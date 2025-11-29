# backend/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import init_db, get_db
from . import crud, schemas
from typing import List
from datetime import datetime

from .agents.lesson_agent import LessonAgent
from .agents.practice_agent import PracticeAgent
from .agents.evaluation_agent import EvaluationAgent

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*",  # ← only for development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE...
    allow_headers=["*"],  # Authorization, Content-Type...
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
async def root():
    return {"message": "Welcome to the Personalized Korean Learning App Backend!"}


# Placeholder for API Endpoints defined in ARCHITECTURE.md
# GET /dashboard/status
@app.get("/dashboard/status", response_model=schemas.UserStatusSummary)
async def get_dashboard_status(db: Session = Depends(get_db)):
    user_status = crud.get_user_status(db)
    if user_status is None:
        # Create a default user status if none exists
        default_status = schemas.UserStatusSummary(
            level="Beginner", known_vocab=0, weak_focus="None"
        )
        crud.create_user_status(db, default_status)
        user_status = crud.get_user_status(db)  # Retrieve after creation
    return schemas.UserStatusSummary(
        level=user_status.current_level,
        known_vocab=user_status.known_vocab_count,
        weak_focus=user_status.most_recent_weak_area,
    )


# GET /lessons/next
@app.get("/lessons/next", response_model=schemas.LessonContent)
async def get_next_lesson(db: Session = Depends(get_db)):
    lesson_agent = LessonAgent(db)
    lesson_content = lesson_agent.generate_lesson()
    return lesson_content


# POST /exercises/generate
@app.post("/exercises/generate", response_model=schemas.ExerciseDetails)
async def generate_exercise(
    exercise_request: schemas.ExerciseRequest, db: Session = Depends(get_db)
):
    practice_agent = PracticeAgent(db)
    exercise_details = practice_agent.generate_exercise(exercise_request)
    return exercise_details


# POST /exercises/submit
@app.post("/exercises/submit", response_model=schemas.EvaluationResult)
async def submit_exercise(
    submission: schemas.Submission, db: Session = Depends(get_db)
):
    evaluation_agent = EvaluationAgent(db)
    evaluation_result = evaluation_agent.evaluate_submission(submission)
    return evaluation_result


# GET /review/history
@app.get("/review/history", response_model=List[schemas.ExerciseListItem])
async def get_review_history(db: Session = Depends(get_db)):
    # This will be implemented later with actual logic to fetch from DB
    return [
        schemas.ExerciseListItem(
            exercise_id=101, grade=85, type="Writing", date=datetime.utcnow()
        ),
        schemas.ExerciseListItem(
            exercise_id=102, grade=90, type="Flashcard", date=datetime.utcnow()
        ),
    ]


# GET /mastery/grammar
@app.get("/mastery/grammar", response_model=List[schemas.GrammarMasteryItem])
async def get_grammar_mastery(db: Session = Depends(get_db)):
    # This will be implemented later with actual logic to fetch from DB
    return [
        schemas.GrammarMasteryItem(
            pattern="-(으)ㄹ 줄 알다",
            mastery_score=0.85,
            weakness_flags=["misuse of honorifics"],
        ),
        schemas.GrammarMasteryItem(
            pattern="-고 싶다", mastery_score=0.92, weakness_flags=[]
        ),
    ]


# GET /mastery/vocab
@app.get("/mastery/vocab", response_model=List[schemas.VocabularyMasteryItem])
async def get_vocabulary_mastery(db: Session = Depends(get_db)):
    # This will be implemented later with actual logic to fetch from DB
    return [
        schemas.VocabularyMasteryItem(
            word_korean="감사합니다", mastery_score=0.95, times_incorrect=1
        ),
        schemas.VocabularyMasteryItem(
            word_korean="안녕하세요", mastery_score=0.99, times_incorrect=0
        ),
    ]
