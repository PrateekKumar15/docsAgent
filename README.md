# AI Agent SaaS Platform

This project is a full-stack SaaS platform that provides an AI agent for answering programming questions from any documentation link. It features:

- **Backend:** FastAPI (Python) for scraping docs and Gemini API integration
- **Frontend:** Next.js (React, TypeScript) with Tailwind CSS, Shadcn UI, GSAP, Framer Motion, Animated Icons
- **Authentication:** Clerk (Editor is a protected route)
- **Database:** Neon (Postgres) with Prisma ORM for chat/message storage

---

## Features

- Web scraping of documentation from a URL
- AI-powered Q&A using Gemini API
- Modern, animated UI (Next.js, Tailwind, Shadcn, GSAP, Framer Motion)
- Authenticated chat editor (protected route)
- Chat history, rename, delete, revisit old chats
- Clerk authentication
- Neon Postgres + Prisma for persistent chat/message storage

---

## Project Structure

- `main.py`, `app.py`: Python backend (FastAPI, Gemini, scraping)
- `frontend/`: Next.js app (UI, Clerk, chat, API routes)
- `frontend/prisma/schema.prisma`: Prisma schema for Neon DB
- `frontend/src/app/api/chats/route.ts`: Next.js API routes for chat CRUD
- `frontend/src/app/editor/page.tsx`: Protected chat editor UI

---

## Setup & Running (Local Development)

### 1. Backend (FastAPI)

```powershell
# In project root
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
# Set up your .env file with GEMINI_API_KEY
python -m uvicorn app:app --reload
```

- The backend will run at [http://127.0.0.1:8000](http://127.0.0.1:8000)

### 2. Frontend (Next.js)

```powershell
cd frontend
npm install
# Set up your .env file with NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, DATABASE_URL, etc.
npx prisma generate
npx prisma migrate dev
npm run dev
```

- The frontend will run at [http://localhost:3000](http://localhost:3000)

---

## How to Use

1. Sign up/sign in via Clerk (Editor page is protected)
2. Go to the Editor (via Navbar or Hero button)
3. Add a documentation link, ask questions, and chat with the AI
4. All chats are saved to your account (Neon DB)
5. You can revisit, rename, or delete chats anytime

---

## Deployment

- Deploy the frontend (Next.js) to Vercel
- Deploy the backend (FastAPI) to Render, Fly.io, or similar
- Use Neon for managed Postgres
- Set all required environment variables in your deployment platform

---

## Notes & Recommendations

- Make sure your Prisma schema matches your chat/message data model
- Keep your API keys and DB credentials secure (never commit secrets)
- For production, set up HTTPS and proper CORS between frontend and backend
- Review Clerk and Neon documentation for advanced features

---

## Credits

- Built with Next.js, FastAPI, Gemini API, Clerk, Neon, Prisma, Tailwind, Shadcn UI, GSAP, Framer Motion

---

For any issues, please open an issue or contact the maintainer.
