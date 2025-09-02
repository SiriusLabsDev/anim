import asyncio
import aioboto3
from concurrent.futures import ProcessPoolExecutor
from dataclasses import dataclass, asdict
from enum import Enum
from fastapi import HTTPException, status
import logging
import os
from pathlib import Path
import psutil
import redis.asyncio as redis
import time
from typing import Optional, Tuple
import uuid

from app.config import config
from app.database.core import AsyncSessionLocal
from app.database.models import Message, Video

from sqlalchemy import select


logger = logging.getLogger(__name__)

class TaskStatus(Enum):
    QUEUED = 'queued'
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    FAILED = 'failed'

@dataclass
class TaskInfo:
    id: str
    user_id: str
    chat_id: str
    message_id: str
    status: TaskStatus
    created_at: float
    instance_id: str
    started_at: Optional[float] = None
    completed_at: Optional[float] = None
    result: Optional[str] = None
    error: Optional[str] = None

# Configure logging
logger = logging.getLogger(__name__)

class RedisTaskManager:
    
    def __init__(self, redis_url: str, max_workers: Optional[int] = None):

        cpu_count = psutil.cpu_count(logical=False)
        
        if max_workers is None:
            max_workers = max(1, int(cpu_count * 0.7))
        
        self.max_workers = max_workers
        self.redis = redis.from_url(redis_url, decode_responses=True)

        self.semaphore = asyncio.Semaphore(max_workers)
        self.executor = ProcessPoolExecutor(max_workers=max_workers)
        
        import socket
        self.instance_id = socket.gethostname()

        # Redis keys
        self.TASK_KEY = "manim:task:{task_id}"
        self.USER_ACTIVE_TASK = "manim:user:{user_id}:active"
        self.QUEUE_KEY = "manim:queue"
        self.STATS_KEY =  "manim:stats"
        self.VIDEO_KEY = "manim:video:{video_id}"

        logger.info(f"Initialized RedisTaskManager on {self.instance_id} with {max_workers} workers")
        
        # Start continuous queue processing
        self._queue_processor_task: asyncio.Task | None = None
        self._shutdown = False
    
    def get_system_stats(self):
        pass

    async def get_task_status(self, task_id: str):
        task_key = self.TASK_KEY.format(task_id=task_id)
        task_data = await self.redis.hgetall(task_key)

        if not task_data:
            return None
        
        response = {
            "task_id": task_id,
            "user_id": task_data["user_id"],
            "chat_id": task_data["chat_id"],
            "message_id": task_data["message_id"],
            "status": task_data["status"],
            "created_at": float(task_data["created_at"]),
            "instance_id": task_data["instance_id"],
        }

        if task_data.get("started_at"):
            response["started_at"] = float(task_data["started_at"])
            response["processing_instance"] = task_data.get("processing_instance")
            
            end_time = float(task_data.get("completed_at", time.time()))
            response["processing_time"] = end_time - response["started_at"]
        
        if task_data.get("completed_at"):
            response["completed_at"] = float(task_data["completed_at"])
        
        if task_data.get("result"):
            response["video_path"] = task_data["result"]
        
        if task_data.get("error"):
            response["error"] = task_data["error"]
        
        return response


    async def can_user_submit_task(self, user_id: str) -> bool:
        active_task_id = await self.redis.get(self.USER_ACTIVE_TASK.format(user_id=user_id))

        return active_task_id is None

    async def get_user_active_task_id(self, user_id: str) -> Optional[str]:
        """Get user's currently active task ID"""
        task_id = await self.redis.get(self.USER_ACTIVE_TASK.format(user_id=user_id))
        return task_id

    async def start_queue_processor(self) -> None:
        if not self._queue_processor_task or self._queue_processor_task.done():
            self._shutdown = False
            self._queue_processor_task = asyncio.create_task(self._continuous_queue_processor())

    async def stop_queue_processor(self) -> None:
        """Stop the continuous queue processor gracefully"""
        self._shutdown = True
        if self._queue_processor_task and not self._queue_processor_task.done():
            try:
                await asyncio.wait_for(self._queue_processor_task, timeout=10)
            except asyncio.TimeoutError:
                self._queue_processor_task.cancel()
        
        # Shutdown executor
        self.executor.shutdown(wait=True)

    async def submit_task(self, user_id: str, chat_id: str, message_id: str, manim_code: str) -> str:
        if not await self.can_user_submit_task(user_id):
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="User already has an active task")
        
        task_id = str(uuid.uuid4())
        task_info = TaskInfo(
            id=task_id,
            user_id=user_id,
            chat_id=chat_id,
            message_id=message_id,
            status=TaskStatus.QUEUED,
            instance_id=self.instance_id,
            created_at=time.time(),
        )

        task_key = self.TASK_KEY.format(task_id=task_id)
        task_dict = asdict(task_info)
    
        task_dict["status"] = task_dict["status"].value  # Convert enum to string
        task_dict["manim_code"] = manim_code

        del task_dict["started_at"]
        del task_dict["completed_at"]
        del task_dict["result"]
        del task_dict["error"]

        await self.redis.hset(task_key, mapping=task_dict)
        await self.redis.expire(task_key, 60 * 60 * 24)  # 24 hours expiration

        await self.redis.set(
            self.USER_ACTIVE_TASK.format(user_id=user_id),
            task_id,
            ex=60*60*24
        )

        await self.redis.lpush(self.QUEUE_KEY, task_id)
        
        if not self._queue_processor_task or self._queue_processor_task.done():
            self._queue_processor_task = asyncio.create_task(self._continuous_queue_processor())
        
        logger.info(f"Task {task_id} submitted by user {user_id}")
        return task_id

    async def _continuous_queue_processor(self) -> None:
        logger.info(f"Starting continuous queue processor on {self.instance_id}")

        while not self._shutdown:
            try:
                if self.semaphore.locked():
                    # All workers busy, wait a bit
                    await asyncio.sleep(1)
                    continue

                result = await self.redis.brpop(self.QUEUE_KEY, timeout=1)

                if result:
                    _, task_id = result
                    asyncio.create_task(self._process_single_task_with_semaphore(task_id))

            except Exception as e:
                logger.error(f"Error in continuous queue processor: {str(e)}")
                await asyncio.sleep(5)  # Wait before retrying
                

    async def _process_single_task_with_semaphore(self, task_id: str) -> None:
        async with self.semaphore:
            await self._process_single_task(task_id)
        
    async def _process_single_task(self, task_id: str) -> None:
        task_key = self.TASK_KEY.format(task_id=task_id)
        task_info = await self.redis.hgetall(task_key)

        if not task_info:
            logger.error(f"Task {task_id} not found in Redis")
            return

        logger.info(f"Processing task with info {task_info}")
        
        try:
            await self.redis.hset(task_key, mapping={
                "status": TaskStatus.PROCESSING.value,
                "started_at": time.time(),
                "processing_instance": self.instance_id
            })

            success, path_or_error = await self.run_manim_generation(
                task_id=task_id, 
                manim_code=task_info["manim_code"],
                output_dir=f"{os.getcwd()}/output/{task_id}"
            )
            
            if success:
                user_id = task_info["user_id"]
                chat_id = task_info["chat_id"]
                message_id = task_info["message_id"]

                s3_bucket = config['AWS_S3_BUCKET']
                s3_key = f"videos/{user_id}/{chat_id}/{message_id}.mp4"
                s3_region = config['AWS_BUCKET_REGION']

                success, output = await self.upload_video_to_s3(path_or_error, s3_bucket, s3_region, s3_key)

                if success:
                    logger.info(f"Video uploaded to S3 at {s3_key}")
                    await self.add_video_to_db(chat_id, message_id, s3_bucket, s3_key)
                else:
                    logger.error(f"Failed to upload video to S3: {output}")

                await self.redis.hset(task_key, mapping={
                    "status": TaskStatus.COMPLETED.value,
                    "completed_at": time.time(),
                    "result": path_or_error
                })

                # Delete video from local storage
                if os.path.exists(path_or_error):
                    os.remove(path_or_error)
            else:
                await self.redis.hset(task_key, mapping={
                    "status": TaskStatus.FAILED.value,
                    "completed_at": time.time(),
                    "error": path_or_error
                })

            logger.info(f"Task {task_id} finished")
        except Exception as e:
            logger.error(f"Error processing task {task_id}: {str(e)}")
            await self.redis.hset(task_key, mapping={
                "status": TaskStatus.FAILED.value,
                "completed_at": time.time(),
                "error": str(e)
            })
        finally:
            user_id = task_info["user_id"]
            await self.redis.delete(self.USER_ACTIVE_TASK.format(user_id=user_id))
    
    async def run_manim_generation(self, task_id: str, manim_code: str, output_dir: str) -> Tuple[bool, str]:
        """main.py file is created in output_dir. The video is generated in output_dir/media/videos/1080p60/."""
        try:
            os.makedirs(output_dir, exist_ok=True)

            with open(f"{output_dir}/main.py", "w") as file:
                file.write(manim_code)

            cmd = ["python", "main.py"]

            try:
                process = await asyncio.create_subprocess_exec(
                    *cmd, 
                    stdout=asyncio.subprocess.PIPE, 
                    stderr=asyncio.subprocess.PIPE,
                    cwd=output_dir 
                )

                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=60 * 20      # 20 minutes
                )

                if process.returncode == 0 and (path_ := self.get_video_file(f"{output_dir}/media/videos")):
                    return True, path_.as_posix()

                else:
                    return False, f"Manim execution failed: {stderr.decode()}"
            
            except asyncio.TimeoutError:
                if process.returncode is None:
                    process.kill()
                    await process.wait()

                return False, "Video generation timed out after 20 minutes"
        
        except Exception as e:
            return False, str(e)


    # ---------------------------------------------------------------------------------
    # Video methods
    # ---------------------------------------------------------------------------------

    async def upload_video_to_s3(self, file_path: str, s3_bucket: str, s3_region: str, s3_key: str) -> Tuple[bool, str]:
        session = aioboto3.Session(
            aws_access_key_id=config['AWS_ACCESS_KEY_ID'], 
            aws_secret_access_key=config['AWS_SECRET_ACCESS_KEY']
        )

        async with session.client('s3', region_name=s3_region) as s3_client:
            try:
                with open(file_path, 'rb') as data:
                    await s3_client.upload_fileobj(data, s3_bucket, s3_key)
                return True, ""
            except Exception as e:
                logger.error(f"Error uploading video to S3: {str(e)}")
                return False, str(e)

    def get_video_file(self, directory: str) -> Optional[Path]:
        video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v'}
        
        directory_path = Path(directory)

        result = list(directory_path.rglob("partial_movie_files"))
        
        if len(result) == 0:
            return None
        
        for file_path in result[0].parent.iterdir():
            if file_path.is_file() and file_path.suffix.lower() in video_extensions:
                return file_path
    
        return None
    
    async def add_video_to_db(self, chat_id: str, message_id: str, s3_bucket: str, s3_key: str):
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Message)
                .where(
                    Message.id == message_id, 
                    Message.chat_id == chat_id
                )
            )
            db_message = result.scalar_one_or_none()

            if not db_message:
                logger.error(f"Message {message_id} in chat {chat_id} not found in DB")
                return
            
            try:
                db_video = Video(
                    s3_bucket=s3_bucket,
                    s3_key=s3_key,
                )

                db.add(db_video)
                await db.commit()
                await db.refresh(db_video)

                db_message.video_id = db_video.id
                await db.commit()

            except Exception as e:
                await db.rollback()
                logger.error(f"Error updating message with video ID: {str(e)}")

    async def get_video_url_aws(self, video_id: str, s3_bucket: str, s3_key: str, expiry: int) -> Optional[str]:
        # Check cache
        video_url = await self.redis.get(self.VIDEO_KEY.format(video_id=video_id))

        if video_url: 
            return video_url

        session = aioboto3.Session(
            aws_access_key_id=config['AWS_ACCESS_KEY_ID'], 
            aws_secret_access_key=config['AWS_SECRET_ACCESS_KEY']
        )

        async with session.client("s3", region_name=config['AWS_BUCKET_REGION']) as s3_client:
            presigned_url = await s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": s3_bucket, "Key": s3_key},
                ExpiresIn=expiry if expiry >= 3600 else 3600
            )

            await self.redis.set(self.VIDEO_KEY.format(video_id=video_id), presigned_url, ex=expiry - 300)

            return presigned_url
