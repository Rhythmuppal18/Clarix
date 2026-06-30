from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
import os

# Initialize database components and services needed strictly for startup
from database.connection import engine, Base, get_db

# Routers
from routers import auth, upload, documents, query, chat

# Load Environment Variables explicitly for Main Scope
from dotenv import load_dotenv
load_dotenv()

# Create tables in the database
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Executes exactly one time during the application startup process to
    load models efficiently preventing request-level cold starts.
    """
    print("Startup sequence initiated.")
    if os.getenv("PRELOAD_EMBEDDING_MODEL", "false").lower() == "true":
        from services.embedder import load_embedding_model
        load_embedding_model()
    print("Startup sequence complete.")
    yield
    print("Shutdown sequence initiated.")
    print("Shutdown sequence complete.")

# Main Application Initialization
app = FastAPI(
    title="Clarix API",
    description="AI-Powered Enterprise Knowledge Retrieval System",
    version="1.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:3000", # Dev configuration required
    "http://127.0.0.1:3000",
    "https://clarix-eclipse-hackathon.onrender.com",
    "https://clarix-eclipse-hackathon.vercel.app" # The live Vercel frontend URL
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiter setup (utilized mostly in query.py)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Root and Health Check Routes for UptimeRobot Configuration
@app.head("/", tags=["system"])
@app.get("/", tags=["system"])
async def root_check(request: Request):
    """
    Root heartbeat check.
    """
    if request.method == "HEAD":
        return Response(status_code=status.HTTP_200_OK)
    return {"status": "ok", "message": "Clarix API is running"}

@app.head("/health", tags=["system"])
@app.get("/health", tags=["system"])
async def health_check(request: Request):
    """
    Standard heartbeat check supporting Render and UptimeRobot HEAD requests.
    """
    if request.method == "HEAD":
        return Response(status_code=status.HTTP_200_OK)
    return {"status": "ok"}

# Router inclusion
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(documents.router)
app.include_router(query.router)
app.include_router(chat.router, prefix="/chat", tags=["chat"])


from fastapi.responses import JSONResponse

# Global Exception Handling
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Catch-all unhandled exceptions explicitly to avoid system crashes locally leaking info.
    """
    print(f"Unhandled Runtime Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred."}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
