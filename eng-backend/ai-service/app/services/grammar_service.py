from openai import OpenAI
from app.config import settings
from app.models import GrammarCheckRequest, GrammarCheckResponse, GrammarError
from app.db.models import GrammarAnalysis, AnalysisMethod
from app.db.audit_models import AuditAction
from app.services.audit_service import audit_service
from sqlalchemy.orm import Session
from datetime import datetime
import logging
import re
import time
import language_tool_python
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class GrammarService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        # Initialize LanguageTool for baseline grammar checking
        try:
            self.language_tool = language_tool_python.LanguageTool('en-US')
            logger.info("LanguageTool initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize LanguageTool: {str(e)}, using LLM-only mode")
            self.language_tool = None

    def _check_with_languagetool(self, text: str) -> tuple[List[GrammarError], str]:
        """
        Baseline grammar check using LanguageTool
        Returns: (errors, corrected_text)
        """
        if not self.language_tool:
            return [], text

        matches = self.language_tool.check(text)
        corrected = language_tool_python.utils.correct(text, matches)

        errors = []
        for match in matches:
            errors.append(GrammarError(
                message=match.message,
                short_message=match.ruleId,
                offset=match.offset,
                length=match.errorLength,
                rule_id=match.ruleId,
                category=match.category,
                replacements=match.replacements[:3] if match.replacements else [],
                context=match.context
            ))

        return errors, corrected

    async def check_grammar(self, request: GrammarCheckRequest, db: Session = None) -> GrammarCheckResponse:
        """
        Two-stage grammar checking:
        1. Baseline check with LanguageTool (fast, rule-based)
        2. LLM re-writer for style improvements and explanations
        """
        start_time = time.time()

        try:
            # Stage 1: Baseline check with LanguageTool
            baseline_errors, baseline_corrected = self._check_with_languagetool(request.text)

            # Stage 2: LLM enhancement
            prompt = f"""You are an expert English writing coach. Review the following text and provide improvements.

Original text:
"{request.text}"

Baseline corrections already found:
"{baseline_corrected}"

Your task:
1. Identify any additional style improvements, word choice enhancements, or clarity issues
2. Provide a polished, natural-sounding rewrite
3. Explain the key differences between the original and your rewrite
4. Give suggestions for improving writing style

Respond in JSON format:
{{
    "rewritten_text": "Your improved version",
    "improvements": [
        {{
            "aspect": "Style | Clarity | Word Choice | Flow",
            "original": "original phrase",
            "improved": "improved phrase",
            "explanation": "why this is better"
        }}
    ],
    "suggestions": ["General writing tip 1", "General writing tip 2"]
}}"""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert English writing coach. Provide constructive feedback and improvements. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1500,
            )

            result = response.choices[0].message.content

            # Parse JSON response
            import json
            try:
                parsed = json.loads(result)
            except:
                # Try to extract JSON from markdown code blocks
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', result, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(1))
                else:
                    parsed = {
                        "rewritten_text": baseline_corrected,
                        "improvements": [],
                        "suggestions": []
                    }

            # Combine baseline errors with LLM improvements
            all_errors = baseline_errors.copy()

            # Add LLM improvements as additional "errors" (they're really enhancements)
            for improvement in parsed.get("improvements", []):
                all_errors.append(GrammarError(
                    message=improvement.get("explanation", ""),
                    short_message=f"{improvement.get('aspect', 'Enhancement')}",
                    offset=0,  # Position not available for LLM suggestions
                    length=0,
                    rule_id="LLM_ENHANCEMENT",
                    category="STYLE",
                    replacements=[improvement.get("improved", "")],
                    context=improvement.get("original", "")
                ))

            final_text = parsed.get("rewritten_text", baseline_corrected)
            suggestions = parsed.get("suggestions", [])

            processing_time = int((time.time() - start_time) * 1000)

            response = GrammarCheckResponse(
                errors=all_errors,
                corrected_text=final_text,
                error_count=len(all_errors),
                suggestions=suggestions
            )

            # Store in database if session provided and user_id exists
            if db and request.user_id:
                try:
                    # Determine analysis method based on what was used
                    analysis_method = AnalysisMethod.HYBRID if self.language_tool else AnalysisMethod.LLM

                    grammar_analysis = GrammarAnalysis(
                        user_id=request.user_id,
                        original_text=request.text,
                        corrected_text=response.corrected_text,
                        errors_detected=[error.dict() for error in all_errors],
                        suggestions=response.suggestions,
                        confidence_score=None,
                        analysis_method=analysis_method,
                        processing_time_ms=processing_time,
                        created_at=datetime.now()
                    )
                    db.add(grammar_analysis)
                    db.commit()
                    logger.info(f"Stored grammar analysis for user {request.user_id} using {analysis_method}")

                    # Log user activity for learning analytics
                    audit_service.log_user_activity(
                        db=db,
                        user_id=request.user_id,
                        activity_type="grammar_practice",
                        score=max(0, 100 - (len(all_errors) * 10)),  # Simple scoring
                        errors_made=len(all_errors),
                        topics_covered=list(set([error.category for error in all_errors])),
                        skills_practiced=["writing", "grammar"],
                        content_metadata={
                            "text_length": len(request.text),
                            "analysis_method": analysis_method.value,
                            "baseline_errors": len(baseline_errors),
                            "llm_enhancements": len(all_errors) - len(baseline_errors)
                        }
                    )

                except Exception as db_error:
                    logger.error(f"Failed to store grammar analysis: {str(db_error)}")
                    db.rollback()

            return response

        except Exception as e:
            logger.error(f"Error in grammar service: {str(e)}")
            raise


grammar_service = GrammarService()
