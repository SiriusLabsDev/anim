# Anim

Anim is a web platform that lets users create explainer videos using a single prompt. This was made possible by a popular python library called [Manim](https://github.com/ManimCommunity/manim) which lets you generate animated videos from python code. 

This project uses a [FastAPI](https://fastapi.tiangolo.com/) backend along with the [Claude](https://platform.claude.com/) and [Redis](https://redis.io/) to efficiently generate and run Manim code.

The LLM response (which contains the Manim code) is streamed to the frontend via [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) and a video generation job is pushed to a Redis queue (list) after the Manim code generation is complete. The backend runs a task manager which pulls jobs from the Redis queue and executes them according to the CPU capactiy of the server.

The frontend after having the LLM response streamed, polls the backend for video generation status whose value the backend fetches from the Redis data store.

Redis is being used here a queue as well as a single source of truth for the video generation status which helps manage job processing across multiple servers.

The code for this section can be found in `backend/app/chat/task_processing.py` and `backend/app/chat/route.py`.

![Architecture](architecture.png)

## Running locally

### Prerequisites

Before running the project locally, ensure you have the following installed:

- **Python 3.13+** (for the backend)
- **Node.js 20+** (for the frontend)
- **PostgreSQL** (for the database)
- **Redis** (for task queue and caching)
- **Manim dependencies** (FFmpeg, LaTeX, Cairo, Pango, etc.)

For detailed instructions on installing Manim and its dependencies for your operating system, please refer to the [official Manim installation guide](https://docs.manim.community/en/stable/installation/uv.html).

#### Quick Setup for PostgreSQL and Redis

**macOS (using Homebrew):**
```bash
brew install postgresql@16 redis
brew services start postgresql@16
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get update && sudo apt-get install -y \
    postgresql \
    postgresql-contrib \
    redis-server

sudo systemctl start postgresql
sudo systemctl start redis-server
```

### Setup

#### 1. Clone the repository

```bash
git clone <repository-url>
cd anim
```

#### 2. Set up External Services

##### Clerk Authentication

1. Sign up for a free account at [Clerk](https://clerk.com/)
2. Create a new application
3. Get your API keys from the dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Frontend)
   - `CLERK_SECRET_KEY` (Backend & Frontend)

##### AWS S3 (for video storage)

1. Create an AWS account at [AWS Console](https://aws.amazon.com/)
2. Create an S3 bucket for video storage
3. Create an IAM user with S3 access and generate access keys
4. Note down:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET` (your bucket name)
   - `AWS_BUCKET_REGION` (e.g., `us-east-1`)

##### LLM API Keys

Get an API key from one of these providers:
- **Claude**: [Anthropic Console](https://console.anthropic.com/)
- **Google AI**: [Google AI Studio](https://makersuite.google.com/app/apikey)

#### 3. Set up PostgreSQL Database

Create a PostgreSQL database for the project:

```bash
psql postgres

CREATE DATABASE anim;
CREATE USER anim_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE anim TO anim_user;

\q
```

Or use a hosted PostgreSQL service (e.g., Aiven, AWS RDS, DigitalOcean, Supabase).

#### 4. Backend Setup

```bash
cd backend

pip install -r requirements.txt

cp .env.example .env

alembic upgrade head
```

**Required environment variables in `.env`:**

```bash
LLM=CLAUDE
CLAUDE_API_KEY=your_claude_api_key
GOOGLE_API_KEY=your_google_api_key

FRONTEND_URL=http://localhost:3000

DB_URI=postgresql://username:password@host:port/database
ASYNC_DB_URI=postgresql+asyncpg://username:password@host:port/database

CLERK_SECRET_KEY=your_clerk_secret_key

REDIS_URL=redis://localhost:6379/0

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_s3_bucket_name
AWS_BUCKET_REGION=your_aws_region

DOCKER_CONTAINER=FALSE
ENVIRONMENT=DEVELOPMENT
```

#### 5. Frontend Setup

```bash
cd ../frontend

npm install

cp .env.example .env
```

**Required environment variables in `.env`:**

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BASE_SOCKET_URL=ws://localhost:8000/api
```

### Running the Application

You'll need to run **two separate processes** in different terminal windows:

#### Terminal 1: Backend API Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

The task manager for processing video generation jobs starts automatically with the backend server.

#### Terminal 2: Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Troubleshooting

**Issue: Manim fails to render videos**
- Ensure FFmpeg is installed: `ffmpeg -version`
- Ensure LaTeX is installed: `latex --version`
- Check that Cairo and Pango are installed properly

**Issue: Redis connection errors**
- Verify Redis is running: `redis-cli ping`
- Check the `REDIS_URL` in your `.env` file

**Issue: Database connection errors**
- Ensure PostgreSQL is running and accessible
- Verify the `DB_URI` and `ASYNC_DB_URI` in your `.env` file
- Run database migrations: `alembic upgrade head`

**Issue: WebSocket connection fails**
- Ensure the backend is running on port 8000
- Check CORS settings in `backend/app/main.py`
- Verify `NEXT_PUBLIC_BASE_SOCKET_URL` in `.env`
