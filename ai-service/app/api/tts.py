"""
Text-to-Speech API endpoints
"""
from fastapi import APIRouter, HTTPException, Response
from app.models import TTSRequest, TTSResponse, VoicesListResponse, VoiceInfo
from app.services.tts_service import tts_service
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/synthesize", response_model=TTSResponse)
async def synthesize_speech(request: TTSRequest):
    """
    Convert text to speech using ElevenLabs TTS

    Args:
        request: TTSRequest containing text and optional voice parameters

    Returns:
        TTSResponse with audio file path and metadata
    """
    try:
        if not tts_service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Text-to-Speech service is not available. Please check ElevenLabs API key configuration."
            )

        if not request.text or not request.text.strip():
            raise HTTPException(
                status_code=400,
                detail="Text cannot be empty"
            )

        # Synthesize speech
        audio_file_path = tts_service.synthesize_speech(
            text=request.text,
            voice_id=request.voice_id,
            stability=request.stability,
            similarity_boost=request.similarity_boost,
            style=request.style
        )

        if not audio_file_path:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate speech. Please try again."
            )

        # Get file size for duration estimate (rough estimate)
        file_size = os.path.getsize(audio_file_path) if os.path.exists(audio_file_path) else 0
        # Rough estimate: ~1 second per 16KB for speech (varies by voice and content)
        duration_estimate = int((file_size / 16000) * 1000) if file_size > 0 else None

        logger.info(f"Speech synthesized successfully: {audio_file_path}")

        return TTSResponse(
            audio_file_path=audio_file_path,
            text=request.text,
            voice_id=request.voice_id or tts_service.default_voice_id,
            duration_ms=duration_estimate
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in TTS synthesize endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/voices", response_model=VoicesListResponse)
async def get_available_voices():
    """
    Get list of available voices from ElevenLabs

    Returns:
        VoicesListResponse containing list of available voices
    """
    try:
        if not tts_service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Text-to-Speech service is not available. Please check ElevenLabs API key configuration."
            )

        voices = tts_service.get_available_voices()

        if voices is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to retrieve voices from ElevenLabs"
            )

        voice_info_list = [VoiceInfo(**voice) for voice in voices]

        return VoicesListResponse(
            voices=voice_info_list,
            total=len(voice_info_list)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get voices endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """
    Retrieve generated audio file

    Args:
        filename: Name of the audio file

    Returns:
        Audio file as binary response
    """
    try:
        audio_dir = Path("audio_output")
        file_path = audio_dir / filename

        # Security check: prevent directory traversal
        if not str(file_path.resolve()).startswith(str(audio_dir.resolve())):
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Audio file not found"
            )

        # Read audio file
        with open(file_path, "rb") as audio_file:
            audio_data = audio_file.read()

        # Return audio with appropriate content type
        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving audio file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.delete("/audio/{filename}")
async def delete_audio_file(filename: str):
    """
    Delete a generated audio file

    Args:
        filename: Name of the audio file to delete

    Returns:
        Success message
    """
    try:
        audio_dir = Path("audio_output")
        file_path = audio_dir / filename

        # Security check: prevent directory traversal
        if not str(file_path.resolve()).startswith(str(audio_dir.resolve())):
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Audio file not found"
            )

        success = tts_service.delete_audio_file(str(file_path))

        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to delete audio file"
            )

        return {"message": f"Audio file '{filename}' deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting audio file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
