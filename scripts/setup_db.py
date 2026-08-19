import sys
import os
import json
import time
from typing import Dict

# Ensure the backend module is accessible when running this script
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from datasets import load_dataset
from backend.chunking.chunker import semantic_chunker
from backend.services.embeddings import get_embeddings_batch
from backend.services.vector_db import insert_chunks, save_index, stats

CHECKPOINT_FILE = "faiss_data/ingest_checkpoint.json"

def load_checkpoint() -> Dict:
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load checkpoint file: {e}")
    return {"languages": {}, "total_vectors_inserted": 0, "total_chunks_processed": 0}

def save_checkpoint(checkpoint: Dict):
    os.makedirs(os.path.dirname(CHECKPOINT_FILE), exist_ok=True)
    with open(CHECKPOINT_FILE, "w") as f:
        json.dump(checkpoint, f, indent=4)

def main():
    # -----------------------------------------------------------------
    # Configuration
    # -----------------------------------------------------------------
    languages_str = os.environ.get("LANGUAGES", "hi,mr,gu")
    languages = [lang.strip() for lang in languages_str.split(",") if lang.strip()]
    
    max_queries_env = int(os.environ.get("MAX_QUERIES", "50"))
    MAX_QUERIES = max_queries_env if max_queries_env > 0 else None
    
    embed_batch_size = int(os.environ.get("EMBED_BATCH_SIZE", "16"))
    # BATCH_SIZE is the number of chunks we accumulate before inserting
    BATCH_SIZE = embed_batch_size * 20 

    print("\n--- Production Embedding Config ---")
    print(f"Languages: {languages}")
    print(f"MAX_QUERIES: {'Unlimited' if MAX_QUERIES is None else MAX_QUERIES}")
    print(f"batch_size: {embed_batch_size}\n")

    checkpoint = load_checkpoint()
    total_chunks_inserted = checkpoint.get("total_vectors_inserted", 0)
    
    start_time = time.time()
    current_payloads = []

    for lang in languages:
        lang_state = checkpoint["languages"].setdefault(lang, {"rows_processed": 0, "completed": False, "chunks": 0})
        
        if lang_state["completed"]:
            print(f"Skipping {lang} as it is marked completed in checkpoint.")
            continue
            
        print(f"\n--- Starting ingestion for language: {lang} ---")
        dataset = load_dataset("ai4bharat/MSMARCO-XI", lang, split="train", streaming=True)
        
        rows_processed = lang_state["rows_processed"]
        if rows_processed > 0:
            print(f"Resuming {lang} from row {rows_processed}...")
            # Note: For IterableDataset, skip() is optimal. If not supported, we can loop and next().
            try:
                dataset = dataset.skip(rows_processed)
            except AttributeError:
                # Fallback if skip is not supported
                iterator = iter(dataset)
                for _ in range(rows_processed):
                    next(iterator, None)
                dataset = iterator
        
        row_count = rows_processed
        
        for row in dataset:
            if MAX_QUERIES is not None and (row_count - rows_processed) >= MAX_QUERIES:
                print(f"Reached MAX_QUERIES limit ({MAX_QUERIES}) for {lang}.")
                break
                
            query_id = row.get("query_id", str(row_count))
            query = row.get("query", "")
            
            # The schema may have 'passages' dict or list
            passages_data = row.get("passages")
            
            passages_list = []
            is_selected_list = []
            
            if isinstance(passages_data, dict):
                # Try Translated_passages first (from previous schema)
                if "Translated_passages" in passages_data:
                    passages_list = passages_data.get("Translated_passages", [])
                    is_selected_list = passages_data.get("is_selected", [])
                elif "passage_text" in passages_data:
                    passages_list = passages_data.get("passage_text", [])
                    is_selected_list = passages_data.get("is_selected", [])
            elif isinstance(passages_data, list):
                # Sometimes it's a list of dicts
                for p in passages_data:
                    passages_list.append(p.get("passage_text", p.get("text", "")))
                    is_selected_list.append(p.get("is_selected", False))
            
            for i, passage in enumerate(passages_list):
                if not passage:
                    continue
                selected_flag = bool(is_selected_list[i]) if i < len(is_selected_list) else False
                
                for chunk in semantic_chunker(passage, query):
                    # Attach required metadata
                    chunk["metadata"]["language"] = lang
                    chunk["metadata"]["query_id"] = query_id
                    chunk["metadata"]["is_selected"] = selected_flag
                    chunk["metadata"]["passage_idx"] = i
                    current_payloads.append(chunk)
                    lang_state["chunks"] += 1
            
            row_count += 1
            
            if len(current_payloads) >= BATCH_SIZE:
                texts_to_embed = [p["text"] for p in current_payloads]
                
                t_embed_start = time.time()
                embeddings = get_embeddings_batch(texts_to_embed)
                t_embed = time.time() - t_embed_start
                
                t_insert_start = time.time()
                insert_chunks(embeddings, current_payloads)
                t_insert = time.time() - t_insert_start
                
                total_chunks_inserted += len(texts_to_embed)
                lang_state["rows_processed"] = row_count
                checkpoint["total_vectors_inserted"] = total_chunks_inserted
                
                # Update checkpoint & save index
                save_checkpoint(checkpoint)
                save_index()
                
                elapsed = time.time() - start_time
                print(f"[{lang}] Progress: {row_count} rows | {lang_state['chunks']} chunks | "
                      f"Batch Insert: {len(texts_to_embed)} chunks in {t_insert:.2f}s | "
                      f"Embed Time: {t_embed:.2f}s | Total Inserted: {total_chunks_inserted}")
                
                current_payloads = []
                
        # End of dataset or MAX_QUERIES reached
        lang_state["rows_processed"] = row_count
        if MAX_QUERIES is None or (row_count - rows_processed) < MAX_QUERIES:
            # If we didn't break because of MAX_QUERIES, we actually completed the dataset
            lang_state["completed"] = True
        
        save_checkpoint(checkpoint)
        
    # Process any remaining chunks
    if current_payloads:
        texts_to_embed = [p["text"] for p in current_payloads]
        embeddings = get_embeddings_batch(texts_to_embed)
        insert_chunks(embeddings, current_payloads)
        total_chunks_inserted += len(texts_to_embed)
        checkpoint["total_vectors_inserted"] = total_chunks_inserted
        save_checkpoint(checkpoint)
        
    save_index()
    
    elapsed = time.time() - start_time
    print(f"\n======================================")
    print(f"Ingestion Complete in {elapsed:.1f}s")
    print(f"======================================")
    for lang, state in checkpoint["languages"].items():
        print(f"{lang.upper()}:")
        print(f"  Rows Processed: {state['rows_processed']}")
        print(f"  Vectors/Chunks: {state['chunks']}")
    
    print(f"\nTOTAL:")
    print(f"  Vectors Inserted: {total_chunks_inserted}")
    print(f"  FAISS Index Stats: {stats()}")
    print(f"======================================")

if __name__ == "__main__":
    main()