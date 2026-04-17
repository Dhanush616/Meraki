from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Meraki API"
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Required parameters found in your .env
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    ENCRYPTION_MASTER_KEY: str
    JWT_SECRET: str

    class Config:
        env_file = ".env"
        extra = "ignore"  # To gracefully ignore any other fields in your .env if they exist

settings = Settings()