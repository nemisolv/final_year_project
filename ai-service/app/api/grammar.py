# eng-backend/ai-service/app/api/grammar.py
from fastapi import APIRouter, HTTPException
from app.models.schemas import GrammarCheckRequest, GrammarCheckResponse
from app.services.grammar_service import grammar_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/grammar", tags=["Grammar"])

@router.post("/check", response_model=GrammarCheckResponse)
async def check_grammar(request: GrammarCheckRequest):
    try:
        response = await grammar_service.check_grammar(request)
        return response
    except Exception as e:
        logger.error(f"Grammar check endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while checking grammar.")