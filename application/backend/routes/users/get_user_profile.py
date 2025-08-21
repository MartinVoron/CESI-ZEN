from flask import request, jsonify, make_response
from datetime import datetime, timedelta
import jwt
from config.database import get_db
from config.config import SECRET_KEY
from routes.users import users_bp
from bson import ObjectId

@users_bp.route('/profile', methods=['GET'])
def get_user_profile():
    print("Received /users/profile request")
    try:
        # Récupérer le token depuis les cookies
        token = request.cookies.get('access_token')
        print(f"Token from cookies: {token}")
        
        if not token:
            # Si pas de token dans les cookies, vérifier les en-têtes
            auth_cookie = request.cookies.get('Authorization')
            print(f"Auth cookie: {auth_cookie}")
            if auth_cookie and auth_cookie.startswith('Bearer '):
                token = auth_cookie.split(' ')[1]
                print(f"Token from cookie: {token}")
            else:
                print("No token found")
                return jsonify({'error': 'Non authentifié'}), 401
        
        # Vérifier et décoder le token
        try:
            print(f"Decoding token: {token}")
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            print(f"User ID from token: {user_id}")
        except jwt.ExpiredSignatureError:
            print("Token expired")
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {str(e)}")
            return jsonify({'error': 'Token invalide'}), 401
        
        # Récupérer les informations de l'utilisateur depuis la base de données
        db = get_db()
        try:
            user_id_obj = ObjectId(user_id)
            print(f"Looking for user with ID: {user_id_obj}")
            user = db.utilisateurs.find_one({'_id': user_id_obj})
            print(f"User found: {user}")
        except Exception as e:
            print(f"Error finding user: {str(e)}")
            return jsonify({'error': f'Erreur lors de la recherche de l\'utilisateur: {str(e)}'}), 500
        
        if not user:
            print("User not found")
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        # Retourner les informations de l'utilisateur (sans le mot de passe)
        user_data = {
            'id': str(user['_id']),
            'nom': user.get('nom', ''),
            'prenom': user.get('prenom', ''),
            'email': user.get('email', ''),
            'role': user.get('role', ''),
            'est_actif': user.get('est_actif', True)
        }
        
        print(f"Returning user data: {user_data}")
        return jsonify(user_data), 200
    
    except Exception as e:
        print(f"Error in get_user_profile: {str(e)}")
        return jsonify({'error': str(e)}), 500 