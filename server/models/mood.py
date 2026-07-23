from pydantic import BaseModel
from typing import Optional

class MoodEntry(BaseModel):
    score: Optional[int] = None
    note: Optional[str] = None
    source: Optional[str] = "manual"