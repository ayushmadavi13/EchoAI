import os
import sys
import time
import json

# Ensure backend module is accessible
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastembed import TextEmbedding
from backend.chunking.chunker import semantic_chunker

def get_test_chunks(num_chunks=512):
    print(f"Loading {num_chunks} test chunks for benchmarking...")
    chunks = []
    
    # Try reading from jsonl first
    jsonl_path = "./local_dataset/hindi_msmarco.jsonl"
    if os.path.exists(jsonl_path):
        try:
            with open(jsonl_path, "r", encoding="utf-8") as f:
                for line in f:
                    data = json.loads(line)
                    hi_query = data.get("query", "")
                    hi_passage = data.get("passage", "")
                    if data.get("language") == "hi" and hi_passage:
                        extracted = semantic_chunker(hi_passage, hi_query)
                        for chunk in extracted:
                            chunks.append(chunk["text"])
                            if len(chunks) >= num_chunks:
                                return chunks
        except Exception as e:
            print(f"Error reading JSONL: {e}")
            
    # Fallback to parquet if JSONL didn't have enough
    if len(chunks) < num_chunks:
        import pyarrow.parquet as pq
        parquet_path = "./local_dataset/hintrain.parquet"
        if os.path.exists(parquet_path):
            pf = pq.ParquetFile(parquet_path)
            for batch in pf.iter_batches(batch_size=1000):
                for row in batch.to_pylist():
                    hi_query = row.get("query", "")
                    passages = row.get("passages", {})
                    translated = passages.get("Translated_passages", [])
                    if not translated or not hi_query:
                        continue
                    for hi_passage in translated:
                        extracted = semantic_chunker(hi_passage, hi_query)
                        for chunk in extracted:
                            chunks.append(chunk["text"])
                            if len(chunks) >= num_chunks:
                                return chunks
    return chunks

def main():
    # 1. Generate fixed test set
    test_chunks = get_test_chunks(512)
    if len(test_chunks) < 512:
        print(f"Warning: Only found {len(test_chunks)} chunks for testing.")
    
    # 2. Load model
    print("Loading FastEmbed model (BAAI/bge-small-en-v1.5)...")
    model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    
    # 3. Warm up
    print("Warming up model...")
    _ = list(model.embed(test_chunks[:16], batch_size=16, parallel=0))
    print("Warm up complete.\n")
    
    # Configurations
    batch_sizes = [16, 32, 48, 64]
    parallels = [1, 2, 3, 4, 5, 6]
    
    results = []
    
    for bs in batch_sizes:
        for p in parallels:
            print(f"Testing batch_size={bs}, parallel={p}...")
            
            run_times = []
            for run_idx in range(2):
                start_time = time.perf_counter()
                
                # We consume the generator completely to measure actual time
                embeddings_generator = model.embed(test_chunks, batch_size=bs, parallel=p)
                _ = list(embeddings_generator)
                
                elapsed = time.perf_counter() - start_time
                run_times.append(elapsed)
                
            avg_time = sum(run_times) / len(run_times)
            chunks_per_sec = len(test_chunks) / avg_time
            avg_time_per_chunk = (avg_time / len(test_chunks)) * 1000 # in ms
            
            result = {
                "batch_size": bs,
                "parallel": p,
                "total_time_sec": avg_time,
                "chunks_per_sec": chunks_per_sec,
                "avg_time_per_chunk_ms": avg_time_per_chunk
            }
            results.append(result)
            print(f"  -> {chunks_per_sec:.2f} chunks/s (avg time: {avg_time:.2f}s)\n")
            
    # Sort descending by chunks/s
    results.sort(key=lambda x: x["chunks_per_sec"], reverse=True)
    
    # Save to JSON
    out_file = os.path.join(os.path.dirname(__file__), "embedding_benchmark_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Saved results to {out_file}\n")
    
    # Print Best
    best = results[0]
    print("BEST CONFIGURATION:")
    print("===================")
    print(f"batch_size={best['batch_size']}")
    print(f"parallel={best['parallel']}")
    print(f"throughput={best['chunks_per_sec']:.1f} chunks/s")
    print(f"total_time={best['total_time_sec']:.2f} s")
    print("===================")

if __name__ == "__main__":
    # Required for Windows multiprocessing
    main()
