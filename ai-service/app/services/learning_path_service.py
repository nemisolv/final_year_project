from anthropic import Anthropic
from app.config import settings
from app.models import LearningPathRequest, LearningPathResponse, LearningActivity, DifficultyLevel
import logging
import json
import uuid

logger = logging.getLogger(__name__)


class LearningPathService:
    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.CLAUDE_MODEL

    async def generate_learning_path(self, request: LearningPathRequest) -> LearningPathResponse:
        """
        Generate a personalized learning path for the user
        """
        try:
            prompt = f"""Create a personalized English learning path with the following specifications:

Current Level: {request.current_level.value}
Learning Goals: {', '.join(request.goals)}
Interests: {', '.join(request.interests) if request.interests else 'General English'}
Available Time Per Day: {request.available_time_per_day} minutes

Generate a structured learning path in JSON format:
{{
    "description": "Overview of the learning path and expected outcomes",
    "activities": [
        {{
            "title": "Activity title",
            "description": "What the learner will do and learn",
            "type": "lesson | exercise | conversation | quiz",
            "estimated_time": time in minutes,
            "difficulty": "{request.current_level.value}",
            "order": sequence number
        }}
    ]
}}

Guidelines:
- Create 7-10 activities for a week-long plan
- Mix different activity types for variety
- Progress from easier to more challenging
- Align with the learner's goals: {', '.join(request.goals)}
- Consider their interests: {', '.join(request.interests) if request.interests else 'General topics'}
- Keep daily time commitment around {request.available_time_per_day} minutes
- Make activities practical and engaging

Respond with valid JSON only."""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=1500,
                temperature=0.7,
                system="You are an expert curriculum designer for English language learning. Always respond with valid JSON only.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            result = response.content[0].text

            # Parse JSON
            try:
                parsed = json.loads(result)
            except:
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', result, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(1))
                else:
                    raise ValueError("Could not parse learning path response")

            # Convert to response model
            activities = []
            total_time = 0

            for activity_data in parsed.get("activities", []):
                activity = LearningActivity(
                    title=activity_data.get("title", ""),
                    description=activity_data.get("description", ""),
                    type=activity_data.get("type", "lesson"),
                    estimated_time=activity_data.get("estimated_time", 30),
                    difficulty=DifficultyLevel(activity_data.get("difficulty", request.current_level.value)),
                    order=activity_data.get("order", len(activities) + 1)
                )
                activities.append(activity)
                total_time += activity.estimated_time

            path_id = str(uuid.uuid4())

            return LearningPathResponse(
                path_id=path_id,
                activities=activities,
                total_estimated_time=total_time,
                description=parsed.get("description", "Your personalized learning path")
            )

        except Exception as e:
            logger.error(f"Error in learning path service: {str(e)}")
            raise


learning_path_service = LearningPathService()
