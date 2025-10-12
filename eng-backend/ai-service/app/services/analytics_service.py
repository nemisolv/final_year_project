from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from app.db.models import (
    DialogueSession, DialogueTurn, GrammarAnalysis,
    PronunciationAnalysis, UserStats, SessionStatus
)
from app.models import ProgressRequest, ProgressResponse, ProgressInsight
from datetime import datetime, timedelta
from typing import List
import logging

logger = logging.getLogger(__name__)


class AnalyticsService:
    """
    Service for analyzing user progress and generating insights
    """

    def __init__(self):
        pass

    async def get_user_progress(self, request: ProgressRequest, db: Session) -> ProgressResponse:
        """
        Generate comprehensive progress analytics for a user
        """
        try:
            # Calculate time period
            end_date = datetime.now()
            if request.time_period == "day":
                start_date = end_date - timedelta(days=1)
            elif request.time_period == "week":
                start_date = end_date - timedelta(days=7)
            elif request.time_period == "month":
                start_date = end_date - timedelta(days=30)
            else:  # all
                start_date = datetime.min

            # Get user stats
            user_stats = db.query(UserStats).filter(
                UserStats.user_id == request.user_id
            ).first()

            if not user_stats:
                # Create default stats if not exist
                user_stats = UserStats(
                    user_id=request.user_id,
                    total_xp=0,
                    current_level=1,
                    current_streak_days=0
                )
                db.add(user_stats)
                db.commit()
                db.refresh(user_stats)

            # Analyze conversation performance
            conversation_insights = await self._analyze_conversations(
                request.user_id, start_date, end_date, db
            )

            # Analyze grammar performance
            grammar_insights = await self._analyze_grammar(
                request.user_id, start_date, end_date, db
            )

            # Analyze pronunciation
            pronunciation_insights = await self._analyze_pronunciation(
                request.user_id, start_date, end_date, db
            )

            # Identify strengths and weaknesses
            strengths, weaknesses = await self._identify_strengths_weaknesses(
                conversation_insights, grammar_insights, pronunciation_insights
            )

            # Generate recommendations
            recommendations = await self._generate_recommendations(
                weaknesses, user_stats
            )

            # Generate next goals
            next_goals = await self._generate_next_goals(
                user_stats, strengths, weaknesses
            )

            # Combine all insights
            all_insights = conversation_insights + grammar_insights + pronunciation_insights

            # Calculate overall score
            overall_score = await self._calculate_overall_score(
                user_stats, all_insights
            )

            return ProgressResponse(
                overall_score=overall_score,
                strengths=strengths,
                weaknesses=weaknesses,
                insights=all_insights,
                recommendations=recommendations,
                next_goals=next_goals
            )

        except Exception as e:
            logger.error(f"Error in analytics service: {str(e)}")
            raise

    async def _analyze_conversations(
        self, user_id: int, start_date: datetime, end_date: datetime, db: Session
    ) -> List[ProgressInsight]:
        """
        Analyze conversation practice sessions
        """
        insights = []

        # Get conversation stats
        sessions = db.query(DialogueSession).filter(
            and_(
                DialogueSession.user_id == user_id,
                DialogueSession.started_at >= start_date,
                DialogueSession.started_at <= end_date
            )
        ).all()

        if sessions:
            total_sessions = len(sessions)
            completed_sessions = len([s for s in sessions if s.status == SessionStatus.COMPLETED])
            avg_score = sum([float(s.score) for s in sessions if s.score]) / len(sessions) if sessions else 0
            total_turns = sum([s.turns_count for s in sessions])

            insights.append(ProgressInsight(
                category="Conversation Practice",
                value=avg_score,
                change=None,
                description=f"Completed {completed_sessions} conversations with {total_turns} turns"
            ))

            # Calculate improvement
            recent_avg = sum([float(s.score) for s in sessions[-5:] if s.score]) / min(5, len(sessions)) if sessions else 0
            early_avg = sum([float(s.score) for s in sessions[:5] if s.score]) / min(5, len(sessions)) if sessions else 0
            improvement = recent_avg - early_avg if len(sessions) >= 5 else 0

            if improvement > 0:
                insights.append(ProgressInsight(
                    category="Conversation Improvement",
                    value=improvement,
                    change=improvement,
                    description=f"Your conversation skills improved by {improvement:.1f}% recently"
                ))

        return insights

    async def _analyze_grammar(
        self, user_id: int, start_date: datetime, end_date: datetime, db: Session
    ) -> List[ProgressInsight]:
        """
        Analyze grammar checking history
        """
        insights = []

        analyses = db.query(GrammarAnalysis).filter(
            and_(
                GrammarAnalysis.user_id == user_id,
                GrammarAnalysis.created_at >= start_date,
                GrammarAnalysis.created_at <= end_date
            )
        ).all()

        if analyses:
            total_checks = len(analyses)
            total_errors = sum([len(a.errors_detected or []) for a in analyses])
            avg_errors = total_errors / total_checks if total_checks > 0 else 0

            insights.append(ProgressInsight(
                category="Grammar Accuracy",
                value=max(0, 100 - (avg_errors * 10)),  # Rough accuracy score
                change=None,
                description=f"Average {avg_errors:.1f} errors per text in {total_checks} checks"
            ))

            # Check for improvement
            recent_analyses = analyses[-10:] if len(analyses) >= 10 else analyses
            early_analyses = analyses[:10] if len(analyses) >= 10 else []

            if early_analyses:
                recent_avg_errors = sum([len(a.errors_detected or []) for a in recent_analyses]) / len(recent_analyses)
                early_avg_errors = sum([len(a.errors_detected or []) for a in early_analyses]) / len(early_analyses)
                error_reduction = early_avg_errors - recent_avg_errors

                if error_reduction > 0.5:
                    insights.append(ProgressInsight(
                        category="Grammar Improvement",
                        value=error_reduction,
                        change=error_reduction,
                        description=f"You're making {error_reduction:.1f} fewer errors on average!"
                    ))

        return insights

    async def _analyze_pronunciation(
        self, user_id: int, start_date: datetime, end_date: datetime, db: Session
    ) -> List[ProgressInsight]:
        """
        Analyze pronunciation practice
        """
        insights = []

        analyses = db.query(PronunciationAnalysis).filter(
            and_(
                PronunciationAnalysis.user_id == user_id,
                PronunciationAnalysis.created_at >= start_date,
                PronunciationAnalysis.created_at <= end_date
            )
        ).all()

        if analyses:
            avg_score = sum([float(a.overall_score) for a in analyses if a.overall_score]) / len(analyses)

            insights.append(ProgressInsight(
                category="Pronunciation",
                value=avg_score,
                change=None,
                description=f"Average pronunciation score: {avg_score:.1f}/100 across {len(analyses)} attempts"
            ))

        return insights

    async def _identify_strengths_weaknesses(
        self, conv_insights: List, grammar_insights: List, pron_insights: List
    ) -> tuple:
        """
        Identify user's strengths and weaknesses
        """
        strengths = []
        weaknesses = []

        all_insights = conv_insights + grammar_insights + pron_insights

        for insight in all_insights:
            if insight.value >= 80:
                strengths.append(f"{insight.category}: {insight.description}")
            elif insight.value < 60:
                weaknesses.append(f"{insight.category}: {insight.description}")

        if not strengths:
            strengths = ["Keep practicing! Your strengths will emerge as you learn more."]

        if not weaknesses:
            weaknesses = ["Great job! No major weaknesses identified."]

        return strengths, weaknesses

    async def _generate_recommendations(
        self, weaknesses: List[str], user_stats: UserStats
    ) -> List[str]:
        """
        Generate personalized recommendations
        """
        recommendations = []

        # Check streak
        if user_stats.current_streak_days < 3:
            recommendations.append("🔥 Build a learning streak! Practice daily to maintain consistency.")

        # Check for weaknesses
        if any("Grammar" in w for w in weaknesses):
            recommendations.append("📚 Focus on grammar exercises to improve accuracy")

        if any("Conversation" in w for w in weaknesses):
            recommendations.append("💬 Practice more conversation scenarios to build confidence")

        if any("Pronunciation" in w for w in weaknesses):
            recommendations.append("🗣️ Work on pronunciation with voice recording exercises")

        # General recommendations
        if user_stats.total_study_time < 300:  # Less than 5 hours
            recommendations.append("⏰ Increase study time to 20-30 minutes daily")

        if not recommendations:
            recommendations.append("✨ You're doing great! Keep up the excellent work!")

        return recommendations

    async def _generate_next_goals(
        self, user_stats: UserStats, strengths: List[str], weaknesses: List[str]
    ) -> List[str]:
        """
        Generate next learning goals
        """
        goals = []

        # Level-based goals
        if user_stats.current_level < 5:
            goals.append(f"Reach Level {user_stats.current_level + 1} ({user_stats.xp_to_next_level} XP needed)")

        # Streak goals
        if user_stats.current_streak_days < 7:
            goals.append(f"Build a 7-day learning streak (currently {user_stats.current_streak_days} days)")
        else:
            goals.append(f"Maintain your {user_stats.current_streak_days}-day streak!")

        # Activity goals
        if user_stats.dialogues_completed < 10:
            goals.append("Complete 10 conversation practice sessions")

        if user_stats.exercises_completed < 20:
            goals.append("Complete 20 grammar exercises")

        return goals

    async def _calculate_overall_score(
        self, user_stats: UserStats, insights: List[ProgressInsight]
    ) -> float:
        """
        Calculate overall progress score (0-100)
        """
        if not insights:
            return 50.0  # Default score

        # Average of all insight values
        avg_performance = sum([i.value for i in insights]) / len(insights)

        # Factor in level and activity
        level_bonus = min(user_stats.current_level * 2, 20)
        streak_bonus = min(user_stats.current_streak_days, 10)

        overall = (avg_performance * 0.7) + level_bonus + streak_bonus

        return min(100.0, max(0.0, overall))


analytics_service = AnalyticsService()
