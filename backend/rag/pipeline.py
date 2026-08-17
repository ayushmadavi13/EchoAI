import time
import asyncio
from backend.agents.orchestrator import RagOrchestrator

orchestrator = RagOrchestrator(max_retries=2)

async def process_query(query: str):
    """
    End-to-end RAG pipeline using the new Orchestrator harness.
    Used for legacy compatibility or simple testing.
    """
    start_time = time.perf_counter()
    
    stream = orchestrator.process(query)
    
    # Collect the full response (only use this if you don't need streaming)
    answer_chunks = []
    async for chunk in stream:
        answer_chunks.append(chunk)
        
    answer = "".join(answer_chunks)
    
    end_time = time.perf_counter()
    latency_ms = (end_time - start_time) * 1000
    
    return answer, latency_ms
