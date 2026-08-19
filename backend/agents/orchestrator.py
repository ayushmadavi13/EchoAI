import logging
import asyncio
import json
import time
from typing import AsyncGenerator
from backend.services.embeddings import get_embedding
from backend.services.vector_db import search_context
from backend.services.llm import generate_answer_stream
from backend.guardrails.filters import InputGuardrail

logger = logging.getLogger(__name__)

class RagOrchestrator:
    def __init__(self, max_retries: int = 2):
        self.max_retries = max_retries

    async def process(self, query: str, transcript: str = "") -> AsyncGenerator[str, None]:
        """
        Orchestrates the entire RAG pipeline and yields Server-Sent Events (SSE).
        """
        start_time = time.perf_counter()
        
        # Send initial transcript event if it came from audio
        if transcript:
            yield f'data: {json.dumps({"type": "transcript", "text": transcript})}\n\n'

        # 1. Guardrail Check & Retrieval (Run in Parallel for Max Speed)
        logger.info(f"Running guardrails and retrieval concurrently for: {query}")
        
        def fetch_context():
            # get_embedding is synchronous
            embed_start = time.perf_counter()
            query_vector = get_embedding(query)
            embed_time = (time.perf_counter() - embed_start) * 1000
            
            search_start = time.perf_counter()
            contexts = search_context(query_vector, top_k=5)
            search_time = (time.perf_counter() - search_start) * 1000
            
            logger.info(f"[DIAGNOSTICS] Query embedding dimension: {len(query_vector)}")
            logger.info(f"[DIAGNOSTICS] search_context() returned empty list: {len(contexts) == 0}")
            logger.info(f"[DIAGNOSTICS] Actual top-5 retrieved text snippets:\n{json.dumps(contexts, indent=2, ensure_ascii=False)}")
            
            return contexts, embed_time, search_time

        try:
            is_valid, (contexts, embed_time, search_time) = await asyncio.gather(
                InputGuardrail.validate(query),
                asyncio.to_thread(fetch_context)
            )
            context_str = "\n".join(contexts)
            logger.info(f"[DIAGNOSTICS] Exact context string sent to LLM:\n{context_str}")
        except Exception as e:
            logger.error(f"Concurrent execution failed: {e}")
            yield f'data: {json.dumps({"type": "error", "content": "Internal error occurred"})}\n\n'
            return

        # Send contexts event
        yield f'data: {json.dumps({"type": "context", "chunks": contexts})}\n\n'

        if not is_valid:
            # Send guardrail event
            yield f'data: {json.dumps({"type": "guardrail", "blocked": True, "reason": "UNSAFE_OR_OFF_TOPIC"})}\n\n'
            yield f'data: {json.dumps({"type": "chunk", "content": "I cannot answer this query because it is off-topic or violates safety guidelines."})}\n\n'
            return
            
        yield f'data: {json.dumps({"type": "guardrail", "blocked": False, "reason": None})}\n\n'

        # 3. LLM Generation with Retry Harness
        retries = 0
        while retries <= self.max_retries:
            try:
                logger.info(f"Generating answer (Attempt {retries + 1})...")
                gen_start = time.perf_counter()
                
                stream = generate_answer_stream(query, context_str)
                
                async for chunk in stream:
                    # Stream actual text chunks
                    safe_chunk = json.dumps({"type": "chunk", "content": chunk})
                    yield f'data: {safe_chunk}\n\n'
                
                gen_time = (time.perf_counter() - gen_start) * 1000
                total_time = (time.perf_counter() - start_time) * 1000
                
                # Send final latency event
                latencies = {
                    "stt_ms": 15.0 if transcript else 0.0, # Approximate if audio was used
                    "embedding_ms": embed_time,
                    "retrieval_ms": search_time,
                    "generation_ms": gen_time,
                    "total_ms": total_time
                }
                yield f'data: {json.dumps({"type": "latency", "data": latencies})}\n\n'
                
                break
                
            except Exception as e:
                logger.error(f"LLM Generation failed: {e}")
                retries += 1
                if retries > self.max_retries:
                    yield f'data: {json.dumps({"type": "error", "content": "Model failed to generate response"})}\n\n'
                    break
                await asyncio.sleep(1)
