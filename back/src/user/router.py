from fastapi import APIRouter
from pydantic import BaseModel

from src.core import UserCore

router = APIRouter(prefix='', tags=['Инфо о пользователе'])

class ResponseUser(BaseModel):
    id: int
    first_name: str | None
    two_fa: bool
    tg_user_id: int
    tg_username: str | None
    email: str | None

@router.get('/get_user/')
async def main_page(id: int):
    user = await UserCore.find_one(id=id)
    resp = ResponseUser(**user.__dict__)
    return resp