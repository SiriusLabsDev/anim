import asyncio

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import config, check_config

from app.chat.route import router as chat_router

check_config()

app = FastAPI()

origins = [config['FRONTEND_URL']]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(chat_router, prefix="/api")

async def event_stream():
    counter = 0
    while True:
        yield f"data: {counter}\n\n"
        counter += 1
        await asyncio.sleep(1)  # simulate new data every second
    
@app.get("/stream")
async def stream():
    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "environment": config['ENVIRONMENT'],
        "frontend_url": config['FRONTEND_URL'],
        "random_var": config.get('RANDOM_VAR', 'not set')
    }
