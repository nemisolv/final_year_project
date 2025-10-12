from openai import AsyncOpenAI
from app.config import settings
from app.models import ChatRequest, ChatResponse, Message, MessageRole
from typing import List
import logging

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.system_prompt = """You are an experienced English teacher and conversation partner.
Your goals are to:
1. Help students practice English conversation naturally
2. Provide gentle corrections when needed
3. Ask engaging follow-up questions to keep the conversation flowing
4. Adapt your language level to match the student's proficiency
5. Encourage the student and build their confidence
6. Focus on practical, real-world English

Be friendly, patient, and encouraging. When you notice errors, correct them naturally
in your response without being overly critical."""

    async def chat(self, request: ChatRequest) -> ChatResponse:
        """
        Process a chat request and return AI response
        """
        try:
            # Prepare messages for OpenAI
            messages = [{"role": "system", "content": self.system_prompt}]

            for msg in request.messages:
                messages.append({
                    "role": msg.role.value,
                    "content": msg.content
                })

            # Call OpenAI API (async)
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=request.max_tokens or settings.OPENAI_MAX_TOKENS,
                temperature=request.temperature or settings.OPENAI_TEMPERATURE,
            )

            # Extract response
            assistant_message = response.choices[0].message.content

            return ChatResponse(
                message=Message(
                    role=MessageRole.ASSISTANT,
                    content=assistant_message
                ),
                usage={
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                }
            )

        except Exception as e:
            logger.error(f"Error in chat service: {str(e)}")
            raise


chat_service = ChatService()
