from typing import Union, Literal

from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, UTC, timezone

import config
from src.core import UserCore
from src.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_jwt_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(days=30)
    to_encode.update({"exp": expire})
    encode_jwt = jwt.encode(to_encode, config.SECRET, 'HS256')
    return encode_jwt

async def decode_jwt_token(token: str) -> Union[int, Literal['incorrect_token', 'lifetime_expired', 'user_not_found']]:
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

    user_db = await UserCore.find_one(id=int(user_id))
    if not user_db:
        return 'user_not_found'

    return user_db.id
