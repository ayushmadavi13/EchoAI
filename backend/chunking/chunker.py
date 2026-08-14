import re
from typing import List, Dict

def semantic_chunker(text: str, query: str, max_chars: int = 600, overlap_sentences: int = 1) -> List[Dict]:
    """
    Advanced chunking strategy:
    1. Splits passage by semantic boundaries (sentences) rather than arbitrary characters.
    2. Groups sentences together up to `max_chars` limit.
    3. Overlaps the chunks by `overlap_sentences` to ensure no context is lost at boundaries.
    4. Attaches the source query as metadata for richer retrieval context.
    """
    # Split text by sentence-ending punctuation followed by whitespace
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if not sentences:
        return []

    chunks = []
    current_sentences = []
    current_length = 0
    
    for sentence in sentences:
        # If a single sentence is absurdly long, we still add it but start a new chunk immediately after
        if current_length + len(sentence) > max_chars and current_sentences:
            # Save the current accumulated chunk
            chunk_text = " ".join(current_sentences)
            
            # To maximize retrieval relevance, we prepend the query to the chunk text itself
            # so the embedding captures both the question and the answer context natively
            enriched_text = f"Query: {query}\nContext: {chunk_text}"
            
            chunks.append({
                "text": enriched_text,
                "metadata": {"source_query": query, "original_text": chunk_text}
            })
            
            # Start a new chunk, keeping the last `overlap_sentences` for semantic overlap
            overlap_slice = current_sentences[-overlap_sentences:] if overlap_sentences > 0 else []
            current_sentences = overlap_slice + [sentence]
            current_length = sum(len(s) for s in current_sentences) + len(current_sentences)
        else:
            current_sentences.append(sentence)
            current_length += len(sentence) + 1 # +1 for the space

    # Add any remaining sentences as the last chunk
    if current_sentences:
        chunk_text = " ".join(current_sentences)
        enriched_text = f"Query: {query}\nContext: {chunk_text}"
        chunks.append({
            "text": enriched_text,
            "metadata": {"source_query": query, "original_text": chunk_text}
        })
        
    return chunks
