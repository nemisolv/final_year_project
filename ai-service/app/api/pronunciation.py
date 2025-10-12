from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.models import PronunciationRequest, PronunciationResponse
from app.services.pronunciation_service import pronunciation_service
from app.db import get_db
import logging
import os
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pronunciation", tags=["Pronunciation"])


@router.post("/analyze", response_model=PronunciationResponse)
async def analyze_pronunciation(
    target_text: str = Form(...),
    audio_file: UploadFile = File(...),
    user_id: int = Form(None),
    db: Session = Depends(get_db)
):
    """
    Analyze pronunciation from audio file

    Uses faster-whisper (primary) with Vosk fallback for speech-to-text,
    then calculates pronunciation accuracy by comparing to target text
    """
    temp_audio_path = None

    try:
        # Validate file type
        allowed_extensions = {'.wav', '.mp3', '.ogg', '.flac', '.m4a', '.webm'}
        file_ext = os.path.splitext(audio_file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            )

        # Read and validate file size (10MB limit)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        content = await audio_file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="File too large. Maximum size is 10MB"
            )

        # Save uploaded audio file temporarily
        upload_dir = "temp_audio"
        os.makedirs(upload_dir, exist_ok=True)

        file_extension = file_ext or ".wav"
        temp_filename = f"{uuid.uuid4()}{file_extension}"
        temp_audio_path = os.path.join(upload_dir, temp_filename)

        with open(temp_audio_path, "wb") as f:
            f.write(content)

        # Create request object
        request = PronunciationRequest(
            target_text=target_text,
            audio_path=temp_audio_path,
            user_id=user_id
        )

        # Analyze pronunciation
        response = await pronunciation_service.analyze_pronunciation(request, db)

        return response

    except HTTPException:
        # Re-raise validation errors (400, 413)
        raise
    except Exception as e:
        logger.error(f"Pronunciation endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while analyzing pronunciation")

    finally:
        # Clean up temporary file
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except Exception as cleanup_error:
                logger.warning(f"Failed to clean up temp file: {cleanup_error}")
