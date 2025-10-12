from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

# Get the base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "English Learning AI Service"
    API_VERSION: str = "v1"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # OpenAI settings
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_MAX_TOKENS: int = 1000
    OPENAI_TEMPERATURE: float = 0.7

    # Backend integration
    BACKEND_URL: str = "http://localhost:8092"
    BACKEND_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8092"]

    # Database (optional)
    DATABASE_URL: str = ""

    # Language Tool
    LANGUAGE_TOOL_URL: str = ""

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
