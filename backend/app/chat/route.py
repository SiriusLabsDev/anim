from fastapi import APIRouter, Body, HTTPException, status, Depends, WebSocket, Query
from fastapi.responses import FileResponse
from langchain_core.messages import HumanMessage, SystemMessage
from pathlib import Path
from pydantic import BaseModel
import subprocess
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.chat.llm import model, parser, scripting_model
from app.chat.llm.prompts import get_system_prompt, get_chat_title_prompt

from app.database.core import get_db_async
from app.database.models import User, Chat, ChatHistory
from app.clerk import get_current_user
from app.schemas import TokenData

router = APIRouter(prefix='/chat', tags=['Chat'])


def get_video_file(directory):
    video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v'}
    
    directory_path = Path(directory)
    
    for file_path in directory_path.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in video_extensions:
            return file_path
    
    return None

class ChatRequest(BaseModel):
    prompt: str

@router.get('/test')
def test_route(current_user: TokenData = Depends(get_current_user)):
    return {
        "message": "Test route is working", 
        "user_id": current_user.user_id, 
        "email": current_user.email
    }


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
    

@router.websocket('/ws')
async def chat_ws(
    ws: WebSocket,
    chat_id: str = Query(...),
):
    await ws.accept()
    try:
        data = await ws.receive_text()
        messages = [
            SystemMessage(get_system_prompt()),
            HumanMessage(data)
        ]
        async for chunk in model.astream(messages):
            await ws.send_text(chunk.content)

    except Exception as e:
        print(f"WebSocket error: {e}")
        raise e
    finally:
        await ws.close()
    

@router.post('/chat')
async def chat(chat_request: ChatRequest = Body(...)):
    prompt = chat_request.prompt
    print(prompt)
    messages = [
        SystemMessage(get_system_prompt()),
        HumanMessage(prompt)
    ]
    response = await model.ainvoke(messages)
    print(response)

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
