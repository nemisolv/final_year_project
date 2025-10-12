# Quick Start Guide - AI Service

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Run the Service

```bash
python run.py
```

### Step 4: Test It!

Visit: http://localhost:8000/docs

## ✅ Verify Installation

```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "version": "v1",
  "services": {
    "openai": "connected"
  }
}
```

## 📝 Example API Call

```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello! Can you help me learn English?"}
    ]
  }'
```

## 🎯 What's Next?

1. Read the full [README.md](./README.md)
2. Check [Integration Guide](../AI_INTEGRATION_GUIDE.md)
3. Explore API docs at http://localhost:8000/docs

## 🆘 Having Issues?

- **OpenAI API Error**: Check your API key in `.env`
- **Port in Use**: Change PORT in `.env` or kill process on port 8000
- **Import Errors**: Run `pip install -r requirements.txt` again

## 💡 Tips

- Use `gpt-4o-mini` for cost-effective testing
- Monitor usage at https://platform.openai.com/usage
- Check logs for detailed error messages
