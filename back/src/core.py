from typing import Literal, Union, List, Optional

from sqlalchemy import select, delete, asc, desc
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import update

from database import async_session_maker, Base
from src.models import User, TgAuthToken, Payout, TopUp, ActiveApplication


class BaseCore:
    model = None

    @classmethod
    async def find_all(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> List[model]:
        order_type: Union[asc, desc] = asc if order_type == 'asc' else desc

        async with async_session_maker() as session:
            query = select(cls.model).filter_by(**filter_by).order_by(order_type(order_by))
            res = await session.execute(query)
            return res.scalars().all()

    @classmethod
    async def find_one(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> Optional[model]:
        order_type: Union[asc, desc] = asc if order_type == 'asc' else desc

        async with async_session_maker() as session:
            query = select(cls.model).filter_by(**filter_by).limit(1).order_by(order_type(order_by))
            res = await session.execute(query)
            return res.scalars().one_or_none()

    @classmethod
    async def add(cls, **values) -> None:
        async with async_session_maker() as session:
            async with session.begin():
                new = cls.model(**values)
                session.add(new)
                try:
                    await session.commit()
                except SQLAlchemyError as err:
                    await session.rollback()
                    raise err

    @classmethod
    async def update(cls, filter_by, **values) -> int:
        async with async_session_maker() as session:
            async with session.begin():
                query = (
                    update(cls.model)
                    .where(*[getattr(cls.model, k) == v for k, v in filter_by.items()])
                    .values(**values)
                    .execution_options(synchronize_session="fetch")
                )
                result = await session.execute(query)
                try:
                    await session.commit()
                except SQLAlchemyError as e:
                    await session.rollback()
                    raise e
                return result.rowcount

    @classmethod
    async def delete(cls, **filter_by) -> int:
        async with async_session_maker() as session:
            async with session.begin():
                query = delete(cls.model).where(**filter_by)
                result = await session.execute(query)
                await session.commit()
                return result.rowcount


class UserCore(BaseCore):
    model = User

    @classmethod
    async def find_all(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> List[model]:
        core = BaseCore
        core.model = cls.model
        # noinspection PyTypeChecker
        return await core.find_all(order_by, order_type, **filter_by)

    @classmethod
    async def find_one(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> Optional[model]:
        core = BaseCore
        core.model = cls.model
        return await core.find_one(order_by, order_type, **filter_by)


class TgAuthTokenCore(BaseCore):
    model = TgAuthToken

    @classmethod
    async def find_all(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> List[model]:
        core = BaseCore
        core.model = cls.model
        # noinspection PyTypeChecker
        return await core.find_all(order_by, order_type, **filter_by)

    @classmethod
    async def find_one(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> Optional[model]:
        core = BaseCore
        core.model = cls.model
        return await core.find_one(order_by, order_type, **filter_by)


class PayoutCore(BaseCore):
    model = Payout

    @classmethod
    async def find_all(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> List[model]:
        core = BaseCore
        core.model = cls.model
        # noinspection PyTypeChecker
        return await core.find_all(order_by, order_type, **filter_by)

    @classmethod
    async def find_one(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> Optional[model]:
        core = BaseCore
        core.model = cls.model
        return await core.find_one(order_by, order_type, **filter_by)


class TopUpCore(BaseCore):
    model = TopUp

    @classmethod
    async def find_all(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> List[model]:
        core = BaseCore
        core.model = cls.model
        # noinspection PyTypeChecker
        return await core.find_all(order_by, order_type, **filter_by)

    @classmethod
    async def find_one(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> Optional[model]:
        core = BaseCore
        core.model = cls.model
        return await core.find_one(order_by, order_type, **filter_by)


class ActiveApplicationCore(BaseCore):
    model = ActiveApplication

    @classmethod
    async def find_all(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> List[model]:
        core = BaseCore
        core.model = cls.model
        # noinspection PyTypeChecker
        return await core.find_all(order_by, order_type, **filter_by)

    @classmethod
    async def find_one(cls, order_by: str = 'id', order_type: Literal['asc', 'desc'] = 'asc', **filter_by) -> Optional[model]:
        core = BaseCore
        core.model = cls.model
        return await core.find_one(order_by, order_type, **filter_by)
