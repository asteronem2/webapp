import secrets
import string
from datetime import datetime, timedelta, timezone
from email.policy import default
from typing import List, Annotated, Literal

from sqlalchemy import Integer, func, ForeignKey, DateTime, BigInteger
from sqlalchemy.orm import mapped_column, Mapped, relationship

import config
from database import Base

created_at = Annotated[datetime, mapped_column(DateTime(timezone=True), server_default=func.now())]

class User(Base):
    __tablename__ = 'user_table'

    id = mapped_column(Integer, primary_key=True)
    first_name: Mapped[str]
    password: Mapped[str|None]
    two_fa: Mapped[bool] = mapped_column(default=False)
    tg_user_id = mapped_column(BigInteger, unique=True)
    tg_username: Mapped[str|None] = mapped_column(unique=True)
    role: Mapped[str] = mapped_column(default='user')
    email: Mapped[str|None] = mapped_column(unique=True)
    registered_at: Mapped[created_at]
    photo_url: Mapped[str|None]
    tether_balance: Mapped[float] = mapped_column(default=0.0)

    tgauthtoken: Mapped[List['TgAuthToken']] = relationship()
    payout: Mapped[List['Payout']] = relationship()
    top_up: Mapped[List['TopUp']] = relationship()
    active_application: Mapped[List['ActiveApplication']] = relationship()

    def __str__(self):
        return f'User: {self.id=}, {self.tg_username=}, {self.role=}'

def token_end_at():
    return datetime.now() + timedelta(minutes=config.TOKEN_LIFETIME)

class TgAuthToken(Base):
    @staticmethod
    def generate_token():
        a, b = ''.join([secrets.choice(string.digits) for _ in range(6)]), ''.join([secrets.choice(string.digits + string.ascii_letters) for _ in range(24)])
        return f'{a}:{b}'

    id = mapped_column(Integer, primary_key=True)
    user_pk: Mapped[int] = mapped_column(ForeignKey('user_table.id'))
    created_at: Mapped[created_at]
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=token_end_at)
    token: Mapped[str] = mapped_column(default=generate_token, unique=True)

    def __str__(self):
        return f'TgAuthToken: {self.id=}, {self.created_at=}, {self.end_at=}, {self.token=}'

class Payout(Base):
    id = mapped_column(Integer, primary_key=True)
    user_pk: Mapped[int] = mapped_column(ForeignKey('user_table.id'))
    to_currency: Mapped[str]
    pre_balance: Mapped[float]
    post_balance: Mapped[float]
    datetime: Mapped[created_at]
    amount: Mapped[float]
    amount_in_usd: Mapped[float]

class TopUp(Base):
    id = mapped_column(Integer, primary_key=True)
    user_pk: Mapped[int] = mapped_column(ForeignKey('user_table.id'))
    datetime: Mapped[created_at]
    transaction_hash: Mapped[str]
    amount: Mapped[float]
    amount_in_usd: Mapped[float]
    pre_balance: Mapped[float]
    post_balance: Mapped[float]

class ActiveApplication(Base):
    id = mapped_column(Integer, primary_key=True)
    user_pk: Mapped[int] = mapped_column(ForeignKey('user_table.id'))
    datetime: Mapped[created_at]
    type: Mapped[Literal['topup', 'payout']]
    amount: Mapped[float]
    currency: Mapped[Literal['tether']] = mapped_column(default='tether')
    expired_at: Mapped[datetime|None] = mapped_column(DateTime(timezone=True))

