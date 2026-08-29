import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sentronix Platform"
    
    # Use SQLite for local testing if Postgres URI isn't provided
    SQLALCHEMY_DATABASE_URI: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./sentronix.db"
    )
    
    # Redis for Celery
    REDIS_URI: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Gemini API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
