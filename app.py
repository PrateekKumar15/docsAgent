from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
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

# Initialize Prisma Client
db = Prisma()

# Pydantic model for the /api/chat request
class ChatRequest(BaseModel):
    urls: list[str]  # Changed from url: str
    question: str
    userId: str
    chatId: str | None = None  # Optional: ID of an existing chat session

class RenameChatRequest(BaseModel):
    title: str
    userId: str  # Added userId for authorization

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

def ask_ai(document_text, question):
    if not model:
        print("AI Model not initialized. Cannot ask AI.")
        return "AI Model not initialized."
    if not document_text or document_text.startswith("Error scraping website:"):
        print("No valid document content to answer from.")
        return "No document content to answer from."
    try:
        prompt = f"Based on the following document, please answer the question.\n\nDocument:\n{document_text[:10000]} \n\nQuestion: {question}"
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error interacting with AI: {e}")
        return f"Error interacting with AI: {e}"

@app.post("/api/ask")
async def api_ask(data: dict):
    url = data.get("url")
    question = data.get("question")
    doc = scrape_website(url)
    answer = ask_ai(doc, question)
    return JSONResponse({"answer": answer})

@app.post("/api/chat")
async def api_chat(data: ChatRequest):
    if not data.urls:
        return JSONResponse({"error": "No URLs provided.", "answer": "Please provide at least one URL."}, status_code=400)

    scraped_doc_text = scrape_multiple_websites(data.urls)  # Use new multi-scrape function
    
    # Check if all scraping failed
    if all(text.startswith("Failed to scrape") for text in scraped_doc_text.split("\n\n") if text.strip()):
        return JSONResponse({"error": "Failed to scrape all provided URLs.", "answer": "Could not retrieve content from any of the URLs."}, status_code=500)

    ai_answer = ask_ai(scraped_doc_text, data.question)
    if ai_answer.startswith("Error interacting with AI:") or ai_answer == "AI Model not initialized." or ai_answer == "No document content to answer from.":
        return JSONResponse({"error": ai_answer, "answer": "Failed to get a response from the AI."}, status_code=500)

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

        chat_session = None
        if data.chatId:
            chat_session = await db.chat.find_unique(where={"id": data.chatId})
            if chat_session and chat_session.userId != user.id:
                print(f"User {data.userId} attempted to write to chat {data.chatId} owned by {chat_session.userId}")
                return JSONResponse({"error": "Unauthorized access to chat session.", "answer": "Unauthorized."}, status_code=403)
            elif not chat_session:
                print(f"ChatId {data.chatId} provided but not found. Creating a new chat.")

        if not chat_session:
            title = data.urls[0] if data.urls else "Chat"
            chat_session = await db.chat.create(
                data={
                    "userId": user.id,
                    "title": title,
                    "urls": data.urls  # Store the list of URLs
                }
            )
            print(f"Created new chat session {chat_session.id} for user {user.id} with title '{title}' and URLs: {data.urls}")
        else:
            if chat_session.urls != data.urls:
                print(f"Updating URLs for chat {chat_session.id} from {chat_session.urls} to {data.urls}")
                await db.chat.update(
                    where={"id": chat_session.id},
                    data={"urls": data.urls}
                )

        await db.message.create_many(
            data=[
                {
                    "chatId": chat_session.id,
                    "role": "user",
                    "content": data.question,
                },
                {
                    "chatId": chat_session.id,
                    "role": "ai",
                    "content": ai_answer,
                }
            ]
        )
        
        updated_chat_with_messages = await db.chat.find_unique(
            where={"id": chat_session.id},
            include={"messages": True}
        )

        print(f"Chat interaction stored for user {data.userId}, chat ID {chat_session.id}")
        return JSONResponse({
            "answer": ai_answer, 
            "chat": jsonable_encoder(updated_chat_with_messages) if updated_chat_with_messages else None
        })

    except Exception as e:
        print(f"Database operation or chat processing failed: {e}") 
        return JSONResponse({"error": f"An unexpected error occurred: {str(e)}", "answer": "An error occurred."}, status_code=500)

@app.put("/api/chats/{chat_id}/rename")
async def rename_chat_session(chat_id: str, request_data: RenameChatRequest):
    try:
        chat_to_update = await db.chat.find_unique(where={"id": chat_id})

        if not chat_to_update:
            return JSONResponse({"error": "Chat session not found."}, status_code=404)

        # Authorization check
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
        chats = await db.chat.find_many(
            where={"userId": user_id},
            include={"messages": True},
            order={"createdAt": "desc"}
        )
        if not chats:
            return JSONResponse([], status_code=200)
        # Manually serialize to handle Pydantic models within a list
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

        # Authorization check
        if chat_to_delete.userId != request_data.userId:
            print(f"User {request_data.userId} unauthorized to delete chat {chat_id} owned by {chat_to_delete.userId}")
            return JSONResponse({"error": "Unauthorized"}, status_code=403)

        # First delete messages associated with the chat, then the chat itself
        await db.message.delete_many(where={"chatId": chat_id})
        deleted_chat = await db.chat.delete(where={"id": chat_id})

        if not deleted_chat:
            return JSONResponse({"error": "Failed to delete chat session."}, status_code=500)
        
        print(f"Chat {chat_id} and its messages deleted successfully by user {request_data.userId}.")
        return JSONResponse({"message": "Chat deleted successfully", "chatId": chat_id})

    except Exception as e:
        print(f"Error deleting chat {chat_id}: {e}")
        return JSONResponse({"error": f"Failed to delete chat: {str(e)}"}, status_code=500)
