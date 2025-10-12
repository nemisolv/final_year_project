from fastapi import APIRouter, HTTPException
from app.models import LearningPathRequest, LearningPathResponse
from app.services import learning_path_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/learning-path", tags=["Learning Path"])


@router.post("/generate", response_model=LearningPathResponse)
async def generate_learning_path(request: LearningPathRequest):
    """
    Generate personalized learning path based on user's level, goals, and interests
    """
    try:
        response = await learning_path_service.generate_learning_path(request)
        return response
    except Exception as e:
        logger.error(f"Learning path endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while generating your learning path")
