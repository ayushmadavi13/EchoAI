import logging
import asyncio
from typing import AsyncGenerator
from backend.services.embeddings import get_embedding
from backend.services.vector_db import search_context
from backend.services.llm import generate_answer_stream
from backend.guardrails.filters import InputGuardrail

logger = logging.getLogger(__name__)

class RagOrchestrator:
    def __init__(self, max_retries: int = 2):
        self.max_retries = max_retries

    async def process(self, query: str) -> AsyncGenerator[str, None]:
        """
        Orchestrates the entire RAG pipeline with proper harnessing.
        - Checks guardrails.
        - Fetches embeddings and searches Qdrant.
        - Generates streaming response with retries.
        """
        # 1. Guardrail Check & Retrieval (Run in Parallel for Max Speed)
        logger.info(f"Running guardrails and retrieval concurrently for: {query}")
        
        async def fetch_context():
            # get_embedding is synchronous, wrap in to_thread if needed, but it's fast enough
            # For pure async, we can just run it directly
            query_vector = get_embedding(query)
            contexts = search_context(query_vector, top_k=2)
            return "\n".join(contexts)

        try:
            # asyncio.gather runs both the LLM guardrail and the Qdrant search at the same time
            is_valid, context_str = await asyncio.gather(
                InputGuardrail.validate(query),
                asyncio.to_thread(fetch_context) # Run blocking FAISS/Qdrant in a thread
            )
        except Exception as e:
            logger.error(f"Concurrent execution failed: {e}")
            yield "An internal error occurred while retrieving information. Please try again later."
            return

        if not is_valid:
            yield "I cannot answer this query because it is off-topic, a greeting, or violates safety guidelines."
            return

        # 2. LLM Generation with Retry Harness
        retries = 0
        while retries <= self.max_retries:
            try:
                logger.info(f"Generating answer (Attempt {retries + 1})...")
                stream = generate_answer_stream(query, context_str)
                
                async for chunk in stream:
                    yield chunk
                
                # Successful generation, break out of retry loop
                break
                
            except Exception as e:
                logger.error(f"LLM Generation failed: {e}")
                retries += 1
                if retries > self.max_retries:
                    yield "\n[Error: Model failed to generate a response after multiple attempts.]"
                    break
                await asyncio.sleep(1) # Backoff before retry
