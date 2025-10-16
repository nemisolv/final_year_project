from fastapi import APIRouter
from .chat import router as chat_router
from .conversation import router as conversation_router
from .grammar import router as grammar_router
from .quiz import router as quiz_router
from .learning_path import router as learning_path_router
from .analytics import router as analytics_router
from .pronunciation import router as pronunciation_router
from .audit import router as audit_router
from .tts import router as tts_router

# Main API router
api_router = APIRouter(prefix="/api/v1")

# Include all sub-routers
api_router.include_router(chat_router)
api_router.include_router(conversation_router)
api_router.include_router(grammar_router)
api_router.include_router(quiz_router)
api_router.include_router(learning_path_router)
api_router.include_router(analytics_router)
api_router.include_router(pronunciation_router)
api_router.include_router(audit_router)
api_router.include_router(tts_router, prefix="/tts", tags=["Text-to-Speech"])
