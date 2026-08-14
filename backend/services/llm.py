import os
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

async def generate_answer(query: str, context: str) -> str:
    """
    Generates an answer based on the provided context using Groq's Llama 3 for ultra-low latency.
    Includes a strict guardrail to only use the provided context.
    """
    system_prompt = (
        "You are an AI assistant. Answer the user's question ONLY using the provided context. "
        "If the context does not contain the answer, reply exactly with: 'I cannot find the answer in the provided context.'"
    )
    
    response = await client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion:\n{query}"}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.0,
    )
    return response.choices[0].message.content

async def classify_intent(query: str) -> str:
    """
    Quickly classifies if a query is a greeting, out of topic, or a valid question.
    """
    system_prompt = (
        "Classify the user's query into one of two categories: 'GREETING' or 'QUESTION'. "
        "Return ONLY the category name."
    )
    
    response = await client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.0,
    )
    return response.choices[0].message.content
