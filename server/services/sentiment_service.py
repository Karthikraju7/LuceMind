from transformers import pipeline

emotion_classifier = None

def load_sentiment_model():
    global emotion_classifier
    print("⏳ Loading emotion model...")
    emotion_classifier = pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        top_k=1
    )
    print("✅ Emotion model loaded")

def detect_emotion(text: str) -> dict:
    global emotion_classifier
    if not emotion_classifier:
        load_sentiment_model()
    try:
        result = emotion_classifier(text[:512])
        top = result[0][0]
        emotion = top["label"].lower()
        score = round(top["score"], 2)
        mood_score = emotion_to_score(emotion)
        return {"emotion": emotion, "confidence": score, "mood_score": mood_score}
    except Exception as e:
        print(f"Sentiment error: {e}")
        return {"emotion": "neutral", "confidence": 0.0, "mood_score": 5}

def emotion_to_score(emotion: str) -> int:
    mapping = {
        "joy": 8,
        "surprise": 6,
        "neutral": 5,
        "fear": 3,
        "sadness": 3,
        "anger": 2,
        "disgust": 2
    }
    return mapping.get(emotion, 5)