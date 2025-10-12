from sqlalchemy import Column, BigInteger, String, Text, DateTime, Integer, JSON, Enum, Index, Float
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class AuditAction(str, enum.Enum):
    """Audit action types for AI service"""
    CHAT_MESSAGE = "CHAT_MESSAGE"
    CONVERSATION_TURN = "CONVERSATION_TURN"
    GRAMMAR_CHECK = "GRAMMAR_CHECK"
    PRONUNCIATION_ANALYSIS = "PRONUNCIATION_ANALYSIS"
    QUIZ_GENERATION = "QUIZ_GENERATION"
    LEARNING_PATH_GENERATION = "LEARNING_PATH_GENERATION"
    ANALYTICS_REQUEST = "ANALYTICS_REQUEST"
    NLU_PARSE = "NLU_PARSE"


class AuditStatus(str, enum.Enum):
    """Status of the audited action"""
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PARTIAL = "PARTIAL"
    ERROR = "ERROR"


class AIServiceAuditLog(Base):
    """
    Comprehensive audit log for all AI service interactions
    Tracks requests, responses, performance metrics, and user behavior
    """
    __tablename__ = "ai_service_audit_logs"

    # Primary key
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)

    # User identification
    user_id = Column(BigInteger, index=True, nullable=True)
    session_id = Column(String(255), index=True, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    # Action details
    action = Column(Enum(AuditAction), nullable=False, index=True)
    status = Column(Enum(AuditStatus), default=AuditStatus.SUCCESS, index=True)
    endpoint = Column(String(255), nullable=False)
    http_method = Column(String(10), nullable=True)

    # Request information
    request_payload = Column(JSON, nullable=True)  # Sanitized request data
    request_size_bytes = Column(Integer, nullable=True)

    # Response information
    response_payload = Column(JSON, nullable=True)  # Sanitized response data
    response_size_bytes = Column(Integer, nullable=True)
    response_code = Column(Integer, nullable=True)

    # AI/ML specific metrics
    model_used = Column(String(100), nullable=True)  # e.g., "gpt-4o-mini", "whisper", "rasa"
    processing_time_ms = Column(Integer, nullable=True)
    tokens_used = Column(Integer, nullable=True)  # For LLM calls
    cost_usd = Column(Float, nullable=True)  # Estimated cost

    # Analysis results (for quick querying)
    intent_detected = Column(String(100), nullable=True)  # For NLU
    confidence_score = Column(Float, nullable=True)
    error_count = Column(Integer, nullable=True)  # For grammar checks
    accuracy_score = Column(Float, nullable=True)  # For pronunciation

    # Error tracking
    error_message = Column(Text, nullable=True)
    error_stack_trace = Column(Text, nullable=True)

    # Metadata
    metadata = Column(JSON, nullable=True)  # Additional context
    tags = Column(JSON, nullable=True)  # For categorization

    # Timestamps
    created_at = Column(DateTime, default=func.now(), index=True, nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Indexes for common queries
    __table_args__ = (
        Index('idx_user_action_created', 'user_id', 'action', 'created_at'),
        Index('idx_status_created', 'status', 'created_at'),
        Index('idx_action_status', 'action', 'status'),
        Index('idx_session_created', 'session_id', 'created_at'),
    )


class AIServiceMetrics(Base):
    """
    Aggregated metrics for AI service performance monitoring
    Daily/hourly rollups for analytics and reporting
    """
    __tablename__ = "ai_service_metrics"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)

    # Time bucket
    metric_date = Column(DateTime, nullable=False, index=True)
    granularity = Column(Enum("HOURLY", "DAILY", "WEEKLY", name="metric_granularity"), nullable=False)

    # Action type
    action = Column(Enum(AuditAction), nullable=False, index=True)

    # Aggregate metrics
    total_requests = Column(Integer, default=0)
    successful_requests = Column(Integer, default=0)
    failed_requests = Column(Integer, default=0)
    error_requests = Column(Integer, default=0)

    # Performance metrics
    avg_processing_time_ms = Column(Float, nullable=True)
    min_processing_time_ms = Column(Integer, nullable=True)
    max_processing_time_ms = Column(Integer, nullable=True)
    p95_processing_time_ms = Column(Integer, nullable=True)

    # Resource usage
    total_tokens_used = Column(BigInteger, default=0)
    total_cost_usd = Column(Float, default=0.0)

    # Quality metrics
    avg_confidence_score = Column(Float, nullable=True)
    avg_accuracy_score = Column(Float, nullable=True)

    # User engagement
    unique_users = Column(Integer, default=0)
    unique_sessions = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_date_action_granularity', 'metric_date', 'action', 'granularity'),
    )


class UserActivityLog(Base):
    """
    User-specific activity tracking for personalization and recommendations
    """
    __tablename__ = "user_activity_logs"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)

    # User identification
    user_id = Column(BigInteger, nullable=False, index=True)

    # Activity details
    activity_type = Column(String(100), nullable=False)  # "grammar_practice", "conversation", etc.
    activity_duration_seconds = Column(Integer, nullable=True)

    # Content information
    content_id = Column(String(255), nullable=True)  # scenario_id, exercise_id, etc.
    content_metadata = Column(JSON, nullable=True)

    # Performance
    score = Column(Float, nullable=True)
    errors_made = Column(Integer, nullable=True)
    improvements = Column(JSON, nullable=True)

    # Learning insights
    topics_covered = Column(JSON, nullable=True)  # ["past_tense", "conditionals"]
    skills_practiced = Column(JSON, nullable=True)  # ["speaking", "writing"]
    difficulty_level = Column(String(50), nullable=True)

    # Engagement metrics
    completion_rate = Column(Float, nullable=True)  # Percentage
    retry_count = Column(Integer, default=0)

    # Device/context
    device_type = Column(String(50), nullable=True)  # "mobile", "web"
    location = Column(String(100), nullable=True)

    # Timestamps
    activity_started_at = Column(DateTime, nullable=True)
    activity_completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), index=True)

    __table_args__ = (
        Index('idx_user_activity_created', 'user_id', 'activity_type', 'created_at'),
        Index('idx_user_created', 'user_id', 'created_at'),
    )
