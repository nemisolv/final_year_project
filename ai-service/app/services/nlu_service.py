import logging
from typing import Dict, List, Optional
import os
import json

logger = logging.getLogger(__name__)


class NLUService:
    """
    Natural Language Understanding service using Rasa NLU
    Handles intent detection and entity extraction
    """

    def __init__(self):
        self.rasa_available = False
        self.interpreter = None

        # Try to load Rasa model
        try:
            from rasa.nlu.model import Interpreter

            model_path = os.getenv("RASA_MODEL_PATH", "models/rasa/nlu")

            if os.path.exists(model_path):
                self.interpreter = Interpreter.load(model_path)
                self.rasa_available = True
                logger.info(f"Rasa NLU model loaded from {model_path}")
            else:
                logger.warning(f"Rasa model not found at {model_path}. NLU will use fallback mode.")

        except ImportError:
            logger.warning("Rasa not installed. Install with: pip install rasa")
        except Exception as e:
            logger.warning(f"Failed to load Rasa model: {str(e)}")

    def parse(self, text: str, user_id: Optional[int] = None) -> Dict:
        """
        Parse user input to extract intent and entities

        Returns:
        {
            "text": "original text",
            "intent": {
                "name": "intent_name",
                "confidence": 0.95
            },
            "entities": [
                {
                    "entity": "entity_type",
                    "value": "entity_value",
                    "start": 0,
                    "end": 5,
                    "confidence": 0.9
                }
            ]
        }
        """
        if self.rasa_available and self.interpreter:
            try:
                result = self.interpreter.parse(text)
                return self._format_rasa_result(result)
            except Exception as e:
                logger.error(f"Rasa parsing failed: {str(e)}, using fallback")
                return self._fallback_parse(text)
        else:
            return self._fallback_parse(text)

    def _format_rasa_result(self, rasa_result: Dict) -> Dict:
        """
        Format Rasa result to standardized output
        """
        return {
            "text": rasa_result.get("text", ""),
            "intent": {
                "name": rasa_result.get("intent", {}).get("name", "unknown"),
                "confidence": rasa_result.get("intent", {}).get("confidence", 0.0)
            },
            "entities": [
                {
                    "entity": entity.get("entity"),
                    "value": entity.get("value"),
                    "start": entity.get("start"),
                    "end": entity.get("end"),
                    "confidence": entity.get("confidence_entity", 0.0),
                    "extractor": entity.get("extractor")
                }
                for entity in rasa_result.get("entities", [])
            ]
        }

    def _fallback_parse(self, text: str) -> Dict:
        """
        Fallback parsing using simple rule-based detection
        (Used when Rasa is not available)
        """
        text_lower = text.lower()

        # Simple intent detection based on keywords
        intent_map = {
            "greeting": ["hello", "hi", "hey", "good morning", "good afternoon"],
            "goodbye": ["bye", "goodbye", "see you", "farewell"],
            "help": ["help", "assist", "support", "how to"],
            "thanks": ["thank", "thanks", "appreciate"],
            "book": ["book", "reserve", "reservation"],
            "cancel": ["cancel", "delete", "remove"],
            "info": ["what", "when", "where", "who", "why", "how"],
        }

        detected_intent = "unknown"
        confidence = 0.5

        for intent, keywords in intent_map.items():
            for keyword in keywords:
                if keyword in text_lower:
                    detected_intent = intent
                    confidence = 0.7
                    break
            if detected_intent != "unknown":
                break

        # Simple entity extraction (very basic)
        entities = self._extract_simple_entities(text)

        return {
            "text": text,
            "intent": {
                "name": detected_intent,
                "confidence": confidence
            },
            "entities": entities
        }

    def _extract_simple_entities(self, text: str) -> List[Dict]:
        """
        Simple entity extraction using regex patterns
        """
        import re

        entities = []

        # Extract dates (simple patterns)
        date_patterns = [
            (r'\b(\d{1,2}/\d{1,2}/\d{4})\b', 'date'),
            (r'\b(\d{4}-\d{2}-\d{2})\b', 'date'),
            (r'\b(today|tomorrow|yesterday)\b', 'date'),
        ]

        for pattern, entity_type in date_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                entities.append({
                    "entity": entity_type,
                    "value": match.group(1),
                    "start": match.start(),
                    "end": match.end(),
                    "confidence": 0.6,
                    "extractor": "regex"
                })

        # Extract times
        time_pattern = r'\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b'
        matches = re.finditer(time_pattern, text, re.IGNORECASE)
        for match in matches:
            entities.append({
                "entity": "time",
                "value": match.group(1),
                "start": match.start(),
                "end": match.end(),
                "confidence": 0.6,
                "extractor": "regex"
            })

        # Extract numbers
        number_pattern = r'\b(\d+)\b'
        matches = re.finditer(number_pattern, text)
        for match in matches:
            entities.append({
                "entity": "number",
                "value": int(match.group(1)),
                "start": match.start(),
                "end": match.end(),
                "confidence": 0.7,
                "extractor": "regex"
            })

        return entities

    def get_intent_examples(self) -> Dict[str, List[str]]:
        """
        Return example sentences for each intent (for training purposes)
        """
        return {
            "greeting": [
                "Hello",
                "Hi there",
                "Good morning",
                "Hey",
                "Hi, how are you?",
            ],
            "goodbye": [
                "Goodbye",
                "Bye",
                "See you later",
                "Talk to you soon",
                "Have a good day",
            ],
            "book_restaurant": [
                "I want to book a table for two",
                "Reserve a table for tonight",
                "Can I make a reservation?",
                "Book a table for 4 people at 7pm",
                "I'd like to reserve a table",
            ],
            "book_hotel": [
                "I need a hotel room",
                "Book a room for two nights",
                "I want to make a hotel reservation",
                "Reserve a room please",
                "Find me a hotel",
            ],
            "ask_directions": [
                "How do I get to the station?",
                "Where is the nearest bank?",
                "Can you direct me to the museum?",
                "How far is the airport?",
                "What's the best way to downtown?",
            ],
            "order_food": [
                "I'd like to order a pizza",
                "Can I have a burger?",
                "I want to order takeout",
                "What's on the menu?",
                "I'll have the special",
            ],
            "complaint": [
                "I'm not satisfied with the service",
                "This is not what I ordered",
                "I have a complaint",
                "The food is cold",
                "This is unacceptable",
            ],
            "request_help": [
                "Can you help me?",
                "I need assistance",
                "Could you please help?",
                "I'm having trouble with this",
                "I don't understand",
            ],
        }


nlu_service = NLUService()
