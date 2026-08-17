import os
import json
from typing import AsyncGenerator, Dict, Any
from groq import AsyncGroq
from openinference.instrumentation.groq import GroqInstrumentor
from phoenix.otel import register

# Initialize Phoenix Tracer for LLM Observability
tracer_provider = register(
    project_name="echoai-rag", 
    endpoint="http://localhost:6006/v1/traces"
)

# Instrument the Groq SDK globally
GroqInstrumentor().instrument(tracer_provider=tracer_provider)

# Initialize Groq client
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

async def generate_answer_stream(query: str, context: str) -> AsyncGenerator[str, None]:
    """
    Generates an answer based on the provided context using Groq's Llama 3 for ultra-low latency.
    Streams the response back as an async generator.
    """
    system_prompt = (
        "You are an AI assistant. Answer the user's question ONLY using the provided context. "
        "If the context does not contain the answer, reply exactly with: 'I cannot find the answer in the provided context.'"
    )
    
    stream = await client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion:\n{query}"}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.0,
        stream=True,
    )
    
    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content

async def classify_query_intent(query: str) -> Dict[str, Any]:
    """
    Quickly classifies if a query is safe and on-topic using JSON mode.
    Returns a dictionary like {"is_safe": bool, "is_question": bool, "reason": str}
    """
    system_prompt = (
        "You are a strict guardrail classifier. You must respond in valid JSON format ONLY. "
        "Analyze the user's query and determine:\n"
        "1. is_safe: boolean (false if harmful, abusive, or explicitly restricted)\n"
        "2. is_question: boolean (true if it's a real question seeking information, false if it's a greeting, statement, or gibberish)\n"
        "3. reason: a very short string explaining the classification."
    )
    
    response = await client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.0,
        response_format={"type": "json_object"},
    )
    
    try:
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception:
        # Fallback in case of parse error
        return {"is_safe": True, "is_question": True, "reason": "Parse error fallback"}
