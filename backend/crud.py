# backend/crud.py
from sqlalchemy.orm import Session
from . import models, schemas
import json
from datetime import datetime

# UserStatus CRUD
def get_user_status(db: Session, user_id: int = 1):
    return db.query(models.UserStatus).filter(models.UserStatus.user_id == user_id).first()

def create_user_status(db: Session, user_status: schemas.UserStatusSummary):
    db_user_status = models.UserStatus(
        current_level=user_status.level,
        known_vocab_count=user_status.known_vocab,
        grammar_mastered_count=0, # Initial value
        most_recent_weak_area=user_status.weak_focus
    )
    db.add(db_user_status)
    db.commit()
    db.refresh(db_user_status)
    return db_user_status

def update_user_status(db: Session, user_status_data: dict, user_id: int = 1):
    db_user_status = get_user_status(db, user_id)
    if db_user_status:
        for key, value in user_status_data.items():
            setattr(db_user_status, key, value)
        db.commit()
        db.refresh(db_user_status)
    return db_user_status

# GrammarMastery CRUD
def get_grammar_mastery(db: Session, pattern: str):
    return db.query(models.GrammarMastery).filter(models.GrammarMastery.pattern == pattern).first()

def get_all_grammar_mastery(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.GrammarMastery).offset(skip).limit(limit).all()

def create_grammar_mastery(db: Session, pattern: str, mastery_score: float = 0.0):
    db_grammar = models.GrammarMastery(
        pattern=pattern,
        mastery_score=mastery_score,
        last_reviewed=datetime.utcnow(),
        weakness_flags=json.dumps([])
    )
    db.add(db_grammar)
    db.commit()
    db.refresh(db_grammar)
    return db_grammar

def update_grammar_mastery(db: Session, pattern: str, mastery_score: float = None, weakness_flags: list = None):
    db_grammar = get_grammar_mastery(db, pattern)
    if db_grammar:
        if mastery_score is not None:
            db_grammar.mastery_score = mastery_score
        if weakness_flags is not None:
            db_grammar.weakness_flags = json.dumps(weakness_flags)
        db_grammar.last_reviewed = datetime.utcnow()
        db.commit()
        db.refresh(db_grammar)
    return db_grammar

# VocabularyMastery CRUD
def get_vocabulary_mastery(db: Session, word_korean: str):
    return db.query(models.VocabularyMastery).filter(models.VocabularyMastery.word_korean == word_korean).first()

def get_all_vocabulary_mastery(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.VocabularyMastery).offset(skip).limit(limit).all()

def create_vocabulary_mastery(db: Session, word_korean: str, mastery_score: float = 0.0):
    db_vocab = models.VocabularyMastery(
        word_korean=word_korean,
        mastery_score=mastery_score,
        last_reviewed=datetime.utcnow(),
        times_correct=0,
        times_incorrect=0
    )
    db.add(db_vocab)
    db.commit()
    db.refresh(db_vocab)
    return db_vocab

def update_vocabulary_mastery(db: Session, word_korean: str, mastery_score: float = None, times_correct: int = None, times_incorrect: int = None):
    db_vocab = get_vocabulary_mastery(db, word_korean)
    if db_vocab:
        if mastery_score is not None:
            db_vocab.mastery_score = mastery_score
        if times_correct is not None:
            db_vocab.times_correct = times_correct
        if times_incorrect is not None:
            db_vocab.times_incorrect = times_incorrect
        db_vocab.last_reviewed = datetime.utcnow()
        db.commit()
        db.refresh(db_vocab)
    return db_vocab

# Lessons CRUD
def create_lesson(db: Session, grammar_focus: str, content: str, new_vocabulary: list):
    db_lesson = models.Lessons(
        grammar_focus=grammar_focus,
        content=content,
        new_vocabulary=json.dumps(new_vocabulary)
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

def get_lesson(db: Session, lesson_id: int):
    return db.query(models.Lessons).filter(models.Lessons.lesson_id == lesson_id).first()

# Exercises CRUD
def create_exercise(db: Session, type: str, sub_type: str, question_data: dict):
    db_exercise = models.Exercises(
        type=type,
        sub_type=sub_type,
        question_data=json.dumps(question_data),
        user_response="",
        grade=0,
        feedback=""
    )
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise

def get_exercise(db: Session, exercise_id: int):
    return db.query(models.Exercises).filter(models.Exercises.exercise_id == exercise_id).first()

def update_exercise_submission(db: Session, exercise_id: int, user_response: str, grade: int, feedback: str):
    db_exercise = get_exercise(db, exercise_id)
    if db_exercise:
        db_exercise.user_response = user_response
        db_exercise.grade = grade
        db_exercise.feedback = feedback
        db.commit()
        db.refresh(db_exercise)
    return db_exercise
