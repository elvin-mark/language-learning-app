# backend/crud.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from datetime import datetime


# =================
# User Status
# =================
def get_user_status(db: Session, user_id: int = 1):
    return (
        db.query(models.UserStatus).filter(models.UserStatus.user_id == user_id).first()
    )


def get_dashboard_status(db: Session, user_id: int = 1) -> schemas.UserStatusSummary:
    status = get_user_status(db, user_id)
    if not status:
        # Create a default status if it doesn't exist
        status = models.UserStatus(
            user_id=user_id,
            current_level="Beginner",
            known_vocab_count=0,
            grammar_mastered_count=0,
            most_recent_weak_area="N/A",
        )
        db.add(status)
        db.commit()
        db.refresh(status)

    return schemas.UserStatusSummary(
        level=status.current_level,
        known_vocab=status.known_vocab_count,
        weak_focus=status.most_recent_weak_area,
    )


# =================
# Agent-Specific Queries
# =================
def get_weakest_grammar_pattern(db: Session):
    """
    Finds the grammar pattern with the lowest mastery_score.
    Ties are broken by the oldest last_reviewed date.
    """
    return (
        db.query(models.GrammarMastery)
        .order_by(
            models.GrammarMastery.mastery_score.asc(),
            models.GrammarMastery.last_reviewed.asc(),
        )
        .first()
    )


def get_vocab_for_drilling(db: Session, count: int = 5):
    """
    Selects vocabulary items with a mastery score suitable for drilling (0.4 - 0.7).
    """
    return (
        db.query(models.VocabularyMastery)
        .filter(models.VocabularyMastery.mastery_score.between(0.4, 0.7))
        .order_by(func.random())
        .limit(count)
        .all()
    )


def get_new_vocabulary(db: Session, count: int = 5):
    """
    Selects new vocabulary items (mastery score < 0.2).
    """
    return (
        db.query(models.VocabularyMastery)
        .filter(models.VocabularyMastery.mastery_score < 0.2)
        .order_by(func.random())
        .limit(count)
        .all()
    )


# =================
# Mastery Updates
# =================
def update_mastery_after_evaluation(db: Session, evaluation: schemas.EvaluationResult):
    """
    Processes the mastery updates from an evaluation result.
    """
    for update in evaluation.mastery_updates:
        # This is a simplified example. In a real app, you'd distinguish
        # between grammar and vocab, possibly with a concept type field.
        # For now, we'll try to find a match in either table.

        grammar_item = (
            db.query(models.GrammarMastery)
            .filter(models.GrammarMastery.pattern == update.concept)
            .first()
        )
        if grammar_item:
            grammar_item.mastery_score = update.new_score
            grammar_item.last_reviewed = datetime.utcnow()

            if update.flags_added:
                # Add new flags if they don't exist
                existing_flags = set(grammar_item.weakness_flags or [])
                for flag in update.flags_added:
                    existing_flags.add(flag)
                grammar_item.weakness_flags = list(existing_flags)

            # If score decreased, increment times_incorrect
            if update.new_score < grammar_item.mastery_score:
                grammar_item.times_incorrect += 1

            continue  # Move to next update

        vocab_item = (
            db.query(models.VocabularyMastery)
            .filter(models.VocabularyMastery.word_korean == update.concept)
            .first()
        )
        if vocab_item:
            # If score increased, increment times_correct
            if update.new_score > vocab_item.mastery_score:
                vocab_item.times_correct += 1
            else:
                vocab_item.times_incorrect += 1

            vocab_item.mastery_score = update.new_score
            vocab_item.last_reviewed = datetime.utcnow()

    db.commit()


# =================
# Generic Getters
# =================
def get_exercise(db: Session, exercise_id: int):
    return (
        db.query(models.Exercises)
        .filter(models.Exercises.exercise_id == exercise_id)
        .first()
    )


def get_lesson(db: Session, lesson_id: int):
    return (
        db.query(models.Lessons).filter(models.Lessons.lesson_id == lesson_id).first()
    )


def get_all_grammar_mastery(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.GrammarMastery)
        .order_by(models.GrammarMastery.mastery_score.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_all_vocabulary_mastery(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.VocabularyMastery)
        .order_by(models.VocabularyMastery.mastery_score.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_review_history(db: Session, skip: int = 0, limit: int = 10):
    return (
        db.query(models.Exercises)
        .filter(models.Exercises.grade is not None)
        .order_by(models.Exercises.exercise_id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# =================
# Generic Creators / Updaters
# =================
def create_lesson(db: Session, lesson_data: schemas.LessonContent) -> models.Lessons:
    db_lesson = models.Lessons(
        grammar_focus=lesson_data.grammar_pattern,
        content=lesson_data.explanation_text,  # Assuming explanation_text is main content
        new_vocabulary=[v.model_dump() for v in lesson_data.new_vocabulary],
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson


def create_exercise(
    db: Session, exercise_data: schemas.ExerciseDetails
) -> models.Exercises:
    db_exercise = models.Exercises(
        type=exercise_data.type,
        sub_type=exercise_data.sub_type,
        question_data=exercise_data.model_dump(),  # Store the whole details object
    )
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise


def update_exercise_with_submission(
    db: Session, submission: schemas.Submission, evaluation: schemas.EvaluationResult
) -> models.Exercises:
    db_exercise = get_exercise(db, submission.exercise_id)
    if db_exercise:
        db_exercise.user_response = submission.user_response
        db_exercise.grade = evaluation.grade
        db_exercise.feedback = evaluation.feedback_text
        db.commit()
        db.refresh(db_exercise)
    return db_exercise
