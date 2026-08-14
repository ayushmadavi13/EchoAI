import os
import asyncio
import base64
from sarvamai import AsyncSarvamAI, RealtimeAudioInput, RealtimeEnd

API_KEY = os.getenv("SARVAM_API_KEY")

async def transcribe(audio_chunks):
    """audio_chunks: an async iterator yielding raw linear16 PCM bytes."""
    client = AsyncSarvamAI(api_subscription_key=API_KEY)

    async with client.speech_to_text_realtime_streaming.connect(
        language_code="hi-IN",
        stream_type="fast",
    ) as ws:

        async def send_audio():
            async for chunk in audio_chunks:
                await ws.send_realtime_audio_input(
                    RealtimeAudioInput(audio=base64.b64encode(chunk).decode("utf-8"))
                )
            await ws.send_realtime_end(RealtimeEnd())

        async def receive_events():
            async for message in ws:
                if message.event == "transcript.partial":
                    print(f"partial: {message.text}")
                elif message.event == "transcript.final":
                    print(f"final: {message.text}")
                    return  # one-shot script: stop after the first utterance's final
                elif message.event == "error":
                    print(f"error ({message.code}): {message.message}")
                    if message.is_fatal:
                        return

        await asyncio.gather(send_audio(), receive_events())


async def pcm_chunks_from_file(path, chunk_size=3200):
    """Yields raw linear16 PCM chunks (~100ms each at 16kHz mono 16-bit)."""
    with open(path, "rb") as f:
        while chunk := f.read(chunk_size):
            yield chunk
            await asyncio.sleep(0.1)  # pace it like real-time audio


if __name__ == "__main__":
    asyncio.run(transcribe(pcm_chunks_from_file("path/to/audio.pcm")))
