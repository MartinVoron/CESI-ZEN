import os
from dotenv import load_dotenv

"""Chargement des variables d'environnement pour la config applicative.
Priorité:
1) Variables d'environnement du runner (CI)
2) .env.test si FLASK_ENV=testing
3) .env.dev (développement)
4) config.env (fallback)
"""

env = os.getenv('FLASK_ENV', 'development').lower()
if env == 'testing':
    load_dotenv('.env.test')
else:
    load_dotenv('.env.dev')
load_dotenv('config.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'cesizen-secret-key-dev-2024')
JWT_EXPIRATION_DELTA = int(os.getenv('JWT_EXPIRATION_DELTA', '86400'))