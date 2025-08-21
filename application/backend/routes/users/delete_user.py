from flask import jsonify
from bson import ObjectId
from config.database import get_db
from routes.users import users_bp
from utils.auth_middleware import require_admin, get_current_user

@users_bp.route('/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    print(f"Received DELETE /users/{user_id} request")
    try:
        # Récupérer l'admin qui supprime l'utilisateur
        admin_user = get_current_user()
        print(f"Admin deleting user: {admin_user['email']}")
        
        # Vérifier que l'ID de l'utilisateur est valide
        try:
            user_id_obj = ObjectId(user_id)
        except Exception as e:
            print(f"Invalid user ID: {user_id}")
            return jsonify({'error': 'ID d\'utilisateur invalide'}), 400
        
        # Vérifier que l'utilisateur existe
        db = get_db()
        user = db.utilisateurs.find_one({'_id': user_id_obj})
        if not user:
            print(f"User {user_id} not found")
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        # Empêcher la suppression de son propre compte
        if str(user_id_obj) == str(admin_user['_id']):
            return jsonify({'error': 'Vous ne pouvez pas supprimer votre propre compte'}), 400
        
        # Empêcher la suppression d'autres admins (sauf si super-admin)
        if user.get('role') == 'admin' and admin_user.get('role') != 'super-admin':
            return jsonify({'error': 'Seul un super-administrateur peut supprimer un autre administrateur'}), 403
        
        # Vérifier s'il y a des historiques associés à cet utilisateur
        historiques_count = db.historiques.count_documents({'id_utilisateur': user_id_obj})
        if historiques_count > 0:
            print(f"User has {historiques_count} history records")
            # On peut soit empêcher la suppression, soit supprimer en cascade
            # Pour cette démo, on va empêcher la suppression
            return jsonify({
                'error': f'Impossible de supprimer cet utilisateur car il a {historiques_count} enregistrement(s) d\'historique associé(s)',
                'historiques_count': historiques_count
            }), 400
        
        # Supprimer l'utilisateur
        try:
            result = db.utilisateurs.delete_one({'_id': user_id_obj})
            
            if result.deleted_count == 0:
                return jsonify({'error': 'Erreur lors de la suppression de l\'utilisateur'}), 500
            
            print(f"User deleted successfully: {user_id}")
            
            return jsonify({
                'message': 'Utilisateur supprimé avec succès',
                'email': user.get('email'),
                'nom': f"{user.get('prenom', '')} {user.get('nom', '')}"
            }), 200
            
        except Exception as e:
            print(f"Error deleting user: {str(e)}")
            return jsonify({'error': f'Erreur lors de la suppression de l\'utilisateur: {str(e)}'}), 500
    
    except Exception as e:
        print(f"Error in delete_user: {str(e)}")
        return jsonify({'error': str(e)}), 500 