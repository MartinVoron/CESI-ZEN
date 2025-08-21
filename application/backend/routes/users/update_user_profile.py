from flask import request, jsonify
from bson import ObjectId
from config.database import get_db
from routes.users import users_bp
from utils.auth_middleware import require_auth, get_current_user

@users_bp.route('/profile', methods=['PUT'])
@require_auth
def update_user_profile():
    print("Received PUT /users/profile request")
    try:
        # Récupérer l'utilisateur qui modifie son profil
        current_user = get_current_user()
        print(f"User updating profile: {current_user['email']}")
        
        # Récupérer les données de mise à jour
        data = request.get_json()
        print(f"Received data for profile update: {data}")
        
        if not data:
            print("No data received")
            return jsonify({'error': 'Aucune donnée reçue'}), 400
        
        # Préparer les champs à mettre à jour
        update_fields = {}
        
        # Nom (optionnel)
        if 'nom' in data and data['nom']:
            update_fields['nom'] = data['nom'].strip()
        
        # Prénom (optionnel)
        if 'prenom' in data and data['prenom']:
            update_fields['prenom'] = data['prenom'].strip()
        
        # Email (optionnel mais vérifier l'unicité)
        if 'email' in data and data['email']:
            new_email = data['email'].strip().lower()
            if new_email != current_user['email'].lower():
                # Vérifier si l'email n'est pas déjà utilisé
                db = get_db()
                existing_user = db.utilisateurs.find_one({
                    'email': new_email,
                    '_id': {'$ne': ObjectId(current_user['_id'])}
                })
                if existing_user:
                    return jsonify({'error': 'Un utilisateur avec cet email existe déjà'}), 400
                update_fields['email'] = new_email
        
        # Vérifier qu'au moins un champ est à mettre à jour
        if not update_fields:
            return jsonify({'error': 'Aucun champ valide à mettre à jour'}), 400
        
        # Mettre à jour l'utilisateur
        db = get_db()
        try:
            user_id_obj = ObjectId(current_user['_id'])
            result = db.utilisateurs.update_one(
                {'_id': user_id_obj},
                {'$set': update_fields}
            )
            
            if result.modified_count == 0:
                return jsonify({'error': 'Aucune modification effectuée'}), 400
            
            print(f"User profile updated successfully: {current_user['_id']}")
            
            # Récupérer l'utilisateur mis à jour
            updated_user = db.utilisateurs.find_one({'_id': user_id_obj})
            
            # Retourner les informations de l'utilisateur mis à jour (sans le mot de passe)
            user_data = {
                'id': str(updated_user['_id']),
                'nom': updated_user.get('nom', ''),
                'prenom': updated_user.get('prenom', ''),
                'email': updated_user.get('email', ''),
                'role': updated_user.get('role', 'utilisateur'),
                'est_actif': updated_user.get('est_actif', True),
                'date_creation': updated_user.get('date_creation'),
                'dateInscription': updated_user.get('date_creation')  # Pour compatibilité avec le frontend
            }
            
            return jsonify({
                'message': 'Profil mis à jour avec succès',
                'user': user_data
            }), 200
            
        except Exception as e:
            print(f"Error updating user profile: {str(e)}")
            return jsonify({'error': f'Erreur lors de la mise à jour du profil: {str(e)}'}), 500
    
    except Exception as e:
        print(f"Error in update_user_profile: {str(e)}")
        return jsonify({'error': str(e)}), 500 