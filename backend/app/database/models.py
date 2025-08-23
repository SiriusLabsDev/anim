from .core import Base

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, Mapped

from typing import List
from uuid import uuid4


class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, index=True, default=uuid4)
    email = Column(String, unique=True, index=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    chats: Mapped[list["Chat"]] = relationship("Chat", back_populates="user", cascade="all, delete-orphan")

class Chat(Base):
    __tablename__ = 'chats'
    
    id = Column(String, primary_key=True, index=True, default=uuid4)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="chats")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="chat", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = 'messages'

    id = Column(String, primary_key=True, index=True)
    chat_id = Column(String, ForeignKey('chats.id'), nullable=False)

    prompt = Column(String, nullable=False)
    response = Column(String, nullable=True)
    video_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    chat: Mapped["Chat"] = relationship("Chat", back_populates="messages")