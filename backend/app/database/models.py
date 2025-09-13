from .core import Base

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.ext.asyncio import AsyncSession

from datetime import datetime, timedelta, timezone

from typing import List
from uuid import uuid4

def uuid_str() -> str:
    return str(uuid4())

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, index=True, default=uuid_str)
    email = Column(String, unique=True, index=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    chats: Mapped[list["Chat"]] = relationship("Chat", back_populates="user", cascade="all, delete-orphan")

class Chat(Base):
    __tablename__ = 'chats'
    
    id = Column(String, primary_key=True, index=True, default=uuid_str)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="chats")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="chat", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = 'messages'

    id = Column(String, primary_key=True, index=True, default=uuid_str)
    chat_id = Column(String, ForeignKey('chats.id'), nullable=False)

    prompt = Column(String, nullable=False)
    response = Column(String, nullable=True)
    video_id = Column(String, ForeignKey('videos.id'), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    chat: Mapped["Chat"] = relationship("Chat", back_populates="messages")
    video: Mapped["Video"] = relationship("Video", back_populates="message")

class Video(Base):
    __tablename__ = 'videos'

    id = Column(String, primary_key=True, index=True, default=uuid_str)
    s3_bucket = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    message: Mapped["Message"] = relationship("Message", back_populates="video")

class Credits(Base):
    __tablename__ = 'credits'

    user_id = Column(String, ForeignKey('users.id'), primary_key=True)
    amount = Column(Integer, nullable=False, default=500)
    refreshed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=False)

    async def get_current_credits(self, db: AsyncSession) -> int:
        if self.refreshed_at and datetime.now(timezone.utc) - self.refreshed_at >= timedelta(hours=24):
            self.amount = 500
            self.refreshed_at = datetime.now(timezone.utc)
            await db.commit()
        
        return self.amount
    
    async def deduct_credits(self, db: AsyncSession, cost: int):
        current_credits = await self.get_current_credits(db)
        if current_credits == 0:
            raise ValueError("Insufficient credits")

        self.amount = max(current_credits - cost, 0)

        await db.commit()