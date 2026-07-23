from pymongo import MongoClient
import certifi
import os

client = None
db = None

def connect_db():
    global client, db
    client = MongoClient(
        os.getenv("MONGODB_URI"),
        tlsCAFile=certifi.where()
    )
    db = client[os.getenv("DB_NAME", "lucemind")]
    print("✅ Connected to MongoDB")

def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db