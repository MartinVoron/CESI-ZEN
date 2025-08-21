from flask import Blueprint, request, jsonify
from utils.auth import token_required

user_routes = Blueprint('users', __name__)

@user_routes.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Récupère le profil de l'utilisateur connecté"""
    try:
        user_data = current_user.to_dict()
        user_data.pop('password', None)
        
        return jsonify({
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la récupération du profil'}), 500

@user_routes.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Met à jour le profil de l'utilisateur"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'Aucune donnée fournie'}), 400
        
        # Champs autorisés à être mis à jour
        allowed_fields = ['nom', 'prenom', 'username', 'date_naissance', 'niveau_experience']
        update_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
        
        if not update_data:
            return jsonify({'message': 'Aucun champ valide à mettre à jour'}), 400
        
        # Mettre à jour le profil
        current_user.update_profile(update_data)
        
        # Récupérer les données mises à jour
        updated_user_data = current_user.to_dict()
        updated_user_data.pop('password', None)
        
        return jsonify({
            'message': 'Profil mis à jour avec succès',
            'user': updated_user_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la mise à jour du profil'}), 500

@user_routes.route('/preferences', methods=['PUT'])
@token_required
def update_preferences(current_user):
    """Met à jour les préférences de l'utilisateur"""
    try:
        data = request.get_json()
        
        if not data or 'preferences' not in data:
            return jsonify({'message': 'Préférences manquantes'}), 400
        
        preferences = data['preferences']
        
        # Valider les préférences
        valid_preferences = {}
        
        if 'duree_preferee' in preferences:
            duree = preferences['duree_preferee']
            if isinstance(duree, int) and 5 <= duree <= 120:
                valid_preferences['duree_preferee'] = duree
        
        if 'type_meditation_prefere' in preferences:
            type_med = preferences['type_meditation_prefere']
            valid_types = ['mindfulness', 'respiration', 'body_scan', 'visualisation', 'mantra']
            if type_med in valid_types:
                valid_preferences['type_meditation_prefere'] = type_med
        
        if 'notifications' in preferences:
            if isinstance(preferences['notifications'], bool):
                valid_preferences['notifications'] = preferences['notifications']
        
        if 'rappels_quotidiens' in preferences:
            if isinstance(preferences['rappels_quotidiens'], bool):
                valid_preferences['rappels_quotidiens'] = preferences['rappels_quotidiens']
        
        if 'heure_rappel' in preferences:
            heure = preferences['heure_rappel']
            # Validation basique du format HH:MM
            if isinstance(heure, str) and len(heure) == 5 and heure[2] == ':':
                try:
                    h, m = map(int, heure.split(':'))
                    if 0 <= h <= 23 and 0 <= m <= 59:
                        valid_preferences['heure_rappel'] = heure
                except ValueError:
                    pass
        
        if not valid_preferences:
            return jsonify({'message': 'Aucune préférence valide fournie'}), 400
        
        # Fusionner avec les préférences existantes
        current_preferences = current_user.preferences.copy()
        current_preferences.update(valid_preferences)
        
        # Mettre à jour
        current_user.update_profile({'preferences': current_preferences})
        
        return jsonify({
            'message': 'Préférences mises à jour avec succès',
            'preferences': current_preferences
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la mise à jour des préférences'}), 500



 