from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.db.database import SessionLocal
from app.db.audit_models import AuditAction, AuditStatus
from app.services.audit_service import audit_service
import time
import logging
import json

logger = logging.getLogger(__name__)


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to automatically log all AI service API requests
    """

    # Map endpoints to audit actions
    ENDPOINT_ACTION_MAP = {
        "/api/v1/chat": AuditAction.CHAT_MESSAGE,
        "/api/v1/conversation": AuditAction.CONVERSATION_TURN,
        "/api/v1/grammar/check": AuditAction.GRAMMAR_CHECK,
        "/api/v1/pronunciation/analyze": AuditAction.PRONUNCIATION_ANALYSIS,
        "/api/v1/quiz/generate": AuditAction.QUIZ_GENERATION,
        "/api/v1/learning-path/generate": AuditAction.LEARNING_PATH_GENERATION,
        "/api/v1/analytics/progress": AuditAction.ANALYTICS_REQUEST,
    }

    async def dispatch(self, request: Request, call_next):
        """
        Intercept request and response for audit logging
        """
        # Skip non-API endpoints
        if not request.url.path.startswith("/api/v1"):
            return await call_next(request)

        # Skip health checks and docs
        if request.url.path in ["/health", "/docs", "/openapi.json"]:
            return await call_next(request)

        start_time = time.time()
        db = SessionLocal()
        audit_log = None

        try:
            # Determine audit action
            action = self._get_action_for_endpoint(request.url.path)
            if not action:
                # Not an audited endpoint
                return await call_next(request)

            # Extract request information
            user_id = self._extract_user_id(request)
            session_id = self._extract_session_id(request)
            ip_address = self._get_client_ip(request)
            user_agent = request.headers.get("user-agent", "")

            # Get request payload (if applicable)
            request_payload = await self._get_request_body(request)

            # Log the request
            audit_log = audit_service.log_request(
                db=db,
                action=action,
                endpoint=request.url.path,
                user_id=user_id,
                session_id=session_id,
                request_payload=request_payload,
                ip_address=ip_address,
                user_agent=user_agent,
                http_method=request.method
            )

            # Process the request
            response = await call_next(request)

            # Calculate processing time
            processing_time_ms = int((time.time() - start_time) * 1000)

            # Update audit log with response
            if audit_log:
                audit_service.update_response(
                    db=db,
                    audit_log=audit_log,
                    status=AuditStatus.SUCCESS if response.status_code < 400 else AuditStatus.FAILED,
                    response_code=response.status_code,
                    processing_time_ms=processing_time_ms
                )

            return response

        except Exception as e:
            # Log error
            processing_time_ms = int((time.time() - start_time) * 1000)

            if audit_log:
                audit_service.update_response(
                    db=db,
                    audit_log=audit_log,
                    status=AuditStatus.ERROR,
                    response_code=500,
                    processing_time_ms=processing_time_ms,
                    error_message=str(e),
                    error_stack_trace=self._get_stack_trace()
                )

            # Re-raise the exception
            raise

        finally:
            db.close()

    def _get_action_for_endpoint(self, path: str) -> Optional[AuditAction]:
        """
        Map endpoint path to audit action
        """
        for endpoint_pattern, action in self.ENDPOINT_ACTION_MAP.items():
            if path.startswith(endpoint_pattern):
                return action
        return None

    def _extract_user_id(self, request: Request) -> Optional[int]:
        """
        Extract user ID from request (from headers, JWT, or query params)
        """
        # Try header
        user_id = request.headers.get("X-User-ID")
        if user_id:
            try:
                return int(user_id)
            except ValueError:
                pass

        # Try query param
        user_id = request.query_params.get("user_id")
        if user_id:
            try:
                return int(user_id)
            except ValueError:
                pass

        # Could also decode JWT token here if using authentication
        # auth_header = request.headers.get("Authorization")
        # if auth_header:
        #     token = auth_header.replace("Bearer ", "")
        #     payload = decode_jwt(token)
        #     return payload.get("user_id")

        return None

    def _extract_session_id(self, request: Request) -> Optional[str]:
        """
        Extract session ID from request
        """
        # Try header
        session_id = request.headers.get("X-Session-ID")
        if session_id:
            return session_id

        # Try cookie
        session_id = request.cookies.get("session_id")
        if session_id:
            return session_id

        return None

    def _get_client_ip(self, request: Request) -> str:
        """
        Get client IP address (handles proxies)
        """
        # Check for proxy headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Return first IP in the chain
            return forwarded_for.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fallback to client
        if request.client:
            return request.client.host

        return "unknown"

    async def _get_request_body(self, request: Request) -> Optional[dict]:
        """
        Extract request body for logging
        """
        try:
            # For JSON requests
            if request.headers.get("content-type", "").startswith("application/json"):
                body = await request.body()
                if body:
                    return json.loads(body)

            # For form data (multipart), just log keys
            if request.headers.get("content-type", "").startswith("multipart/form-data"):
                form = await request.form()
                return {key: "file" if hasattr(value, "read") else str(value) for key, value in form.items()}

        except Exception as e:
            logger.warning(f"Failed to extract request body: {str(e)}")

        return None

    def _get_stack_trace(self) -> str:
        """
        Get current exception stack trace
        """
        import traceback
        return traceback.format_exc()


from typing import Optional
