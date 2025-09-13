from fastapi import APIRouter, Body, HTTPException, status, Depends, WebSocket, Query
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
import logging
from pathlib import Path
from pydantic import BaseModel

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.chat.llm import model, parser, scripting_model
from app.chat.llm.parser import simple_parser
from app.chat.llm.prompts import get_system_prompt, get_chat_title_prompt
        
from app.config import config
from app.database.core import get_db_async
from app.database.models import Chat, Message, Video, Credits
from app.clerk import get_current_user, get_current_user_ws
from app.schemas import TokenData

from .task_processing import RedisTaskManager

router = APIRouter(prefix='/chat', tags=['Chat'])

task_manager = RedisTaskManager(redis_url=config['REDIS_URL'])
logger = logging.getLogger(__name__)


def get_video_file(directory):
    video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v'}
    
    directory_path = Path(directory)
    
    for file_path in directory_path.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in video_extensions:
            return file_path
    
    return None

class ChatRequest(BaseModel):
    prompt: str


@router.get('/messages/{chat_id}')
async def get_messages(chat_id: str, db: AsyncSession = Depends(get_db_async)):
    result = await db.execute(select(Message).where(Message.chat_id == chat_id))
    messages = result.scalars().all()
    video_urls: list[str] = []

    for message in messages:
        if message.video_id:
            result = await db.execute(select(Video).where(Video.id == message.video_id))
            video = result.scalar_one_or_none()

            if video:
                s3_bucket = video.s3_bucket
                s3_key = video.s3_key
                video_url = await task_manager.get_video_url_aws(video.id, s3_bucket, s3_key, expiry=3600)
                video_urls.append(video_url)
            else:
                video_urls.append(None)
        else:
            video_urls.append(None)

    messages = [
        {
            "id": message.id,
            "prompt": message.prompt,
            "response": simple_parser(message.response)["message"] if message.response else None,
            "code": simple_parser(message.response)["code"] if message.response else None,
            "video_url": video_urls[i],
            "created_at": message.created_at
        } for i, message in enumerate(messages)
    ]

    return sorted(messages, key=lambda x: x["created_at"])

@router.get('/history')
async def get_chats(
    current_user: TokenData = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db_async)
):
    result = await db.execute(select(Chat).where(Chat.user_id == current_user.user_id).order_by(Chat.created_at.desc()))
    chats = result.scalars().all()

    return [{"id": chat.id, "title": chat.title} for chat in chats]

@router.post('/create')
async def create_chat(
    current_user: TokenData = Depends(get_current_user), 
    chat_request: ChatRequest = Body(...), 
    db: AsyncSession = Depends(get_db_async),
):
    if not task_manager.can_user_submit_task(current_user.user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Video generation already in progess. Cannot send a message."
        )

    result = await db.execute(select(Credits).where(Credits.user_id == current_user.user_id))
    db_credits = result.scalar_one_or_none()

    assert db_credits is not None

    if not await db_credits.get_current_credits(db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient credits")

    prompt = chat_request.prompt

    messages = [
        SystemMessage(get_chat_title_prompt()),
        HumanMessage(prompt)
    ]

    response = await scripting_model.ainvoke(messages)

    content = response.content
    
    if isinstance(content, list):
        content = content[0]

    chat_title = content.strip()
    if not chat_title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chat title cannot be empty")

    db_chat = Chat(title=chat_title, user_id=current_user.user_id) 
    db.add(db_chat)
    await db.commit()
    await db.refresh(db_chat)

    return {
        'title': db_chat.title,
        'id': db_chat.id 
    }
    

@router.put('/update/title/{chat_id}')
async def update_chat_title(
    chat_id: str, 
    db: AsyncSession = Depends(get_db_async),
    title: str = Body(..., embed=True)
):
    result = await db.execute(select(Chat).where(Chat.id == chat_id))
    chat = result.scalar_one_or_none()
    
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    
    chat.title = title
    await db.commit()
    await db.refresh(chat)

    return {
        "id": chat.id,
        "title": chat.title
    }


@router.websocket('/ws')
async def chat_ws(
    ws: WebSocket,
    chat_id: str = Query(...),
    current_user: TokenData = Depends(get_current_user_ws),
    db: AsyncSession = Depends(get_db_async)
):
    if not task_manager.can_user_submit_task(user_id=current_user.user_id):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="User already has an active task")
    
    result = await db.execute(select(Credits).where(Credits.user_id == current_user.user_id))
    db_credits = result.scalar_one_or_none()

    assert db_credits is not None

    if not await db_credits.get_current_credits(db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient credits")

    result = await db.execute(
        select(Chat)
        .options(selectinload(Chat.messages))
        .where(Chat.id == chat_id, Chat.user_id == current_user.user_id)
    )
    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    prev_messages = chat.messages

    await ws.accept()
    output = ""

    try:
        history = []
        for message in prev_messages:
            history.append(HumanMessage(message.prompt))
            history.append(AIMessage(message.response if message.response else ""))

        data = await ws.receive_text()

        # Add message to database
        db_message = Message(chat_id=chat.id, prompt=data)
        db.add(db_message)
        await db.commit()
        await db.refresh(db_message)


        # Generation
        messages = [SystemMessage(get_system_prompt())] + history[-6:] + [HumanMessage(data)]

        async for chunk in model.astream(messages):
            await ws.send_text(chunk.content)
            print(chunk.content)
            output += chunk.content

        # Update response
        db_message.response = output
        await db.commit()
        await db.refresh(db_message)
        
        logger.info(output)
        await ws.send_text("<done/>")
    
        manim_code = parser.parse_and_return_code(output)

        # Submit task for video generation
        await task_manager.submit_task(
            user_id=current_user.user_id, 
            chat_id=chat_id, 
            message_id=db_message.id,
            manim_code=manim_code
        )

        await ws.send_text("<queued/>")

    except Exception as e:
        print(f"WebSocket error: {e}")
        raise e
    finally:
        await ws.close()
    

@router.get('/running')
async def get_running_chat(
    current_user: TokenData = Depends(get_current_user), 
):
    task_id = await task_manager.get_user_active_task_id(user_id=current_user.user_id)
    task_data = await task_manager.get_task_status(task_id)

    print(task_data)

    return task_data

@router.get('/message/video/{message_id}')
async def get_video_url(
    message_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_async),
):
    result = await db.execute(select(Message).where(Message.id == message_id, Message.chat.has(Chat.user_id == current_user.user_id)))
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    if not message.video_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")

    result = await db.execute(select(Video).where(Video.id == message.video_id)) 
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")
    
    s3_bucket = video.s3_bucket
    s3_key = video.s3_key 

    video_url = await task_manager.get_video_url_aws(video.id, s3_bucket, s3_key, expiry=3600)

    return {"video_url": video_url}


@router.get('/credits')
async def get_credits_info(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_async),
):
    result = await db.execute(select(Credits).where(Credits.user_id == current_user.user_id))
    credits = result.scalar_one_or_none()
    
    assert credits is not None
    
    return {
        "credits": await credits.get_current_credits(db),
        "refreshed_at": credits.refreshed_at
    }