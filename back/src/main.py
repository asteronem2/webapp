import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse


from src.routers.home import router as router_home
from src.routers.auth import router as auth_router
from src.routers.user import router as user_router
from src.routers.applications import router as application_router
from src.tg_bot.tg_bot import start_polling
from src.utils import Auth as AuthMethods, CheckingTopUps


# noinspection PyAsyncCall
@asynccontextmanager
async def lifespan(app: FastAPI):
    # await TgAuthTokenCore.delete()
    asyncio.create_task(start_polling())
    CheckingTopUps()
    yield

app = FastAPI(lifespan=lifespan, root_path_in_servers=False)

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
    allow_methods=["GET", 'POST', 'OPTIONS'],
    allow_headers=['*'],
)

@app.middleware('http')
async def check_auth(request: Request, call_next):
    try:
        print(await request.json())
    except:
        pass
    if request.method == 'OPTIONS':
        return await call_next(request)
    if request['path'] in ('/auth/check_token/', '/auth/check_token'):
        if (await request.json()).get('token'):
            return await call_next(request)
    token = request.cookies.get('user_access_token')
    if not token:
        return JSONResponse({'detail': 'unauthorized'} ,status_code=401)
    result = await AuthMethods.decode_jwt_token(token)
    if type(result) == str:
        return JSONResponse({'detail': 'unauthorized'} ,status_code=401)

    request.state.user_id = result

    return await call_next(request)

app.include_router(router_home)
app.include_router(auth_router, prefix='/auth')
app.include_router(user_router, prefix='/user')
app.include_router(application_router, prefix='/application')
