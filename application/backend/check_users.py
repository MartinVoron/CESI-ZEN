#!/usr/bin/env python3
"""Script pour vérifier les utilisateurs dans la base de données"""

from config.database import get_db

def check_users():
    print("🔍 Vérification des utilisateurs...")
    
    db = get_db()
    if db is None:
        print("❌ Erreur de connexion à la base de données")
        return
    
    users = list(db.utilisateurs.find({}))
    print(f"\n👥 Nombre d'utilisateurs: {len(users)}")
    
    for user in users:
        print(f"- {user['prenom']} {user['nom']} ({user['email']}) - Rôle: {user['role']}")

if __name__ == "__main__":
    check_users() 