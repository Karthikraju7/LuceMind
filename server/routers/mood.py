from fastapi import APIRouter, Depends
from datetime import datetime, date
from database.db import get_db
from routers.auth import get_current_user
from models.mood import MoodEntry

router = APIRouter(prefix="/mood", tags=["Mood"])

@router.post("")
def log_mood(data: MoodEntry, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["sub"]
    today = date.today().isoformat()

    existing = db.mood_logs.find_one({"user_id": user_id, "date": today})
    entry = {
        "user_id": user_id,
        "date": today,
        "score": data.score,
        "note": data.note or "",
        "source": data.source,
        "emotion": "neutral",
        "created_at": datetime.utcnow()
    }

    if existing:
        db.mood_logs.update_one({"_id": existing["_id"]}, {"$set": entry})
        return {"message": "Mood updated", "date": today}
    else:
        db.mood_logs.insert_one(entry)
        return {"message": "Mood logged", "date": today}

@router.get("/history")
def get_mood_history(days: int = 7, current_user: dict = Depends(get_current_user)):
    db = get_db()
    logs = list(db.mood_logs.find(
        {"user_id": current_user["sub"]},
        {"_id": 0, "user_id": 0}
    ).sort("date", -1).limit(days))
    return logs

@router.get("/today")
def get_today_mood(current_user: dict = Depends(get_current_user)):
    db = get_db()
    today = date.today().isoformat()
    log = db.mood_logs.find_one(
        {"user_id": current_user["sub"], "date": today},
        {"_id": 0, "user_id": 0}
    )
    return log or {"message": "No mood logged today"}