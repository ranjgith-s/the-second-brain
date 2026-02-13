from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db, get_session
from models import Note
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from graph import app as agent_app

class ChatRequest(BaseModel):
    message: str
    provider: str
    api_key: str

class ChatResponse(BaseModel):
    response: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic (e.g., db connection)
    print("Cortex is starting up...")
    await init_db()
    yield
    # Shutdown logic
    print("Cortex is shutting down...")

app = FastAPI(title="The Second Brain Cortex", version="0.1.0", lifespan=lifespan)

# CORS Configuration
origins = [
    "http://localhost:3000",  # Next.js frontend
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "cortex"}

@app.get("/")
async def root():
    return {"message": "Welcome to The Second Brain Cortex"}

@app.post("/notes/", response_model=Note)
async def create_note(note: Note, session: AsyncSession = Depends(get_session)):
    session.add(note)
    await session.commit()
    await session.refresh(note)
    return note

@app.get("/notes/", response_model=List[Note])
async def read_notes(skip: int = 0, limit: int = 100, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Note).offset(skip).limit(limit))
    notes = result.scalars().all()
    return notes

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    inputs = {"messages": [HumanMessage(content=request.message)]}
    config = {"configurable": {"provider": request.provider, "api_key": request.api_key}}

    result = await agent_app.ainvoke(inputs, config=config)
    last_message = result["messages"][-1]
    return ChatResponse(response=str(last_message.content))
