import os
from dotenv import dotenv_values

config = {
    **dotenv_values(".env"),
    **os.environ # For docker deployment
}

def check_config() -> None:
    required_env_vars = [
        'FRONTEND_URL',
        'LLM',
        'GOOGLE_API_KEY',
        'ASYNC_DB_URI',
        'CLERK_SECRET_KEY',
        'DB_URI',
        'REDIS_URL',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_S3_BUCKET',
        'AWS_BUCKET_REGION',
        'DOCKER_CONTAINER',
        'ENVIRONMENT'
    ]

    if config.get('LLM') and config['LLM'] == 'CLAUDE':
        required_env_vars.append('CLAUDE_API_KEY')
    
    for var in required_env_vars:
        if var not in config:
            raise ValueError(f"{var} is required")
        
if config['DOCKER_CONTAINER'] == 'TRUE' and config['ENVIRONMENT'] == 'DEVELOPMENT':
    config['REDIS_URL'] = config['REDIS_URL'].replace('localhost', 'host.docker.internal')
        