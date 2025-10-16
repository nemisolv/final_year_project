"""
Text-to-Speech Service using ElevenLabs API
Provides high-quality, natural-sounding speech synthesis for English learning
"""
from elevenlabs import ElevenLabs, VoiceSettings
from app.config import settings
import logging
import os
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class TTSService:
    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.model_id = settings.ELEVENLABS_MODEL_ID
        self.default_voice_id = settings.ELEVENLABS_VOICE_ID
        self.client = None

        if self.api_key:
            try:
                self.client = ElevenLabs(api_key=self.api_key)
                logger.info("ElevenLabs TTS client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize ElevenLabs client: {e}")
                self.client = None
        else:
            logger.warning("ElevenLabs API key not provided. TTS will be unavailable.")

        # Create audio output directory if it doesn't exist
        self.output_dir = Path("audio_output")
        self.output_dir.mkdir(exist_ok=True)

    def is_available(self) -> bool:
        """Check if ElevenLabs TTS service is available"""
        return self.client is not None

    def synthesize_speech(
        self,
        text: str,
        voice_id: Optional[str] = None,
        output_filename: Optional[str] = None,
        stability: float = 0.5,
        similarity_boost: float = 0.75,
        style: float = 0.0,
        use_speaker_boost: bool = True
    ) -> Optional[str]:
        """
        Synthesize speech from text using ElevenLabs API

        Args:
            text: The text to convert to speech
            voice_id: ElevenLabs voice ID (uses default if not provided)
            output_filename: Custom output filename (auto-generated if not provided)
            stability: Voice stability (0.0-1.0). Higher = more consistent, lower = more expressive
            similarity_boost: Voice similarity boost (0.0-1.0). Higher = closer to original voice
            style: Style exaggeration (0.0-1.0). Higher = more stylistic
            use_speaker_boost: Whether to use speaker boost for better clarity

        Returns:
            Path to the generated audio file, or None if synthesis fails
        """
        if not self.is_available():
            logger.error("ElevenLabs TTS is not available. Check your API key.")
            return None

        if not text or not text.strip():
            logger.error("Text cannot be empty")
            return None

        try:
            # Use default voice if not specified
            voice_id = voice_id or self.default_voice_id

            # Generate output filename if not provided
            if not output_filename:
                import hashlib
                text_hash = hashlib.md5(text.encode()).hexdigest()[:10]
                output_filename = f"tts_{text_hash}.mp3"

            output_path = self.output_dir / output_filename

            logger.info(f"Generating speech for text: '{text[:50]}...' using voice: {voice_id}")

            # Generate audio using ElevenLabs API
            audio_generator = self.client.text_to_speech.convert(
                voice_id=voice_id,
                optimize_streaming_latency=0,
                output_format="mp3_44100_128",
                text=text,
                model_id=self.model_id,
                voice_settings=VoiceSettings(
                    stability=stability,
                    similarity_boost=similarity_boost,
                    style=style,
                    use_speaker_boost=use_speaker_boost
                )
            )

            # Write audio to file
            with open(output_path, "wb") as audio_file:
                for chunk in audio_generator:
                    if chunk:
                        audio_file.write(chunk)

            logger.info(f"Audio successfully generated at: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"Error generating speech: {str(e)}")
            return None

    def get_available_voices(self) -> Optional[list]:
        """
        Get list of available voices from ElevenLabs

        Returns:
            List of voice objects with id, name, and other metadata
        """
        if not self.is_available():
            logger.error("ElevenLabs TTS is not available.")
            return None

        try:
            voices = self.client.voices.get_all()
            voice_list = []

            for voice in voices.voices:
                voice_list.append({
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "category": voice.category if hasattr(voice, 'category') else 'general',
                    "labels": voice.labels if hasattr(voice, 'labels') else {}
                })

            logger.info(f"Retrieved {len(voice_list)} available voices")
            return voice_list

        except Exception as e:
            logger.error(f"Error fetching voices: {str(e)}")
            return None

    def delete_audio_file(self, file_path: str) -> bool:
        """
        Delete a generated audio file

        Args:
            file_path: Path to the audio file to delete

        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Deleted audio file: {file_path}")
                return True
            else:
                logger.warning(f"Audio file not found: {file_path}")
                return False
        except Exception as e:
            logger.error(f"Error deleting audio file: {str(e)}")
            return False


# Singleton instance
tts_service = TTSService()
