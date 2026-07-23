from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, date
from bson import ObjectId
from models.chat import ChatRequest
from database.db import get_db
from routers.auth import get_current_user
from services.llm_service import get_ai_response
from services.sentiment_service import detect_emotion

router = APIRouter(prefix="/chat", tags=["Chat"])

CRISIS_KEYWORDS = [
    "suicide", "suicidal", "kill myself", "end my life", "don't want to live",
    "self harm", "self-harm", "cutting myself", "hurt myself", "want to die",
    "no reason to live", "better off dead", "can't go on"
]

def check_crisis(message: str) -> bool:
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in CRISIS_KEYWORDS)

@router.post("")
def chat(data: ChatRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["sub"]
    is_crisis = check_crisis(data.message)

    # Detect emotion from user message
    sentiment = detect_emotion(data.message)

    # Auto log mood from chat
    today = date.today().isoformat()
    existing_mood = db.mood_logs.find_one({"user_id": user_id, "date": today})
    if not existing_mood:
        db.mood_logs.insert_one({
            "user_id": user_id,
            "date": today,
            "score": sentiment["mood_score"],
            "emotion": sentiment["emotion"],
            "note": "",
            "source": "chat",
            "created_at": datetime.utcnow()
        })

    # Get or create session
    if data.session_id:
        try:
            session = db.chat_sessions.find_one({
                "_id": ObjectId(data.session_id),
                "user_id": user_id
            })
        except:
            session = None
    else:
        session = None

    if not session:
        session = {
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "messages": []
        }
        result = db.chat_sessions.insert_one(session)
        session["_id"] = result.inserted_id

    history = session.get("messages", [])
    ai_reply = get_ai_response(history, data.message)

    user_msg = {
        "role": "user",
        "content": data.message,
        "emotion": sentiment["emotion"],
        "timestamp": datetime.utcnow()
    }
    ai_msg = {
        "role": "assistant",
        "content": ai_reply,
        "timestamp": datetime.utcnow()
    }

    db.chat_sessions.update_one(
        {"_id": session["_id"]},
        {"$push": {"messages": {"$each": [user_msg, ai_msg]}}}
    )

    return {
        "reply": ai_reply,
        "session_id": str(session["_id"]),
        "is_crisis": is_crisis,
        "emotion": sentiment["emotion"],
        "mood_score": sentiment["mood_score"]
    }

@router.get("/sessions")
def get_sessions(current_user: dict = Depends(get_current_user)):
    db = get_db()
    sessions = list(db.chat_sessions.find(
        {"user_id": current_user["sub"]},
        {"messages": 0}
    ).sort("created_at", -1))
    for s in sessions:
        s["_id"] = str(s["_id"])
    return sessions

@router.get("/session/{session_id}")
def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        session = db.chat_sessions.find_one({
            "_id": ObjectId(session_id),
            "user_id": current_user["sub"]
        })
    except:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session["_id"] = str(session["_id"])
    for msg in session["messages"]:
        msg["timestamp"] = str(msg["timestamp"])
    return session

@router.delete("/session/{session_id}")
def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        result = db.chat_sessions.delete_one({
            "_id": ObjectId(session_id),
            "user_id": current_user["sub"]
        })
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session deleted"}
    except:
        raise HTTPException(status_code=400, detail="Invalid session id")