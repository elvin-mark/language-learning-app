from typing import List, Optional
from pydantic import BaseModel, Field

# Define Structured Output Models
class WordInfo(BaseModel):
    text: str = Field(description="The word or phrase in the target language (e.g., Korean, Japanese, Chinese)")
    meaning: str = Field(description="English translation of the word")
    pronunciation: Optional[str] = Field(None, description="Phonetic transcription (e.g., Romanization, Pinyin, Hiragana)")

class GrammarInfo(BaseModel):
    pattern: str = Field(description="The grammar pattern used (e.g., -고 싶다, -아요/어요)")
    explanation: str = Field(description="Simple explanation of how the grammar works")
    example: str = Field(description="An example sentence using this grammar")

class FeedbackInfo(BaseModel):
    is_correct: bool = Field(description="Whether the user message is grammatically correct")
    correction: Optional[str] = Field(None, description="Corrected version of the user sentence")
    explanation: Optional[str] = Field(None, description="Explanation of the correction or naturalness")
    natural_score: int = Field(description="How natural the user sentence sounds (1-10)")

class AISystemResponse(BaseModel):
    response_target: str = Field(description="The natural response to the user's message in the target language")
    response_english: str = Field(description="The English translation of the AI response")
    feedback: Optional[FeedbackInfo] = Field(None, description="Analysis of the user's input if it was in the target language")
    vocabulary: List[WordInfo] = Field(default_factory=list, description="Key words used in the AI response")
    grammar: List[GrammarInfo] = Field(default_factory=list, description="Key grammar patterns used in the AI response")
    completed_objective_indices: List[int] = Field(default_factory=list, description="The indexes of mission objectives that the student successfully completed in this turn (0-indexed)")

class SuggestionResponse(BaseModel):
    suggestion: str = Field(description="A natural next sentence for the user in the target language")
    translation: str = Field(description="English translation of the suggestion")
