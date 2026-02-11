from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Explicitly load the .env file
load_dotenv()

class Settings(BaseSettings):
    DB_USERNAME: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str
    
    # These fields were causing the validation error
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # Provide a default value
    ALGORITHM: str = 'HS256'  # Provide a default value
    SECRET_KEY: str
    MAPS_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Create a single instance of settings to be imported
settings = Settings()