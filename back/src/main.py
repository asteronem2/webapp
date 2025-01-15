import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel

from src.routers.auth import router as auth_router
from src.routers.user import router as user_router
from src.routers.applications import router as application_router
from src.routers.admin import router as admin_router
from src.tg_bot.tg_bot import start_polling
from src.utils import Auth as AuthMethods


# noinspection PyAsyncCall
@asynccontextmanager
async def lifespan(app: FastAPI):
    # await TgAuthTokenCore.delete()
    asyncio.create_task(start_polling())
    yield

app = FastAPI(lifespan=lifespan, root_path_in_servers=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["GET", 'POST', 'OPTIONS', 'DELETE', 'PATCH'],
    allow_headers=['*'],
)

@app.middleware('http')
async def allow_credentials(request: Request, call_next):
    response = await call_next(request)
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.middleware('http')
async def check_auth(request: Request, call_next):
    if request.method == 'OPTIONS':
        return await call_next(request)
    if request['path'] == '/auth/check_token/':
        if (await request.json()).get('token'):
            return await call_next(request)
    elif request['path'] == '/auth/check_auth/':
        return await call_next(request)
    elif request['path'] == '/admin/auth/':
        if (await request.json()).get('token'):
            print(1)
            return await call_next(request)

    if request['path'][:6] == '/admin':
        token = request.cookies.get('admin_access_token')
    else:
        token = request.cookies.get('user_access_token')
    if not token:
        return JSONResponse({'detail': 'unauthorized'}, status_code=401)
    result = await AuthMethods.decode_jwt_token(token)
    if type(result) == str:
        if result != 'admin':
            return JSONResponse({'detail': 'unauthorized'}, status_code=401)

    request.state.user_id = result

    return await call_next(request)


class Item(BaseModel):
    hello: str = 'hello'

@app.get('/', tags=['Базовый адрес'])
async def main_page() -> Item:
    return Item()


app.include_router(auth_router, prefix='/auth')
app.include_router(user_router, prefix='/user')
app.include_router(application_router, prefix='/application')
app.include_router(admin_router, prefix='/admin')
