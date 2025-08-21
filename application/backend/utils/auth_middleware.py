from functools import wraps
from flask import request, jsonify
import jwt
from config.config import SECRET_KEY
from config.database import get_db
from bson import ObjectId

def require_auth(f):
    """Décorateur qui vérifie que l'utilisateur est authentifié"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get('access_token')
        if not token:
            return jsonify({'error': 'Non authentifié'}), 401
        
        try:
            # Décoder le token JWT
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            
            # Récupérer l'utilisateur depuis la base de données
            db = get_db()
            user = db.utilisateurs.find_one({'_id': ObjectId(payload['user_id'])})
            
            if not user or not user.get('est_actif', False):
                return jsonify({'error': 'Utilisateur non trouvé ou inactif'}), 401
            
            # Ajouter l'utilisateur à la requête
            request.current_user = user
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
        except Exception as e:
            return jsonify({'error': 'Erreur d\'authentification'}), 401
    
    return decorated_function

def require_admin(f):
    """Décorateur qui vérifie que l'utilisateur est un admin"""
    @wraps(f)
    @require_auth
    def decorated_function(*args, **kwargs):
        user = request.current_user
        
        if user.get('role') != 'admin':
            return jsonify({'error': 'Accès refusé. Droits administrateur requis.'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user():
    """Fonction utilitaire pour récupérer l'utilisateur actuel"""
    return getattr(request, 'current_user', None) 