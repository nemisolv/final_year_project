# Audit Logging System Documentation

## Overview

The AI Service now includes a comprehensive audit logging system that tracks all interactions, performance metrics, and user activities. This provides rich information for analytics, debugging, compliance, and service optimization.

## Features

### 1. **Automatic Request/Response Logging**
- Middleware automatically captures all API requests
- Logs request payloads, response data, processing times
- Tracks success/failure status
- Records IP addresses, user agents, session IDs

### 2. **AI-Specific Metrics**
- Model usage tracking (GPT-4o-mini, Whisper, Vosk, Rasa)
- Token consumption and cost estimation
- Confidence scores and accuracy metrics
- Intent detection and entity extraction results

### 3. **User Activity Tracking**
- Learning activities (grammar practice, conversation, pronunciation)
- Performance scores and error tracking
- Topics and skills practiced
- Completion rates and engagement metrics

### 4. **Performance Monitoring**
- Processing time metrics
- Success/failure rates
- Error analysis and debugging
- Resource usage tracking

### 5. **Rich Reporting APIs**
- User-specific audit logs
- Activity summaries
- Performance dashboards
- Error analysis reports

---

## Database Schema

### AIServiceAuditLog

Primary audit log table tracking all AI service requests.

| Column | Type | Description |
|--------|------|-------------|
| id | BigInteger | Primary key |
| user_id | BigInteger | User making the request (nullable) |
| session_id | String(255) | Session identifier |
| ip_address | String(45) | Client IP address |
| user_agent | String(500) | Browser/client user agent |
| action | Enum(AuditAction) | Type of action performed |
| status | Enum(AuditStatus) | SUCCESS/FAILED/ERROR |
| endpoint | String(255) | API endpoint called |
| http_method | String(10) | GET/POST/etc |
| request_payload | JSON | Sanitized request data |
| response_payload | JSON | Sanitized response data |
| model_used | String(100) | AI model (gpt-4o-mini, whisper, etc) |
| processing_time_ms | Integer | Time to process request |
| tokens_used | Integer | LLM tokens consumed |
| cost_usd | Float | Estimated cost |
| intent_detected | String(100) | NLU detected intent |
| confidence_score | Float | Confidence/accuracy score |
| error_count | Integer | Number of errors (for grammar) |
| accuracy_score | Float | Pronunciation/accuracy score |
| error_message | Text | Error description |
| created_at | DateTime | When request was made |

**Indexes:**
- `(user_id, action, created_at)` - User activity queries
- `(status, created_at)` - Error analysis
- `(action, status)` - Performance metrics
- `(session_id, created_at)` - Session tracking

### UserActivityLog

Tracks user learning activities for personalization.

| Column | Type | Description |
|--------|------|-------------|
| id | BigInteger | Primary key |
| user_id | BigInteger | User ID (required) |
| activity_type | String(100) | Type of activity |
| activity_duration_seconds | Integer | Time spent |
| content_id | String(255) | Scenario/exercise ID |
| score | Float | Performance score |
| errors_made | Integer | Number of errors |
| topics_covered | JSON | List of topics practiced |
| skills_practiced | JSON | List of skills (speaking, writing) |
| difficulty_level | String(50) | Difficulty level |
| completion_rate | Float | Percentage completed |
| device_type | String(50) | mobile/web |
| content_metadata | JSON | Additional context |
| created_at | DateTime | Activity timestamp |

**Indexes:**
- `(user_id, activity_type, created_at)` - User activity queries
- `(user_id, created_at)` - User timeline

### AIServiceMetrics

Aggregated metrics for dashboard and reporting.

| Column | Type | Description |
|--------|------|-------------|
| id | BigInteger | Primary key |
| metric_date | DateTime | Time bucket |
| granularity | Enum | HOURLY/DAILY/WEEKLY |
| action | Enum(AuditAction) | Action type |
| total_requests | Integer | Total requests |
| successful_requests | Integer | Success count |
| failed_requests | Integer | Failure count |
| avg_processing_time_ms | Float | Average processing time |
| p95_processing_time_ms | Integer | 95th percentile |
| total_tokens_used | BigInteger | Total tokens |
| total_cost_usd | Float | Total cost |
| unique_users | Integer | Unique user count |

---

## Audit Actions

The system tracks these action types:

```python
class AuditAction(Enum):
    CHAT_MESSAGE = "CHAT_MESSAGE"
    CONVERSATION_TURN = "CONVERSATION_TURN"
    GRAMMAR_CHECK = "GRAMMAR_CHECK"
    PRONUNCIATION_ANALYSIS = "PRONUNCIATION_ANALYSIS"
    QUIZ_GENERATION = "QUIZ_GENERATION"
    LEARNING_PATH_GENERATION = "LEARNING_PATH_GENERATION"
    ANALYTICS_REQUEST = "ANALYTICS_REQUEST"
    NLU_PARSE = "NLU_PARSE"
```

---

## API Endpoints

### Get User Audit Logs

```http
GET /api/v1/audit/logs/user/{user_id}
```

**Query Parameters:**
- `action` (optional): Filter by action type
- `start_date` (optional): Start date
- `end_date` (optional): End date
- `limit` (optional): Max results (default: 100, max: 1000)

**Example:**
```bash
curl "http://localhost:8000/api/v1/audit/logs/user/123?action=GRAMMAR_CHECK&limit=50"
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 123,
    "action": "GRAMMAR_CHECK",
    "status": "SUCCESS",
    "endpoint": "/api/v1/grammar/check",
    "processing_time_ms": 450,
    "error_count": 3,
    "model_used": "gpt-4o-mini",
    "created_at": "2025-10-08T10:30:00"
  }
]
```

### Get User Activities

```http
GET /api/v1/audit/activity/user/{user_id}
```

**Query Parameters:**
- `activity_type` (optional): Filter by activity type
- `start_date` (optional): Start date
- `end_date` (optional): End date
- `limit` (optional): Max results

**Example:**
```bash
curl "http://localhost:8000/api/v1/audit/activity/user/123?activity_type=grammar_practice"
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 123,
    "activity_type": "grammar_practice",
    "score": 85.5,
    "errors_made": 2,
    "topics_covered": ["GRAMMAR", "STYLE"],
    "skills_practiced": ["writing", "grammar"],
    "created_at": "2025-10-08T10:30:00"
  }
]
```

### Get Performance Metrics

```http
GET /api/v1/audit/metrics/performance
```

**Query Parameters:**
- `start_date` (optional): Start date
- `end_date` (optional): End date
- `action` (optional): Filter by action type

**Example:**
```bash
curl "http://localhost:8000/api/v1/audit/metrics/performance?action=GRAMMAR_CHECK"
```

**Response:**
```json
{
  "total_requests": 1250,
  "successful_requests": 1200,
  "failed_requests": 50,
  "avg_processing_time_ms": 425.5,
  "total_errors": 3500,
  "avg_accuracy": 87.2,
  "unique_users": 450
}
```

### Get Usage Statistics

```http
GET /api/v1/audit/metrics/usage
```

**Response:**
```json
[
  {
    "action": "GRAMMAR_CHECK",
    "count": 500,
    "avg_processing_time_ms": 420.5,
    "success_rate": 96.0
  },
  {
    "action": "CONVERSATION_TURN",
    "count": 350,
    "avg_processing_time_ms": 850.2,
    "success_rate": 98.5
  }
]
```

### Get User Engagement Metrics

```http
GET /api/v1/audit/metrics/user-engagement/{user_id}?days=30
```

**Response:**
```json
{
  "user_id": 123,
  "period_days": 30,
  "activity_summary": [
    {
      "activity_type": "grammar_practice",
      "count": 45,
      "avg_score": 85.2,
      "total_errors": 120
    },
    {
      "activity_type": "conversation_practice",
      "count": 30,
      "avg_score": 78.5,
      "total_errors": 0
    }
  ],
  "skills_practiced": {
    "writing": 45,
    "speaking": 30,
    "grammar": 45
  },
  "topics_covered": {
    "GRAMMAR": 30,
    "STYLE": 15,
    "PUNCTUATION": 10
  }
}
```

### Get Error Analysis

```http
GET /api/v1/audit/metrics/errors?limit=50
```

**Response:**
```json
[
  {
    "id": 100,
    "action": "GRAMMAR_CHECK",
    "endpoint": "/api/v1/grammar/check",
    "error_message": "OpenAI API timeout",
    "user_id": 123,
    "created_at": "2025-10-08T10:30:00",
    "processing_time_ms": 5000
  }
]
```

---

## Usage Examples

### Automatic Logging via Middleware

All API requests are automatically logged:

```python
# No code changes needed in endpoints!
# Middleware handles everything automatically

@router.post("/grammar/check")
async def check_grammar(request: GrammarCheckRequest, db: Session = Depends(get_db)):
    # Your code here
    # Middleware logs request/response automatically
    pass
```

### Manual User Activity Logging

For custom activity tracking:

```python
from app.services.audit_service import audit_service

# Log user activity
audit_service.log_user_activity(
    db=db,
    user_id=123,
    activity_type="grammar_practice",
    score=85.5,
    errors_made=3,
    topics_covered=["GRAMMAR", "STYLE"],
    skills_practiced=["writing", "grammar"],
    difficulty_level="intermediate",
    content_metadata={"text_length": 250}
)
```

### Querying Audit Logs

```python
from app.services.audit_service import audit_service
from app.db.audit_models import AuditAction
from datetime import datetime, timedelta

# Get user's grammar check history
start_date = datetime.now() - timedelta(days=7)
logs = audit_service.get_user_audit_logs(
    db=db,
    user_id=123,
    action=AuditAction.GRAMMAR_CHECK,
    start_date=start_date,
    limit=50
)
```

---

## Data Privacy & Security

### Sensitive Data Sanitization

The audit service automatically sanitizes sensitive information:

```python
# These fields are automatically redacted:
- password
- token
- api_key
- secret
- authorization
- credit_card
- ssn
```

### Payload Truncation

Long text fields are automatically truncated to prevent database bloat:
- Strings > 5000 characters are truncated
- Full data is stored in primary tables (GrammarAnalysis, etc)
- Audit logs contain summaries

### Retention Policy

Implement data retention in your application:

```sql
-- Delete old audit logs (run monthly)
DELETE FROM ai_service_audit_logs
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Keep activity logs longer for analytics
DELETE FROM user_activity_logs
WHERE created_at < DATE_SUB(NOW(), INTERVAL 365 DAY);
```

---

## Setup Instructions

### 1. Create Database Tables

```bash
cd /eng-backend/ai-service
python create_audit_tables.py
```

This creates:
- `ai_service_audit_logs`
- `ai_service_metrics`
- `user_activity_logs`

### 2. Environment Variables

Already configured in your `.env`:

```bash
DATABASE_URL=mysql+pymysql://root:nam123@localhost:3307/english_learning_platform
```

### 3. Enable Middleware

Already enabled in `main.py`:

```python
app.add_middleware(AuditLoggingMiddleware)
```

### 4. Send User ID in Requests

Include user ID in requests for tracking:

**Option 1: Header**
```bash
curl -H "X-User-ID: 123" -X POST http://localhost:8000/api/v1/grammar/check
```

**Option 2: Request Body**
```json
{
  "text": "Your text here",
  "user_id": 123
}
```

### 5. Session Tracking

Send session ID for multi-request sessions:

```bash
curl -H "X-Session-ID: abc123" -X POST http://localhost:8000/api/v1/conversation
```

---

## Performance Considerations

### Index Usage

Audit tables have optimized indexes for common queries:
- User activity lookups: `O(log n)` with user_id index
- Time-range queries: `O(log n)` with created_at index
- Status filtering: `O(log n)` with composite indexes

### Write Performance

- Middleware uses `flush()` instead of `commit()` for non-blocking writes
- Failed audits don't block main requests
- Async logging can be enabled for higher throughput

### Storage

Estimated storage per record:
- AIServiceAuditLog: ~1-2 KB per request
- UserActivityLog: ~0.5-1 KB per activity
- At 10,000 requests/day: ~20 MB/day, ~7 GB/year

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Error Rate**
```sql
SELECT
  action,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'ERROR' THEN 1 ELSE 0 END) as errors,
  (SUM(CASE WHEN status = 'ERROR' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as error_rate
FROM ai_service_audit_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY action;
```

2. **Processing Time P95**
```sql
SELECT
  action,
  AVG(processing_time_ms) as avg_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) as p95_time
FROM ai_service_audit_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY action;
```

3. **Cost Tracking**
```sql
SELECT
  DATE(created_at) as date,
  SUM(cost_usd) as daily_cost,
  SUM(tokens_used) as daily_tokens
FROM ai_service_audit_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Best Practices

1. **Always include user_id** when available for tracking
2. **Use session_id** for multi-turn conversations
3. **Monitor error rates** and set up alerts for spikes
4. **Review cost metrics** weekly to optimize token usage
5. **Analyze user activities** to improve learning paths
6. **Archive old logs** to separate tables for compliance
7. **Use indexes** for all time-based queries

---

## Troubleshooting

### Audit logs not appearing

Check:
1. Middleware is enabled in `main.py`
2. Database connection is working
3. Tables were created: `python create_audit_tables.py`
4. Check logs for errors: Look for "Failed to create audit log"

### High database load

Solutions:
1. Implement batching for high-volume endpoints
2. Use async database writes
3. Archive old logs to cold storage
4. Reduce payload size in logs

### Missing user_id

Solutions:
1. Send `X-User-ID` header in requests
2. Include `user_id` in request body
3. Implement JWT token decoding in middleware

---

## Future Enhancements

- [ ] Real-time analytics dashboard
- [ ] Automated anomaly detection
- [ ] Cost optimization recommendations
- [ ] User behavior predictions
- [ ] A/B testing framework
- [ ] Grafana/Prometheus integration

---

## Support

For questions or issues with audit logging:
1. Check logs: `tail -f logs/ai-service.log`
2. Verify database connection
3. Review error analysis endpoint: `/api/v1/audit/metrics/errors`
