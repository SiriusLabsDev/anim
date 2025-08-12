from fastapi import APIRouter, Body, HTTPException, status
from fastapi.responses import FileResponse
from langchain_core.messages import HumanMessage, SystemMessage
from pathlib import Path
from pydantic import BaseModel
import subprocess
import uuid

from app.chat.llm import model, parser
from app.chat.llm.prompts import get_system_prompt

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
