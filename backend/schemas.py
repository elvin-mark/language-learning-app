from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ChatMessageBase(BaseModel):
    role: str
    content: str


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    last_active: datetime
    scenario_id: Optional[str] = None
    target_language: str


class ConversationCreate(BaseModel):
    title: str
    scenario_id: Optional[str] = None
    target_language: str


class ChatRequest(BaseModel):
    user_message: str
    chat_history: List[ChatMessageBase] = []
    scenario_id: Optional[str] = None
    conversation_id: Optional[int] = None
    custom_scenario: Optional[dict] = None


class Variation(BaseModel):
    label: str
    text: str
    explanation: Optional[str] = None


class WritingAssistRequest(BaseModel):
    draft_text: str
    scenario_id: Optional[str] = None
    chat_history: List[ChatMessageBase] = []


class WritingAssistResponse(BaseModel):
    variations: List[Variation]


class UserResponse(BaseModel):
    id: int
    username: str
    target_language: str
    llm_type: str
    cloud_provider: str
    llm_provider: Optional[str] = None
    local_llm_url: Optional[str] = None


class UserUpdate(BaseModel):
    target_language: Optional[str] = None
    llm_type: Optional[str] = None
    cloud_provider: Optional[str] = None
    llm_provider: Optional[str] = None
    local_llm_url: Optional[str] = None


class StatResponse(BaseModel):
    words_learned: int
    grammar_practiced: int
    last_activity: str


class ExplainRequest(BaseModel):
    text: str


class ScenarioGenerateRequest(BaseModel):
    topic: str


class ReadingGenerateRequest(BaseModel):
    topic: str
    difficulty: Optional[str] = "Intermediate"


class PracticeMasteryRequest(BaseModel):
    item_id: int
    item_type: str  # "word" or "grammar"
    quality: int  # 1=Hard, 2=Good, 3=Easy


class JournalEntryCreate(BaseModel):
    prompt: str
    content: str


class JournalEntryResponse(BaseModel):
    id: int
    user_id: int
    prompt: str
    content: str
    feedback: Optional[str] = None
    created_at: datetime
    target_language: str


class JournalPromptRequest(BaseModel):
    topic: Optional[str] = None
