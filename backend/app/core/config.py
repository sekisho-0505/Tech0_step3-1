"""Application configuration settings."""
from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Price Simulation API"
    VERSION: str = "1.0.0"

    # Database Settings
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/pdss"

    # Supabase Settings
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None

    # CORS Settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
