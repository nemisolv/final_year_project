# eng-backend/ai-service/app/services/grammar_service.py
import language_tool_python
from openai import AsyncOpenAI
from app.config import settings
from app.models.schemas import GrammarCheckRequest, GrammarCheckResponse, GrammarError
from typing import List
import logging

logger = logging.getLogger(__name__)

class GrammarService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.tool = language_tool_python.LanguageTool('en-US')

        # Các quy tắc đơn giản, độ tin cậy cao mà LanguageTool có thể tự xử lý
        self.HIGH_CONFIDENCE_CATEGORIES = {
            'TYPOS', 'CASING', 'GRAMMAR', 'PUNCTUATION',
            'CONFUSED_WORDS', 'REDUNDANCY'
        }

    async def check_grammar(self, request: GrammarCheckRequest) -> GrammarCheckResponse:
        try:
            matches = self.tool.check(request.text)

            if not matches:
                # Nếu không có lỗi, trả về ngay lập tức
                return GrammarCheckResponse(
                    original_text=request.text,
                    corrected_text=request.text,
                    errors=[]
                )

            # --- Logic phân loại lỗi ---
            is_complex = False
            for match in matches:
                # Nếu một lỗi không có gợi ý hoặc thuộc danh mục phức tạp,
                # chúng ta cần LLM để giải thích tốt hơn.
                if not match.replacements or match.category not in self.HIGH_CONFIDENCE_CATEGORIES:
                    is_complex = True
                    break

            # --- Xử lý dựa trên kết quả phân loại ---
            if not is_complex:
                # Trường hợp 1: Tất cả lỗi đều đơn giản. Tự động sửa và trả về.
                logger.info(f"Handling grammar check for text '{request.text[:30]}...' with LanguageTool only.")

                corrected_text = language_tool_python.utils.correct(request.text, matches)
                errors: List[GrammarError] = []
                for match in matches:
                    errors.append(GrammarError(
                        offset=match.offset,
                        errorLength=match.errorLength,
                        message=match.message,
                        suggestions=match.replacements
                    ))

                return GrammarCheckResponse(
                    original_text=request.text,
                    corrected_text=corrected_text,
                    errors=errors
                )
            else:
                # Trường hợp 2: Có lỗi phức tạp. Sử dụng LLM để có giải thích tốt nhất.
                logger.info(f"Escalating grammar check for text '{request.text[:30]}...' to LLM.")

                error_descriptions = []
                for match in matches:
                    error_descriptions.append(
                        f"- Error: '{request.text[match.offset:match.offset+match.errorLength]}' "
                        f"(Rule: {match.ruleId}). Suggestion: {match.replacements[0] if match.replacements else 'N/A'}. "
                        f"Message: {match.message}"
                    )

                prompt = f"""
                A user has written: "{request.text}"
                A grammar tool found these errors:
                {chr(10).join(error_descriptions)}

                Act as a friendly English tutor. For each error, provide a simple explanation and suggest a fix.
                Then, provide the fully corrected text.
                
                Respond in a structured JSON format: {{"corrected_text": "...", "errors": [{{"offset": ..., "errorLength": ..., "message": "...", "suggestions": ["..."]}}]}}.
                Ensure "offset" and "errorLength" match the original text exactly.
                """

                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a helpful English grammar assistant responding in JSON format."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )

                ai_response_data = response.choices[0].message.content
                return GrammarCheckResponse.parse_raw(ai_response_data)

        except Exception as e:
            logger.error(f"Error in grammar service: {str(e)}")
            raise

grammar_service = GrammarService()