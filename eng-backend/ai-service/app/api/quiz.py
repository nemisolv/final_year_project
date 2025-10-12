from fastapi import APIRouter, HTTPException
from app.models import QuizRequest, QuizResponse
from app.services import quiz_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/quiz", tags=["Quiz"])


@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    """
    Generate AI-powered quizzes based on topic and difficulty
    """
    try:
        response = await quiz_service.generate_quiz(request)
        return response
    except Exception as e:
        logger.error(f"Quiz endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate quiz")
