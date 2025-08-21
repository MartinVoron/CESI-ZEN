import os
from dotenv import load_dotenv

load_dotenv('config.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'cesizen-secret-key-dev-2024')
JWT_EXPIRATION_DELTA = int(os.getenv('JWT_EXPIRATION_DELTA', '86400')) 