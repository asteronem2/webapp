import asyncio
import json
import time
from typing import Union, Literal

from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, UTC, timezone
import httpx

import config
from src.core import UserCore, ActiveApplicationCore, TopUpCore


class Auth:
    @staticmethod
    def get_password_hash(password: str) -> str:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_jwt_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(UTC) + timedelta(days=30)
        to_encode.update({"exp": expire})
        encode_jwt = jwt.encode(to_encode, config.SECRET, 'HS256')
        return encode_jwt

    @staticmethod
    async def decode_jwt_token(token: str) -> Union[
        int, str, Literal['incorrect_token', 'lifetime_expired', 'user_not_found']
    ]:
        try:
            payload = jwt.decode(token, config.SECRET, 'HS256')
        except JWTError:
            return 'incorrect_token'

        expire = payload.get('exp')
        if expire:
            expire_time = datetime.fromtimestamp(int(expire), tz=timezone.utc)
            if expire_time < datetime.now(UTC):
                return 'lifetime_expired'
        else:
            return 'lifetime_expired'

        user_id = payload.get('sub')
        if not user_id:
            return 'user_not_found'
        elif user_id == 'admin':
            return 'admin'

        user_db = await UserCore.find_one(id=int(user_id))
        if not user_db:
            return 'user_not_found'

        return user_db.id

class CheckingTopUps:
    def __init__(self):
        asyncio.create_task(self._checking())

    async def _checking(self):
        applications = await ActiveApplicationCore.find_all(type='topup')
        while True:
            time.sleep(120)
            for i in applications:
                await self.check_top_up(i.id)

    @staticmethod
    async def check_top_up(application_id: str, time_interval: int = 60):
        condition = True
        application_row = await ActiveApplicationCore.find_one(id=application_id)
        if not application_row:
            condition = False
        if application_row.expired_at < datetime.now(UTC):
            await ActiveApplicationCore.delete(id=application_id)
            condition = False

        while condition:
            await asyncio.sleep(time_interval)

            application_row = await ActiveApplicationCore.find_one(id=application_id)
            async with httpx.AsyncClient() as client:
                response = await client.get(url='https://apilist.tronscanapi.com/api/filter/trc20/transfers',
                                            params={
                                                'limit': '20',
                                                'sort': '-timestamp',
                                                'count': 'true',
                                                'filterTokenValue': '0',
                                                'relatedAddress': 'addressssssss'
                                            })

                try:
                    token_transfers = response.json().get('token_transfers')
                except json.decoder.JSONDecodeError:
                    continue

                if token_transfers:
                    for i in token_transfers:
                        if i['toAddress'] != config.CRYPTOADDRESS:
                            continue

                        if i['tokenInfo']['TokenAbbr'] != 'USDT':
                            continue

                        application_created_at = application_row.datetime
                        transfer_datetime = datetime.fromtimestamp(float(i['block_ts']) / 1000, UTC)
                        if transfer_datetime < application_created_at:
                            continue

                        if (not i['confirmed'] is True) or (i['contractRet'] != 'SUCCESS') or (i['finalResult'] != 'SUCCESS'):
                            continue

                        transfer_amount = float(i['quant']) / 1000000
                        if transfer_amount != application_row.amount:
                            continue

                        await ActiveApplicationCore.delete(id=application_id)

                        user_row = await UserCore.find_one(id=application_row.user_pk)
                        pre_value = user_row.tether_balance
                        await UserCore.update(
                            {'id': user_row.id},
                            tether_balance=user_row.tether_balance + transfer_amount
                        )
                        await TopUpCore.add(
                            user_pk=user_row.id,
                            transaction_hash=i['transaction_id'],
                            amount=transfer_amount,
                            amount_in_usd=get_rate('tether', transfer_amount),
                            pre_value=pre_value,
                            post_value=user_row.tether_balance + transfer_amount
                        )

async def get_rate(currency: Literal['rub', 'tether'], amount: float = 0) -> float:
    rate: float = 0
    if currency == 'rub':
        async with httpx.AsyncClient() as client:
            response = await client.get('https://www.cbr-xml-daily.ru/daily_json.js')
            rate = float(response.json()['Valute']['USD']['Value'])
    elif currency == 'tether':
        async with httpx.AsyncClient() as client:
            response = await client.get('https://api.coincap.io/v2/assets', params={'ids': 'tether'})
            rate = float(response.json()['data']['priceUsd'])
    else:
        raise Exception("Incorrect currency")

    if amount > 0:
        return rate * amount
    else:
        return rate
