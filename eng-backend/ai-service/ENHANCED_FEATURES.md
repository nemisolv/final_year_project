# Enhanced AI Service Features

This document describes the advanced features implemented in the AI service for the English Learning Platform.

## Overview

The AI service has been enhanced with three major improvements:

1. **Two-Stage Grammar Checking** (LanguageTool + LLM)
2. **Advanced Speech Recognition** (faster-whisper + Vosk fallback)
3. **Natural Language Understanding** (Rasa NLU for intent/entity extraction)

---

## 1. Two-Stage Grammar Checking

### Architecture

The grammar service now uses a hybrid approach:

```
User Text → LanguageTool (Baseline) → LLM Enhancement → Final Result
```

**Stage 1: Baseline Check (LanguageTool)**
- Fast, rule-based grammar checking
- Detects common grammatical errors, spelling mistakes, punctuation issues
- Provides immediate corrections

**Stage 2: LLM Enhancement (GPT-4o-mini)**
- Style improvements
- Word choice enhancements
- Clarity and flow suggestions
- Contextual explanations

### Benefits

- **Fast + Accurate**: Rule-based checking is instant, LLM adds intelligence
- **Comprehensive**: Catches both mechanical errors and style issues
- **Educational**: Users see both corrections AND explanations
- **Cost-effective**: Only uses LLM for enhancements, not basic grammar

### Usage

```bash
POST /api/v1/grammar/check
{
  "text": "I goed to the store yesterday for buying some apple",
  "user_id": 123
}
```

**Response includes:**
- Baseline errors from LanguageTool
- LLM-suggested improvements
- Fully rewritten text
- Explanations for each change

---

## 2. Advanced Speech Recognition (STT)

### Architecture

```
Audio File → faster-whisper (Primary) → Success? → Return
                      ↓ (Fail)
                 Vosk (Fallback) → Return
```

**Primary: faster-whisper**
- Based on OpenAI's Whisper model
- Highly accurate transcription
- Supports word-level timestamps
- Confidence scores per word

**Fallback: Vosk**
- Lightweight, offline-capable
- Works when Whisper fails or is unavailable
- Lower accuracy but reliable backup

### Features

- **Word-level scoring**: Individual pronunciation scores for each word
- **WER calculation**: Word Error Rate for overall accuracy
- **Fluency analysis**: Timing and pacing feedback
- **Detailed feedback**: Specific suggestions for improvement

### Usage

```bash
POST /api/v1/pronunciation/analyze
Content-Type: multipart/form-data

target_text: "Hello, how are you today?"
audio_file: <audio_file.wav>
user_id: 123
```

**Response includes:**
- Recognized text
- Word-by-word pronunciation scores
- Overall score (0-100)
- Word Error Rate
- Specific feedback

### Setup

1. **Install dependencies:**
```bash
pip install faster-whisper vosk
```

2. **Download Vosk model** (optional, for fallback):
```bash
mkdir -p models
cd models
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip
```

3. **Set environment variable:**
```bash
export VOSK_MODEL_PATH="models/vosk-model-small-en-us-0.15"
```

---

## 3. Natural Language Understanding (Rasa NLU)

### Architecture

Rasa NLU extracts intent and entities from user messages using:
- **DIET Classifier**: Dual Intent Entity Transformer
- **RegexFeaturizer**: Pattern-based entity extraction
- **Fallback NLU**: Simple rule-based backup when Rasa unavailable

### Intents Supported

- `greeting` - Hello, hi, good morning
- `goodbye` - Bye, see you later
- `book_restaurant` - Table reservation
- `book_hotel` - Room booking
- `ask_directions` - Navigation requests
- `order_food` - Food orders
- `complaint` - Service complaints
- `request_help` - Help requests
- `ask_info` - Information queries
- `thanks` - Gratitude
- `affirm` - Yes, agree
- `deny` - No, disagree

### Entities Extracted

- `number` - Quantities (2 people, 4 nights)
- `time` - Temporal expressions (7pm, tomorrow)
- `date` - Specific dates
- `duration` - Time periods (2 nights, 3 days)
- `location` - Places (the station, downtown)
- `food_item` - Menu items
- `order_type` - Takeout, delivery, etc.

### Setup

#### 1. Train Rasa Model

```bash
cd rasa_config
rasa train nlu
```

This creates a trained model in `models/` directory.

#### 2. Set Environment Variable

```bash
export RASA_MODEL_PATH="models/rasa/nlu"
```

#### 3. (Optional) Add More Training Data

Edit `rasa_config/nlu.yml` to add more example sentences:

```yaml
- intent: book_restaurant
  examples: |
    - I want to book a table
    - reserve a table for [4](number) people
    - book me a spot for [tonight](time)
```

#### 4. Use in Conversation Service

The conversation service automatically uses NLU to:
- Detect user intent
- Extract entities (numbers, times, locations)
- Log intent confidence
- Provide context-aware responses

### Fallback Mode

If Rasa is not available or not trained, the service automatically falls back to:
- Simple keyword-based intent detection
- Regex-based entity extraction
- Still functional, just less accurate

---

## Database Integration

All services now store their results in the database for analytics:

### Grammar Analysis
- Original text
- Corrected text
- Errors detected
- Suggestions
- Analysis method (LANGUAGETOOL, LLM, or HYBRID)

### Pronunciation Analysis
- Target text
- Recognized text
- Word scores
- Overall score
- WER
- Analysis method (WHISPER or VOSK)

### Analytics

The analytics service (`/api/v1/analytics/progress`) analyzes:
- Grammar improvement over time
- Pronunciation accuracy trends
- Conversation practice stats
- Personalized recommendations

---

## Performance Optimization

### Grammar Service
- LanguageTool runs in memory (fast)
- LLM called only once per request
- Results cached in database

### Pronunciation Service
- faster-whisper uses CPU/GPU efficiently
- Vosk loads once at startup
- Temporary audio files cleaned up

### NLU Service
- Rasa model loaded once at startup
- Fallback mode has minimal overhead
- Intent detection takes ~10-50ms

---

## Environment Variables

Add these to your `.env` file:

```bash
# Database
DATABASE_URL=mysql+pymysql://user:password@localhost:3307/english_learning_platform

# Vosk Model (optional)
VOSK_MODEL_PATH=models/vosk-model-small-en-us-0.15

# Rasa Model (optional)
RASA_MODEL_PATH=models/rasa/nlu

# OpenAI (required)
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

---

## Testing

### Test Grammar Service

```bash
curl -X POST "http://localhost:8000/api/v1/grammar/check" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I goed to store yesterday",
    "user_id": 1
  }'
```

### Test Pronunciation Service

```bash
curl -X POST "http://localhost:8000/api/v1/pronunciation/analyze" \
  -F "target_text=Hello, how are you?" \
  -F "audio_file=@test_audio.wav" \
  -F "user_id=1"
```

### Test NLU Service

```python
from app.services.nlu_service import nlu_service

result = nlu_service.parse("I want to book a table for 2 at 7pm")
print(result)
# {
#   "intent": {"name": "book_restaurant", "confidence": 0.95},
#   "entities": [
#     {"entity": "number", "value": 2},
#     {"entity": "time", "value": "7pm"}
#   ]
# }
```

---

## Troubleshooting

### LanguageTool not initializing
- Make sure Java is installed: `java -version`
- LanguageTool downloads language models on first run

### faster-whisper errors
- Install with: `pip install faster-whisper`
- Requires ffmpeg: `sudo apt-get install ffmpeg`

### Vosk model not found
- Download model from https://alphacephei.com/vosk/models
- Set VOSK_MODEL_PATH environment variable

### Rasa model not found
- Train model: `cd rasa_config && rasa train nlu`
- Move model to correct path
- Service will use fallback mode if unavailable

---

## Next Steps

1. **Fine-tune Rasa**: Add more training examples for your specific use cases
2. **Optimize Whisper**: Use GPU for faster transcription
3. **Custom Grammar Rules**: Add domain-specific grammar rules to LanguageTool
4. **A/B Testing**: Compare hybrid grammar vs LLM-only
5. **Pronunciation Coaching**: Add phoneme-level feedback

---

## License

This enhanced AI service is part of the English Learning Platform project.
