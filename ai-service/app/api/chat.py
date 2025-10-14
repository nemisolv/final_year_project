from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
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


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    AI-powered chat with streaming response for real-time interaction
    Returns SSE (Server-Sent Events) stream
    """
    try:
        async def event_generator():
            async for chunk in chat_service.chat_stream(request):
                yield chunk

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Disable nginx buffering
            }
        )
    except Exception as e:
        logger.error(f"Chat stream endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")
