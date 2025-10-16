from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class DifficultyLevel(str, Enum):
    BEGINNER = "BEGINNER"
    ELEMENTARY = "ELEMENTARY"
    INTERMEDIATE = "INTERMEDIATE"
    UPPER_INTERMEDIATE = "UPPER_INTERMEDIATE"
    ADVANCED = "ADVANCED"
    PROFICIENT = "PROFICIENT"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# Base Schemas
class Message(BaseModel):
    role: MessageRole
    content: str
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)


class ChatRequest(BaseModel):
    messages: List[Message]
    user_id: Optional[int] = None
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7


class ChatResponse(BaseModel):
    message: Message
    usage: Optional[Dict[str, Any]] = None


# Conversation Scenario
class ConversationRequest(BaseModel):
    scenario_id: str
    user_message: str
    conversation_history: List[Message] = []
    user_id: Optional[int] = None


class ConversationResponse(BaseModel):
    ai_message: str
    feedback: Optional[str] = None
    corrections: List[Dict[str, str]] = []
    score: Optional[float] = None


# Grammar Analysis
class GrammarCheckRequest(BaseModel):
    text: str
    user_id: Optional[int] = None


class GrammarError(BaseModel):
    offset: int
    errorLength: int
    message: str
    suggestions: List[str] = []


class GrammarCheckResponse(BaseModel):
    originalText: str
    correctedText: str
    errors: List[GrammarError]


# Pronunciation Analysis
class PronunciationRequest(BaseModel):
    target_text: str
    audio_path: str  # Path to audio file
    user_id: Optional[int] = None


class WordScore(BaseModel):
    word: str
    score: float  # 0-100
    pronunciation_accuracy: float
    fluency_score: float
    feedback: str


class PronunciationResponse(BaseModel):
    recognized_text: str
    word_scores: List[WordScore]
    overall_score: float  # 0-100
    word_error_rate: float
    feedback: List[str]


# Learning Path
class LearningPathRequest(BaseModel):
    user_id: int
    current_level: DifficultyLevel
    goals: List[str]
    interests: List[str] = []
    available_time_per_day: int = 30  # minutes


class LearningActivity(BaseModel):
    title: str
    description: str
    type: str  # "lesson", "exercise", "conversation", "quiz"
    estimated_time: int  # minutes
    difficulty: DifficultyLevel
    order: int


class LearningPathResponse(BaseModel):
    path_id: str
    activities: List[LearningActivity]
    total_estimated_time: int
    description: str


# Quiz Generation
class QuizRequest(BaseModel):
    topic: str
    difficulty: DifficultyLevel
    num_questions: int = 10
    question_types: List[str] = ["multiple_choice", "fill_blank", "true_false"]
    user_id: Optional[int] = None


class QuizQuestion(BaseModel):
    id: str
    type: str
    question: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str
    difficulty: DifficultyLevel


class QuizResponse(BaseModel):
    quiz_id: str
    topic: str
    questions: List[QuizQuestion]
    total_questions: int


# Progress Analysis
class ProgressRequest(BaseModel):
    user_id: int
    time_period: str = "week"  # day, week, month, all


class ProgressInsight(BaseModel):
    category: str
    value: float
    change: Optional[float] = None
    description: str


class ProgressResponse(BaseModel):
    overall_score: float
    strengths: List[str]
    weaknesses: List[str]
    insights: List[ProgressInsight]
    recommendations: List[str]
    next_goals: List[str]


# Text-to-Speech
class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    stability: Optional[float] = 0.5
    similarity_boost: Optional[float] = 0.75
    style: Optional[float] = 0.0
    user_id: Optional[int] = None


class TTSResponse(BaseModel):
    audio_file_path: str
    text: str
    voice_id: str
    duration_ms: Optional[int] = None


class VoiceInfo(BaseModel):
    voice_id: str
    name: str
    category: str
    labels: Dict[str, str] = {}


class VoicesListResponse(BaseModel):
    voices: List[VoiceInfo]
    total: int


# Health Check
class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str
    services: Dict[str, str]
