import sys
import os

# Ensure the backend module is accessible when running this script
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from datasets import load_dataset
from backend.chunking.chunker import semantic_chunker
from backend.services.embeddings import get_embeddings_batch
from backend.services.vector_db import insert_chunks

def main():
    print("Connecting to MSMARCO dataset (Downloading first 100k rows)...")
    # We remove streaming=True to bypass a known PyArrow bug with nested chunked arrays.
    # By specifying the split as "train[:100000]", HuggingFace is smart enough to 
    # ONLY download the first few parquet shards (a few hundred MBs) instead of the full 56GB!
    dataset_slice = load_dataset("ai4bharat/MSMARCO-XI", split="train[:100000]")
    
    TARGET_ROWS = 100000
    BATCH_SIZE = 256 # Number of chunks to embed and insert at once
    
    row_count = 0
    total_chunks_inserted = 0
    
    current_payloads = []
    
    print(f"Starting advanced chunking and embedding for the first {TARGET_ROWS} rows...")
    
    for row in dataset_slice:
        if row_count >= TARGET_ROWS:
            break
            
        # The exact column names depend on MSMARCO format, typically query and passage
        query = row.get("query", row.get("question", ""))
        passage = row.get("passage", row.get("text", row.get("context", "")))
        
        if not passage or not query:
            row_count += 1
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
            
            print(f"Progress: Read {row_count} dataset rows | Inserted {total_chunks_inserted} vector chunks...")
            current_payloads = []
            
    # Process any remaining chunks
    if current_payloads:
        texts_to_embed = [p["text"] for p in current_payloads]
        embeddings = get_embeddings_batch(texts_to_embed)
        insert_chunks(embeddings, current_payloads)
        total_chunks_inserted += len(current_payloads)

    print(f"\nDatabase setup complete! Successfully indexed {total_chunks_inserted} highly-optimized overlapping chunks.")

if __name__ == "__main__":
    main()
