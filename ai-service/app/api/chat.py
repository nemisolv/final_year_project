from fastapi import APIRouter, HTTPException
from app.models import ChatRequest, ChatResponse
from app.services import chat_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    AI-powered chat for general English learning conversations
    """
    try:
        response = await chat_service.chat(request)
        return response
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")
