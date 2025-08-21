from flask import request, jsonify
from config.database import get_db
from routes.exercices import exercices_bp
from bson import ObjectId

@exercices_bp.route('', methods=['GET'])
def get_exercices():
    print("Received GET /exercices request")
    try:
        db = get_db()
        
        # Récupérer tous les exercices
        exercices_cursor = db.exercices.find({})
        exercices_list = []
        
        for exercice in exercices_cursor:
            exercice_data = {
                'id': str(exercice['_id']),
                'nom': exercice.get('nom', ''),
                'description': exercice.get('description', ''),
                'duree_inspiration': exercice.get('duree_inspiration', 0),
                'duree_apnee': exercice.get('duree_apnee', 0),
                'duree_expiration': exercice.get('duree_expiration', 0),
                'cree_par_admin': exercice.get('nom_admin', 'Système'),
                'date_creation': exercice.get('date_creation')
            }
            exercices_list.append(exercice_data)
        
        print(f"Found {len(exercices_list)} exercices")
        return jsonify(exercices_list), 200
        
    except Exception as e:
        print(f"Error in get_exercices: {str(e)}")
        return jsonify({'error': str(e)}), 500

@exercices_bp.route('/<exercice_id>', methods=['GET'])
def get_exercice_by_id(exercice_id):
    print(f"Received GET /exercices/{exercice_id} request")
    try:
        db = get_db()
        
        # Récupérer l'exercice par ID
        try:
            exercice_id_obj = ObjectId(exercice_id)
            exercice = db.exercices.find_one({'_id': exercice_id_obj})
        except Exception as e:
            print(f"Invalid exercice ID: {exercice_id}")
            return jsonify({'error': 'ID d\'exercice invalide'}), 400
        
        if not exercice:
            print(f"Exercice {exercice_id} not found")
            return jsonify({'error': 'Exercice non trouvé'}), 404
        
        # Retourner les informations de l'exercice
        exercice_data = {
            'id': str(exercice['_id']),
            'nom': exercice.get('nom', ''),
            'description': exercice.get('description', ''),
            'duree_inspiration': exercice.get('duree_inspiration', 0),
            'duree_apnee': exercice.get('duree_apnee', 0),
            'duree_expiration': exercice.get('duree_expiration', 0),
            'cree_par_admin': exercice.get('nom_admin', 'Système'),
            'date_creation': exercice.get('date_creation')
        }
        
        print(f"Returning exercice data: {exercice_data}")
        return jsonify(exercice_data), 200
        
    except Exception as e:
        print(f"Error in get_exercice_by_id: {str(e)}")
        return jsonify({'error': str(e)}), 500 