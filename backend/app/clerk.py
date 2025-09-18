import asyncio
from fastapi import HTTPException, Depends, status, Request, WebSocket

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import config
from app.schemas import TokenData, DummyRequest

from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions, RequestState

from app.database.core import get_db_async
from app.database.models import User, Credits


def verify(req: Request | WebSocket) -> RequestState:
    sdk = Clerk(
        bearer_auth=config['CLERK_SECRET_KEY'],
    )
    request_state = sdk.authenticate_request(
        req,
        AuthenticateRequestOptions(
            authorized_parties=[config['FRONTEND_URL'] or 'http://localhost:3000'],
        )
    )

    return request_state

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db_async)):
    token_data = await verify_user_and_return_user_data(request, db)
    print("authenticated")
    return token_data
    
async def get_current_user_ws(ws: WebSocket, db: AsyncSession = Depends(get_db_async)):
    token_data = await verify_user_and_return_user_data(ws, db)
    return token_data

async def get_current_user_ws_dummy(dummy_request: DummyRequest, db: AsyncSession = Depends(get_db_async)):
    token_data = await verify_user_and_return_user_data(dummy_request, db)
    return token_data

async def verify_user_and_return_user_data(req: Request | WebSocket | DummyRequest, db: AsyncSession):
    loop = asyncio.get_running_loop()

    if not loop or not loop.is_running():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
         
    request_state = await loop.run_in_executor(None, verify, req)

    if not request_state.is_signed_in:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or missing token"
        )

    user_id = request_state.payload.get('sub')

    result = await db.execute(select(User).where(User.id == user_id))

    user = result.scalar_one_or_none()
    email = user.email if user else None

    if not user:
        async with Clerk(bearer_auth=config['CLERK_SECRET_KEY']) as clerk:
            clerk_user = await clerk.users.get_async(user_id=request_state.payload.get('sub'))
            email = clerk_user.email_addresses[0].email_address if clerk_user.email_addresses else None

            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User email not found"
                )
                
        user = User(id=user_id, email=email)
        credits = Credits(user_id=user_id, amount=500)

        db.add(user)
        db.add(credits)

        await db.commit()
        await db.refresh(user)

    return TokenData(user_id=user_id, email=email)
