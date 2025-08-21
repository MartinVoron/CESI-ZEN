from flask import request, jsonify
from datetime import datetime
import jwt
from config.database import get_db
from config.config import SECRET_KEY
from routes.historiques import historiques_bp
from bson import ObjectId

@historiques_bp.route('', methods=['POST'])
def create_historique():
    print("Received POST /historiques request")
    try:
        # Récupérer le token depuis les cookies
        token = request.cookies.get('access_token')
        print(f"Token from cookies: {token}")
        
        if not token:
            # Si pas de token dans les cookies, vérifier les en-têtes
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            else:
                print("No token found")
                return jsonify({'error': 'Non authentifié'}), 401
        
        # Vérifier et décoder le token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            print(f"User ID from token: {user_id}")
        except jwt.ExpiredSignatureError:
            print("Token expired")
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {str(e)}")
            return jsonify({'error': 'Token invalide'}), 401
        
        # Récupérer les données du formulaire
        data = request.get_json()
        print(f"Received data for historique creation: {data}")
        
        # Vérifier les données reçues
        if not data:
            print("No data received")
            return jsonify({'error': 'Aucune donnée reçue'}), 400
        
        # Vérifier les champs obligatoires
        if 'id_exercice' not in data:
            print("Missing required field: id_exercice")
            return jsonify({'error': 'L\'ID de l\'exercice est obligatoire'}), 400
        
        # Vérifier que l'exercice existe
        db = get_db()
        try:
            exercice_id_obj = ObjectId(data['id_exercice'])
            exercice = db.exercices.find_one({'_id': exercice_id_obj})
            if not exercice:
                return jsonify({'error': 'Exercice non trouvé'}), 404
        except Exception as e:
            print(f"Invalid exercice ID: {data['id_exercice']}")
            return jsonify({'error': 'ID d\'exercice invalide'}), 400
        
        # Vérifier que l'utilisateur existe
        try:
            user_id_obj = ObjectId(user_id)
            user = db.utilisateurs.find_one({'_id': user_id_obj})
            if not user:
                return jsonify({'error': 'Utilisateur non trouvé'}), 404
        except Exception as e:
            print(f"Invalid user ID: {user_id}")
            return jsonify({'error': 'ID utilisateur invalide'}), 400
        
        # Préparer les données de l'historique
        historique_data = {
            'date_execution': data.get('date_execution', datetime.utcnow()),
            'id_utilisateur': user_id_obj,
            'id_exercice': exercice_id_obj
        }
        
        # Si une date personnalisée est fournie, la parser
        if 'date_execution' in data and data['date_execution']:
            try:
                if isinstance(data['date_execution'], str):
                    historique_data['date_execution'] = datetime.fromisoformat(data['date_execution'].replace('Z', '+00:00'))
            except ValueError:
                print("Invalid date format")
                return jsonify({'error': 'Format de date invalide'}), 400
        
        # Insérer l'historique dans la base de données
        try:
            result = db.historiques_exercices.insert_one(historique_data)
            historique_id = result.inserted_id
            print(f"Historique created successfully with ID: {historique_id}")
            
            # Retourner les informations de l'historique créé
            created_historique = {
                'id': str(historique_id),
                'date_execution': historique_data['date_execution'].isoformat(),
                'id_utilisateur': str(historique_data['id_utilisateur']),
                'id_exercice': str(historique_data['id_exercice']),
                'exercice': {
                    'nom': exercice.get('nom', ''),
                    'duree_inspiration': exercice.get('duree_inspiration', 0),
                    'duree_apnee': exercice.get('duree_apnee', 0),
                    'duree_expiration': exercice.get('duree_expiration', 0)
                }
            }
            
            return jsonify({
                'message': 'Historique créé avec succès',
                'historique': created_historique
            }), 201
            
        except Exception as e:
            print(f"Error creating historique: {str(e)}")
            return jsonify({'error': f'Erreur lors de la création de l\'historique: {str(e)}'}), 500
    
    except Exception as e:
        print(f"Error in create_historique: {str(e)}")
        return jsonify({'error': str(e)}), 500 