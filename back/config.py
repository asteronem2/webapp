import os

from dotenv import load_dotenv

load_dotenv()

DB_URL = os.environ.get('DB_URL')

BOT_TOKEN = os.environ.get('BOT_TOKEN')
SECRET = os.environ.get('SECRET')

TOKEN_LIFETIME = 12#minutes

frontend_url = 'https://google.com/'

CRYPTOADDRESS = 'TEDepUJidzXfCkHtDmWhAPQiTibhiRE2C5'

ADMIN_TOKEN = '197685:DF3KijgREdqjzRFuylb0MTIh'