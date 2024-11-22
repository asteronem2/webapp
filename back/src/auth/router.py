import re
from datetime import UTC, datetime
from typing import Literal, Union

import fastapi
from fastapi import APIRouter, Response, Request
from pydantic import BaseModel

from src.auth.auth import create_jwt_token, decode_jwt_token
from src.core import TgAuthTokenCore, UserCore
from src.models import User

router = APIRouter(prefix='', tags=['Auth'])

class LoginOptions(BaseModel):
    password: bool
    email: bool
    two_fa: bool

class CheckToken(BaseModel):
    valid_token: bool
    info: Literal['not_exists', 'too_long', 'too_short', 'invalid_characters', None] = None
    login_options: LoginOptions | None = None
    token_lifetime_expired: bool | None = None


def check_errors(token: str) -> Union[str, None]:
    rres = re.search('[^0-9a-zA-Z:]', token)
    if len(token) > 40:
        return 'too_long'
    elif len(token) < 20:
        return 'too_short'
    elif rres:
        return 'invalid_characters'
    else:
        return None

@router.get('/check_auth/')
async def check_auth(request: Request):
    token = request.cookies.get('user_access_token')
    if not token:
        return {'valid_auth': False, 'info': 'no cookies'}

    result = await decode_jwt_token(token)
    if type(result) == str:
        return {'valid_auth': False, 'info': result}

    return {'valid_auth': True, 'id': result}

@router.get('/check_token/')
async def check_token(response: Response, token: str):
    db_token = await TgAuthTokenCore.find_one(token=token)
    print(f'{db_token=}')
    answer = None
    db_user = User
    if not db_token:
        answer = CheckToken(valid_token=False, info=check_errors(token) or 'not_exists')
    else:
        login_options = None
        if db_token.end_at < datetime.now(UTC):
            valid_token = False
            token_lifetime_expired = True
        else:
            valid_token = True
            token_lifetime_expired = False
            db_user = await UserCore.find_one(id=db_token.user_pk)
            login_options = LoginOptions(
                password = True if db_user.password else False,
                email = True if db_user.email else False,
                two_fa = db_user.two_fa,
            )
        answer = CheckToken(
            valid_token=valid_token,
            token_lifetime_expired=token_lifetime_expired,
            login_options=login_options,
        )

    print(f'{answer=}')
    if answer.valid_token:
        access_token = create_jwt_token({'sub': str(db_user.id)})
        print(f'{access_token=}')
        response.set_cookie(key='user_access_token', value=access_token, httponly=True, samesite='none', secure=True)
        print('success')

    return answer