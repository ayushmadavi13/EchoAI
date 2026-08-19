from fastembed import TextEmbedding

# Initialize the embedding model globally
# 'BAAI/bge-small-en-v1.5' is very fast (~10ms) and highly accurate for RAG.
# It runs locally via ONNX, so there is no network latency!
embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

def get_embedding(text: str) -> list[float]:
    """
    Generates a vector embedding for the input text.
    Returns a list of floats representing the vector.
    """
    # fastembed.embed takes an iterable of strings and returns a generator of numpy arrays
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"[DIAGNOSTICS] Runtime query using embedding model: {embedding_model.model_name}")
    
    embeddings_generator = embedding_model.embed([text])
    
    # Get the first (and only) embedding from the generator
    embedding_array = next(embeddings_generator)
    
    # Convert numpy array to standard python list for json serialization or vector DB ingestion
    return embedding_array.tolist()

import os

# Read the FastEmbed internal batch size from environment, defaulting to 16
EMBED_BATCH_SIZE = int(os.environ.get("EMBED_BATCH_SIZE", "16"))

# Read the parallel value for benchmarking. Default to 4.
_parallel_env = os.environ.get("EMBED_PARALLEL", "4")
EMBED_PARALLEL = int(_parallel_env) if _parallel_env is not None else None

def get_embeddings_batch(texts: list[str]) -> list:
    """
    Generates embeddings for a batch of texts.
    Useful for indexing the dataset.
    """
    embeddings_generator = embedding_model.embed(texts, batch_size=EMBED_BATCH_SIZE, parallel=EMBED_PARALLEL)
    
    # Return the generator as a list of numpy arrays directly.
    return list(embeddings_generator)
