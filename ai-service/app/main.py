from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api import api_router
from app.models import HealthCheck
from app.middleware.audit_middleware import AuditLoggingMiddleware
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered English learning service with chat, conversation practice, grammar checking, quiz generation, and personalized learning paths with comprehensive audit logging",
    version=settings.API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware (must be first)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit logging middleware
app.add_middleware(AuditLoggingMiddleware)


# Health check endpoint
@app.get("/health", response_model=HealthCheck)
async def health_check():
    """
    Health check endpoint to verify service status
    """
    return HealthCheck(
        status="healthy",
        timestamp=datetime.now(),
        version=settings.API_VERSION,
        services={
            "openai": "connected" if settings.OPENAI_API_KEY else "not_configured",
            "backend": "configured" if settings.BACKEND_URL else "not_configured",
        }
    )


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with API information
    """
    return {
        "service": settings.APP_NAME,
        "version": settings.API_VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "chat": "/api/v1/chat",
            "conversation": "/api/v1/conversation",
            "grammar": "/api/v1/grammar/check",
            "quiz": "/api/v1/quiz/generate",
            "learning_path": "/api/v1/learning-path/generate",
        }
    }


# Include API router
app.include_router(api_router)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."}
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"{settings.APP_NAME} started successfully")
    logger.info(f"OpenAI configured: {bool(settings.OPENAI_API_KEY)}")
    logger.info(f"Backend URL: {settings.BACKEND_URL}")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"{settings.APP_NAME} shutting down")
