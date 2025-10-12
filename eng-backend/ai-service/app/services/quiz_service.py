from openai import OpenAI
from app.config import settings
from app.models import QuizRequest, QuizResponse, QuizQuestion, DifficultyLevel
import logging
import json
import uuid

logger = logging.getLogger(__name__)


class QuizService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    async def generate_quiz(self, request: QuizRequest) -> QuizResponse:
        """
        Generate a quiz based on topic and difficulty
        """
        try:
            prompt = f"""Create an English learning quiz with the following specifications:

Topic: {request.topic}
Difficulty Level: {request.difficulty.value}
Number of Questions: {request.num_questions}
Question Types: {', '.join(request.question_types)}

Generate questions in JSON format with this structure:
{{
    "questions": [
        {{
            "type": "multiple_choice | fill_blank | true_false",
            "question": "The question text",
            "options": ["option1", "option2", "option3", "option4"],  // Only for multiple_choice
            "correct_answer": "The correct answer",
            "explanation": "Why this is the correct answer and learning point"
        }}
    ]
}}

Guidelines:
- Make questions educational and relevant to {request.topic}
- Adjust complexity to {request.difficulty.value} level
- Include diverse question types: {', '.join(request.question_types)}
- Provide clear explanations for learning
- For fill_blank questions, use "___" to indicate the blank
- For true_false, options should be ["True", "False"]

Respond with valid JSON only."""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert English teacher creating educational quizzes. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000,
            )

            result = response.choices[0].message.content

            # Parse JSON
            try:
                parsed = json.loads(result)
            except (json.JSONDecodeError, ValueError) as e:
                # Extract JSON from markdown
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', result, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(1))
                else:
                    raise ValueError(f"Could not parse quiz response: {str(e)}")

            # Convert to response model
            questions = []
            for idx, q in enumerate(parsed.get("questions", [])[:request.num_questions]):
                question = QuizQuestion(
                    id=str(uuid.uuid4()),
                    type=q.get("type", "multiple_choice"),
                    question=q.get("question", ""),
                    options=q.get("options"),
                    correct_answer=q.get("correct_answer", ""),
                    explanation=q.get("explanation", ""),
                    difficulty=request.difficulty
                )
                questions.append(question)

            quiz_id = str(uuid.uuid4())

            return QuizResponse(
                quiz_id=quiz_id,
                topic=request.topic,
                questions=questions,
                total_questions=len(questions)
            )

        except Exception as e:
            logger.error(f"Error in quiz service: {str(e)}")
            raise


quiz_service = QuizService()
