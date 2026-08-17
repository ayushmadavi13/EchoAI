import os
from groq import AsyncGroq
import logging

logger = logging.getLogger(__name__)
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """
    Transcribes audio bytes using Groq's Whisper API.
    Supports browser audio formats (.webm, .m4a, .mp3, .wav, etc.) directly.
    """
    try:
        # Create a tuple structure Groq expects for file uploads: (filename, bytes)
        file_tuple = (filename, audio_bytes)
        
        logger.info(f"Sending audio to Groq Whisper for transcription...")
        
        transcription = await client.audio.transcriptions.create(
            file=file_tuple,
            model="whisper-large-v3",
            response_format="json",
            temperature=0.0
        )
        
        text = transcription.text.strip()
        logger.info(f"Transcription complete: {text}")
        return text
    except Exception as e:
        logger.error(f"STT failed: {e}")
        return ""
