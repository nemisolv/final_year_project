from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import GrammarCheckRequest, GrammarCheckResponse
from app.services import grammar_service
from app.db import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/grammar", tags=["Grammar"])


@router.post("/check", response_model=GrammarCheckResponse)
async def check_grammar(request: GrammarCheckRequest, db: Session = Depends(get_db)):
    """
    Check grammar, spelling, and style in English text
    """
    try:
        response = await grammar_service.check_grammar(request, db)
        return response
    except Exception as e:
        logger.error(f"Grammar endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while checking grammar")
