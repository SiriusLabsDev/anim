from app.config import config

from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from typing import AsyncGenerator

async_engine = create_async_engine(config['ASYNC_DB_URI'])
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
)

Base = declarative_base()

async def get_db_async() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close() 
            