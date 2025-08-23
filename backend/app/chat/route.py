from fastapi import APIRouter, Body, HTTPException, status, Depends, WebSocket, Query
from fastapi.responses import FileResponse
from langchain_core.messages import HumanMessage, SystemMessage
import logging
from pathlib import Path
from pydantic import BaseModel
import subprocess
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.chat.llm import model, parser, scripting_model
from app.chat.llm.prompts import get_system_prompt, get_chat_title_prompt
        
from app.config import config
from app.database.core import get_db_async
from app.database.models import User, Chat, Message
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


@router.post('/create')
async def create_chat(
    chat_request: ChatRequest = Body(...), db: AsyncSession = Depends(get_db_async),
):
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

    db_chat = Chat(title=chat_title, user_id="default_user_id") 
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
    if not await task_manager.can_user_submit_task(user_id=current_user.user_id):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="User already has an active task")

    result = await db.execute(select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.user_id))
    chat = result.scalar_one_or_none()

    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    await ws.accept()

    output = ""

    try:
        data = await ws.receive_text()

        # Add message to database
        db_message = Message(chat_id=chat.id, prompt=data)
        db.add(db_message)
        await db.commit()
        await db.refresh(db_message)

        # Generation
        messages = [
            SystemMessage(get_system_prompt()),
            HumanMessage(data)
        ]
        async for chunk in model.astream(messages):
            await ws.send_text(chunk.content)
            output += chunk.content

        # Update response
        db_message.response = output
        await db.commit()
        await db.refresh(db_message)
        
        logger.info(output)
        await ws.send_text("<done/>")
    
        manim_code = parser.parse_and_return_code(output)

        if not manim_code:
            await ws.send_text("<failed/>")
            raise Exception("Video generation failed")

        # Submit task for video generation
        await task_manager.submit_task(
            user_id=current_user.user_id, 
            chat_id=chat.id, 
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
    db: AsyncSession = Depends(get_db_async)
):
    task_id = await task_manager.get_user_active_task_id(user_id=current_user.user_id)
    task_data = await task_manager.get_task_status(task_id)

    return task_data


@router.post('/chat')
async def chat(chat_request: ChatRequest = Body(...)):
    prompt = chat_request.prompt
    print(prompt)
    messages = [
        SystemMessage(get_system_prompt()),
        HumanMessage(prompt)
    ]
    response = await model.ainvoke(messages)
    logger.info(response)

    random_id = str(uuid.uuid1())
    temp_wd = f"./output/{random_id}"

    content = response.content
    
    if isinstance(content, list):
        content = content[0]

    parser.parse_and_create_file(content, target_directory=temp_wd)

    subprocess.run(["python", "main.py"], cwd=temp_wd)

    video_dir = Path(f'{temp_wd}/media/videos/1080p60')
    video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v'}
    
    video_file = None
    for file_path in video_dir.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in video_extensions:
            video_file = file_path
            break
    
    if not video_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video file not found")
    
    return FileResponse(
        path=str(video_file),
        media_type='video/mp4',  # Adjust based on actual file type
        filename=video_file.name
    )
