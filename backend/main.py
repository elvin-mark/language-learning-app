from fastapi import FastAPI, Depends, HTTPException, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlmodel import Session, select, func, or_
from typing import List, Optional
from datetime import datetime
import json
import os
import random

from backend.database import create_db_and_tables, get_session, engine
from backend.models import User, Word, GrammarPoint, ChatMessage
from backend.ai_engine import AIEngine
from backend.ai_models import AISystemResponse
from backend import scenarios
from backend.schemas import ChatRequest, ChatMessageBase, UserUpdate, UserResponse, ExplainRequest
from backend.auth import verify_password, get_password_hash, create_access_token, decode_access_token

app = FastAPI(title="Linguis - AI Language Learning")
api_router = APIRouter(prefix="/api")

# Auth setup - update tokenUrl to follow the new /api prefix
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Engine (needs GROQ_API_KEY)
ai_engine = AIEngine()

async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    username = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@api_router.post("/explain")
def explain(request: ExplainRequest, current_user: User = Depends(get_current_user)):
    try:
        return ai_engine.explain_snippet(
            request.text, 
            target_language=current_user.target_language,
            llm_provider=current_user.llm_provider,
            local_llm_url=current_user.local_llm_url
        )
    except Exception as e:
        import traceback
        print(f"ERROR in /explain: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
def on_startup():
    # During dev: auto-drop tables to apply schema changes (caution!)
    # from backend.models import SQLModel
    # SQLModel.metadata.drop_all(engine)
    create_db_and_tables()

@api_router.post("/register")
def register(username: str, password: str, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.username == username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = User(username=username, hashed_password=get_password_hash(password))
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"msg": "User created successfully"}

@api_router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "username": user.username,
        "target_language": user.target_language,
        "llm_provider": user.llm_provider,
        "local_llm_url": user.local_llm_url
    }

@api_router.get("/user/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.patch("/user/me", response_model=UserResponse)
def update_me(update: UserUpdate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if update.target_language:
        current_user.target_language = update.target_language
    if update.llm_provider:
        current_user.llm_provider = update.llm_provider
    if update.local_llm_url is not None:
        current_user.local_llm_url = update.local_llm_url
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@api_router.get("/stats")
def get_stats(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    total_words = session.exec(select(Word).where(
        Word.user_id == current_user.id,
        Word.language == current_user.target_language
    )).all()
    total_grammar = session.exec(select(GrammarPoint).where(
        GrammarPoint.user_id == current_user.id,
        GrammarPoint.language == current_user.target_language
    )).all()
    
    # Calculate streak
    all_user_messages = session.exec(select(ChatMessage).where(
        ChatMessage.user_id == current_user.id,
        ChatMessage.role == "user"
    )).all()
    
    active_days = sorted(set(msg.timestamp.date() for msg in all_user_messages), reverse=True)
    streak = 0
    if active_days:
        from datetime import date, timedelta
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        # Streak continues if last activity was today or yesterday
        if active_days[0] >= yesterday:
            streak = 1
            current_day = active_days[0]
            for i in range(1, len(active_days)):
                if active_days[i] == current_day - timedelta(days=1):
                    streak += 1
                    current_day = active_days[i]
                else:
                    break
    
    return {
        "words_learned": len(total_words),
        "grammar_practiced": len(total_grammar),
        "daily_streak": streak,
        "last_activity": datetime.now()
    }

@api_router.post("/chat/suggest")
def suggest_chat(request: List[ChatMessageBase], current_user: User = Depends(get_current_user)):
    try:
        # Convert Pydantic history to dict
        history_dicts = [m.dict() for m in request]
        
        suggestion_data = ai_engine.get_suggestion(
            target_language=current_user.target_language,
            llm_provider=current_user.llm_provider,
            local_llm_url=current_user.local_llm_url,
            chat_history=history_dicts
        )
        
        return suggestion_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/usage")
def get_usage(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Aggregate tokens and request counts by date
    # We count assistant messages for tokens and user messages for requests
    messages = session.exec(select(ChatMessage).where(
        ChatMessage.user_id == current_user.id
    )).all()
    
    usage_by_day = {}
    for msg in messages:
        day = msg.timestamp.strftime("%Y-%m-%d")
        if day not in usage_by_day:
            usage_by_day[day] = {"tokens": 0, "requests": 0}
            
        if msg.role == "assistant" and msg.total_tokens:
            usage_by_day[day]["tokens"] += msg.total_tokens
        elif msg.role == "user":
            usage_by_day[day]["requests"] += 1
            
    # Convert to sorted list of dicts for the frontend chart
    sorted_usage = [
        {"date": d, "tokens": v["tokens"], "requests": v["requests"]} 
        for d, v in sorted(usage_by_day.items())
    ]
    return sorted_usage

@api_router.get("/scenarios")
def get_scenarios():
    return scenarios.get_all_scenarios()

@api_router.get("/scenarios/{scenario_id}")
def get_one_scenario(scenario_id: str):
    s = scenarios.get_scenario(scenario_id)
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return s

@api_router.post("/chat")
def chat(request: ChatRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    try:
        # Convert Pydantic history to dict for AI Engine
        history_dicts = [m.dict() for m in request.chat_history]
        
        # Get scenario context if applicable
        scenario_data = None
        if request.scenario_id:
            scenario_data = scenarios.get_scenario(request.scenario_id)
            if scenario_data:
                scenario_data = scenario_data.dict()
        
        # 1. AI Generation
        ai_data = ai_engine.generate_response(
            request.user_message, 
            target_language=current_user.target_language,
            llm_provider=current_user.llm_provider,
            local_llm_url=current_user.local_llm_url,
            chat_history=history_dicts,
            scenario=scenario_data
        )
        ai_resp: AISystemResponse = ai_data["response"]
        usage = ai_data["usage"]
        
        # 2. Persist User Message
        user_msg = ChatMessage(
            role="user", 
            content=request.user_message, 
            user_id=current_user.id,
            feedback=json.dumps(ai_resp.feedback.dict()) if ai_resp.feedback else None
        )
        session.add(user_msg)
        
        # 3. Persist Assistant Message
        assistant_msg = ChatMessage(
            role="assistant", 
            content=ai_resp.response_target,
            user_id=current_user.id,
            grammar_used=json.dumps([g.dict() for g in ai_resp.grammar]),
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
            total_tokens=usage.get("total_tokens"),
            model_used=usage.get("model_name")
        )
        session.add(assistant_msg)
        
        # 4. Save new vocabulary and grammar points to DB
        for word in ai_resp.vocabulary:
            existing = session.exec(select(Word).where(
                Word.text == word.text, 
                Word.user_id == current_user.id,
                Word.language == current_user.target_language
            )).first()
            if not existing:
                session.add(Word(
                    text=word.text, 
                    meaning=word.meaning, 
                    pronunciation=word.pronunciation,
                    user_id=current_user.id,
                    language=current_user.target_language
                ))
            else:
                existing.last_practiced = datetime.now()
                existing.mastery_level = min(100, existing.mastery_level + 5)
                
        for grammar in ai_resp.grammar:
            existing = session.exec(select(GrammarPoint).where(
                GrammarPoint.pattern == grammar.pattern, 
                GrammarPoint.user_id == current_user.id,
                GrammarPoint.language == current_user.target_language
            )).first()
            if not existing:
                session.add(GrammarPoint(
                    pattern=grammar.pattern,
                    explanation=grammar.explanation,
                    example=grammar.example,
                    user_id=current_user.id,
                    language=current_user.target_language
                ))
            else:
                existing.last_practiced = datetime.now()
        
        session.commit()
        
        return ai_resp
        
    except Exception as e:
        import traceback
        error_detail = f"{type(e).__name__}: {str(e)}"
        print(f"ERROR in /chat: {error_detail}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_detail)

@api_router.get("/vocabulary")
def get_vocabulary(
    page: int = 1, 
    size: int = 10, 
    search: Optional[str] = None,
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    query = select(Word).where(
        Word.user_id == current_user.id,
        Word.language == current_user.target_language
    )
    
    if search:
        search_filter = f"%{search}%"
        query = query.where(or_(
            Word.text.like(search_filter),
            Word.meaning.like(search_filter)
        ))
    
    # Get total count for pagination
    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    
    # Get paginated items
    items = session.exec(query.offset((page - 1) * size).limit(size)).all()
    
    return {"items": items, "total": total}

@api_router.get("/grammar")
def get_grammar(
    page: int = 1, 
    size: int = 10, 
    search: Optional[str] = None,
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    query = select(GrammarPoint).where(
        GrammarPoint.user_id == current_user.id,
        GrammarPoint.language == current_user.target_language
    )
    
    if search:
        search_filter = f"%{search}%"
        query = query.where(or_(
            GrammarPoint.pattern.like(search_filter),
            GrammarPoint.explanation.like(search_filter)
        ))
        
    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    items = session.exec(query.offset((page - 1) * size).limit(size)).all()
    
    return {"items": items, "total": total}

@api_router.get("/practice/items")
def get_practice_items(
    count: int = 10, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    words = session.exec(select(Word).where(
        Word.user_id == current_user.id,
        Word.language == current_user.target_language
    )).all()
    
    grammar = session.exec(select(GrammarPoint).where(
        GrammarPoint.user_id == current_user.id,
        GrammarPoint.language == current_user.target_language
    )).all()
    
    # Mix and normalize for flashcards
    items = []
    for w in words:
        items.append({
            "id": w.id,
            "type": "word",
            "front": w.text,
            "back": w.meaning,
            "pronunciation": w.pronunciation,
            "example": w.example_sentence
        })
    for g in grammar:
        items.append({
            "id": g.id,
            "type": "grammar",
            "front": g.pattern,
            "back": g.explanation,
            "example": g.example
        })
    
    random.shuffle(items)
    return items[:count]

# Include the API router
app.include_router(api_router)

# Mount the static frontend files
# During development, './static' might not exist, so we check
if os.path.exists("./static"):
    app.mount("/", StaticFiles(directory="./static", html=True), name="static")

    # Catch-all route to serve index.html for unknown frontend routes (SPA support)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't serve API routes or existing files as SPA
        if full_path.startswith("api"):
            raise HTTPException(status_code=404)
        
        index_path = os.path.join("./static", "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        raise HTTPException(status_code=404)
