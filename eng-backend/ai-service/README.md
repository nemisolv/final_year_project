# English Learning AI Service

A comprehensive AI-powered microservice for English language learning, providing intelligent chat, conversation practice, grammar checking, quiz generation, and personalized learning paths.

## 🚀 Features

### 1. **AI Chat** (`/api/v1/chat`)
- Real-time conversation with an AI English tutor
- Context-aware responses
- Natural language understanding
- Suitable for all proficiency levels

### 2. **Conversation Practice** (`/api/v1/conversation`)
- Role-play scenarios (Restaurant, Job Interview, Hotel, Doctor, etc.)
- Contextual AI responses
- Real-time feedback and corrections
- Performance scoring

### 3. **Grammar Checking** (`/api/v1/grammar/check`)
- Advanced grammar analysis
- Spelling and style corrections
- Detailed error explanations
- Replacement suggestions
- Context-aware corrections

### 4. **Quiz Generation** (`/api/v1/quiz/generate`)
- AI-generated quizzes on any topic
- Multiple question types (multiple choice, fill-in-blank, true/false)
- Adaptive difficulty levels
- Detailed explanations for answers

### 5. **Learning Path** (`/api/v1/learning-path/generate`)
- Personalized curriculum generation
- Based on user's level, goals, and interests
- Structured weekly plans
- Mixed activity types

## 📋 Prerequisites

- Python 3.11+
- OpenAI API key
- Docker (optional, for containerization)

## 🛠️ Installation

### 1. Clone and Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional customizations
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Backend integration
BACKEND_URL=http://localhost:8092

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:8092"]
```

### 3. Run the Service

#### Development Mode

```bash
python run.py
```

#### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Docker

```bash
# Build image
docker build -t english-ai-service .

# Run container
docker run -p 8000:8000 --env-file .env english-ai-service

# Or use docker-compose
docker-compose up -d
```

## 📖 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🔌 API Endpoints

### Chat

```http
POST /api/v1/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Hello, can you help me practice English?"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7
}
```

### Conversation Practice

```http
POST /api/v1/conversation
Content-Type: application/json

{
  "scenario_id": "1",
  "user_message": "I'd like to order the steak, please.",
  "conversation_history": [],
  "user_id": 123
}
```

### Grammar Check

```http
POST /api/v1/grammar/check
Content-Type: application/json

{
  "text": "I has been learning English for two years.",
  "user_id": 123
}
```

### Quiz Generation

```http
POST /api/v1/quiz/generate
Content-Type: application/json

{
  "topic": "Business English",
  "difficulty": "INTERMEDIATE",
  "num_questions": 10,
  "question_types": ["multiple_choice", "fill_blank"],
  "user_id": 123
}
```

### Learning Path

```http
POST /api/v1/learning-path/generate
Content-Type: application/json

{
  "user_id": 123,
  "current_level": "INTERMEDIATE",
  "goals": ["Improve speaking", "Business communication"],
  "interests": ["Technology", "Travel"],
  "available_time_per_day": 30
}
```

## 🏗️ Project Structure

```
ai-service/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── chat.py
│   │   ├── conversation.py
│   │   ├── grammar.py
│   │   ├── quiz.py
│   │   └── learning_path.py
│   ├── config/                 # Configuration
│   │   └── settings.py
│   ├── models/                 # Pydantic models
│   │   └── schemas.py
│   ├── services/               # Business logic
│   │   ├── chat_service.py
│   │   ├── conversation_service.py
│   │   ├── grammar_service.py
│   │   ├── quiz_service.py
│   │   └── learning_path_service.py
│   └── main.py                 # FastAPI application
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose
├── .env.example                # Environment template
└── run.py                      # Run script
```

## 🔧 Configuration

### OpenAI Models

Recommended models:
- **gpt-4o-mini**: Fast, cost-effective (recommended)
- **gpt-4o**: More capable, higher quality
- **gpt-3.5-turbo**: Budget option

Configure in `.env`:
```env
OPENAI_MODEL=gpt-4o-mini
```

### Adjusting Response Quality

```env
OPENAI_MAX_TOKENS=1000        # Max response length
OPENAI_TEMPERATURE=0.7        # Creativity (0.0-1.0)
```

## 🔗 Integration with Spring Boot Backend

### Option 1: Direct Frontend Integration

Frontend calls AI service directly:

```typescript
// In your Next.js app
const response = await fetch('http://localhost:8000/api/v1/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
```

### Option 2: Proxy through Spring Boot

Add a proxy controller in Spring Boot:

```java
@RestController
@RequestMapping("/ai-proxy")
public class AIProxyController {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        return restTemplate.postForEntity(
            aiServiceUrl + "/api/v1/chat",
            request,
            ChatResponse.class
        );
    }
}
```

## 🧪 Testing

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Using the Interactive Docs

Visit http://localhost:8000/docs and test endpoints directly in the browser.

## 📊 Monitoring

The service provides:
- Health check endpoint (`/health`)
- Structured logging
- Request/response logging
- Error tracking

View logs:
```bash
# Docker
docker logs english-learning-ai-service -f

# Direct run
# Check console output
```

## 🚀 Deployment

### Production Checklist

1. **Set secure environment variables**
   - Use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Never commit `.env` files

2. **Configure CORS properly**
   ```env
   CORS_ORIGINS=["https://yourdomain.com"]
   ```

3. **Set production logging**
   ```env
   LOG_LEVEL=INFO
   DEBUG=False
   ```

4. **Use HTTPS**
   - Deploy behind a reverse proxy (nginx, traefik)
   - Configure SSL/TLS certificates

5. **Scale with workers**
   ```bash
   uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
   ```

### Deployment Options

- **Cloud Run** (Google Cloud)
- **ECS/Fargate** (AWS)
- **Azure Container Instances**
- **Heroku**
- **DigitalOcean App Platform**
- **Your own VPS with Docker**

## 💡 Tips & Best Practices

1. **API Key Security**
   - Never expose OpenAI API key in frontend
   - Always use environment variables
   - Rotate keys regularly

2. **Cost Management**
   - Set OpenAI usage limits
   - Monitor token usage
   - Cache frequent responses when possible
   - Use gpt-4o-mini for cost efficiency

3. **Performance**
   - Enable response caching for common queries
   - Use async/await throughout
   - Implement request timeouts
   - Consider rate limiting

4. **Error Handling**
   - Always validate user input
   - Provide meaningful error messages
   - Log errors for debugging
   - Implement retry logic for API calls

## 🐛 Troubleshooting

### OpenAI API Errors

```
Error: OpenAI API key not configured
```
**Solution**: Set `OPENAI_API_KEY` in `.env`

### Port Already in Use

```
Error: Address already in use
```
**Solution**: Change port in `.env` or kill existing process:
```bash
lsof -ti:8000 | xargs kill -9
```

### Import Errors

```
ModuleNotFoundError: No module named 'openai'
```
**Solution**: Reinstall dependencies:
```bash
pip install -r requirements.txt
```

## 📝 License

This project is part of the English Learning Platform.

## 🤝 Contributing

1. Create feature branches
2. Write tests
3. Update documentation
4. Submit pull requests

## 📞 Support

For issues or questions:
- Check the [documentation](http://localhost:8000/docs)
- Review logs for errors
- Contact the development team
