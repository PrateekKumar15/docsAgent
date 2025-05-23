from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
import uuid
import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import sys
from datetime import datetime, timedelta
import asyncio

# Add project root to sys.path BEFORE importing Prisma
project_root = os.path.abspath(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
print(f"[DEBUG] Project root added to sys.path: {project_root}")
print(f"[DEBUG] Current sys.path: {sys.path}")

# Prisma Client Python
from prisma_py_client import Prisma

load_dotenv()
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    print("GEMINI_API_KEY not found in .env file. Please ensure it is set.")
else:
    genai.configure(api_key=gemini_api_key)

# Initialize Gemini Model
model = None
try:
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("Gemini Model initialized successfully.")
except Exception as e:
    print(f"Error initializing Gemini Model: {e}")

app = FastAPI()

# Global in-memory store for active Gemini chat sessions
active_gemini_chats = {}  # Key: app_chat_id, Value: dict {'session': Gemini ChatSession object, 'history': []}

# Initialize Prisma Client
db = Prisma()

# Pydantic model for the /api/chat request
class ChatRequest(BaseModel):
    urls: list[str]
    question: str
    userId: str
    chatId: str | None = None

class RenameChatRequest(BaseModel):
    title: str
    userId: str

class DeleteChatRequest(BaseModel):
    userId: str

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup_db_client():
    try:
        await db.connect()
        print("Prisma client connected successfully.")
    except Exception as e:
        print(f"Failed to connect Prisma client: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    if db.is_connected():
        await db.disconnect()
        print("Prisma client disconnected.")

def scrape_website(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        for script_or_style in soup(["script", "style"]):
            script_or_style.decompose()
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        return text
    except Exception as e:
        print(f"Error during website scraping ({url}): {e}")
        return f"Error scraping website ({url}): {e}"

def scrape_multiple_websites(urls: list[str]) -> str:
    all_text = []
    for url in urls:
        print(f"Scraping {url}...")
        text = scrape_website(url)
        if text.startswith("Error scraping website"):
            all_text.append(f"Failed to scrape {url}. Error: {text.split(': ', 1)[1]}")
        else:
            all_text.append(f"Content from {url}:\n{text}\n---")
    return "\n\n".join(all_text)

async def get_ai_response_conversational_stream(app_chat_id: str, user_question: str, document_text: str | None = None):
    global model, active_gemini_chats

    if not model:
        print("AI Model not initialized. Cannot ask AI.")
        yield "Error: AI Model not initialized."
        return

    chat_info = active_gemini_chats.get(app_chat_id)
    gemini_chat_session = None
    if chat_info:
        gemini_chat_session = chat_info['session']

    try:
        if not gemini_chat_session:  # New session or needs rehydration
            if not document_text:
                print(f"Error: Attempting to start/rehydrate chat {app_chat_id} without document text.")
                yield "Error: Missing document context for new/rehydrated chat, or scraping failed during rehydration."
                return

            gemini_chat_session = model.start_chat(history=[])
            print(f"Starting new Gemini chat session for app_chat_id: {app_chat_id}")

            context_prompt = f"The following is a document (or multiple documents) that I will be asking questions about. Please read and understand it. This is the context for our entire conversation. Document content: {document_text[:25000]}"
            print(f"Sending context to Gemini for chat {app_chat_id} (length: {len(context_prompt)} chars)...")
            context_response = await asyncio.to_thread(gemini_chat_session.send_message, context_prompt)
            print(f"Gemini context acknowledgment for {app_chat_id}: {context_response.text[:100]}...")
            active_gemini_chats[app_chat_id] = {'session': gemini_chat_session, 'history': list(gemini_chat_session.history)}
            print(f"Gemini session for {app_chat_id} initialized with context and stored.")

        print(f"Sending user question to Gemini for chat {app_chat_id} (streaming): '{user_question}'")
        stream = await asyncio.to_thread(gemini_chat_session.send_message, user_question, stream=True)
        for chunk in stream:
            if chunk.text:
                yield chunk.text
        active_gemini_chats[app_chat_id]['history'] = list(gemini_chat_session.history)
        print(f"Finished streaming AI response for {app_chat_id}.")

    except Exception as e:
        print(f"Error interacting with Gemini for chat {app_chat_id}: {e}")
        if app_chat_id in active_gemini_chats:
            del active_gemini_chats[app_chat_id]
            print(f"Removed faulty Gemini session for {app_chat_id} due to error.")
        yield f"Error: Error interacting with AI: {str(e)}"

@app.post("/api/chat")
async def api_chat(data: ChatRequest):
    if not data.urls and not data.chatId:
        return JSONResponse({"error": "No URLs provided for a new chat.", "answer": "Please provide at least one URL for a new chat."}, status_code=400)

    try:
        user = await db.user.upsert(
            where={"id": data.userId},
            data={
                "create": {"id": data.userId, "email": f"user_{data.userId}@example.com"},
                "update": {},
            },
        )
        if not user:
            print(f"Failed to upsert user with ID: {data.userId}")
            return JSONResponse({"error": "Failed to process user information.", "answer": "Error with user data."}, status_code=500)

        chat_session_db_record = None
        doc_text_for_ai = None
        is_new_chat_session = False

        if data.chatId:
            chat_session_db_record = await db.chat.find_unique(
                where={"id": data.chatId},
                include={"urls": True}
            )
            if chat_session_db_record and chat_session_db_record.userId != user.id:
                print(f"User {data.userId} attempted to access chat {data.chatId} owned by {chat_session_db_record.userId}")
                return JSONResponse({"error": "Unauthorized access to chat session.", "answer": "Unauthorized."}, status_code=403)
            elif not chat_session_db_record:
                print(f"ChatId {data.chatId} provided but not found. Treating as a new chat if URLs are present.")
                if not data.urls:
                    return JSONResponse({"error": "Chat not found and no URLs provided to create a new one.", "answer": "Chat not found."}, status_code=404)

        if not chat_session_db_record:
            if not data.urls:
                return JSONResponse({"error": "Cannot create a new chat without URLs.", "answer": "Please provide URLs."}, status_code=400)

            is_new_chat_session = True
            print(f"Creating new chat for user {user.id} with URLs: {data.urls}")
            doc_text_for_ai = scrape_multiple_websites(data.urls)
            if all(text.startswith("Failed to scrape") for text in doc_text_for_ai.split("\n\n") if text.strip()):
                return JSONResponse({"error": "Failed to scrape all provided URLs for new chat.", "answer": "Could not retrieve content."}, status_code=500)

            title = data.urls[0] if data.urls else "New Chat"
            chat_session_db_record = await db.chat.create(
                data={
                    "userId": user.id,
                    "title": title,
                    "urls": data.urls
                }
            )
            print(f"New chat session {chat_session_db_record.id} created in DB.")
        else:
            print(f"Continuing chat session {chat_session_db_record.id} for user {user.id}")
            if not active_gemini_chats.get(chat_session_db_record.id):
                print(f"No active Gemini session for chat {chat_session_db_record.id}. Rehydrating...")
                if not chat_session_db_record.urls:
                    print(f"Error: Chat {chat_session_db_record.id} from DB has no URLs for rehydration.")
                    return JSONResponse({"error": "Cannot rehydrate chat without URLs.", "answer": "Chat data corrupted."}, status_code=500)

                doc_text_for_ai = scrape_multiple_websites(chat_session_db_record.urls)
                if all(text.startswith("Failed to scrape") for text in doc_text_for_ai.split("\n\n") if text.strip()):
                    return JSONResponse({"error": "Failed to scrape URLs for chat rehydration.", "answer": "Could not retrieve content for rehydration."}, status_code=500)

        async def stream_generator():
            full_ai_response = ""
            error_occurred = False
            async for chunk in get_ai_response_conversational_stream(
                app_chat_id=chat_session_db_record.id,
                user_question=data.question,
                document_text=doc_text_for_ai
            ):
                if chunk.startswith("Error:"):
                    print(f"Streaming error for chat {chat_session_db_record.id}: {chunk}")
                    yield f'{{"error": "{chunk}", "answer": "Failed to get a response from the AI."}}'
                    error_occurred = True
                    break
                full_ai_response += chunk
                yield chunk

            if not error_occurred and full_ai_response:
                try:
                    await db.message.create_many(
                        data=[
                            {"chatId": chat_session_db_record.id, "role": "user", "content": data.question},
                            {"chatId": chat_session_db_record.id, "role": "ai", "content": full_ai_response},
                        ]
                    )
                    print(f"Chat interaction (user & AI full response) stored for chat ID {chat_session_db_record.id}")

                    updated_chat_with_messages = await db.chat.find_unique(
                        where={"id": chat_session_db_record.id},
                        include={"messages": True, "urls": True}
                    )
                    if updated_chat_with_messages:
                        yield f"__CHAT_METADATA__{jsonable_encoder(updated_chat_with_messages)}"
                except Exception as db_e:
                    print(f"Database operation failed after streaming for chat {chat_session_db_record.id}: {db_e}")
                    if not error_occurred:
                        yield f'{{"error": "Failed to save chat to database after AI response.", "answer": "AI response generated but not saved."}}'
            elif not error_occurred and not full_ai_response:
                print(f"AI generated an empty response for chat {chat_session_db_record.id}.")
                yield f'{{"error": "AI returned an empty response.", "answer": "AI returned an empty response."}}'

        return StreamingResponse(stream_generator(), media_type="text/event-stream")

    except Exception as e:
        print(f"Database operation or main chat processing failed: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse({"error": f"An unexpected error occurred: {str(e)}", "answer": "An error occurred."}, status_code=500)

@app.put("/api/chats/{chat_id}/rename")
async def rename_chat_session(chat_id: str, request_data: RenameChatRequest):
    try:
        chat_to_update = await db.chat.find_unique(where={"id": chat_id})

        if not chat_to_update:
            return JSONResponse({"error": "Chat session not found."}, status_code=404)

        if chat_to_update.userId != request_data.userId:
            print(f"User {request_data.userId} unauthorized to rename chat {chat_id} owned by {chat_to_update.userId}")
            return JSONResponse({"error": "Unauthorized"}, status_code=403)

        updated_chat = await db.chat.update(
            where={"id": chat_id},
            data={"title": request_data.title}
        )
        if not updated_chat:
            return JSONResponse({"error": "Failed to rename chat session."}, status_code=500)
        
        print(f"Chat {chat_id} renamed to '{request_data.title}' by user {request_data.userId}")
        return JSONResponse(jsonable_encoder(updated_chat))

    except Exception as e:
        print(f"Error renaming chat {chat_id}: {e}")
        return JSONResponse({"error": f"Failed to rename chat: {str(e)}"}, status_code=500)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/users/{user_id}/chats")
async def get_user_chats(user_id: str):
    try:
        one_month_ago = datetime.utcnow() - timedelta(days=30)

        chats = await db.chat.find_many(
            where={
                "userId": user_id,
                "createdAt": {"gte": one_month_ago}
            },
            include={"messages": True},  # Removed "urls": True as it's a scalar list
            order={"createdAt": "desc"}
        )
        if not chats:
            return JSONResponse([], status_code=200)
        return JSONResponse(jsonable_encoder(chats))
    except Exception as e:
        print(f"Error fetching chats for user {user_id}: {e}")
        return JSONResponse({"error": f"Failed to fetch chats: {str(e)}"}, status_code=500)

@app.delete("/api/chats/{chat_id}")
async def delete_chat_session(chat_id: str, request_data: DeleteChatRequest):
    try:
        chat_to_delete = await db.chat.find_unique(where={"id": chat_id})

        if not chat_to_delete:
            return JSONResponse({"error": "Chat session not found."}, status_code=404)

        if chat_to_delete.userId != request_data.userId:
            print(f"User {request_data.userId} unauthorized to delete chat {chat_id} owned by {chat_to_delete.userId}")
            return JSONResponse({"error": "Unauthorized"}, status_code=403)

        await db.message.delete_many(where={"chatId": chat_id})
        deleted_chat = await db.chat.delete(where={"id": chat_id})

        if not deleted_chat:
            return JSONResponse({"error": "Failed to delete chat session."}, status_code=500)
        
        print(f"Chat {chat_id} and its messages deleted successfully by user {request_data.userId}.")
        return JSONResponse({"message": "Chat deleted successfully", "chatId": chat_id})

    except Exception as e:
        print(f"Error deleting chat {chat_id}: {e}")
        return JSONResponse({"error": f"Failed to delete chat: {str(e)}"}, status_code=500)
