from sqlmodel import Session, create_engine, SQLModel
from sqlalchemy.orm import sessionmaker
import os

# SQLite database file path
DATABASE_URL = "sqlite:///./language_app.db"

# Create engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
