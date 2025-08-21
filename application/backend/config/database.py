from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

"""Gestion du chargement des variables d'environnement pour MongoDB.
Priorité:
1) Variables d'environnement du runner (CI)
2) Fichier .env.test si FLASK_ENV=testing
3) Fichier .env.dev (développement)
4) Fichier config.env (fallback)
"""

env = os.getenv('FLASK_ENV', 'development').lower()
if env == 'testing':
    load_dotenv('.env.test')
else:
    load_dotenv('.env.dev')
load_dotenv('config.env')  # Fallback commun

# Configuration de la connexion MongoDB depuis les variables d'environnement
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'cesizen_db')

def _mask_mongo_uri(uri: str) -> str:
    """Masque les identifiants dans une URI MongoDB pour éviter les fuites de secrets."""
    try:
        # Exemple: mongodb://user:pass@host:port/db?opts
        if '://' in uri and '@' in uri:
            scheme, rest = uri.split('://', 1)
            creds_and_host = rest.split('@', 1)
            # Remplacer les credentials par ***
            masked_rest = f"***:***@{creds_and_host[1]}"
            return f"{scheme}://{masked_rest}"
        return uri
    except Exception:
        return uri

masked_uri = _mask_mongo_uri(MONGO_URI)
print(f"Connecting to MongoDB with URI: {masked_uri}")
print(f"Using database name: {DB_NAME}")

def get_db():
    try:
        print("Creating new MongoDB connection...")
        client = MongoClient(MONGO_URI)
        # Test de la connexion
        print("Testing connection with ping...")
        client.admin.command('ping')
        print("Connection successful!")
        
        # Vérification de la base de données
        dbs = client.list_database_names()
        print(f"Available databases: {dbs}")
        
        if DB_NAME not in dbs:
            print(f"Database {DB_NAME} does not exist, it will be created on first use")
        else:
            print(f"Database {DB_NAME} exists")
        
        db = client[DB_NAME]
        print(f"Using database: {db.name}")
        return db
    except Exception as e:
        print(f"Erreur de connexion à MongoDB: {e}")
        return None

class Database:
    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            self._client = get_db()
            self._db = self._client

    def get_db(self):
        return self._db

    def get_collection(self, collection_name):
        return self._db[collection_name]

    def close_connection(self):
        if self._client:
            self._client.close()

# Instance globale
db_instance = Database() 