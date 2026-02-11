from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db

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
