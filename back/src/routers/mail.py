import email
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import Request, HTTPException

from fastapi import APIRouter
from pydantic import BaseModel

from src.auth.auth import decode_jwt_token
from src.core import UserCore

router = APIRouter(prefix='', tags=['Почта'])

@router.get('/send_verification/')
async def main_page(request: Request, user_email: str):
    return 'В разработке'
    token = request.cookies.get('user_access_token')
    if not token:
        raise HTTPException(
            status_code=400,
            detail={'error': 'error'}
        )

    user_id = await decode_jwt_token(token)
    if type(user_id) == str:
        raise HTTPException(
            status_code=400,
            detail={'error': 'error'}
        )

    try:

        from_email = ''
        to_email = user_email
        subject = 'Подтверждение аккаунта'
        body = ''

        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_email, "your_password")
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()

    except:
        raise HTTPException(
            status_code=400,
            detail={'error': 'email'}
        )



