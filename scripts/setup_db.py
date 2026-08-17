import sys
import os

# Ensure the backend module is accessible when running this script
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.chunking.chunker import semantic_chunker
from backend.services.embeddings import get_embeddings_batch
from backend.services.vector_db import insert_chunks

def main():
    print("Initializing Quick Knowledge Base...")
    
    # We replaced the massive 56GB MSMARCO dataset with a fast, hardcoded knowledge base
    # so you can instantly test the RAG pipeline without waiting for hours of downloads!
    mock_data = [
        {"query": "What is EchoAI?", "passage": "EchoAI is a blazing fast RAG pipeline designed to hit sub-50ms latency using local embeddings and ultra-fast LLMs."},
        {"query": "How fast is Qdrant?", "passage": "Qdrant is a high-performance vector search engine written in Rust. Running it locally in memory allows retrievals in under 5 milliseconds."},
        {"query": "What embeddings does this use?", "passage": "This system uses FastEmbed with the BGE-Small-EN-v1.5 model, which runs purely on CPU and generates vectors in a few milliseconds."},
        {"query": "How does the microphone work?", "passage": "The frontend uses the MediaRecorder API to capture audio as a .webm blob. This is sent to the FastAPI backend, which streams it to Groq Whisper for lightning-fast transcription."},
        {"query": "What is Retrieval Augmented Generation?", "passage": "Retrieval Augmented Generation (RAG) is a technique that grounds Large Language Models on private or specific data by searching a vector database and injecting the retrieved contexts into the prompt."},
        {"query": "What model handles guardrails?", "passage": "We use Llama 3 on Groq to instantly classify query intent and enforce safety guardrails before the main generation step even begins."},
        {"query": "What are server sent events?", "passage": "Server-Sent Events (SSE) allow a server to push real-time updates to the browser over a single HTTP connection. We use SSE to stream the STT, contexts, latencies, and LLM chunks dynamically."}
    ]
    
    total_chunks_inserted = 0
    current_payloads = []
    
    print(f"Chunking {len(mock_data)} knowledge base articles...")
    
    for row in mock_data:
        chunks = semantic_chunker(row["passage"], row["query"])
        for chunk in chunks:
            current_payloads.append(chunk)
            
    # Embed and insert
    print(f"Embedding and inserting {len(current_payloads)} chunks into Qdrant...")
    if current_payloads:
        texts_to_embed = [p["text"] for p in current_payloads]
        embeddings = get_embeddings_batch(texts_to_embed)
        insert_chunks(embeddings, current_payloads)
        total_chunks_inserted += len(current_payloads)

    print(f"\nDatabase setup complete! Successfully indexed {total_chunks_inserted} highly-optimized vector chunks.")
    print("You can now test the voice interface! Try asking: 'What is EchoAI?' or 'How fast is Qdrant?'")

if __name__ == "__main__":
    main()
