from fastapi import FastAPI
from fastapi.responses import JSONResponse
from backend.api.routes import router as api_router

app = FastAPI()

app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "healthy"}, status_code=200)
