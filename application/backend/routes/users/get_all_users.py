from flask import jsonify
from config.database import get_db
from routes.users import users_bp
from utils.auth_middleware import require_admin

@users_bp.route('', methods=['GET'])
@require_admin
def get_all_users():
    print("Received GET /users request")
    try:
        db = get_db()
        
        # Récupérer tous les utilisateurs
        users_cursor = db.utilisateurs.find({})
        users_list = []
        
        for user in users_cursor:
            user_data = {
                'id': str(user['_id']),
                'nom': user.get('nom', ''),
                'prenom': user.get('prenom', ''),
                'email': user.get('email', ''),
                'role': user.get('role', 'utilisateur'),
                'est_actif': user.get('est_actif', True),
                'date_creation': user.get('date_creation')
            }
            users_list.append(user_data)
        
        print(f"Found {len(users_list)} users")
        return jsonify(users_list), 200
        
    except Exception as e:
        print(f"Error in get_all_users: {str(e)}")
        return jsonify({'error': str(e)}), 500 