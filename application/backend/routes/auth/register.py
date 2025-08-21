from flask import request, jsonify, make_response
from datetime import datetime, timedelta
import jwt
import bcrypt
from bson import ObjectId
from config.database import get_db
from config.config import SECRET_KEY, JWT_EXPIRATION_DELTA
from routes.auth import auth_bp

@auth_bp.route('/register', methods=['POST'])
def register():
    print("Received registration request")
    try:
        db = get_db()
        if db is None:
            print("Database connection failed")
            return jsonify({'error': 'Connexion à la base de données échouée'}), 500

        data = request.get_json()
        print(f"Received data: {data}")

        # Vérification des données requises
        required_fields = ['nom', 'prenom', 'email', 'mot_de_passe']
        if not all(k in data for k in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            print(f"Missing required fields: {missing_fields}")
            return jsonify({'error': 'Tous les champs sont requis', 'missing_fields': missing_fields}), 400

        # Vérification si l'email existe déjà
        if db.utilisateurs.find_one({'email': data['email']}):
            print("Email already exists")
            return jsonify({'error': 'Email déjà utilisé'}), 400

        # Hashage du mot de passe
        try:
            password_bytes = data['mot_de_passe'].encode('utf-8')
            hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
            print("Mot de passe haché avec succès")
        except Exception as e:
            print(f"Erreur lors du hashage du mot de passe: {str(e)}")
            return jsonify({'error': 'Erreur lors de la création du compte'}), 500

        # Création de l'utilisateur
        user = {
            '_id': ObjectId(),
            'nom': data['nom'],
            'prenom': data['prenom'],
            'email': data['email'],
            'mot_de_passe': hashed_password.decode('utf-8'),  # Stockage en string
            'role': data.get('role', 'utilisateur'),  # Rôle par défaut
            'est_actif': True,
            'date_creation': datetime.utcnow()
        }

        # Insertion dans la base de données
        result = db.utilisateurs.insert_one(user)
        print(f"User created with id: {result.inserted_id}")

        # Génération du token JWT
        payload = {
            'user_id': str(user['_id']),
            'email': user['email'],
            'exp': datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION_DELTA)
        }
        
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        # Préparation de la réponse
        response_data = {
            'message': 'Utilisateur créé avec succès',
            'user': {
                'id': str(user['_id']),
                'nom': user['nom'],
                'prenom': user['prenom'],
                'email': user['email'],
                'role': user['role']
            }
        }

        # Création de la réponse avec cookies
        response = make_response(jsonify(response_data), 201)
        
        # Définition du cookie sécurisé
        response.set_cookie(
            'access_token', 
            token, 
            httponly=True, 
            secure=False,  # Mettre à True en production avec HTTPS
            samesite='Lax',
            max_age=JWT_EXPIRATION_DELTA
        )

        return response

    except Exception as e:
        print(f"Error in register: {str(e)}")
        return jsonify({'error': str(e)}), 500 