# eng-backend/ai-service/app/services/grammar_service.py
import language_tool_python
from anthropic import AsyncAnthropic
from app.config import settings
from app.models.schemas import GrammarCheckRequest, GrammarCheckResponse, GrammarError
from typing import List
import logging
import json

logger = logging.getLogger(__name__)

class GrammarService:
    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.CLAUDE_MODEL
        self._tool = None

        # Các quy tắc đơn giản, độ tin cậy cao mà LanguageTool có thể tự xử lý
        self.HIGH_CONFIDENCE_CATEGORIES = {
            'TYPOS', 'CASING', 'GRAMMAR', 'PUNCTUATION',
            'CONFUSED_WORDS', 'REDUNDANCY'
        }

    @property
    def tool(self):
        """Lazy initialization of LanguageTool"""
        if self._tool is None:
            try:
                self._tool = language_tool_python.LanguageTool('en-US')
            except Exception as e:
                logger.warning(f"LanguageTool not available: {e}. Will use Claude API only.")
        return self._tool

    async def check_grammar(self, request: GrammarCheckRequest) -> GrammarCheckResponse:
        try:
            # If LanguageTool is not available, use Claude API directly
            if self.tool is None:
                logger.info(f"LanguageTool not available, using Claude API for text: {request.text[:30]}...")
                return await self._check_with_claude(request.text)

            matches = self.tool.check(request.text)

            if not matches:
                # Nếu không có lỗi, trả về ngay lập tức
                return GrammarCheckResponse(
                    originalText=request.text,
                    correctedText=request.text,
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
                    originalText=request.text,
                    correctedText=corrected_text,
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

                Respond in a structured JSON format: {{"originalText": "...", "correctedText": "...", "errors": [{{"offset": ..., "errorLength": ..., "message": "...", "suggestions": ["..."]}}]}}.
                Ensure "offset" and "errorLength" match the original text exactly.
                """

                response = await self.client.messages.create(
                    model=self.model,
                    max_tokens=settings.CLAUDE_MAX_TOKENS,
                    temperature=settings.CLAUDE_TEMPERATURE,
                    system="You are a helpful English grammar assistant responding in JSON format.",
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )

                ai_response_data = response.content[0].text
                # Try to parse JSON from the response
                import json
                try:
                    # Clean up potential markdown formatting
                    clean_response = ai_response_data.strip()
                    if clean_response.startswith("```json"):
                        clean_response = clean_response[7:]
                    if clean_response.startswith("```"):
                        clean_response = clean_response[3:]
                    if clean_response.endswith("```"):
                        clean_response = clean_response[:-3]
                    clean_response = clean_response.strip()

                    parsed_data = json.loads(clean_response)
                    return GrammarCheckResponse(**parsed_data)
                except (json.JSONDecodeError, Exception) as parse_error:
                    logger.warning(f"Failed to parse LLM response: {parse_error}. Using fallback.")
                    # Fallback: use LanguageTool corrections
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
                        originalText=request.text,
                        correctedText=corrected_text,
                        errors=errors
                    )

        except Exception as e:
            logger.error(f"Error in grammar service: {str(e)}")
            raise

    async def _check_with_claude(self, text: str) -> GrammarCheckResponse:
        """Use Claude API directly when LanguageTool is not available"""
        prompt = f"""
        Check the following text for grammar errors and provide corrections:

        Text: "{text}"

        Respond in a structured JSON format: {{"originalText": "...", "correctedText": "...", "errors": [{{"offset": ..., "errorLength": ..., "message": "...", "suggestions": ["..."]}}]}}.

        If there are no errors, return the same text in both originalText and correctedText fields with an empty errors array.
        Ensure "offset" and "errorLength" match the original text exactly.
        """

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=settings.CLAUDE_MAX_TOKENS,
            temperature=settings.CLAUDE_TEMPERATURE,
            system="You are a helpful English grammar assistant responding in JSON format.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        ai_response_data = response.content[0].text

        try:
            # Clean up potential markdown formatting
            clean_response = ai_response_data.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:]
            if clean_response.startswith("```"):
                clean_response = clean_response[3:]
            if clean_response.endswith("```"):
                clean_response = clean_response[:-3]
            clean_response = clean_response.strip()

            parsed_data = json.loads(clean_response)
            return GrammarCheckResponse(**parsed_data)
        except (json.JSONDecodeError, Exception) as parse_error:
            logger.warning(f"Failed to parse Claude response: {parse_error}. Returning text as-is.")
            # Fallback: return text without corrections
            return GrammarCheckResponse(
                originalText=text,
                correctedText=text,
                errors=[]
            )

grammar_service = GrammarService()