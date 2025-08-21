from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis config.env
load_dotenv('config.env')

# Configuration de la connexion MongoDB depuis les variables d'environnement
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'cesizen_db')

print(f"Connecting to MongoDB with URI: {MONGO_URI}")
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