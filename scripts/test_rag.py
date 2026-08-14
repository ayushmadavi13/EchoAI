import sys
import os
import asyncio
from dotenv import load_dotenv

# Load environment variables from .env file so the Groq API key is detected
load_dotenv()

# Add the project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services.embeddings import get_embedding
from backend.services.vector_db import search_context
from backend.services.llm import generate_answer, classify_intent

async def main():
    print("Welcome to EchoAI RAG Test!")
    print("Make sure you have Phoenix running on http://localhost:6006")
    
    while True:
        query = input("\nAsk a question (or type 'quit'): ")
        if query.lower() == 'quit':
            break
            
        print("\n--- 1. Classifying Intent ---")
        intent = await classify_intent(query)
        print(f"Intent detected: {intent}")
        
        if "GREETING" in intent.upper():
            print("Response: Hello! I am ready to search the dataset. What would you like to know?")
            continue
            
        print("\n--- 2. Generating Embedding ---")
        vector = get_embedding(query)
        
        print("\n--- 3. Searching Vector DB ---")
        contexts = search_context(vector, top_k=3)
        combined_context = "\n\n".join(contexts)
        
        if not contexts:
            print("No matching context found in the database.")
            continue
            
        print(f"Retrieved {len(contexts)} relevant chunks.")
        
        print("\n--- 4. Generating Answer via Groq ---")
        answer = await generate_answer(query, combined_context)
        
        print("\n================ ANSWER ================")
        print(answer)
        print("========================================")
        print("Check your Phoenix dashboard at http://localhost:6006 to see the exact trace latency!")

if __name__ == "__main__":
    asyncio.run(main())
