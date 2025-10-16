# AI Service Integration Testing Guide

**Author:** Vũ Hoài Nam
**Date:** 2025-10-16
**Purpose:** Hướng dẫn testing tích hợp AI service với backend sử dụng Postman

---

## 📋 MỤC LỤC

1. [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
2. [Chuẩn Bị Môi Trường](#chuẩn-bị-môi-trường)
3. [Import Postman Collection](#import-postman-collection)
4. [Cấu Hình Variables](#cấu-hình-variables)
5. [Test Cases Chi Tiết](#test-cases-chi-tiết)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## 🏗️ TỔNG QUAN KIẾN TRÚC

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Port 3000)                  │
│                     React/Next.js                        │
└──────────────────────────┬────────────────────────────────┘
                           │ HTTP/REST API
                           │
┌──────────────────────────▼────────────────────────────────┐
│              Backend (Port 8092)                          │
│              Spring Boot + WebClient                      │
│                                                           │
│  Controllers:                                            │
│  - GrammarController    → Grammar checking              │
│  - TTSController        → Text-to-Speech                │
│  - PronunciationController → Pronunciation assessment    │
│  - ChatController       → Streaming chat                 │
│                                                           │
│  Services:                                               │
│  - GrammarAIService                                      │
│  - TTSAIService                                          │
│  - PronunciationAIService                                │
│  - ChatAIService                                         │
└──────────────────────────┬────────────────────────────────┘
                           │ WebClient (Spring Reactive)
                           │
┌──────────────────────────▼────────────────────────────────┐
│              AI Service (Port 8076)                       │
│              FastAPI + Python                            │
│                                                           │
│  Features:                                               │
│  ✅ Grammar Checking (LanguageTool + Claude LLM)        │
│  ✅ TTS (ElevenLabs)                                     │
│  ✅ Pronunciation (Azure + Whisper + Vosk)               │
│  ✅ Streaming Chat (Claude)                              │
│  ✅ Conversation Scenarios                               │
│  ✅ Quiz Generation                                      │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 CHUẨN BỊ MÔI TRƯỜNG

### 1. Yêu Cầu Hệ Thống

- **Java 17+** (cho Backend)
- **Python 3.12+** (cho AI Service)
- **MariaDB/MySQL** (Database)
- **Redis** (Cache - optional)
- **Postman** (Testing tool)

### 2. Start Services

#### A. Start Database
```bash
# MariaDB
mysql.server start

# hoặc Docker
docker run -p 3307:3306 --name mariadb \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=english_learning \
  -d mariadb:latest
```

#### B. Start Backend (Spring Boot)
```bash
cd eng-backend
./mvnw spring-boot:run

# Hoặc
./mvnw clean package
java -jar target/eng-backend-1.0.0.jar
```

**Verify Backend:**
```bash
curl http://localhost:8092/actuator/health
```

#### C. Start AI Service (FastAPI)
```bash
cd ai-service

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate     # Windows

# Start service
uvicorn app.main:app --reload --port 8076
```

**Verify AI Service:**
```bash
curl http://localhost:8076/health
```

### 3. Cấu Hình API Keys

Tạo file `.env` trong `ai-service/`:

```bash
# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-...

# Azure Speech Services
AZURE_SPEECH_KEY=your_azure_key_here
AZURE_SPEECH_REGION=eastus

# ElevenLabs TTS
ELEVENLABS_API_KEY=your_elevenlabs_key_here
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Database
DATABASE_URL=mysql+pymysql://root:password@localhost:3307/english_learning

# Backend URL
BACKEND_URL=http://localhost:8092
```

---

## 📥 IMPORT POSTMAN COLLECTION

### Bước 1: Mở Postman

1. Mở ứng dụng Postman
2. Click **Import** ở góc trên bên trái

### Bước 2: Import Collection

1. Chọn tab **File**
2. Upload file: `eng-backend/postman/AI_Service_Integration_Tests.postman_collection.json`
3. Click **Import**

### Bước 3: Verify Import

Bạn sẽ thấy collection với cấu trúc:
```
📁 English Learning Platform - AI Service Integration Tests
  ├─ 📁 0. Authentication
  │   └─ Login
  ├─ 📁 1. Grammar Checking
  │   ├─ Check Grammar - Simple Typo
  │   └─ Check Grammar - Complex Error
  ├─ 📁 2. Text-to-Speech
  │   ├─ Get Available Voices
  │   ├─ Synthesize Speech
  │   └─ Get Audio File
  ├─ 📁 3. Pronunciation Assessment
  │   ├─ Check Service Health
  │   └─ Analyze Pronunciation
  ├─ 📁 4. Chat Stream
  │   └─ Start Chat Stream
  └─ 📁 5. Direct AI Service Tests
      ├─ AI Service Health Check
      ├─ Direct Grammar Check (AI Service)
      └─ Direct TTS Synthesize (AI Service)
```

---

## ⚙️ CẤU HÌNH VARIABLES

### Collection Variables

Click vào Collection → **Variables** tab:

| Variable | Initial Value | Current Value | Description |
|----------|--------------|---------------|-------------|
| `backend_url` | `http://localhost:8092` | (auto) | Backend API URL |
| `ai_service_url` | `http://localhost:8076` | (auto) | AI Service URL |
| `auth_token` | (empty) | (auto-filled after login) | JWT token |
| `user_email` | `test@example.com` | Your test email | Login email |
| `user_password` | `password123` | Your test password | Login password |
| `voice_id` | (auto) | (auto-filled from voices list) | TTS voice ID |
| `audio_filename` | (auto) | (auto-filled after synthesis) | Generated audio filename |

**⚠️ Important:**
- Update `user_email` and `user_password` với credentials thật
- `auth_token` sẽ được tự động set sau khi login
- Các variables khác được auto-populated bởi test scripts

---

## 🧪 TEST CASES CHI TIẾT

### TEST 0: Authentication

#### 0.1. Login
**Endpoint:** `POST /api/auth/login`

**Purpose:** Lấy JWT token để authenticate các requests khác

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser"
  }
}
```

**Auto Tests:**
```javascript
✓ Status code is 200
✓ Response contains access token
✓ Token saved to collection variable
```

**Manual Verification:**
- Check collection variables → `auth_token` đã được set
- Token format: JWT (3 parts separated by dots)

---

### TEST 1: Grammar Checking

#### 1.1. Check Grammar - Simple Typo

**Endpoint:** `POST /api/ai/grammar/check`

**Purpose:** Test grammar checking với lỗi đơn giản (should use LanguageTool only)

**Request Body:**
```json
{
  "text": "I hav a cat and it is vry nice."
}
```

**Expected Response:**
```json
{
  "originalText": "I hav a cat and it is vry nice.",
  "correctedText": "I have a cat and it is very nice.",
  "errors": [
    {
      "offset": 2,
      "errorLength": 3,
      "message": "Possible spelling mistake found.",
      "suggestions": ["have", "had", "has"]
    },
    {
      "offset": 22,
      "errorLength": 3,
      "message": "Possible spelling mistake found.",
      "suggestions": ["very", "vary", "wry"]
    }
  ]
}
```

**What to Check:**
- ✅ Errors detected for "hav" and "vry"
- ✅ Suggestions provided
- ✅ correctedText has fixes applied
- ✅ Fast response (<500ms) - indicates LanguageTool was used

**Backend Log Check:**
```
INFO: Using LanguageTool only for text: 'I hav a cat...'
INFO: All errors have high confidence (>=70)
```

---

#### 1.2. Check Grammar - Complex Error

**Endpoint:** `POST /api/ai/grammar/check`

**Purpose:** Test với lỗi phức tạp (should escalate to LLM)

**Request Body:**
```json
{
  "text": "The movie was very very very good and I think that maybe possibly we could try to attempt to start watching more."
}
```

**Expected Response:**
```json
{
  "originalText": "The movie was very very very good...",
  "correctedText": "The movie was excellent and perhaps we could start watching more.",
  "errors": [
    {
      "offset": 14,
      "errorLength": 20,
      "message": "Redundant use of 'very'. Consider using a stronger adjective like 'excellent' or 'outstanding'.",
      "suggestions": ["excellent", "outstanding", "superb"]
    },
    {
      "offset": 48,
      "errorLength": 45,
      "message": "Wordy phrase. Consider simplifying to improve clarity.",
      "suggestions": ["perhaps we could start"]
    }
  ]
}
```

**What to Check:**
- ✅ Style/redundancy issues detected
- ✅ LLM provides better explanations
- ✅ Slower response (~2s) - indicates LLM was used
- ✅ More educational feedback messages

**Backend Log Check:**
```
INFO: Found 2 low-confidence errors (< 70). Escalating to LLM
INFO: LLM provided enhanced explanations
```

---

### TEST 2: Text-to-Speech

#### 2.1. Get Available Voices

**Endpoint:** `GET /api/ai/tts/voices`

**Purpose:** Lấy danh sách voices từ ElevenLabs

**Expected Response:**
```json
{
  "voices": [
    {
      "voiceId": "21m00Tcm4TlvDq8ikWAM",
      "name": "Rachel",
      "category": "premade",
      "labels": {
        "accent": "american",
        "age": "young",
        "gender": "female"
      }
    },
    {
      "voiceId": "29vD33N1CtxCmqQRPOHJ",
      "name": "Drew",
      "category": "premade",
      "labels": {
        "accent": "american",
        "age": "middle aged",
        "gender": "male"
      }
    }
    // ... more voices
  ],
  "total": 25
}
```

**What to Check:**
- ✅ Multiple voices returned
- ✅ Each voice has voiceId, name, category
- ✅ First voice ID saved to collection variable

---

#### 2.2. Synthesize Speech

**Endpoint:** `POST /api/ai/tts/synthesize`

**Purpose:** Generate audio from text

**Request Body:**
```json
{
  "text": "Hello! This is a test of the text-to-speech system. Welcome to English learning platform.",
  "stability": 0.5,
  "similarityBoost": 0.75,
  "style": 0.0
}
```

**Expected Response:**
```json
{
  "audioFilePath": "audio_output/tts_abc123def.mp3",
  "text": "Hello! This is a test of the text-to-speech system...",
  "voiceId": "21m00Tcm4TlvDq8ikWAM",
  "durationMs": 5200
}
```

**What to Check:**
- ✅ Audio file path returned
- ✅ Duration estimated
- ✅ Filename saved to collection variable
- ✅ Response time ~2-5s (depends on text length)

**Voice Parameters Explained:**
- **stability** (0.0-1.0): Cao = ổn định, thấp = biểu cảm
- **similarityBoost** (0.0-1.0): Cao = giống voice gốc hơn
- **style** (0.0-1.0): Cao = thêm phong cách

---

#### 2.3. Get Audio File

**Endpoint:** `GET /api/ai/tts/audio/{filename}`

**Purpose:** Download audio file đã generate

**Expected Response:**
- Content-Type: `audio/mpeg`
- Binary audio data (MP3 file)

**How to Verify:**
1. Click **Send and Download**
2. Save file với extension `.mp3`
3. Play audio để verify quality

---

### TEST 3: Pronunciation Assessment

#### 3.1. Check Service Health

**Endpoint:** `GET /api/ai/pronunciation/health`

**Purpose:** Verify Azure Pronunciation Assessment service availability

**Expected Response:**
```json
{
  "available": true,
  "message": "Pronunciation analysis service is available"
}
```

**What to Check:**
- ✅ `available: true` means Azure credentials configured correctly
- ❌ `available: false` means check Azure config in `.env`

---

#### 3.2. Analyze Pronunciation

**Endpoint:** `POST /api/ai/pronunciation/analyze`

**Purpose:** Assess pronunciation from audio recording

**⚠️ Prerequisites:**
- Cần file audio thật (WAV format recommended)
- File phải accessible by AI service

**Request Body:**
```json
{
  "targetText": "Hello, how are you today?",
  "audioPath": "/path/to/recorded_audio.wav"
}
```

**Expected Response:**
```json
{
  "recognizedText": "Hello how are you today",
  "overallScore": 85.5,
  "wordErrorRate": 0.05,
  "wordScores": [
    {
      "word": "Hello",
      "score": 92.0,
      "pronunciationAccuracy": 92.0,
      "fluencyScore": 88.0,
      "feedback": "Excellent pronunciation!"
    },
    {
      "word": "how",
      "score": 87.5,
      "pronunciationAccuracy": 87.5,
      "fluencyScore": 85.0,
      "feedback": "Good pronunciation!"
    },
    {
      "word": "are",
      "score": 78.0,
      "pronunciationAccuracy": 78.0,
      "fluencyScore": 80.0,
      "feedback": "Fair pronunciation, can be improved."
    }
    // ... more words
  ],
  "feedback": [
    "Very good pronunciation overall. Minor adjustments on some words.",
    "Try to speak more smoothly and at a steady pace."
  ]
}
```

**Score Ranges:**
- **90-100**: Excellent
- **75-89**: Very good
- **60-74**: Good
- **<60**: Needs improvement

**What to Check:**
- ✅ Word-level scores provided
- ✅ Overall score calculated
- ✅ Feedback messages helpful
- ✅ Word error rate calculated

**Testing với Real Audio:**
```bash
# Record audio với browser
# hoặc dùng command line:
ffmpeg -f avfoundation -i ":0" -t 5 test_audio.wav

# Upload to server accessible path
cp test_audio.wav /path/accessible/by/ai-service/
```

---

### TEST 4: Chat Stream

#### 4.1. Start Chat Stream

**Endpoint:** `POST /learning/chat-stream`

**Purpose:** Start streaming conversation với AI

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello! Can you help me learn English?"
    }
  ]
}
```

**Expected Response:**
- Content-Type: `text/event-stream`
- Streaming chunks:
```
data: Of

data:  course

data: !

data:  I'd

data:  be

data:  happy

data:  to

...
```

**What to Check:**
- ✅ Response is Server-Sent Events (SSE)
- ✅ Chunks arrive progressively
- ✅ Messages saved to database
- ✅ Response feels natural and helpful

**Testing Tips:**
- Use Postman **Send** button (not Send and Download)
- Watch chunks arrive in real-time
- Full response builds up gradually

---

### TEST 5: Direct AI Service Tests

#### 5.1. AI Service Health Check

**Endpoint:** `GET {ai_service_url}/health`

**Purpose:** Verify AI service configuration

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T10:30:00.000Z",
  "version": "v1",
  "services": {
    "claude": "connected",
    "backend": "configured",
    "azure_speech": "configured",
    "elevenlabs_tts": "configured"
  }
}
```

**What to Check:**
- ✅ All services show "connected" or "configured"
- ❌ "not_configured" means missing API keys

---

#### 5.2. Direct Grammar Check

**Purpose:** Test AI service directly (bypass backend)

**Request Body:**
```json
{
  "text": "I hav a cat"
}
```

**Use Case:**
- Debug AI service issues independently
- Verify AI service works before testing backend integration

---

#### 5.3. Direct TTS Synthesize

**Purpose:** Test TTS directly on AI service

**Request Body:**
```json
{
  "text": "Hello world"
}
```

**Use Case:**
- Verify ElevenLabs API key works
- Test voice quality independently

---

## 🐛 TROUBLESHOOTING

### Common Issues

#### 1. Authentication Failed

**Error:**
```json
{
  "status": 401,
  "message": "Unauthorized"
}
```

**Solutions:**
- Run "0. Authentication → Login" first
- Check `auth_token` variable is set
- Token may have expired (login again)

---

#### 2. AI Service Not Available

**Error:**
```json
{
  "status": 503,
  "message": "AI service is not available"
}
```

**Solutions:**
```bash
# Check AI service is running
curl http://localhost:8076/health

# Check logs
cd ai-service
tail -f logs/app.log

# Restart service
uvicorn app.main:app --reload --port 8076
```

---

#### 3. TTS Service Unavailable

**Error:**
```json
{
  "detail": "Text-to-Speech service is not available"
}
```

**Solutions:**
- Check `ELEVENLABS_API_KEY` in `.env`
- Verify API key is valid at https://elevenlabs.io
- Check API quota/limits

---

#### 4. Azure Pronunciation Not Available

**Error:**
```json
{
  "available": false,
  "message": "Pronunciation analysis service is unavailable"
}
```

**Solutions:**
- Check `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` in `.env`
- Verify Azure subscription is active
- Test key with Azure Speech Studio

---

#### 5. Grammar Check Too Slow

**Issue:** Grammar check takes >5 seconds

**Possible Causes:**
- LLM being called for every request
- Network latency to Claude API
- LanguageTool not working

**Solutions:**
```bash
# Check AI service logs
grep "LanguageTool" ai-service/logs/app.log
grep "Escalating to LLM" ai-service/logs/app.log

# Should see:
# "Using LanguageTool only" for simple errors (fast)
# "Escalating to LLM" only for complex errors (slower)
```

---

## ✅ BEST PRACTICES

### 1. Test Order

Always run tests in this order:
1. **Authentication** first (get token)
2. **Health checks** (verify services)
3. **Individual features** (grammar, TTS, pronunciation)
4. **Complex scenarios** (chat streams)

### 2. Environment Variables

Create Postman environment for different setups:
- **Development**: localhost URLs
- **Staging**: staging server URLs
- **Production**: prod URLs (with caution)

### 3. Test Data

Use meaningful test data:
```javascript
// ❌ Bad
{"text": "test"}

// ✅ Good
{"text": "I went to the store yesterday and buyed some apples."}
```

### 4. Assertions

Always add test assertions:
```javascript
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Overall score is between 0 and 100", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.overallScore).to.be.at.least(0);
    pm.expect(jsonData.overallScore).to.be.at.most(100);
});
```

### 5. Cleanup

After testing TTS:
```javascript
// Delete generated audio files
pm.sendRequest({
    url: pm.collectionVariables.get("backend_url") +
         "/api/ai/tts/audio/" +
         pm.collectionVariables.get("audio_filename"),
    method: "DELETE"
});
```

---

## 📊 SUCCESS CRITERIA

Test suite passed khi:

✅ **Authentication**: Login successful, token saved
✅ **Grammar Checking**:
- Simple errors < 500ms (LanguageTool)
- Complex errors ~2s (LLM escalation)
- Correct errors detected

✅ **TTS**:
- Voices list retrieved
- Audio generated successfully
- Audio file downloadable

✅ **Pronunciation**:
- Service available
- Scores calculated correctly
- Word-level feedback provided

✅ **Chat Stream**:
- SSE streaming works
- Messages saved to DB
- Natural responses

✅ **Direct AI Service**:
- Health check passes
- All services configured

---

## 📝 REPORTING

### Generate Test Report

Postman → Collection → Run → Select tests → Run

Export results:
- JSON format for automation
- HTML format for documentation

### Sample Report Format

```markdown
## Test Execution Report

**Date:** 2025-10-16
**Environment:** Development
**Tester:** Vũ Hoài Nam

### Summary
- Total Tests: 25
- Passed: 24
- Failed: 1
- Success Rate: 96%

### Failed Tests
1. Pronunciation Assessment - Analyze Pronunciation
   - Error: Audio file not found
   - Resolution: Need to upload audio file first
```

---

## 🎓 TIPS CHO THẦY HƯỚNG DẪN

Khi demo với thầy, nhấn mạnh:

1. **Seamless Integration**: Backend tích hợp hoàn toàn với AI service
2. **Error Handling**: Robust error handling ở mọi layer
3. **Performance**: Fast response với LanguageTool, slower but better với LLM
4. **Scalability**: WebClient reactive pattern for better performance
5. **Testing**: Comprehensive test suite với automated assertions

### Demo Flow Recommended:

1. Show architecture diagram
2. Start services (Backend + AI Service)
3. Run Postman health checks
4. Demo simple grammar check (fast)
5. Demo complex grammar check (LLM)
6. Demo TTS synthesis
7. Explain confidence threshold logic
8. Show logs to prove flow

---

**END OF GUIDE**

Chúc bạn test thành công! 🚀
