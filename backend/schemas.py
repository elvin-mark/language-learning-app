# backend/schemas.py
from pydantic import BaseModel, RootModel
from typing import List, Optional
from datetime import datetime

# Dashboard
class UserStatusSummary(BaseModel):
    level: str
    known_vocab: int
    weak_focus: str

# Lessons
class NewVocabularyItem(BaseModel):
    korean: str
    english: str

class LessonContent(BaseModel):
    lesson_id: int
    grammar_pattern: str
    explanation_text: str
    example_sentences: List[str]
    new_vocabulary: List[NewVocabularyItem]

# Exercises
class ExerciseRequest(BaseModel):
    type: Optional[str] = None
    sub_type: Optional[str] = None
    target_concept_id: Optional[str] = None

class ExerciseDetails(BaseModel):
    exercise_id: int
    type: str
    sub_type: str
    question_text: str
    expected_format: str

class Submission(BaseModel):
    exercise_id: int
    user_response: str

class MasteryUpdate(BaseModel):
    concept: str
    new_score: float
    flags_added: Optional[List[str]] = None

class EvaluationResult(BaseModel):
    grade: int
    feedback_text: str
    mastery_updates: List[MasteryUpdate]

class ExerciseListItem(BaseModel):
    exercise_id: int
    grade: int
    type: str
    date: datetime

class ExerciseList(RootModel[List[ExerciseListItem]]):
    pass

# Mastery
class GrammarMasteryItem(BaseModel):
    pattern: str
    mastery_score: float
    weakness_flags: Optional[List[str]] = None

class GrammarMasteryList(RootModel[List[GrammarMasteryItem]]):
    pass

class VocabularyMasteryItem(BaseModel):
    word_korean: str
    mastery_score: float
    times_incorrect: int

class VocabularyMasteryList(RootModel[List[VocabularyMasteryItem]]):
    pass