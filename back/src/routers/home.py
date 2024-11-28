from fastapi import APIRouter
from pydantic import BaseModel
router = APIRouter(prefix='', tags=['Главная страница'])

class Item(BaseModel):
    hello: str = 'hello'

@router.get('/')
async def main_page():
    return Item()