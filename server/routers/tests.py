from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from database.db import get_db
from routers.auth import get_current_user
from models.test_result import TestSubmit

router = APIRouter(prefix="/tests", tags=["Tests"])

TESTS = {
    "PHQ-9": {
        "name": "PHQ-9 Depression Screening",
        "description": "Measures the severity of depression",
        "questions": [
            "Little interest or pleasure in doing things",
            "Feeling down, depressed, or hopeless",
            "Trouble falling or staying asleep, or sleeping too much",
            "Feeling tired or having little energy",
            "Poor appetite or overeating",
            "Feeling bad about yourself",
            "Trouble concentrating on things",
            "Moving or speaking slowly / being fidgety or restless",
            "Thoughts that you would be better off dead"
        ],
        "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"],
        "max_score": 27
    },
    "GAD-7": {
        "name": "GAD-7 Anxiety Screening",
        "description": "Measures the severity of anxiety",
        "questions": [
            "Feeling nervous, anxious, or on edge",
            "Not being able to stop or control worrying",
            "Worrying too much about different things",
            "Trouble relaxing",
            "Being so restless that it is hard to sit still",
            "Becoming easily annoyed or irritable",
            "Feeling afraid as if something awful might happen"
        ],
        "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"],
        "max_score": 21
    },
    "PSS-10": {
        "name": "PSS-10 Stress Scale",
        "description": "Measures perceived stress levels",
        "questions": [
            "Been upset because of something unexpected?",
            "Unable to control important things in life?",
            "Felt nervous and stressed?",
            "Felt confident about handling personal problems?",
            "Felt things were going your way?",
            "Unable to cope with things you had to do?",
            "Able to control irritations in life?",
            "Felt on top of things?",
            "Angered because of things outside your control?",
            "Difficulties piling up so high you cannot overcome them?"
        ],
        "options": ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"],
        "reverse_scored": [3, 4, 6, 7],
        "max_score": 40
    },
    "Burnout": {
        "name": "Student Burnout Quiz",
        "description": "Measures academic burnout levels",
        "questions": [
            "I feel exhausted by my academic responsibilities",
            "I feel detached or disconnected from my studies",
            "I struggle to find meaning in my coursework",
            "I feel overwhelmed by deadlines and assignments",
            "I have lost motivation to attend classes",
            "I feel like I am falling behind no matter how hard I try",
            "I have difficulty concentrating during lectures or study sessions",
            "I feel physically drained after a day of studying",
            "I feel like my efforts in college are not worth it",
            "I find it hard to enjoy activities I used to love"
        ],
        "options": ["Never", "Rarely", "Sometimes", "Often", "Always"],
        "max_score": 40
    }
}

def interpret_score(test_name: str, score: int) -> str:
    if test_name == "PHQ-9":
        if score <= 4: return "Minimal or no depression"
        elif score <= 9: return "Mild depression"
        elif score <= 14: return "Moderate depression"
        elif score <= 19: return "Moderately severe depression"
        else: return "Severe depression"
    elif test_name == "GAD-7":
        if score <= 4: return "Minimal anxiety"
        elif score <= 9: return "Mild anxiety"
        elif score <= 14: return "Moderate anxiety"
        else: return "Severe anxiety"
    elif test_name == "PSS-10":
        if score <= 13: return "Low stress"
        elif score <= 26: return "Moderate stress"
        else: return "High stress"
    elif test_name == "Burnout":
        if score <= 10: return "No burnout"
        elif score <= 20: return "Mild burnout"
        elif score <= 30: return "Moderate burnout"
        else: return "Severe burnout"
    return "Unknown"

@router.get("")
def get_tests():
    return [
        {
            "id": key,
            "name": val["name"],
            "description": val["description"],
            "question_count": len(val["questions"])
        }
        for key, val in TESTS.items()
    ]

@router.get("/{test_name}")
def get_test(test_name: str):
    test = TESTS.get(test_name)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.post("/submit")
def submit_test(data: TestSubmit, current_user: dict = Depends(get_current_user)):
    test = TESTS.get(data.test_name)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    questions = test["questions"]
    if len(data.answers) != len(questions):
        raise HTTPException(status_code=400, detail="Wrong number of answers")

    # Handle reverse scoring for PSS-10
    answers = data.answers.copy()
    if "reverse_scored" in test:
        max_option = len(test["options"]) - 1
        for i in test["reverse_scored"]:
            answers[i] = max_option - answers[i]

    score = sum(answers)
    interpretation = interpret_score(data.test_name, score)

    result = {
        "user_id": current_user["sub"],
        "test_name": data.test_name,
        "score": score,
        "interpretation": interpretation,
        "answers": data.answers,
        "taken_at": datetime.utcnow()
    }
    db = get_db()
    db.test_results.insert_one(result)

    return {
        "test_name": data.test_name,
        "score": score,
        "max_score": test["max_score"],
        "interpretation": interpretation
    }

@router.get("/history/all")
def get_test_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    results = list(db.test_results.find(
        {"user_id": current_user["sub"]},
        {"_id": 0, "user_id": 0}
    ).sort("taken_at", -1))
    for r in results:
        r["taken_at"] = str(r["taken_at"])
    return results