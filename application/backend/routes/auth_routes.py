from flask import Blueprint, request, jsonify
from models.user import User
from utils.auth import generate_tokens, refresh_token_required, token_required

auth_routes = Blueprint('auth', __name__)

@auth_routes.route('/register', methods=['POST'])
def register():
    """Inscription d'un nouvel utilisateur"""
    try:
        data = request.get_json()
        
        # Validation des données requises
        required_fields = ['nom', 'prenom', 'email', 'password', 'username']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'Le champ {field} est requis'}), 400
        
        # Validation de l'email
        if '@' not in data['email']:
            return jsonify({'message': 'Format d\'email invalide'}), 400
        
        # Validation du mot de passe
        if len(data['password']) < 6:
            return jsonify({'message': 'Le mot de passe doit contenir au moins 6 caractères'}), 400
        
        # Créer l'utilisateur
        user = User.create_user(data)
        
        # Générer les tokens
        access_token, refresh_token = generate_tokens(user._id)
        
        # Préparer la réponse
        user_data = user.to_dict()
        user_data.pop('password', None)  # Ne pas renvoyer le mot de passe
        
        return jsonify({
            'message': 'Utilisateur créé avec succès',
            'user': user_data,
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la création du compte'}), 500

@auth_routes.route('/login', methods=['POST'])
def login():
    """Connexion d'un utilisateur"""
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'message': 'Email et mot de passe requis'}), 400
        
        # Trouver l'utilisateur
        user = User.find_by_email(data['email'])
        if not user:
            return jsonify({'message': 'Email ou mot de passe incorrect'}), 401
        
        # Vérifier le mot de passe
        if not user.check_password(data['password']):
            return jsonify({'message': 'Email ou mot de passe incorrect'}), 401
        
        # Vérifier si le compte est actif
        if not user.is_active:
            return jsonify({'message': 'Compte désactivé'}), 401
        
        # Mettre à jour la dernière connexion
        from datetime import datetime
        user.derniere_connexion = datetime.utcnow()
        user.update_profile({'derniere_connexion': user.derniere_connexion})
        
        # Générer les tokens
        access_token, refresh_token = generate_tokens(user._id)
        
        # Préparer la réponse
        user_data = user.to_dict()
        user_data.pop('password', None)
        
        return jsonify({
            'message': 'Connexion réussie',
            'user': user_data,
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la connexion'}), 500

@auth_routes.route('/refresh', methods=['POST'])
@refresh_token_required
def refresh_token(user):
    """Rafraîchissement du token d'accès"""
    try:
        # Générer un nouveau token d'accès
        access_token, _ = generate_tokens(user._id)
        
        return jsonify({
            'message': 'Token rafraîchi avec succès',
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors du rafraîchissement du token'}), 500

@auth_routes.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    """Déconnexion de l'utilisateur"""
    try:
        # Dans une implémentation complète, on pourrait ajouter le token à une blacklist
        # Pour l'instant, on retourne simplement un message de succès
        
        return jsonify({
            'message': 'Déconnexion réussie'
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la déconnexion'}), 500

@auth_routes.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Récupère les informations de l'utilisateur connecté"""
    try:
        user_data = current_user.to_dict()
        user_data.pop('password', None)
        
        return jsonify({
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la récupération du profil'}), 500 