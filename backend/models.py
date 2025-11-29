# backend/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from .database import Base
from datetime import datetime


class UserStatus(Base):
    __tablename__ = "user_status"
    user_id = Column(Integer, primary_key=True, default=1)
    current_level = Column(String)
    known_vocab_count = Column(Integer)
    grammar_mastered_count = Column(Integer)
    most_recent_weak_area = Column(Text)


class GrammarMastery(Base):
    __tablename__ = "grammar_mastery"
    mastery_id = Column(Integer, primary_key=True, autoincrement=True)
    pattern = Column(String, unique=True, nullable=False)
    mastery_score = Column(Float, default=0.0)
    last_reviewed = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    weakness_flags = Column(JSON, default=list)
    times_incorrect = Column(Integer, default=0)


class VocabularyMastery(Base):
    __tablename__ = "vocabulary_mastery"
    mastery_id = Column(Integer, primary_key=True, autoincrement=True)
    word_korean = Column(String, unique=True, nullable=False)
    mastery_score = Column(Float, default=0.0)
    last_reviewed = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    times_correct = Column(Integer, default=0)
    times_incorrect = Column(Integer, default=0)


class Lessons(Base):
    __tablename__ = "lessons"
    lesson_id = Column(Integer, primary_key=True, autoincrement=True)
    grammar_focus = Column(String)
    content = Column(Text)
    new_vocabulary = Column(JSON, default=list)


class Exercises(Base):
    __tablename__ = "exercises"
    exercise_id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String)
    sub_type = Column(String)
    question_data = Column(JSON)
    user_response = Column(Text)
    grade = Column(Integer)
    feedback = Column(Text)
