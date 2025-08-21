from flask import request, jsonify, make_response
from datetime import datetime, timedelta
import jwt
import bcrypt
from config.database import get_db
from config.config import SECRET_KEY, JWT_EXPIRATION_DELTA
from routes.auth import auth_bp

@auth_bp.route('/login', methods=['POST'])
def login():
    print("Received POST /auth/login request")
    try:
        # Récupérer les données du formulaire
        data = request.get_json()
        print(f"Received login data: {data}")
        
        # Vérifier les données reçues
        if not data:
            return jsonify({'error': 'Aucune donnée reçue'}), 400
        
        # Vérifier les champs obligatoires
        if 'email' not in data or 'mot_de_passe' not in data:
            return jsonify({'error': 'Email et mot de passe requis'}), 400
        
        # Récupérer l'utilisateur depuis la base de données
        db = get_db()
        user = db.utilisateurs.find_one({'email': data['email']})
        
        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        # Vérifier le mot de passe
        if not bcrypt.checkpw(data['mot_de_passe'].encode('utf-8'), user['mot_de_passe'].encode('utf-8')):
            return jsonify({'error': 'Mot de passe incorrect'}), 401
        
        # Vérifier que l'utilisateur est actif
        if not user.get('est_actif', True):
            return jsonify({'error': 'Compte désactivé'}), 401
        
        # Créer le token JWT
        payload = {
            'user_id': str(user['_id']),
            'email': user['email'],
            'exp': datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION_DELTA)
        }
        
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        
        # Créer la réponse avec le token dans les cookies
        response = make_response(jsonify({
            'message': 'Connexion réussie',
            'user': {
                'id': str(user['_id']),
                'nom': user.get('nom', ''),
                'prenom': user.get('prenom', ''),
                'email': user.get('email', ''),
                'role': user.get('role', '')
            }
        }))
        
        # Définir le cookie avec le token
        response.set_cookie(
            'access_token',
            token,
            max_age=JWT_EXPIRATION_DELTA,
            httponly=True,
            secure=False,  # Mettre à True en production avec HTTPS
            samesite='Lax'
        )
        
        return response, 200
        
    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({'error': str(e)}), 500 