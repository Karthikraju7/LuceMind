# LuceMind

LuceMind is a full-stack RAG (Retrieval-Augmented Generation) application built with React and FastAPI.

## Getting Started

### Clone the repository

```bash
git clone https://github.com/<your-username>/LuceMind.git
cd LuceMind
```

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

## Backend Setup

```bash
cd server
```

Create a virtual environment:

**Windows**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux**
```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the `server` directory and add the required environment variables.

Run the backend:

```bash
uvicorn main:app --reload
```
