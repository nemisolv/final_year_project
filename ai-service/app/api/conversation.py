from fastapi import APIRouter, HTTPException
from app.models import ConversationRequest, ConversationResponse
from app.services import conversation_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/conversation", tags=["Conversation"])


@router.post("/", response_model=ConversationResponse)
async def practice_conversation(request: ConversationRequest):
    """
    Role-play conversation practice with AI in various scenarios
    """
    try:
        response = await conversation_service.process_conversation(request)
        return response
    except Exception as e:
        logger.error(f"Conversation endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process conversation")
