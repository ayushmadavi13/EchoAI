import sys
import os

# Ensure the backend module is accessible when running this script
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from datasets import load_dataset
from backend.chunking.chunker import semantic_chunker
from backend.services.embeddings import get_embeddings_batch
from backend.services.vector_db import insert_chunks

def main():
    print("Connecting to MSMARCO dataset (Streaming mode)...")
    # Stream the dataset to avoid downloading the 56GB block upfront
    dataset = load_dataset("ai4bharat/MSMARCO-XI", streaming=True)
    split_name = list(dataset.keys())[0]
    
    # We will process 10,000 rows as a solid proof of concept.
    # You can increase this to 50k or more when you run the final build overnight.
    TARGET_ROWS = 10000
    BATCH_SIZE = 256 # Number of chunks to embed and insert at once
    
    row_count = 0
    total_chunks_inserted = 0
    
    current_payloads = []
    
    print(f"Starting advanced chunking and embedding for the first {TARGET_ROWS} rows...")
    
    for row in dataset[split_name]:
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
