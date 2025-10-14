from anthropic import Anthropic
from app.config import settings
from app.models import ConversationRequest, ConversationResponse, Message
from app.services.nlu_service import nlu_service
from typing import Dict
import logging

logger = logging.getLogger(__name__)


class ConversationService:
    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.CLAUDE_MODEL
        self.nlu = nlu_service

        # Scenario templates
        self.scenarios: Dict[str, Dict] = {
            "1": {
                "title": "At the Restaurant",
                "user_role": "Customer",
                "ai_role": "Waiter",
                "context": "You are a friendly waiter at an upscale restaurant. Help the customer order food, answer questions about menu items, and provide excellent service.",
                "objectives": ["Order a meal", "Ask about menu items", "Make special requests", "Ask for the bill"]
            },
            "2": {
                "title": "Job Interview",
                "user_role": "Candidate",
                "ai_role": "Interviewer",
                "context": "You are conducting a job interview for a software engineer position. Ask professional questions, evaluate responses, and maintain a professional yet friendly demeanor.",
                "objectives": ["Introduce yourself", "Talk about experience", "Answer behavioral questions", "Ask about the company"]
            },
            "3": {
                "title": "Hotel Check-in",
                "user_role": "Guest",
                "ai_role": "Receptionist",
                "context": "You are a helpful hotel receptionist. Assist the guest with check-in, answer questions about amenities, and provide information about hotel services.",
                "objectives": ["Confirm reservation", "Ask about amenities", "Request services", "Ask about breakfast"]
            },
            "4": {
                "title": "Doctor's Appointment",
                "user_role": "Patient",
                "ai_role": "Doctor",
                "context": "You are a caring doctor. Listen to the patient's symptoms, ask relevant questions, and provide professional medical advice in clear, understandable language.",
                "objectives": ["Describe symptoms", "Answer health questions", "Understand prescriptions", "Get medical advice"]
            }
        }

    async def process_conversation(self, request: ConversationRequest) -> ConversationResponse:
        """
        Process a conversation in a specific scenario
        Uses NLU for intent and entity detection
        """
        try:
            # Parse user message with NLU
            nlu_result = self.nlu.parse(request.user_message, request.user_id)
            logger.info(f"NLU detected intent: {nlu_result['intent']['name']} (confidence: {nlu_result['intent']['confidence']:.2f})")

            # Get scenario details
            scenario = self.scenarios.get(request.scenario_id)
            if not scenario:
                raise ValueError(f"Unknown scenario ID: {request.scenario_id}")

            # Build system prompt with NLU context
            system_prompt = f"""You are playing the role of a {scenario['ai_role']} in a language learning conversation practice.

Context: {scenario['context']}

The learner is playing the role of: {scenario['user_role']}

Your responsibilities:
1. Stay in character as {scenario['ai_role']}
2. Respond naturally to the learner's messages
3. Gently correct major grammar or vocabulary mistakes by modeling correct usage
4. Ask follow-up questions to keep the conversation realistic
5. Help the learner achieve these objectives: {', '.join(scenario['objectives'])}
6. Provide a natural, realistic conversation experience

Provide brief, natural responses (2-4 sentences). Don't break character."""

            # Build message history (Claude uses separate system parameter)
            messages = []

            # Add conversation history
            for msg in request.conversation_history:
                messages.append({
                    "role": msg.role.value,
                    "content": msg.content
                })

            # Add current user message
            messages.append({
                "role": "user",
                "content": request.user_message
            })

            # Call Claude API
            response = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                temperature=0.8,
                system=system_prompt,
                messages=messages
            )

            ai_message = response.content[0].text

            # Analyze user's message for corrections (simple version)
            corrections = await self._analyze_for_corrections(request.user_message)

            # Calculate approximate score based on message quality
            score = await self._calculate_score(request.user_message, corrections)

            # Generate feedback if there are corrections
            feedback = await self._generate_feedback(corrections, request.user_message) if corrections else None

            return ConversationResponse(
                ai_message=ai_message,
                feedback=feedback,
                corrections=corrections,
                score=score
            )

        except Exception as e:
            logger.error(f"Error in conversation service: {str(e)}")
            raise

    async def _analyze_for_corrections(self, text: str) -> list:
        """
        Analyze text for common errors (simplified version)
        """
        # In production, use language-tool-python or advanced NLP
        corrections = []
        # This is a placeholder - implement proper grammar checking
        return corrections

    async def _calculate_score(self, text: str, corrections: list) -> float:
        """
        Calculate a quality score for the message
        """
        # Simple scoring based on length and corrections
        base_score = 80.0
        length_score = min(20, len(text.split()) * 2)  # Bonus for longer responses
        error_penalty = len(corrections) * 5

        score = base_score + length_score - error_penalty
        return max(0.0, min(100.0, score))

    async def _generate_feedback(self, corrections: list, original_text: str) -> str:
        """
        Generate helpful feedback based on corrections
        """
        if not corrections:
            return "Great job! Your message was clear and well-structured."

        feedback_parts = ["Good effort! Here are some suggestions:"]
        for correction in corrections[:3]:  # Limit to top 3
            feedback_parts.append(f"- {correction.get('message', 'Grammar suggestion')}")

        return " ".join(feedback_parts)


conversation_service = ConversationService()
