from pydantic import BaseModel

class TokenData(BaseModel):
    user_id: str
    email: str

class DummyRequest(BaseModel):
    headers: dict