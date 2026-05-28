import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv


load_dotenv()


def _resolve_database_url() -> str:
    database_url_override = os.getenv("DATABASE_URL")
    if database_url_override:
        return database_url_override

    username = os.getenv("DB_USERNAME", "")
    password = os.getenv("DB_PASSWORD", "")
    host = os.getenv("DB_HOST", "")
    port = os.getenv("DB_PORT", "")
    database_name = os.getenv("DB_NAME", "")
    return f"mysql+pymysql://{username}:{password}@{host}:{port}/{database_name}"


Base = declarative_base()

_engine = None
_session_local = None


def _get_engine():
    global _engine, _session_local
    if _engine is None:
        url = _resolve_database_url()
        _engine = create_engine(
            url,
            connect_args={"check_same_thread": False} if url.startswith("sqlite") else {},
            pool_pre_ping=True,
        )
        _session_local = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _engine


def get_db():
    _get_engine()
    db = _session_local()
    try:
        yield db
    finally:
        db.close()

