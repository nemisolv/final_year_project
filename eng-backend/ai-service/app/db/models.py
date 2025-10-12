from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, Decimal, Enum, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class AnalysisMethod(str, enum.Enum):
    WHISPER = "WHISPER"
    VOSK = "VOSK"
    HYBRID = "HYBRID"
    LANGUAGETOOL = "LANGUAGETOOL"
    LLM = "LLM"


class SessionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


# Dialogue Sessions
class DialogueSession(Base):
    __tablename__ = "dialogue_sessions"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    scenario_id = Column(BigInteger, ForeignKey("dialogue_scenarios.id"), nullable=False)
    session_data = Column(JSON)
    current_state = Column(String(100))
    score = Column(Decimal(5, 2))
    turns_count = Column(Integer, default=0)
    successful_turns = Column(Integer, default=0)
    status = Column(Enum(SessionStatus), default=SessionStatus.ACTIVE)
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)


# Dialogue Turns
class DialogueTurn(Base):
    __tablename__ = "dialogue_turns"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    session_id = Column(BigInteger, ForeignKey("dialogue_sessions.id"), nullable=False)
    turn_number = Column(Integer, nullable=False)
    user_input = Column(Text)
    user_audio_path = Column(String(255))
    ai_response = Column(Text)
    ai_audio_path = Column(String(255))
    intent_detected = Column(String(100))
    entities_extracted = Column(JSON)
    confidence_score = Column(Decimal(5, 4))
    grammar_errors = Column(JSON)
    pronunciation_score = Column(Decimal(5, 2))
    is_successful = Column(Boolean)
    feedback = Column(Text)
    created_at = Column(DateTime, default=func.now())


# Grammar Analyses
class GrammarAnalysis(Base):
    __tablename__ = "grammar_analyses"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    exercise_attempt_id = Column(BigInteger, ForeignKey("exercise_attempts.id"))
    original_text = Column(Text, nullable=False)
    corrected_text = Column(Text)
    errors_detected = Column(JSON)
    suggestions = Column(JSON)
    confidence_score = Column(Decimal(5, 4))
    analysis_method = Column(Enum(AnalysisMethod), default=AnalysisMethod.LLM)
    processing_time_ms = Column(Integer)
    created_at = Column(DateTime, default=func.now(), index=True)


# Pronunciation Analyses
class PronunciationAnalysis(Base):
    __tablename__ = "pronunciation_analyses"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    exercise_attempt_id = Column(BigInteger, ForeignKey("exercise_attempts.id"))
    target_text = Column(Text, nullable=False)
    recognized_text = Column(Text)
    audio_file_path = Column(String(255))
    word_scores = Column(JSON)
    overall_score = Column(Decimal(5, 2), index=True)
    word_error_rate = Column(Decimal(5, 4))
    feedback = Column(JSON)
    analysis_method = Column(Enum(AnalysisMethod), default=AnalysisMethod.WHISPER)
    processing_time_ms = Column(Integer)
    created_at = Column(DateTime, default=func.now(), index=True)


# User Stats
class UserStats(Base):
    __tablename__ = "user_stats"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    total_xp = Column(Integer, default=0, index=True)
    current_level = Column(Integer, default=1, index=True)
    xp_to_next_level = Column(Integer, default=100)
    total_study_time = Column(Integer, default=0)  # in minutes
    lessons_completed = Column(Integer, default=0)
    exercises_completed = Column(Integer, default=0)
    dialogues_completed = Column(Integer, default=0)
    current_streak_days = Column(Integer, default=0, index=True)
    longest_streak_days = Column(Integer, default=0)
    last_activity_date = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
