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
    embeddings_generator = embedding_model.embed([text])
    
    # Get the first (and only) embedding from the generator
    embedding_array = next(embeddings_generator)
    
    # Convert numpy array to standard python list for json serialization or vector DB ingestion
    return embedding_array.tolist()

def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """
    Generates embeddings for a batch of texts.
    Useful for indexing the dataset.
    """
    embeddings_generator = embedding_model.embed(texts)
    return [emb.tolist() for emb in embeddings_generator]
