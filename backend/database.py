# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from .base import Base # Import Base from base.py

load_dotenv() # Load environment variables from .env

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db") # Use .env or default

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

