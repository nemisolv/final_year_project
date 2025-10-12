from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.db import get_db
from app.db.audit_models import AIServiceAuditLog, UserActivityLog, AuditAction, AuditStatus
from app.services.audit_service import audit_service
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/audit", tags=["Audit & Analytics"])


# Response models
class AuditLogSummary(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    status: str
    endpoint: str
    processing_time_ms: Optional[int]
    error_count: Optional[int]
    accuracy_score: Optional[float]
    model_used: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserActivitySummary(BaseModel):
    id: int
    user_id: int
    activity_type: str
    score: Optional[float]
    errors_made: Optional[int]
    topics_covered: Optional[List[str]]
    skills_practiced: Optional[List[str]]
    created_at: datetime

    class Config:
        from_attributes = True


class PerformanceMetrics(BaseModel):
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_processing_time_ms: float
    total_errors: int
    avg_accuracy: Optional[float]
    unique_users: int


class UsageStats(BaseModel):
    action: str
    count: int
    avg_processing_time_ms: Optional[float]
    success_rate: float


@router.get("/logs/user/{user_id}", response_model=List[AuditLogSummary])
async def get_user_audit_logs(
    user_id: int,
    action: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get audit logs for a specific user
    """
    try:
        # Validate action enum
        try:
            action_enum = AuditAction[action] if action else None
        except KeyError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid action: {action}. Valid actions: {', '.join([a.name for a in AuditAction])}"
            )

        logs = audit_service.get_user_audit_logs(
            db=db,
            user_id=user_id,
            action=action_enum,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )

        return [AuditLogSummary.from_orm(log) for log in logs]

    except HTTPException:
        # Re-raise validation errors
        raise
    except Exception as e:
        logger.error(f"Failed to get user audit logs: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while retrieving audit logs")


@router.get("/activity/user/{user_id}", response_model=List[UserActivitySummary])
async def get_user_activities(
    user_id: int,
    activity_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get activity logs for a specific user
    """
    try:
        activities = audit_service.get_user_activities(
            db=db,
            user_id=user_id,
            activity_type=activity_type,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )

        return [UserActivitySummary.from_orm(activity) for activity in activities]

    except Exception as e:
        logger.error(f"Failed to get user activities: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/performance", response_model=PerformanceMetrics)
async def get_performance_metrics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    action: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get overall system performance metrics
    """
    try:
        query = db.query(AIServiceAuditLog)

        if start_date:
            query = query.filter(AIServiceAuditLog.created_at >= start_date)
        if end_date:
            query = query.filter(AIServiceAuditLog.created_at <= end_date)
        if action:
            query = query.filter(AIServiceAuditLog.action == AuditAction[action])

        # Calculate metrics
        total_requests = query.count()
        successful_requests = query.filter(
            AIServiceAuditLog.status == AuditStatus.SUCCESS
        ).count()
        failed_requests = query.filter(
            AIServiceAuditLog.status.in_([AuditStatus.FAILED, AuditStatus.ERROR])
        ).count()

        # Average processing time
        avg_time_result = query.with_entities(
            func.avg(AIServiceAuditLog.processing_time_ms)
        ).scalar()
        avg_processing_time = float(avg_time_result) if avg_time_result else 0.0

        # Total errors
        total_errors_result = query.with_entities(
            func.sum(AIServiceAuditLog.error_count)
        ).scalar()
        total_errors = int(total_errors_result) if total_errors_result else 0

        # Average accuracy
        avg_accuracy_result = query.filter(
            AIServiceAuditLog.accuracy_score.isnot(None)
        ).with_entities(
            func.avg(AIServiceAuditLog.accuracy_score)
        ).scalar()
        avg_accuracy = float(avg_accuracy_result) if avg_accuracy_result else None

        # Unique users
        unique_users = query.filter(
            AIServiceAuditLog.user_id.isnot(None)
        ).with_entities(
            func.count(func.distinct(AIServiceAuditLog.user_id))
        ).scalar()

        return PerformanceMetrics(
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            avg_processing_time_ms=avg_processing_time,
            total_errors=total_errors,
            avg_accuracy=avg_accuracy,
            unique_users=unique_users or 0
        )

    except Exception as e:
        logger.error(f"Failed to get performance metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/usage", response_model=List[UsageStats])
async def get_usage_statistics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """
    Get usage statistics grouped by action type
    """
    try:
        query = db.query(
            AIServiceAuditLog.action,
            func.count(AIServiceAuditLog.id).label('count'),
            func.avg(AIServiceAuditLog.processing_time_ms).label('avg_time'),
            func.sum(
                func.case(
                    (AIServiceAuditLog.status == AuditStatus.SUCCESS, 1),
                    else_=0
                )
            ).label('success_count')
        ).group_by(AIServiceAuditLog.action)

        if start_date:
            query = query.filter(AIServiceAuditLog.created_at >= start_date)
        if end_date:
            query = query.filter(AIServiceAuditLog.created_at <= end_date)

        results = query.all()

        usage_stats = []
        for action, count, avg_time, success_count in results:
            success_rate = (success_count / count * 100) if count > 0 else 0
            usage_stats.append(UsageStats(
                action=action.value,
                count=count,
                avg_processing_time_ms=float(avg_time) if avg_time else None,
                success_rate=success_rate
            ))

        return usage_stats

    except Exception as e:
        logger.error(f"Failed to get usage statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/user-engagement/{user_id}")
async def get_user_engagement_metrics(
    user_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Get detailed engagement metrics for a specific user
    """
    try:
        start_date = datetime.now() - timedelta(days=days)

        # Activity summary
        activities = db.query(
            UserActivityLog.activity_type,
            func.count(UserActivityLog.id).label('count'),
            func.avg(UserActivityLog.score).label('avg_score'),
            func.sum(UserActivityLog.errors_made).label('total_errors')
        ).filter(
            and_(
                UserActivityLog.user_id == user_id,
                UserActivityLog.created_at >= start_date
            )
        ).group_by(UserActivityLog.activity_type).all()

        # Skills practiced
        skills_query = db.query(UserActivityLog.skills_practiced).filter(
            and_(
                UserActivityLog.user_id == user_id,
                UserActivityLog.created_at >= start_date,
                UserActivityLog.skills_practiced.isnot(None)
            )
        ).all()

        all_skills = []
        for (skills,) in skills_query:
            if skills:
                all_skills.extend(skills)

        skill_counts = {}
        for skill in all_skills:
            skill_counts[skill] = skill_counts.get(skill, 0) + 1

        # Topics covered
        topics_query = db.query(UserActivityLog.topics_covered).filter(
            and_(
                UserActivityLog.user_id == user_id,
                UserActivityLog.created_at >= start_date,
                UserActivityLog.topics_covered.isnot(None)
            )
        ).all()

        all_topics = []
        for (topics,) in topics_query:
            if topics:
                all_topics.extend(topics)

        topic_counts = {}
        for topic in all_topics:
            topic_counts[topic] = topic_counts.get(topic, 0) + 1

        return {
            "user_id": user_id,
            "period_days": days,
            "activity_summary": [
                {
                    "activity_type": act_type,
                    "count": count,
                    "avg_score": float(avg_score) if avg_score else None,
                    "total_errors": int(total_errors) if total_errors else 0
                }
                for act_type, count, avg_score, total_errors in activities
            ],
            "skills_practiced": skill_counts,
            "topics_covered": topic_counts
        }

    except Exception as e:
        logger.error(f"Failed to get user engagement metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/errors")
async def get_error_analysis(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(50, le=500),
    db: Session = Depends(get_db)
):
    """
    Get analysis of errors and failures
    """
    try:
        query = db.query(AIServiceAuditLog).filter(
            AIServiceAuditLog.status.in_([AuditStatus.ERROR, AuditStatus.FAILED])
        )

        if start_date:
            query = query.filter(AIServiceAuditLog.created_at >= start_date)
        if end_date:
            query = query.filter(AIServiceAuditLog.created_at <= end_date)

        errors = query.order_by(AIServiceAuditLog.created_at.desc()).limit(limit).all()

        return [
            {
                "id": error.id,
                "action": error.action.value,
                "endpoint": error.endpoint,
                "error_message": error.error_message,
                "user_id": error.user_id,
                "created_at": error.created_at,
                "processing_time_ms": error.processing_time_ms
            }
            for error in errors
        ]

    except Exception as e:
        logger.error(f"Failed to get error analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
