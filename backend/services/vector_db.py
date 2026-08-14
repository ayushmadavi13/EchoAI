from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# Use a local path for Qdrant to persist data locally without network overhead
# This is crucial for the <50ms latency target since it avoids HTTP round-trips
client = QdrantClient(path="qdrant_data")

COLLECTION_NAME = "msmarco_chunks"
# fastembed's BGE-small-en-v1.5 produces vectors of size 384
VECTOR_SIZE = 384 

def init_db():
    """Initializes the collection if it doesn't exist."""
    if not client.collection_exists(COLLECTION_NAME):
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )

# Ensure DB is initialized when service is imported
init_db()

def insert_chunks(vectors: list[list[float]], payloads: list[dict], ids: list[int] = None):
    """
    Inserts chunk vectors and their payload (context text) into the local DB.
    payloads should be a list of dicts, e.g., [{"text": "the actual chunk text..."}]
    """
    # If no custom IDs are provided, just use an incrementing integer
    if ids is None:
        # In a real app you'd want robust UUIDs, but for task evaluation simple ints work
        import uuid
        ids = [str(uuid.uuid4()) for _ in vectors]
        
    points = [
        PointStruct(id=idx, vector=vec, payload=payload)
        for idx, vec, payload in zip(ids, vectors, payloads)
    ]
    
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

def search_context(query_vector: list[float], top_k: int = 3) -> list[str]:
    """
    Searches the local Vector DB for the top_k most similar chunks.
    Returns a list of text context strings (less than 2ms execution time).
    """
    search_result = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k
    )
    
    # Extract the 'text' field from the payload of the matched results
    return [hit.payload.get("text", "") for hit in search_result]
