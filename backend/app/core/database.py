from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Handling SQLite specifically for the fallback
connect_args = {"check_same_thread": False} if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite") else {}

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI, 
    connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
