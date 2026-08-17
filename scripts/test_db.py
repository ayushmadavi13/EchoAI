import sys
import os

# Ensure the backend module is accessible
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.chunking.chunker import semantic_chunker
from backend.services.embeddings import get_embeddings_batch
from backend.services.vector_db import insert_chunks
import time

def main():
    print("Setting up quick dummy data...")
    start_time = time.time()
    
    # Dummy Hindi Q&A dataset to test the RAG pipeline instantly
    dummy_data = [
        {
            "query": "भारत की राजधानी क्या है?",
            "passage": "नई दिल्ली भारत की राजधानी है और यह शहर अपनी ऐतिहासिक और सांस्कृतिक विरासत के लिए प्रसिद्ध है।"
        },
        {
            "query": "सूर्य क्या है?",
            "passage": "सूर्य हमारे सौर मंडल के केंद्र में स्थित एक तारा है, जो पृथ्वी को प्रकाश और ऊर्जा प्रदान करता है।"
        },
        {
            "query": "पानी का रासायनिक सूत्र क्या है?",
            "passage": "पानी का रासायनिक सूत्र H2O है, जिसका अर्थ है कि इसके प्रत्येक अणु में दो हाइड्रोजन और एक ऑक्सीजन परमाणु होता है।"
        }
    ]
    
    current_payloads = []
    
    print("Chunking and preparing data...")
    for row in dummy_data:
        chunks = semantic_chunker(row["passage"], row["query"])
        for chunk in chunks:
            current_payloads.append(chunk)
            
    print(f"Embedding {len(current_payloads)} chunks...")
    texts_to_embed = [p["text"] for p in current_payloads]
    embeddings = get_embeddings_batch(texts_to_embed)
    
    print("Inserting chunks into Qdrant...")
    insert_chunks(embeddings, current_payloads)
    
    elapsed = time.time() - start_time
    print(f"\nSuccess! Dummy database setup complete in {elapsed:.1f} seconds.")
    print("You can now test your Voice Interface right away!")

if __name__ == "__main__":
    main()
