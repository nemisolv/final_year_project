from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import ProgressRequest, ProgressResponse
from app.services.analytics_service import analytics_service
from app.db import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post("/progress", response_model=ProgressResponse)
async def get_user_progress(request: ProgressRequest, db: Session = Depends(get_db)):
    """
    Get comprehensive progress analytics and insights for a user

    Analyzes:
    - Conversation practice sessions
    - Grammar checking history
    - Pronunciation practice
    - Learning streaks
    - Overall progress trends

    Returns personalized insights, recommendations, and next goals
    """
    try:
        response = await analytics_service.get_user_progress(request, db)
        return response
    except Exception as e:
        logger.error(f"Analytics endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while processing analytics")
