# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from . import crud, schemas
from .database import init_db, get_db
from .agents.lesson_agent import LessonAgent
from .agents.practice_agent import PracticeAgent
from .agents.evaluation_agent import EvaluationAgent

app = FastAPI(
    title="Personalized Korean Learning Agent API",
    description="API for a personalized language learning system using AI agents.",
    version="1.0.0",
)

# CORS (Cross-Origin Resource Sharing)
origins = [
    "http://localhost:5173",  # Default Vite dev server port
    "http://127.0.0.1:5173",
    # Add other origins as needed, e.g., your production frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # This will create the database tables if they don't exist.
    init_db()


# =================
# API Endpoints
# =================


@app.get("/", tags=["General"])
async def root():
    return {"message": "Welcome to the Personalized Korean Learning App Backend!"}


@app.get(
    "/dashboard/status", response_model=schemas.UserStatusSummary, tags=["Dashboard"]
)
async def get_dashboard_status(db: Session = Depends(get_db)):
    """
    Get aggregated user level and mastery counts.
    """
    return crud.get_dashboard_status(db)


@app.get("/lessons/next", response_model=schemas.LessonContent, tags=["Lessons"])
async def get_next_lesson(db: Session = Depends(get_db)):
    """
    Generate and retrieve the next personalized lesson.
    """
    lesson_agent = LessonAgent(db)
    lesson_content = lesson_agent.generate_lesson()
    if not lesson_content:
        raise HTTPException(status_code=404, detail="Could not generate a new lesson.")
    # The agent should return data that fits the schema, but Pydantic will validate.
    return lesson_content


@app.post(
    "/exercises/generate", response_model=schemas.ExerciseDetails, tags=["Exercises"]
)
async def generate_exercise(
    exercise_request: schemas.ExerciseRequest, db: Session = Depends(get_db)
):
    """
    Generate a new exercise, optionally specifying a type and sub-type.
    """
    practice_agent = PracticeAgent(db)
    exercise_details = practice_agent.generate_exercise(exercise_request)
    if not exercise_details:
        raise HTTPException(
            status_code=500, detail="Could not generate a new exercise."
        )
    return exercise_details


@app.post(
    "/exercises/submit", response_model=schemas.EvaluationResult, tags=["Exercises"]
)
async def submit_exercise(
    submission: schemas.Submission, db: Session = Depends(get_db)
):
    """
    Submit a response for grading and trigger Mastery DB updates.
    """
    evaluation_agent = EvaluationAgent(db)
    evaluation_result = evaluation_agent.evaluate_submission(submission)
    if not evaluation_result:
        raise HTTPException(
            status_code=500, detail="Failed to evaluate the submission."
        )
    return evaluation_result


@app.get(
    "/review/history", response_model=List[schemas.ExerciseListItem], tags=["Review"]
)
async def list_review_history(
    skip: int = 0, limit: int = 10, db: Session = Depends(get_db)
):
    """
    List all completed lessons and exercises.
    """
    history = crud.get_review_history(db, skip=skip, limit=limit)
    # Convert DB models to Pydantic schemas
    return [
        schemas.ExerciseListItem(
            exercise_id=item.exercise_id,
            grade=item.grade,
            type=item.type,
            date=item.question_data.get(
                "timestamp", datetime.utcnow()
            ),  # Approximation
        )
        for item in history
    ]


@app.get(
    "/mastery/grammar",
    response_model=List[schemas.GrammarMasteryItem],
    tags=["Mastery"],
)
async def get_grammar_mastery(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """
    Retrieve the full GrammarMastery table.
    """
    mastery_items = crud.get_all_grammar_mastery(db, skip=skip, limit=limit)
    return mastery_items


@app.get(
    "/mastery/vocab",
    response_model=List[schemas.VocabularyMasteryItem],
    tags=["Mastery"],
)
async def get_vocabulary_mastery(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """
    Retrieve the full VocabularyMastery table.
    """
    mastery_items = crud.get_all_vocabulary_mastery(db, skip=skip, limit=limit)
    return mastery_items
