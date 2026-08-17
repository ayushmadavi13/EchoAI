from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from backend.agents.orchestrator import RagOrchestrator
from backend.services.stt import transcribe_audio

router = APIRouter()
orchestrator = RagOrchestrator(max_retries=2)

@router.post("/query")
async def ask_question(
    audio: UploadFile = File(None),
    text: str = Form(None)
):
    """
    Endpoint that receives either an audio file OR text query.
    Returns a Server-Sent Events (SSE) stream of JSON objects containing 
    metadata (STT, Contexts, Latencies) and generated text chunks.
    """
    transcript = ""
    query = ""
    
    if audio:
        audio_bytes = await audio.read()
        filename = audio.filename
        query = await transcribe_audio(audio_bytes, filename)
        transcript = query
    elif text:
        query = text
        
    if not query:
        # Fallback if somehow both are missing or STT fails entirely
        query = "Hello"
        
    return StreamingResponse(
        orchestrator.process(query, transcript), 
        media_type="text/event-stream"
    )
