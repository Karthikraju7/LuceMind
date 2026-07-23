from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database.db import connect_db
from routers import auth, chat, mood, tests
from services.rag_service import load_and_index_documents
from services.sentiment_service import load_sentiment_model

load_dotenv()

app = FastAPI(title="Lucemind API")

connect_db()
load_and_index_documents()
load_sentiment_model()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(mood.router)
app.include_router(tests.router)

@app.get("/")
def root():
    return {"message": "Lucemind API is running"}