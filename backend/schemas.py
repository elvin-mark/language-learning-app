from pydantic import BaseModel
from typing import List, Optional

class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_message: str
    chat_history: List[ChatMessageBase] = []
    scenario_id: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    target_language: str
    llm_provider: str
    local_llm_url: Optional[str] = None

class UserUpdate(BaseModel):
    target_language: Optional[str] = None
    llm_provider: Optional[str] = None
    local_llm_url: Optional[str] = None

class StatResponse(BaseModel):
    words_learned: int
    grammar_practiced: int
    last_activity: str

class ExplainRequest(BaseModel):
    text: str
