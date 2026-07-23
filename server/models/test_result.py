from pydantic import BaseModel
from typing import List

class TestSubmit(BaseModel):
    test_name: str
    answers: List[int]