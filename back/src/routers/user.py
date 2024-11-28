from datetime import datetime, UTC

from fastapi import APIRouter, Request
from pydantic import BaseModel

from src.core import UserCore, PayoutCore, TopUpCore
from src.models import Payout

router = APIRouter(prefix='', tags=['Инфо о пользователе'])

class ResponseUser(BaseModel):
    id: int
    first_name: str | None
    two_fa: bool
    tg_user_id: int
    tg_username: str | None
    email: str | None
    tether_balance: float

@router.get('/get_user/')
async def get_user(request: Request):
    user_id = request.state.user_id
    user = await UserCore.find_one(id=user_id)
    resp = ResponseUser(**user.__dict__)
    return resp

@router.get('/stats/')
async def stats(request: Request):
    user_id = request.state.user_id
    stats_topup = await TopUpCore.find_all(user_pk=user_id)
    stats_payout = await PayoutCore.find_all(user_pk=user_id)

    all_stats = []

    count = 0

    for i in stats_payout + stats_topup:
        count += 1
        all_stats.append({
            'id': count,
            'datetime': i.datetime,
            'amount': i.amount,
            'amount_in_usd': i.amount_in_usd,
            'type': 'payout' if type(i) == Payout else 'topup',
            'currency': i.to_currency if type(i) == Payout else 'tether',
        })

    return all_stats