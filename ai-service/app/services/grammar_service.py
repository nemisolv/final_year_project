# eng-backend/ai-service/app/services/grammar_service.py
import language_tool_python
from anthropic import AsyncAnthropic
from app.config import settings
from app.models.schemas import GrammarCheckRequest, GrammarCheckResponse, GrammarError
from typing import List
import logging
import json
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)

class GrammarService:
    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.CLAUDE_MODEL
        self._tool = None

        # Confidence threshold: Nếu score >= 70 thì dùng LanguageTool, < 70 thì gọi LLM
        self.CONFIDENCE_THRESHOLD = 70.0

        # Phân loại categories theo độ tin cậy
        self.HIGH_CONFIDENCE_CATEGORIES = {
            'TYPOS', 'CASING', 'PUNCTUATION'
        }
        self.MEDIUM_CONFIDENCE_CATEGORIES = {
            'GRAMMAR', 'CONFUSED_WORDS', 'REDUNDANCY'
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

    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """
        Tính độ tương đồng giữa 2 chuỗi sử dụng SequenceMatcher.
        Return: 0.0 - 1.0
        """
        return SequenceMatcher(None, str1.lower(), str2.lower()).ratio()

    def _calculate_confidence_score(self, match) -> float:
        """
        Tính confidence score dựa trên các yếu tố:
        1. Category của lỗi (40 điểm)
        2. Số lượng suggestions (30 điểm)
        3. Độ tương đồng của suggestion với original (20 điểm)
        4. Issue type priority (10 điểm)

        Return: 0-100
        """
        score = 0.0

        # 1. Category confidence (40 điểm)
        if match.category in self.HIGH_CONFIDENCE_CATEGORIES:
            score += 40
        elif match.category in self.MEDIUM_CONFIDENCE_CATEGORIES:
            score += 25
        else:
            score += 10  # Low confidence categories (style, semantic, etc.)

        # 2. Số lượng suggestions (30 điểm)
        if match.replacements:
            num_suggestions = len(match.replacements)
            if num_suggestions == 1:
                # Chỉ 1 cách sửa duy nhất -> rất tin cậy
                score += 30
            elif num_suggestions <= 3:
                # 2-3 cách sửa -> tin cậy vừa phải
                score += 20
            else:
                # Quá nhiều cách sửa (>3) -> không chắc chắn
                score += 10
        else:
            # Không có suggestion -> không tin cậy
            score += 0

        # 3. Độ tương đồng của suggestion với original (20 điểm)
        if match.replacements:
            original = match.matchedText if hasattr(match, 'matchedText') else ""
            if not original:
                # Fallback: lấy từ offset
                original = ""
            suggestion = match.replacements[0]

            if original and suggestion:
                similarity = self._calculate_similarity(original, suggestion)
                score += similarity * 20  # 0-20 điểm
            else:
                score += 15  # Không xác định được, cho điểm khá để không penalize quá

        # 4. Issue type priority (10 điểm)
        # LanguageTool có thuộc tính ruleIssueType hoặc kiểm tra qua ruleId
        if hasattr(match, 'ruleIssueType'):
            if match.ruleIssueType == 'misspelling':
                score += 10
            elif match.ruleIssueType in ['grammar', 'typographical']:
                score += 8
            else:
                score += 5
        else:
            # Kiểm tra qua category
            if match.category in ['TYPOS', 'GRAMMAR']:
                score += 8
            else:
                score += 5

        return min(score, 100.0)

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

            # --- NEW LOGIC: Tính confidence score cho mỗi lỗi ---
            high_confidence_matches = []
            low_confidence_matches = []

            for match in matches:
                confidence_score = self._calculate_confidence_score(match)
                logger.debug(f"Error '{match.matchedText if hasattr(match, 'matchedText') else 'unknown'}' "
                           f"(Category: {match.category}) -> Confidence: {confidence_score:.2f}")

                if confidence_score >= self.CONFIDENCE_THRESHOLD:
                    high_confidence_matches.append(match)
                else:
                    low_confidence_matches.append(match)

            # --- Xử lý dựa trên confidence score ---
            if not low_confidence_matches:
                # Trường hợp 1: TẤT CẢ lỗi đều có confidence cao
                # -> Dùng LanguageTool trực tiếp (nhanh, deterministic)
                logger.info(f"All errors have high confidence (>={self.CONFIDENCE_THRESHOLD}). "
                          f"Using LanguageTool only for text: '{request.text[:30]}...'")

                corrected_text = language_tool_python.utils.correct(request.text, matches)
                errors: List[GrammarError] = []
                for match in matches:
                    errors.append(GrammarError(
                        offset=match.offset,
                        errorLength=match.errorLength,
                        message=match.message,
                        suggestions=match.replacements[:5] if match.replacements else []
                    ))

                return GrammarCheckResponse(
                    originalText=request.text,
                    correctedText=corrected_text,
                    errors=errors
                )
            else:
                # Trường hợp 2: CÓ ÍT NHẤT 1 lỗi có confidence thấp
                # -> Gọi LLM để có explanation và suggestion tốt hơn
                logger.info(f"Found {len(low_confidence_matches)} low-confidence errors (< {self.CONFIDENCE_THRESHOLD}). "
                          f"Escalating to LLM for text: '{request.text[:30]}...'")

                error_descriptions = []
                for match in matches:
                    confidence = self._calculate_confidence_score(match)
                    error_descriptions.append(
                        f"- Error: '{request.text[match.offset:match.offset+match.errorLength]}' "
                        f"(Rule: {match.ruleId}, Category: {match.category}, Confidence: {confidence:.1f}/100). "
                        f"Suggestions: {', '.join(match.replacements[:3]) if match.replacements else 'None'}. "
                        f"Message: {match.message}"
                    )

                prompt = f"""
A user has written: "{request.text}"

A grammar checking tool (LanguageTool) detected these potential errors:
{chr(10).join(error_descriptions)}

Your task:
1. Analyze each error carefully
2. For each error, provide a clear, simple explanation suitable for an English learner
3. Suggest the best correction(s)
4. Provide the fully corrected text

Respond in JSON format:
{{
  "originalText": "...",
  "correctedText": "...",
  "errors": [
    {{
      "offset": <int>,
      "errorLength": <int>,
      "message": "<clear explanation for learner>",
      "suggestions": ["<best suggestion>", "<alternative if applicable>"]
    }}
  ]
}}

IMPORTANT:
- "offset" and "errorLength" must match the original text exactly
- Keep explanations simple and educational
- Only include the most relevant suggestions (max 3 per error)
"""

                response = await self.client.messages.create(
                    model=self.model,
                    max_tokens=settings.CLAUDE_MAX_TOKENS,
                    temperature=settings.CLAUDE_TEMPERATURE,
                    system="You are a helpful English grammar assistant. You explain errors clearly and suggest corrections. Always respond in valid JSON format.",
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
                    logger.warning(f"Failed to parse LLM response: {parse_error}. Using LanguageTool fallback.")
                    # Fallback: use LanguageTool corrections
                    corrected_text = language_tool_python.utils.correct(request.text, matches)
                    errors: List[GrammarError] = []
                    for match in matches:
                        errors.append(GrammarError(
                            offset=match.offset,
                            errorLength=match.errorLength,
                            message=match.message,
                            suggestions=match.replacements[:5] if match.replacements else []
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