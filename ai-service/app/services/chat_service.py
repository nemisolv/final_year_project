# eng-backend/ai-service/app/services/chat_service.py
from openai import AsyncOpenAI
from app.config import settings
from app.models import ChatRequest
from typing import AsyncGenerator
import logging

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.system_prompt = """You are an experienced English teacher...""" # Giữ nguyên

    async def chat_stream(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        """
        Process a chat request and stream the AI response
        """
        try:
            messages = [{"role": "system", "content": self.system_prompt}]
            for msg in request.messages:
                messages.append({"role": msg.role.value, "content": msg.content})

            # Gọi OpenAI API ở chế độ stream
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=True, # Bật chế độ stream
            )

            # Lặp qua từng chunk dữ liệu và trả về
            async for chunk in stream:
                content = chunk.choices[0].delta.content or ""
                yield content

        except Exception as e:
            logger.error(f"Error in chat stream service: {str(e)}")
            # Có thể yield một thông báo lỗi nếu cần
            yield "Sorry, an error occurred."

chat_service = ChatService()