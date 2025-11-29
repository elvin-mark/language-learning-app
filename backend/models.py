# backend/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
import json
from .base import Base  # Import Base from base.py


class UserStatus(Base):
    __tablename__ = "user_status"
    user_id = Column(Integer, primary_key=True, default=1)
    current_level = Column(String)
    known_vocab_count = Column(Integer)
    grammar_mastered_count = Column(Integer)
    most_recent_weak_area = Column(String)


class GrammarMastery(Base):
    __tablename__ = "grammar_mastery"
    mastery_id = Column(Integer, primary_key=True, autoincrement=True)
    pattern = Column(String, unique=True)
    mastery_score = Column(Float)
    last_reviewed = Column(DateTime, default=datetime.utcnow)
    weakness_flags = Column(Text)  # Stored as JSON string

    def set_weakness_flags(self, flags):
        self.weakness_flags = json.dumps(flags)

    def get_weakness_flags(self):
        return json.loads(self.weakness_flags) if self.weakness_flags else []


class VocabularyMastery(Base):
    __tablename__ = "vocabulary_mastery"
    mastery_id = Column(Integer, primary_key=True, autoincrement=True)
    word_korean = Column(String, unique=True)
    mastery_score = Column(Float)
    last_reviewed = Column(DateTime, default=datetime.utcnow)
    times_correct = Column(Integer, default=0)
    times_incorrect = Column(Integer, default=0)


class Lessons(Base):
    __tablename__ = "lessons"
    lesson_id = Column(Integer, primary_key=True, autoincrement=True)
    grammar_focus = Column(String)
    content = Column(Text)
    new_vocabulary = Column(Text)  # Stored as JSON string

    def set_new_vocabulary(self, vocab_list):
        self.new_vocabulary = json.dumps(vocab_list)

    def get_new_vocabulary(self):
        return json.loads(self.new_vocabulary) if self.new_vocabulary else []


class Exercises(Base):
    __tablename__ = "exercises"
    exercise_id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String)
    sub_type = Column(String)
    question_data = Column(Text)  # Stored as JSON string
    user_response = Column(Text)
    grade = Column(Integer)
    feedback = Column(Text)

    def set_question_data(self, data):
        self.question_data = json.dumps(data)

    def get_question_data(self):
        return json.loads(self.question_data) if self.question_data else {}
