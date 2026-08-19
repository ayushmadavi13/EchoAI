import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.embeddings import get_embedding
from backend.services.vector_db import search_context

query = "what was the immediate impact of the success of the manhattan project?"
print("Query:", query)

query_vector = get_embedding(query)
print("Vector length:", len(query_vector))

results = search_context(query_vector, top_k=3)
print("Found", len(results), "results:")
for i, res in enumerate(results):
    print(f"--- Result {i+1} ---")
    print(res)
