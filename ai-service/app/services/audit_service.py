from sqlalchemy.orm import Session
from app.db.audit_models import AIServiceAuditLog, UserActivityLog, AuditAction, AuditStatus
from datetime import datetime
from typing import Optional, Dict, Any
import logging
import json
import sys

logger = logging.getLogger(__name__)


class AuditService:
    """
    Service for logging AI service interactions and user activities
    """

    def __init__(self):
        pass

    def log_request(
        self,
        db: Session,
        action: AuditAction,
        endpoint: str,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None,
        request_payload: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        http_method: str = "POST",
        metadata: Optional[Dict[str, Any]] = None
    ) -> AIServiceAuditLog:
        """
        Log an incoming request to the AI service

        Returns the audit log entry for later updating with response data
        """
        try:
            # Sanitize request payload (remove sensitive data)
            sanitized_payload = self._sanitize_payload(request_payload) if request_payload else None

            # Calculate request size
            request_size = len(json.dumps(sanitized_payload)) if sanitized_payload else 0

            audit_log = AIServiceAuditLog(
                user_id=user_id,
                session_id=session_id,
                ip_address=ip_address,
                user_agent=user_agent,
                action=action,
                status=AuditStatus.SUCCESS,  # Will be updated
                endpoint=endpoint,
                http_method=http_method,
                request_payload=sanitized_payload,
                request_size_bytes=request_size,
                metadata=metadata,
                created_at=datetime.now()
            )

            db.add(audit_log)
            db.flush()  # Get ID without committing

            return audit_log

        except Exception as e:
            logger.error(f"Failed to create audit log: {str(e)}")
            # Don't fail the main request if audit logging fails
            return None

    def update_response(
        self,
        db: Session,
        audit_log: AIServiceAuditLog,
        status: AuditStatus,
        response_payload: Optional[Dict[str, Any]] = None,
        response_code: int = 200,
        processing_time_ms: Optional[int] = None,
        model_used: Optional[str] = None,
        tokens_used: Optional[int] = None,
        cost_usd: Optional[float] = None,
        intent_detected: Optional[str] = None,
        confidence_score: Optional[float] = None,
        error_count: Optional[int] = None,
        accuracy_score: Optional[float] = None,
        error_message: Optional[str] = None,
        error_stack_trace: Optional[str] = None
    ):
        """
        Update audit log with response information
        """
        if not audit_log:
            return

        try:
            # Sanitize response payload
            sanitized_response = self._sanitize_payload(response_payload) if response_payload else None

            # Calculate response size
            response_size = len(json.dumps(sanitized_response)) if sanitized_response else 0

            # Update audit log
            audit_log.status = status
            audit_log.response_payload = sanitized_response
            audit_log.response_size_bytes = response_size
            audit_log.response_code = response_code
            audit_log.processing_time_ms = processing_time_ms
            audit_log.model_used = model_used
            audit_log.tokens_used = tokens_used
            audit_log.cost_usd = cost_usd
            audit_log.intent_detected = intent_detected
            audit_log.confidence_score = confidence_score
            audit_log.error_count = error_count
            audit_log.accuracy_score = accuracy_score
            audit_log.error_message = error_message
            audit_log.error_stack_trace = error_stack_trace
            audit_log.updated_at = datetime.now()

            db.commit()

        except Exception as e:
            logger.error(f"Failed to update audit log: {str(e)}")
            db.rollback()

    def log_user_activity(
        self,
        db: Session,
        user_id: int,
        activity_type: str,
        content_id: Optional[str] = None,
        score: Optional[float] = None,
        activity_duration_seconds: Optional[int] = None,
        errors_made: Optional[int] = None,
        topics_covered: Optional[list] = None,
        skills_practiced: Optional[list] = None,
        difficulty_level: Optional[str] = None,
        completion_rate: Optional[float] = None,
        device_type: Optional[str] = None,
        content_metadata: Optional[Dict] = None,
        improvements: Optional[Dict] = None
    ) -> Optional[UserActivityLog]:
        """
        Log user learning activity for personalization and analytics
        """
        try:
            activity_log = UserActivityLog(
                user_id=user_id,
                activity_type=activity_type,
                content_id=content_id,
                score=score,
                activity_duration_seconds=activity_duration_seconds,
                errors_made=errors_made,
                topics_covered=topics_covered,
                skills_practiced=skills_practiced,
                difficulty_level=difficulty_level,
                completion_rate=completion_rate,
                device_type=device_type,
                content_metadata=content_metadata,
                improvements=improvements,
                created_at=datetime.now()
            )

            db.add(activity_log)
            db.commit()
            db.refresh(activity_log)

            logger.info(f"Logged user activity: {activity_type} for user {user_id}")
            return activity_log

        except Exception as e:
            logger.error(f"Failed to log user activity: {str(e)}")
            db.rollback()
            return None

    def _sanitize_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Remove sensitive information from payloads before storing
        """
        if not payload:
            return {}

        sensitive_keys = [
            'password', 'token', 'api_key', 'secret', 'auth',
            'authorization', 'credit_card', 'ssn'
        ]

        sanitized = {}
        for key, value in payload.items():
            # Check if key contains sensitive information
            if any(sensitive in key.lower() for sensitive in sensitive_keys):
                sanitized[key] = "***REDACTED***"
            elif isinstance(value, dict):
                sanitized[key] = self._sanitize_payload(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    self._sanitize_payload(item) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                # Truncate very long strings
                if isinstance(value, str) and len(value) > 5000:
                    sanitized[key] = value[:5000] + "...[truncated]"
                else:
                    sanitized[key] = value

        return sanitized

    def calculate_cost(
        self,
        model: str,
        tokens_used: int,
        action: AuditAction
    ) -> float:
        """
        Calculate estimated cost for AI service usage
        """
        # Pricing (as of 2024, adjust as needed)
        pricing = {
            "gpt-4o-mini": {
                "input": 0.00015 / 1000,  # per token
                "output": 0.0006 / 1000
            },
            "gpt-4o": {
                "input": 0.005 / 1000,
                "output": 0.015 / 1000
            },
            "whisper": 0.006 / 60,  # per second
        }

        if model.startswith("gpt"):
            # Estimate 60% input, 40% output ratio
            input_tokens = int(tokens_used * 0.6)
            output_tokens = int(tokens_used * 0.4)

            model_key = "gpt-4o-mini" if "mini" in model else "gpt-4o"
            cost = (
                input_tokens * pricing[model_key]["input"] +
                output_tokens * pricing[model_key]["output"]
            )
            return round(cost, 6)

        return 0.0

    def get_user_audit_logs(
        self,
        db: Session,
        user_id: int,
        action: Optional[AuditAction] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> list:
        """
        Retrieve audit logs for a specific user
        """
        query = db.query(AIServiceAuditLog).filter(
            AIServiceAuditLog.user_id == user_id
        )

        if action:
            query = query.filter(AIServiceAuditLog.action == action)

        if start_date:
            query = query.filter(AIServiceAuditLog.created_at >= start_date)

        if end_date:
            query = query.filter(AIServiceAuditLog.created_at <= end_date)

        return query.order_by(AIServiceAuditLog.created_at.desc()).limit(limit).all()

    def get_user_activities(
        self,
        db: Session,
        user_id: int,
        activity_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> list:
        """
        Retrieve user activity logs
        """
        query = db.query(UserActivityLog).filter(
            UserActivityLog.user_id == user_id
        )

        if activity_type:
            query = query.filter(UserActivityLog.activity_type == activity_type)

        if start_date:
            query = query.filter(UserActivityLog.created_at >= start_date)

        if end_date:
            query = query.filter(UserActivityLog.created_at <= end_date)

        return query.order_by(UserActivityLog.created_at.desc()).limit(limit).all()


audit_service = AuditService()
