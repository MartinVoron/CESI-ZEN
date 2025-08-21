#!/usr/bin/env python3
"""
Script d'initialisation de la base de données CesiZen
Peuple la base avec des données d'exemple
"""

from datetime import datetime
import bcrypt
from config.database import get_db
from bson import ObjectId

def init_database():
    """Initialise la base de données avec des données d'exemple"""
    print("🚀 Initialisation de la base de données CesiZen...")
    
    db = get_db()
    if db is None:
        print("❌ Erreur: Impossible de se connecter à la base de données")
        return False
    
    try:
        # Nettoyer les collections existantes
        print("🧹 Nettoyage des collections existantes...")
        db.utilisateurs.delete_many({})
        db.exercices.delete_many({})
        db.historiques_exercices.delete_many({})
        db.contenus.delete_many({})
        
        # 1. Créer les utilisateurs
        print("👥 Création des utilisateurs...")
        
        # Hasher le mot de passe pour Alice
        password_hash = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt())
        
        user_alice = {
            "_id": ObjectId("6653ff0a3a6e8a2d4c1b8e11"),
            "nom": "Dupont",
            "prenom": "Alice",
            "email": "alice.dupont@example.com",
            "mot_de_passe": password_hash.decode('utf-8'),
            "role": "utilisateur",
            "est_actif": True,
            "date_creation": datetime.utcnow()
        }
        
        # Ajouter un admin pour les tests
        admin_password_hash = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        user_admin = {
            "nom": "Admin",
            "prenom": "CesiZen",
            "email": "admin@cesizen.fr",
            "mot_de_passe": admin_password_hash.decode('utf-8'),
            "role": "admin",
            "est_actif": True,
            "date_creation": datetime.utcnow()
        }
        
        db.utilisateurs.insert_many([user_alice, user_admin])
        print("✅ Utilisateurs créés avec succès")
        
        # 2. Créer les exercices
        print("🧘 Création des exercices...")
        
        exercices = [
            {
                "_id": ObjectId("6653ff363a6e8a2d4c1b8e13"),
                "nom": "Exercice 7-4-8",
                "description": "Inspire 7s, Apnée 4s, Expire 8s. Pour la cohérence cardiaque.",
                "duree_inspiration": 7,
                "duree_apnee": 4,
                "duree_expiration": 8,
                "date_creation": datetime.utcnow()
            },
            {
                "nom": "Exercice 5-5",
                "description": "Inspire 5s, Expire 5s. Respiration équilibrée pour la concentration.",
                "duree_inspiration": 5,
                "duree_apnee": 0,
                "duree_expiration": 5,
                "date_creation": datetime.utcnow()
            },
            {
                "nom": "Exercice 4-6",
                "description": "Inspire 4s, Expire 6s. Respiration apaisante avec expiration prolongée.",
                "duree_inspiration": 4,
                "duree_apnee": 0,
                "duree_expiration": 6,
                "date_creation": datetime.utcnow()
            }
        ]
        
        result_exercices = db.exercices.insert_many(exercices)
        print("✅ Exercices créés avec succès")
        
        # 3. Créer les contenus
        print("📝 Création des contenus...")
        
        contenu = {
            "_id": ObjectId("6653ff223a6e8a2d4c1b8e12"),
            "titre": "Introduction à la respiration consciente",
            "texte": "La respiration consciente est une pratique simple pour gérer le stress...",
            "date_creation": datetime(2024, 11, 10, 10, 30, 0),
            "date_mise_a_jour": datetime(2024, 12, 1, 15, 45, 0)
        }
        
        db.contenus.insert_one(contenu)
        print("✅ Contenus créés avec succès")
        
        # 4. Créer un historique d'exemple
        print("📊 Création de l'historique d'exemple...")
        
        historique = {
            "_id": ObjectId("6653ff473a6e8a2d4c1b8e14"),
            "date_execution": datetime(2025, 5, 20, 8, 0, 0),
            "id_utilisateur": ObjectId("6653ff0a3a6e8a2d4c1b8e11"),
            "id_exercice": ObjectId("6653ff363a6e8a2d4c1b8e13")
        }
        
        db.historiques_exercices.insert_one(historique)
        print("✅ Historique créé avec succès")
        
        # Afficher un résumé
        print("\n📋 Résumé de l'initialisation:")
        print(f"   👥 Utilisateurs: {db.utilisateurs.count_documents({})}")
        print(f"   🧘 Exercices: {db.exercices.count_documents({})}")
        print(f"   📝 Contenus: {db.contenus.count_documents({})}")
        print(f"   📊 Historiques: {db.historiques_exercices.count_documents({})}")
        
        print("\n🎉 Base de données initialisée avec succès!")
        print("\n🔑 Comptes de test:")
        print("   👤 Utilisateur: alice.dupont@example.com / password123")
        print("   👑 Admin: admin@cesizen.fr / admin123")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {e}")
        return False

if __name__ == "__main__":
    init_database() 