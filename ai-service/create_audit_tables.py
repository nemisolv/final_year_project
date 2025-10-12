"""
Script to create audit log tables in the database
Run this script to set up the audit logging infrastructure
"""

from app.db.database import engine, Base
from app.db.audit_models import AIServiceAuditLog, AIServiceMetrics, UserActivityLog
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_audit_tables():
    """
    Create all audit log tables
    """
    try:
        logger.info("Creating audit log tables...")

        # Create tables
        Base.metadata.create_all(bind=engine, tables=[
            AIServiceAuditLog.__table__,
            AIServiceMetrics.__table__,
            UserActivityLog.__table__
        ])

        logger.info("✓ Audit log tables created successfully!")
        logger.info("  - ai_service_audit_logs")
        logger.info("  - ai_service_metrics")
        logger.info("  - user_activity_logs")

    except Exception as e:
        logger.error(f"✗ Failed to create audit log tables: {str(e)}")
        raise


if __name__ == "__main__":
    create_audit_tables()
