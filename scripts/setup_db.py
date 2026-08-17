import sys
import os

# Ensure the backend module is accessible when running this script
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from datasets import load_dataset
from backend.chunking.chunker import semantic_chunker
from backend.services.embeddings import get_embeddings_batch
from backend.services.vector_db import insert_chunks
import time
import itertools

def main():
    print("Connecting to ai4bharat/MSMARCO-XI Dataset (Downloading small chunk)...")
    
    TARGET_ROWS = 1500 
    
    # We deliberately remove streaming=True to bypass the PyArrow nested array crash.
    # By using a very small slice (train[:1500]), we ALSO bypass the 56GB memory crash!
    print("Downloading and preparing dataset slice...")
    ds = load_dataset("ai4bharat/MSMARCO-XI", split=f"train[:{TARGET_ROWS}]")
    
    # Since we aren't streaming, we can iterate directly
    row_count = 0
    total_chunks_inserted = 0
    BATCH_SIZE = 256
    current_payloads = []
    
    print(f"Starting advanced chunking and embedding for {TARGET_ROWS} MSMARCO Hindi documents...")
    start_time = time.time()
    
    for row in ds:
        if row_count >= TARGET_ROWS:
            break
            
        # Target Hindi specifically. MSMARCO-XI typically stores translations in 'query_hi' / 'passage_hi'
        # Or if it uses a language column, we ensure it matches Hindi.
        if row.get("language") and row.get("language") != "hi":
            continue
            
        # Fallbacks to grab Hindi content explicitly
        query = row.get("query_hi", row.get("query", row.get("question", "")))
        passage = row.get("passage_hi", row.get("passage", row.get("text", row.get("context", ""))))
        
        if not passage or not query:
            continue
            
        chunks = semantic_chunker(passage, query)
        
        for chunk in chunks:
            current_payloads.append(chunk)
            
        row_count += 1
        
        # Batch processing for extreme speed
        if len(current_payloads) >= BATCH_SIZE:
            texts_to_embed = [p["text"] for p in current_payloads]
            embeddings = get_embeddings_batch(texts_to_embed)
            
            insert_chunks(embeddings, current_payloads)
            total_chunks_inserted += len(current_payloads)
            
            elapsed = time.time() - start_time
            print(f"Progress: Read {row_count} rows | Inserted {total_chunks_inserted} vector chunks | Time: {elapsed:.1f}s")
            current_payloads = []
            
    # Process any remaining chunks
    if current_payloads:
        texts_to_embed = [p["text"] for p in current_payloads]
        embeddings = get_embeddings_batch(texts_to_embed)
        insert_chunks(embeddings, current_payloads)
        total_chunks_inserted += len(current_payloads)

    elapsed = time.time() - start_time
    print(f"\nDatabase setup complete in {elapsed:.1f} seconds! Successfully indexed {total_chunks_inserted} English and Hindi MSMARCO chunks.")

if __name__ == "__main__":
    main()
