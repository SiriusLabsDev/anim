from fastapi import FastAPI
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
)

app.include_router(chat_router)