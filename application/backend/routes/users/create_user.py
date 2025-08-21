from flask import request, jsonify
from datetime import datetime
import bcrypt
from config.database import get_db
from routes.users import users_bp
from utils.auth_middleware import require_admin, get_current_user

@users_bp.route('', methods=['POST'])
@require_admin
def create_user():
    print("Received POST /users request")
    try:
        # Récupérer l'admin qui crée l'utilisateur
        admin_user = get_current_user()
        print(f"Admin creating user: {admin_user['email']}")
        
        # Récupérer les données du formulaire
        data = request.get_json()
        print(f"Received data for user creation: {data}")
        
        # Vérifier les données reçues
        if not data:
            print("No data received")
            return jsonify({'error': 'Aucune donnée reçue'}), 400
        
        # Vérifier les champs obligatoires
        required_fields = ['nom', 'prenom', 'email', 'mot_de_passe']
        for field in required_fields:
            if field not in data or not data[field]:
                print(f"Missing required field: {field}")
                return jsonify({'error': f'Le champ {field} est obligatoire'}), 400
        
        # Vérifier les permissions pour créer des comptes admin
        requested_role = data.get('role', 'utilisateur')
        if requested_role == 'admin':
            # Seul un admin peut créer d'autres admins
            if admin_user.get('role') != 'admin':
                print(f"Non-admin trying to create admin account")
                return jsonify({'error': 'Seul un administrateur peut créer des comptes administrateur'}), 403
        
        # Vérifier si l'utilisateur existe déjà
        db = get_db()
        existing_user = db.utilisateurs.find_one({'email': data['email']})
        if existing_user:
            print(f"User with email {data['email']} already exists")
            return jsonify({'error': 'Un utilisateur avec cet email existe déjà'}), 409
        
        # Hasher le mot de passe
        password_hash = bcrypt.hashpw(data['mot_de_passe'].encode('utf-8'), bcrypt.gensalt())
        
        # Préparer les données utilisateur
        user_data = {
            'nom': data['nom'],
            'prenom': data['prenom'],
            'email': data['email'],
            'mot_de_passe': password_hash.decode('utf-8'),
            'role': data.get('role', 'utilisateur'),  # Rôle par défaut
            'est_actif': True,
            'date_creation': datetime.utcnow()
        }
        
        # Insérer l'utilisateur dans la base de données
        try:
            result = db.utilisateurs.insert_one(user_data)
            user_id = result.inserted_id
            print(f"User created successfully with ID: {user_id}")
            
            # Retourner les informations de l'utilisateur créé (sans le mot de passe)
            created_user = {
                'id': str(user_id),
                'nom': user_data['nom'],
                'prenom': user_data['prenom'],
                'email': user_data['email'],
                'role': user_data['role'],
                'est_actif': user_data['est_actif']
            }
            
            return jsonify({
                'message': 'Utilisateur créé avec succès',
                'user': created_user
            }), 201
            
        except Exception as e:
            print(f"Error creating user: {str(e)}")
            return jsonify({'error': f'Erreur lors de la création de l\'utilisateur: {str(e)}'}), 500
    
    except Exception as e:
        print(f"Error in create_user: {str(e)}")
        return jsonify({'error': str(e)}), 500 