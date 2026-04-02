from typing import List, Optional
from pydantic import BaseModel, Field

# Define Structured Output Models
class WordInfo(BaseModel):
    text: str = Field(description="The word or phrase in the target language (e.g., Korean, Japanese, Chinese)")
    meaning: str = Field(description="English translation of the word")
    pronunciation: Optional[str] = Field(None, description="Phonetic transcription (e.g., Romanization, Pinyin, Hiragana)")
    example: Optional[str] = Field(None, description="A short example sentence using this word in the target language")

class GrammarInfo(BaseModel):
    pattern: str = Field(description="The grammar pattern used (e.g., -고 싶다, -아요/어요)")
    explanation: str = Field(description="Simple explanation of how the grammar works")
    example: str = Field(description="An example sentence using this grammar")

class FeedbackInfo(BaseModel):
    is_correct: bool = Field(description="Whether the user message is grammatically correct")
    correction: Optional[str] = Field(None, description="Corrected version of the user sentence")
    explanation: Optional[str] = Field(None, description="Explanation of the correction or naturalness")
    natural_score: int = Field(description="How natural the user sentence sounds (1-10)")

class SuggestionResponse(BaseModel):
    suggestion: str = Field(description="A natural next sentence for the user in the target language")
    translation: str = Field(description="English translation of the suggestion")

class AISystemResponse(BaseModel):
    response_target: str = Field(description="The natural response to the user's message in the target language")
    response_english: str = Field(description="The English translation of the AI response")
    feedback: Optional[FeedbackInfo] = Field(None, description="Analysis of the user's input if it was in the target language")
    vocabulary: List[WordInfo] = Field(default_factory=list, description="Key words used in the AI response")
    grammar: List[GrammarInfo] = Field(default_factory=list, description="Key grammar patterns used in the AI response")
    suggestions: List[SuggestionResponse] = Field(default_factory=list, description="Four natural next sentences for the user to pick from")
    completed_objective_indices: List[int] = Field(default_factory=list, description="The indexes of mission objectives that the student successfully completed in this turn (0-indexed)")
    objective_hints: List[str] = Field(default_factory=list, description="Helpful hints or reasons why specific objectives were NOT met, in the same order as scenario objectives. Empty string if met or no hint needed.")

class ScenarioInfo(BaseModel):
    id: str = Field(description="Slugified version of the mission name")
    name: str = Field(description="Catchy name for the mission")
    description: str = Field(description="Brief overview of the situation")
    role: str = Field(description="The role the AI will play")
    goal: str = Field(description="The main mission objective for the student")
    objectives: List[str] = Field(description="List of 3-4 specific conversational tasks")
    initial_message: str = Field(description="AI's opening line in the target language")
    difficulty: str = Field(description="Beginner, Intermediate, or Advanced")

class VariationInfo(BaseModel):
    label: str = Field(description="The style of the variation (Formal, Casual, or Natural)")
    text: str = Field(description="The actual text in the target language")
    explanation: str = Field(description="Brief English explanation of the nuance")

class WritingAssistantResponse(BaseModel):
    variations: List[VariationInfo] = Field(description="A list of 3 variations of the user's intent")

class ReadingQuestionInfo(BaseModel):
    question: str = Field(description="The reading comprehension question in English")
    options: List[str] = Field(description="A list of 4 options in English")
    correct_answer_index: int = Field(description="The 0-indexed position of the correct option")
    explanation: str = Field(description="A brief explanation in English of why the answer is correct based on the text")

class ReadingPassageInfo(BaseModel):
    title: str = Field(description="Catchy title for the passage in the target language")
    passage: str = Field(description="The reading passage in the target language (approx 150-300 words)")
    translation: str = Field(description="Full English translation of the passage")
    questions: List[ReadingQuestionInfo] = Field(description="A list of 3-5 reading comprehension questions")
    vocabulary: List[WordInfo] = Field(default_factory=list, description="Key words from the passage")
    grammar: List[GrammarInfo] = Field(default_factory=list, description="Key grammar patterns from the passage")
