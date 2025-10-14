# eng-backend/ai-service/app/services/chat_service.py
from anthropic import AsyncAnthropic
from app.config import settings
from app.models import ChatRequest
from typing import AsyncGenerator
import logging

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.CLAUDE_MODEL
        self.system_prompt = """You are an experienced English teacher...""" # Giữ nguyên

    async def chat_stream(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        """
        Process a chat request and stream the AI response
        """
        try:
            # Convert messages to Claude format (Claude uses separate system parameter)
            messages = []
            for msg in request.messages:
                messages.append({"role": msg.role.value, "content": msg.content})

            # Call Claude API in stream mode
            async with self.client.messages.stream(
                model=self.model,
                max_tokens=settings.CLAUDE_MAX_TOKENS,
                temperature=settings.CLAUDE_TEMPERATURE,
                system=self.system_prompt,
                messages=messages,
            ) as stream:
                async for text in stream.text_stream:
                    yield text

        except Exception as e:
            logger.error(f"Error in chat stream service: {str(e)}")
            # Có thể yield một thông báo lỗi nếu cần
            yield "Sorry, an error occurred."

chat_service = ChatService()