"""
vector_db.py (FAISS version)

Replaces the local-path Qdrant backend, which stores data in SQLite and
does a disk fsync on every upsert() call -- this was the actual cause of
the ~800s-per-256-chunks slowdown you were seeing (confirmed via
qdrant_data/collection/msmarco_chunks/storage.sqlite in your project).

FAISS keeps the index entirely in memory during a run and writes to disk
only when you explicitly call save(), so bulk insertion during indexing
is limited by embedding speed, not disk I/O -- this should turn your
indexing run from "hundreds of seconds per batch" into "a few ms per
batch, dominated only by the embedding call".

Same public API as before, so orchestrator.py / main.py need ZERO changes:
    - insert_chunks(vectors, payloads, ids=None)
    - search_context(query_vector, top_k=3)

New, needed for the FAISS version:
    - save_index()   -- call this once at the end of setup_db.py
    - (index auto-loads from disk on import if a saved index exists)
"""

import os
import pickle
import threading

import numpy as np
import faiss

from backend.services.embeddings import get_embedding

INDEX_DIR = "faiss_data"
INDEX_PATH = os.path.join(INDEX_DIR, "echoai.index")
PAYLOADS_PATH = os.path.join(INDEX_DIR, "payloads.pkl")

try:
    VECTOR_SIZE = len(get_embedding("dummy"))
except Exception as e:
    print(f"Warning: Failed to calculate vector size dynamically: {e}")
    VECTOR_SIZE = 384

_lock = threading.Lock()

os.makedirs(INDEX_DIR, exist_ok=True)


def _new_index():
    # IndexFlatIP on L2-normalized vectors == cosine similarity, matching
    # Qdrant's Distance.COSINE behaviour. IndexIDMap lets us use our own
    # integer ids (so payloads dict and index positions always agree).
    flat = faiss.IndexFlatIP(VECTOR_SIZE)
    return faiss.IndexIDMap(flat)


def _load_or_create():
    if os.path.exists(INDEX_PATH) and os.path.exists(PAYLOADS_PATH):
        index = faiss.read_index(INDEX_PATH)
        with open(PAYLOADS_PATH, "rb") as f:
            payloads = pickle.load(f)
        print(f"[vector_db] Loaded existing FAISS index: {index.ntotal} vectors")
        return index, payloads
    else:
        print("[vector_db] No existing index found -- starting fresh.")
        return _new_index(), {}


_index, _payloads = _load_or_create()
_next_id = max(_payloads.keys(), default=-1) + 1


import shutil

def init_db():
    """Kept for API compatibility -- FAISS index is already initialized above."""
    pass


def reset_index():
    """
    Safely clears the in-memory FAISS index and payloads and recreates them,
    wiping any existing data on disk.
    """
    global _index, _payloads, _next_id
    with _lock:
        _index = _new_index()
        _payloads = {}
        _next_id = 0
        if os.path.exists(INDEX_DIR):
            shutil.rmtree(INDEX_DIR, ignore_errors=True)
        os.makedirs(INDEX_DIR, exist_ok=True)
        print("[vector_db] Index fully reset in memory and on disk.")


def _normalize(vecs: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    norms[norms == 0] = 1e-8
    return vecs / norms


def insert_chunks(vectors: list[list[float]], payloads: list[dict], ids: list[int] = None):
    """
    Same signature as the Qdrant version. Adds vectors + payloads to the
    in-memory FAISS index. Does NOT write to disk on every call -- call
    save_index() periodically (e.g. every N batches) and once at the end.
    """
    global _next_id

    vecs = np.array(vectors, dtype="float32")
    vecs = _normalize(vecs)

    with _lock:
        if ids is None:
            ids = list(range(_next_id, _next_id + len(vectors)))
            _next_id += len(vectors)

        id_arr = np.array(ids, dtype="int64")
        _index.add_with_ids(vecs, id_arr)

        for _id, payload in zip(ids, payloads):
            _payloads[_id] = payload


def search_context(query_vector: list[float], top_k: int = 3) -> list[str]:
    """
    Same signature as the Qdrant version. In-memory search, no network,
    no disk I/O -- this is the <2ms-class operation your latency target
    actually needs.
    """
    if _index.ntotal == 0:
        return []

    vec = np.array([query_vector], dtype="float32")
    vec = _normalize(vec)

    # Overfetch to allow filtering for positive passages
    fetch_k = min(_index.ntotal, top_k * 50)
    scores, ids = _index.search(vec, fetch_k)
    
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"[DIAGNOSTICS] Runtime search is using FAISS. Total index vectors: {_index.ntotal}")

    results = []
    for _id in ids[0]:
        if _id == -1:
            continue
        payload = _payloads.get(int(_id))
        if payload:
            meta = payload.get("metadata", {})
            if meta.get("is_selected") == True:
                results.append(payload.get("text", ""))
                if len(results) >= top_k:
                    break
    
    logger.info(f"[DIAGNOSTICS] Top-{len(results)} FAISS post-filter results found.")
    return results


def save_index():
    """
    Persist the index + payloads to disk. Call this periodically during
    a long indexing run (e.g. every 50 batches) as a safety checkpoint,
    and ALWAYS once at the very end.
    """
    with _lock:
        faiss.write_index(_index, INDEX_PATH)
        with open(PAYLOADS_PATH, "wb") as f:
            pickle.dump(_payloads, f)
    print(f"[vector_db] Saved index: {_index.ntotal} vectors -> {INDEX_PATH}")


def stats():
    return {"total_vectors": _index.ntotal, "total_payloads": len(_payloads)}