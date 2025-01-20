from datetime import datetime, timedelta, UTC
from random import randint, choice
from re import compile

from fastapi import APIRouter, Body, Response, HTTPException
from pydantic import BaseModel, Field

import config
from src import utils
from src.core import UserCore, CurrencyCore, WithdrawCore
from src.models import User, Currency

router = APIRouter(prefix='', tags=['Админ панель'])

@router.post('/auth/')
async def auth(response: Response, token: str = Body(..., embed=True)):
    if token == config.ADMIN_TOKEN:
        admin_access_token = utils.Auth.create_jwt_token({'sub': 'admin'})
        response.set_cookie(key='admin_access_token', value=admin_access_token, httponly=True, samesite='lax', secure=False)
        return {'access': True}
    else:
        return {'access': False}

@router.get('/check_auth/')
async def check_auth():
    return {'auth': True}

@router.get('/withdraws/')
async def withdraws():
    withdraw_list = []

    count = 0
    for i in range(15):
        count += 1
        amount = randint(1, 10000) / randint(1, 9)
        withdraw_list.append({
            'id': count,
            'datetime': datetime.now(UTC) - timedelta(hours=randint(0, 50), minutes=randint(0, 200), seconds=randint(0, 800)),
            'amount': amount,
            'amount_in_usd': amount + 1.0003,
            'currency': choice(['rubles', 'tenge']),
            'user': 'astercael',
            'phone': f'+7 ({randint(100, 999)}) {randint(100, 999)}-{randint(10, 99)}-{randint(10, 99)}',
            'card': f'{randint(1000, 9999)} {randint(1000, 9999)} {randint(1000, 9999)} {randint(1000, 9999)}',
            'receiver': 'Пусто',
            'bank': choice(['tbank', 'sber', 'alfa']),
            'tag': 'Пусто',
            'status': choice(['completed', 'waiting', 'reject']),
            'comment': 'Пусто'
        })

    return withdraw_list

@router.patch('/withdraw/update_tag/')
async def update_tag(id: int = Body(..., embed=True), tag: str = Body(..., embed=True)):
    found_withdraw = True if (await WithdrawCore.find_one(id=id)) else False
    if not found_withdraw:
        print(f'NOT FOUND {id=}, {tag=}')
        return HTTPException(403)


@router.get('/topups/')
async def topups():
    topup_list = []

    count = 0
    for i in range(15):
        count += 1
        amount = randint(1, 10000) / randint(1, 9)
        topup_list.append({
            'id': count,
            'datetime': datetime.now(UTC) - timedelta(hours=randint(0, 50), minutes=randint(0, 200), seconds=randint(0, 800)),
            'amount': amount,
            'amount_in_usd': amount + 1.0003,
            'user': 'astercael',
            'tag': 'Пусто',
            'status': choice(['completed', 'waiting', 'reject']),
        })

    return topup_list


@router.get('/users/')
async def users():
    user_list = []
    user_rows = await UserCore.find_all()

    for user in user_rows:
        user: User
        user_list.append({
            'datetime': user.registered_at,
            'name': user.first_name,
            'username': user.tg_username,
            'balance': user.tether_balance
        })

    return user_list

@router.get('/currencies/')
async def currencies():
    currency_list = []
    currency_rows = await CurrencyCore.find_all()

    for currency in currency_rows:
        currency_list.append({
            'name': currency.name,
            'code': currency.code,
            'symbol': currency.symbol,
            'rate': currency.rate,
            'percent': currency.percent,
            'min_amount': currency.min_amount,
            'commission_step': currency.commission_step
        })

    return currency_list

class CurrencyModel(BaseModel):
    name: str
    code: str
    symbol: str
    percent: str = Field(pattern=compile(r'[+\d.-]+'))
    min_amount: str = Field(pattern=compile(r'[+\d.-]+'))
    commission_step: str = Field(pattern=compile(r'[+\d.-]+'))

@router.post('/create_currency/')
async def create_currency(currency: CurrencyModel):
    await CurrencyCore.add(
        name=currency.name,
        code=currency.code,
        symbol=currency.symbol,
        percent=float(currency.percent),
        min_amount=float(currency.min_amount),
        commission_step=float(currency.commission_step)
    )
    return {'success': True}