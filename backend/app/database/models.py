from .core import Base

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ChatHistory(Base):
    __tablename__ = 'chat_history'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    prompt = Column(String, nullable=False)
    response = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())