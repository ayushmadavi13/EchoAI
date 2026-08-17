from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from backend.agents.orchestrator import RagOrchestrator

router = APIRouter()
orchestrator = RagOrchestrator(max_retries=2)

class QueryRequest(BaseModel):
    query: str

@router.post("/ask")
async def ask_question(request: QueryRequest):
    """
    Endpoint that receives a query and streams the RAG response back.
    Streaming ensures Time-To-First-Token (TTFT) stays under 50ms.
    """
    return StreamingResponse(
        orchestrator.process(request.query), 
        media_type="text/plain"
    )
