import os
from dotenv import dotenv_values

config = {
    **dotenv_values(".env"),
    **os.environ # For docker deployment
}

def check_config() -> None:
    required_env_vars = [
        'FRONTEND_URL',
        'GOOGLE_API_KEY',
        'ASYNC_DB_URI',
        'CLERK_SECRET_KEY',
        'DB_URI',
        'REDIS_URL',
    ]
    
    for var in required_env_vars:
        if var not in config:
            raise ValueError(f"{var} is required")