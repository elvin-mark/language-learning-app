from pydantic import BaseModel
from typing import List, Optional

class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_message: str
    chat_history: List[ChatMessageBase] = []
    scenario_id: Optional[str] = None
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
