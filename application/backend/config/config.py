import os
from dotenv import load_dotenv

# Load environment variables (development first, then fallback)
load_dotenv('.env.dev')  # Development environment
load_dotenv('config.env')  # Fallback to existing config

SECRET_KEY = os.getenv('SECRET_KEY', 'cesizen-secret-key-dev-2024')
JWT_EXPIRATION_DELTA = int(os.getenv('JWT_EXPIRATION_DELTA', '86400')) 