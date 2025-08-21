import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from models.user import User

def generate_tokens(user_id):
    """Génère les tokens d'accès et de rafraîchissement"""
    
    # Token d'accès (expire en 1 heure)
    access_payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iat': datetime.utcnow(),
        'type': 'access'
    }
    
    # Token de rafraîchissement (expire en 7 jours)
    refresh_payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow(),
        'type': 'refresh'
    }
    
    access_token = jwt.encode(access_payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    
    return access_token, refresh_token

def verify_token(token, token_type='access'):
    """Vérifie et décode un token JWT"""
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        
        if payload.get('type') != token_type:
            return None
            
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Décorateur pour protéger les routes nécessitant une authentification"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Récupérer le token depuis l'en-tête Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Format: "Bearer <token>"
            except IndexError:
                return jsonify({'message': 'Format de token invalide'}), 401
        
        if not token:
            return jsonify({'message': 'Token manquant'}), 401
        
        # Vérifier le token
        payload = verify_token(token, 'access')
        if payload is None:
            return jsonify({'message': 'Token invalide ou expiré'}), 401
        
        # Récupérer l'utilisateur
        current_user = User.find_by_id(payload['user_id'])
        if not current_user or not current_user.is_active:
            return jsonify({'message': 'Utilisateur non trouvé ou inactif'}), 401
        
        # Passer l'utilisateur à la fonction
        return f(current_user, *args, **kwargs)
    
    return decorated

def refresh_token_required(f):
    """Décorateur pour les routes de rafraîchissement de token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        data = request.get_json()
        
        if not data or 'refresh_token' not in data:
            return jsonify({'message': 'Token de rafraîchissement manquant'}), 400
        
        refresh_token = data['refresh_token']
        
        # Vérifier le token de rafraîchissement
        payload = verify_token(refresh_token, 'refresh')
        if payload is None:
            return jsonify({'message': 'Token de rafraîchissement invalide ou expiré'}), 401
        
        # Récupérer l'utilisateur
        user = User.find_by_id(payload['user_id'])
        if not user or not user.is_active:
            return jsonify({'message': 'Utilisateur non trouvé ou inactif'}), 401
        
        return f(user, *args, **kwargs)
    
    return decorated

def get_current_user_id():
    """Récupère l'ID de l'utilisateur actuel depuis le token"""
    token = None
    
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return None
    
    if not token:
        return None
    
    payload = verify_token(token, 'access')
    if payload:
        return payload['user_id']
    
    return None 