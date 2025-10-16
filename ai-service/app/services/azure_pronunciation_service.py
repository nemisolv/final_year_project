"""
Azure Pronunciation Assessment Service
Uses Azure Cognitive Services Speech SDK for accurate pronunciation scoring
"""
import azure.cognitiveservices.speech as speechsdk
from app.config import settings
from app.models import WordScore
from typing import List, Optional, Tuple
import logging
import json

logger = logging.getLogger(__name__)


class AzurePronunciationService:
    def __init__(self):
        self.speech_key = settings.AZURE_SPEECH_KEY
        self.speech_region = settings.AZURE_SPEECH_REGION
        self.speech_config = None

        if self.speech_key and self.speech_region:
            try:
                self.speech_config = speechsdk.SpeechConfig(
                    subscription=self.speech_key,
                    region=self.speech_region
                )
                logger.info(f"Azure Speech SDK initialized successfully for region: {self.speech_region}")
            except Exception as e:
                logger.warning(f"Failed to initialize Azure Speech SDK: {e}")
                self.speech_config = None
        else:
            logger.warning("Azure Speech credentials not provided. Azure Pronunciation Assessment will be unavailable.")

    def is_available(self) -> bool:
        """Check if Azure service is available"""
        return self.speech_config is not None

    def _create_pronunciation_assessment_config(self, reference_text: str) -> speechsdk.PronunciationAssessmentConfig:
        """
        Create pronunciation assessment configuration

        Args:
            reference_text: The expected text that user should pronounce

        Returns:
            PronunciationAssessmentConfig object
        """
        # Create pronunciation assessment config
        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=reference_text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Word,
            enable_miscue=True  # Detect if words are omitted, inserted, or mispronounced
        )

        return pronunciation_config

    def assess_pronunciation(
        self,
        audio_file_path: str,
        reference_text: str
    ) -> Tuple[Optional[str], Optional[List[WordScore]], Optional[float], Optional[dict]]:
        """
        Assess pronunciation using Azure Pronunciation Assessment API

        Args:
            audio_file_path: Path to the audio file (WAV format recommended)
            reference_text: The text that the user is expected to say

        Returns:
            Tuple of (recognized_text, word_scores, overall_score, detailed_results)
            Returns (None, None, None, None) if assessment fails
        """
        if not self.is_available():
            logger.error("Azure Pronunciation Assessment is not available. Check your credentials.")
            return None, None, None, None

        try:
            # Create audio config from file
            audio_config = speechsdk.audio.AudioConfig(filename=audio_file_path)

            # Create pronunciation assessment config
            pronunciation_config = self._create_pronunciation_assessment_config(reference_text)

            # Create speech recognizer
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )

            # Apply pronunciation assessment config
            pronunciation_config.apply_to(speech_recognizer)

            # Recognize speech
            result = speech_recognizer.recognize_once()

            # Check result
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                recognized_text = result.text
                logger.info(f"Azure recognized: {recognized_text}")

                # Get pronunciation assessment results
                pronunciation_result = speechsdk.PronunciationAssessmentResult(result)

                # Extract overall scores
                accuracy_score = pronunciation_result.accuracy_score
                fluency_score = pronunciation_result.fluency_score
                completeness_score = pronunciation_result.completeness_score
                pronunciation_score = pronunciation_result.pronunciation_score

                logger.info(f"Azure scores - Accuracy: {accuracy_score}, Fluency: {fluency_score}, "
                          f"Completeness: {completeness_score}, Overall: {pronunciation_score}")

                # Extract word-level results
                word_scores = self._parse_word_results(result)

                # Create detailed results
                detailed_results = {
                    "accuracy_score": accuracy_score,
                    "fluency_score": fluency_score,
                    "completeness_score": completeness_score,
                    "pronunciation_score": pronunciation_score,
                    "recognized_text": recognized_text
                }

                return recognized_text, word_scores, pronunciation_score, detailed_results

            elif result.reason == speechsdk.ResultReason.NoMatch:
                logger.warning("Azure: No speech could be recognized")
                return None, None, None, None

            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation_details = result.cancellation_details
                logger.error(f"Azure speech recognition canceled: {cancellation_details.reason}")
                if cancellation_details.reason == speechsdk.CancellationReason.Error:
                    logger.error(f"Error details: {cancellation_details.error_details}")
                return None, None, None, None

        except Exception as e:
            logger.error(f"Error in Azure pronunciation assessment: {str(e)}")
            return None, None, None, None

    def _parse_word_results(self, result) -> List[WordScore]:
        """
        Parse word-level pronunciation results from Azure response

        Args:
            result: Azure SpeechRecognitionResult object

        Returns:
            List of WordScore objects
        """
        word_scores = []

        try:
            # Get detailed results as JSON
            json_result = json.loads(result.properties.get(
                speechsdk.PropertyId.SpeechServiceResponse_JsonResult
            ))

            # Navigate to word-level results
            if "NBest" in json_result and len(json_result["NBest"]) > 0:
                words_data = json_result["NBest"][0].get("Words", [])

                for word_data in words_data:
                    word_text = word_data.get("Word", "")
                    accuracy = word_data.get("PronunciationAssessment", {}).get("AccuracyScore", 0)
                    error_type = word_data.get("PronunciationAssessment", {}).get("ErrorType", "None")

                    # Generate feedback based on score and error type
                    feedback = self._generate_word_feedback(accuracy, error_type)

                    word_scores.append(WordScore(
                        word=word_text,
                        score=accuracy,
                        pronunciation_accuracy=accuracy,
                        fluency_score=accuracy,  # Azure doesn't provide word-level fluency separately
                        feedback=feedback
                    ))

                    logger.debug(f"Word: '{word_text}' - Score: {accuracy} - Error: {error_type}")

        except Exception as e:
            logger.error(f"Error parsing Azure word results: {str(e)}")

        return word_scores

    def _generate_word_feedback(self, score: float, error_type: str) -> str:
        """
        Generate helpful feedback based on pronunciation score and error type

        Args:
            score: Pronunciation accuracy score (0-100)
            error_type: Azure error type (None, Mispronunciation, Omission, Insertion)

        Returns:
            Feedback string
        """
        if error_type == "Omission":
            return "This word was skipped. Make sure to pronounce all words."
        elif error_type == "Insertion":
            return "This word was added but not in the original text."
        elif error_type == "Mispronunciation":
            if score >= 80:
                return "Close! Minor pronunciation adjustment needed."
            elif score >= 60:
                return "Needs improvement. Practice this word more."
            else:
                return "Significant mispronunciation. Focus on this word."
        else:  # None (correct pronunciation)
            if score >= 90:
                return "Excellent pronunciation!"
            elif score >= 75:
                return "Good pronunciation!"
            elif score >= 60:
                return "Fair pronunciation, can be improved."
            else:
                return "Needs more practice."


azure_pronunciation_service = AzurePronunciationService()
