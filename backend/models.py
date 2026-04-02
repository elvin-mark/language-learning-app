from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    target_language: str = Field(default="Korean")
    llm_type: str = Field(default="cloud") # "cloud" or "local"
    llm_provider: str = Field(default="groq") # deprecated but keep for compatibility for now
    cloud_provider: str = Field(default="groq") # "groq" or "gemini"
    local_llm_url: str = Field(default="http://localhost:1234/v1")

class Word(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    language: str = Field(index=True)
    text: str = Field(index=True)
    meaning: str
    pronunciation: Optional[str] = None
    example_sentence: Optional[str] = None
    last_practiced: datetime = Field(default_factory=datetime.utcnow)
    mastery_level: int = Field(default=0)  # 0 to 100

class GrammarPoint(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    language: str = Field(index=True)
    pattern: str = Field(index=True)
    explanation: str
    example: str
    usage_notes: Optional[str] = None
    last_practiced: datetime = Field(default_factory=datetime.utcnow)

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    title: str = Field(default="New Conversation")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)
    scenario_id: Optional[str] = None # Link to a scenario if applicable
    target_language: str = Field(default="Korean")

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    conversation_id: Optional[int] = Field(default=None, foreign_key="conversation.id", index=True)
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # AI Metadata (stored as JSON string or in a separate table)
    feedback: Optional[str] = None  # For user messages
    grammar_used: Optional[str] = None  # For assistant messages (comma-separated or JSON)
    
    # Token usage
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    model_used: Optional[str] = None
