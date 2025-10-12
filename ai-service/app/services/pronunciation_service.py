from faster_whisper import WhisperModel
from vosk import Model as VoskModel, KaldiRecognizer
from sqlalchemy.orm import Session
from app.db.models import PronunciationAnalysis, AnalysisMethod
from app.models import PronunciationRequest, PronunciationResponse, WordScore
from datetime import datetime
import logging
import time
import wave
import json
import os
from typing import List, Optional, Tuple
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)


class PronunciationService:
    def __init__(self):
        # Initialize faster-whisper (primary)
        try:
            # Using small model for faster processing
            self.whisper_model = WhisperModel("small", device="cpu", compute_type="int8")
            logger.info("Faster-whisper model loaded successfully")
        except Exception as e:
            logger.warning(f"Failed to load faster-whisper: {str(e)}")
            self.whisper_model = None

        # Initialize Vosk (fallback)
        try:
            vosk_model_path = os.getenv("VOSK_MODEL_PATH", "models/vosk-model-small-en-us-0.15")
            if os.path.exists(vosk_model_path):
                self.vosk_model = VoskModel(vosk_model_path)
                logger.info("Vosk model loaded successfully")
            else:
                logger.warning(f"Vosk model not found at {vosk_model_path}")
                self.vosk_model = None
        except Exception as e:
            logger.warning(f"Failed to load Vosk model: {str(e)}")
            self.vosk_model = None

    def _transcribe_with_whisper(self, audio_path: str) -> Optional[Tuple[str, List[dict]]]:
        """
        Transcribe audio using faster-whisper
        Returns: (transcribed_text, word_timings)
        """
        if not self.whisper_model:
            return None

        try:
            segments, info = self.whisper_model.transcribe(
                audio_path,
                beam_size=5,
                word_timestamps=True
            )

            text_parts = []
            word_timings = []

            for segment in segments:
                text_parts.append(segment.text)
                if hasattr(segment, 'words'):
                    for word in segment.words:
                        word_timings.append({
                            "word": word.word.strip(),
                            "start": word.start,
                            "end": word.end,
                            "confidence": word.probability
                        })

            transcribed_text = " ".join(text_parts).strip()
            logger.info(f"Whisper transcription: {transcribed_text}")
            return transcribed_text, word_timings

        except Exception as e:
            logger.error(f"Whisper transcription failed: {str(e)}")
            return None

    def _transcribe_with_vosk(self, audio_path: str) -> Optional[Tuple[str, List[dict]]]:
        """
        Transcribe audio using Vosk (fallback)
        Returns: (transcribed_text, word_timings)
        """
        if not self.vosk_model:
            return None

        try:
            wf = wave.open(audio_path, "rb")

            # Vosk requires 16kHz mono audio
            if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
                logger.warning("Audio format must be 16kHz mono WAV for Vosk")
                wf.close()
                return None

            recognizer = KaldiRecognizer(self.vosk_model, wf.getframerate())
            recognizer.SetWords(True)

            results = []
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                if recognizer.AcceptWaveform(data):
                    results.append(json.loads(recognizer.Result()))

            # Get final result
            results.append(json.loads(recognizer.FinalResult()))
            wf.close()

            # Combine all text
            text_parts = [r.get("text", "") for r in results if r.get("text")]
            transcribed_text = " ".join(text_parts).strip()

            # Extract word timings
            word_timings = []
            for result in results:
                if "result" in result:
                    for word_info in result["result"]:
                        word_timings.append({
                            "word": word_info.get("word", ""),
                            "start": word_info.get("start", 0),
                            "end": word_info.get("end", 0),
                            "confidence": word_info.get("conf", 0)
                        })

            logger.info(f"Vosk transcription: {transcribed_text}")
            return transcribed_text, word_timings

        except Exception as e:
            logger.error(f"Vosk transcription failed: {str(e)}")
            return None

    def _calculate_word_scores(self, target_text: str, recognized_text: str, word_timings: List[dict]) -> List[WordScore]:
        """
        Calculate pronunciation scores for each word
        """
        target_words = target_text.lower().split()
        recognized_words = recognized_text.lower().split()

        word_scores = []

        # Use sequence matcher to align words
        matcher = SequenceMatcher(None, target_words, recognized_words)

        for target_idx, target_word in enumerate(target_words):
            # Find best matching recognized word
            best_score = 0.0
            matched_word = None

            for recognized_idx, recognized_word in enumerate(recognized_words):
                similarity = SequenceMatcher(None, target_word, recognized_word).ratio()
                if similarity > best_score:
                    best_score = similarity
                    matched_word = recognized_word

            # Get timing info if available
            timing_info = None
            if word_timings and target_idx < len(word_timings):
                timing_info = word_timings[target_idx]

            # Calculate score (0-100)
            score = best_score * 100

            word_scores.append(WordScore(
                word=target_word,
                score=score,
                pronunciation_accuracy=score,
                fluency_score=timing_info.get("confidence", 0.8) * 100 if timing_info else 80.0,
                feedback=self._get_word_feedback(score)
            ))

        return word_scores

    def _get_word_feedback(self, score: float) -> str:
        """
        Generate feedback based on pronunciation score
        """
        if score >= 90:
            return "Excellent pronunciation!"
        elif score >= 75:
            return "Good pronunciation, minor improvements possible"
        elif score >= 60:
            return "Fair pronunciation, practice this word more"
        else:
            return "Needs improvement, focus on this word"

    def _calculate_wer(self, target_text: str, recognized_text: str) -> float:
        """
        Calculate Word Error Rate (WER)
        """
        target_words = target_text.lower().split()
        recognized_words = recognized_text.lower().split()

        # Levenshtein distance
        d = [[0] * (len(recognized_words) + 1) for _ in range(len(target_words) + 1)]

        for i in range(len(target_words) + 1):
            d[i][0] = i
        for j in range(len(recognized_words) + 1):
            d[0][j] = j

        for i in range(1, len(target_words) + 1):
            for j in range(1, len(recognized_words) + 1):
                if target_words[i-1] == recognized_words[j-1]:
                    d[i][j] = d[i-1][j-1]
                else:
                    d[i][j] = min(d[i-1][j], d[i][j-1], d[i-1][j-1]) + 1

        wer = d[len(target_words)][len(recognized_words)] / len(target_words) if target_words else 0
        return min(1.0, wer)

    async def analyze_pronunciation(self, request: PronunciationRequest, db: Session = None) -> PronunciationResponse:
        """
        Analyze pronunciation using faster-whisper with Vosk fallback
        """
        start_time = time.time()
        analysis_method = None

        try:
            # Try faster-whisper first
            result = self._transcribe_with_whisper(request.audio_path)

            if result:
                recognized_text, word_timings = result
                analysis_method = AnalysisMethod.WHISPER
            else:
                # Fallback to Vosk
                logger.info("Falling back to Vosk for transcription")
                result = self._transcribe_with_vosk(request.audio_path)

                if result:
                    recognized_text, word_timings = result
                    analysis_method = AnalysisMethod.VOSK
                else:
                    raise Exception("Both Whisper and Vosk transcription failed")

            # Calculate word-level scores
            word_scores = self._calculate_word_scores(
                request.target_text,
                recognized_text,
                word_timings
            )

            # Calculate overall metrics
            overall_score = sum([ws.score for ws in word_scores]) / len(word_scores) if word_scores else 0
            wer = self._calculate_wer(request.target_text, recognized_text)

            # Generate overall feedback
            feedback = []
            if overall_score >= 90:
                feedback.append("Outstanding pronunciation! Keep up the excellent work!")
            elif overall_score >= 75:
                feedback.append("Very good pronunciation overall. Minor adjustments on some words.")
            elif overall_score >= 60:
                feedback.append("Good effort! Focus on the words marked for improvement.")
            else:
                feedback.append("Keep practicing! Pay attention to word pronunciation and clarity.")

            if wer > 0.3:
                feedback.append("Focus on speaking more clearly and at a steady pace.")

            processing_time = int((time.time() - start_time) * 1000)

            response = PronunciationResponse(
                recognized_text=recognized_text,
                word_scores=word_scores,
                overall_score=overall_score,
                word_error_rate=wer,
                feedback=feedback
            )

            # Store in database if session provided
            if db and request.user_id:
                try:
                    pronunciation_analysis = PronunciationAnalysis(
                        user_id=request.user_id,
                        target_text=request.target_text,
                        recognized_text=recognized_text,
                        audio_file_path=request.audio_path,
                        word_scores=[ws.dict() for ws in word_scores],
                        overall_score=overall_score,
                        word_error_rate=wer,
                        feedback=feedback,
                        analysis_method=analysis_method,
                        processing_time_ms=processing_time,
                        created_at=datetime.now()
                    )
                    db.add(pronunciation_analysis)
                    db.commit()
                    logger.info(f"Stored pronunciation analysis for user {request.user_id} using {analysis_method}")
                except Exception as db_error:
                    logger.error(f"Failed to store pronunciation analysis: {str(db_error)}")
                    db.rollback()

            return response

        except Exception as e:
            logger.error(f"Error in pronunciation service: {str(e)}")
            raise


pronunciation_service = PronunciationService()
