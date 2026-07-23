from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from services.rag_service import get_relevant_context
import os

SYSTEM_PROMPT = """You are Lucemind, a warm and empathetic AI mental health companion designed for students.

Your role:
- Listen actively and respond with empathy and understanding
- Help students manage stress, anxiety, and emotional challenges
- Suggest healthy coping strategies based on evidence-based approaches (CBT, mindfulness)
- Keep responses concise and conversational (3-5 sentences)

Your personality:
- Warm, non-judgmental, and supportive
- Never dismissive or minimizing of feelings
- Calm and grounding in tone

Hard rules:
- NEVER claim to be a human or a licensed therapist
- NEVER provide medical diagnoses
- ALWAYS recommend professional help for severe symptoms
- If the user expresses suicidal ideation or self-harm, respond with compassion AND provide crisis helpline numbers (iCall: 9152987821)

{context}
"""

def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.7
    )

def build_messages(conversation_history: list, user_message: str, context: str):
    system = SYSTEM_PROMPT.format(
        context=f"Use this relevant information to help answer:\n{context}" if context else ""
    )
    messages = [SystemMessage(content=system)]
    for msg in conversation_history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))
    messages.append(HumanMessage(content=user_message))
    return messages

def get_ai_response(conversation_history: list, user_message: str) -> str:
    context = get_relevant_context(user_message)
    llm = get_llm()
    messages = build_messages(conversation_history, user_message, context)
    response = llm.invoke(messages)
    return response.content