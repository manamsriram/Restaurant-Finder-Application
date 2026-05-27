from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Explicitly load the .env file
load_dotenv()


class Settings(BaseSettings):
    # DATABASE_URL is preferred for hosted environments (Vercel/Supabase).
    DATABASE_URL: str | None = None

    # Keep MySQL-style pieces optional for local fallback compatibility.
    DB_USERNAME: str = ""
    DB_PASSWORD: str = ""
    DB_HOST: str = ""
    DB_PORT: str = ""
    DB_NAME: str = ""

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    SECRET_KEY: str
    MAPS_KEY: str = ""

    # Comma-separated list, for example: https://app.vercel.app,https://www.app.com
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


# Create a single instance of settings to be imported
settings = Settings()