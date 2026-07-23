from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
import os

CHROMA_PATH = os.getenv("CHROMA_PERSIST_PATH", "./chroma_db")
DOCUMENTS_PATH = "./data/documents"

embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

def load_and_index_documents():
    if not os.path.exists(DOCUMENTS_PATH):
        print("⚠️ No documents folder found")
        return

    files = [f for f in os.listdir(DOCUMENTS_PATH) if f.endswith(".pdf")]
    if not files:
        print("⚠️ No PDF files found in data/documents")
        return

    all_chunks = []
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

    for file in files:
        path = os.path.join(DOCUMENTS_PATH, file)
        loader = PyPDFLoader(path)
        pages = loader.load()
        chunks = splitter.split_documents(pages)
        all_chunks.extend(chunks)
        print(f"✅ Indexed: {file} ({len(chunks)} chunks)")

    vectorstore = Chroma.from_documents(
        documents=all_chunks,
        embedding=embedding_function,
        persist_directory=CHROMA_PATH
    )
    print(f"✅ RAG ready — {len(all_chunks)} total chunks indexed")

def get_relevant_context(query: str, k: int = 3) -> str:
    try:
        vectorstore = Chroma(
            persist_directory=CHROMA_PATH,
            embedding_function=embedding_function
        )
        docs = vectorstore.similarity_search(query, k=k)
        if not docs:
            return ""
        context = "\n\n".join([doc.page_content for doc in docs])
        return context
    except Exception as e:
        print(f"RAG error: {e}")
        return ""