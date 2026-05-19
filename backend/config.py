import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Using field definitions that Pydantic will populate from .env or environment
    db_username: str = "postgres"
    db_password: str = "123456"
    db_host: str = "localhost"
    db_port: str = "5432"
    db_name: str = "siperu"
    jwt_secret_key: str = "super-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expires_minutes: int = 60 * 24 # 1 day

    # Pydantic v2 configuration to read .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def database_url(self) -> str:
        # FastAPI/SQLAlchemy AsyncPG URL
        return f"postgresql+asyncpg://{self.db_username}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

settings = Settings()
