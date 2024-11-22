import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core import TgAuthTokenCore
from src.home.router import router as router_home
from src.auth.router import router as auth_router
from src.user.router import router as user_router
from src.application.router import router as application_router
from src.tg_bot.tg_bot import start_polling

# noinspection PyAsyncCall
@asynccontextmanager
async def lifespan(app: FastAPI):
    # await TgAuthTokenCore.delete()
    asyncio.create_task(start_polling())
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    'https://0461-84-39-247-238.ngrok-free.app',
    'https://e4b7-185-39-207-33.ngrok-free.app'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_home)
app.include_router(auth_router, prefix='/auth')
app.include_router(user_router, prefix='/user')
app.include_router(application_router, prefix='/application')
