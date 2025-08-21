from flask import request, jsonify
from datetime import datetime
from config.database import get_db
from routes.exercices import exercices_bp
from utils.auth_middleware import require_admin, get_current_user

@exercices_bp.route('', methods=['POST'])
@require_admin
def create_exercice():
    print("Received POST /exercices request")
    try:
        # Récupérer l'admin qui crée l'exercice
        admin_user = get_current_user()
        print(f"Admin creating exercice: {admin_user['email']}")
        
        # Récupérer les données du formulaire
        data = request.get_json()
        print(f"Received data for exercice creation: {data}")
        
        # Vérifier les données reçues
        if not data:
            print("No data received")
            return jsonify({'error': 'Aucune donnée reçue'}), 400
        
        # Vérifier les champs obligatoires
        required_fields = ['nom', 'description', 'duree_inspiration', 'duree_expiration']
        for field in required_fields:
            if field not in data:
                print(f"Missing required field: {field}")
                return jsonify({'error': f'Le champ {field} est obligatoire'}), 400
        
        # Vérifier que les durées sont des entiers positifs
        try:
            duree_inspiration = int(data['duree_inspiration'])
            duree_apnee = int(data.get('duree_apnee', 0))
            duree_expiration = int(data['duree_expiration'])
            
            if duree_inspiration <= 0 or duree_expiration <= 0 or duree_apnee < 0:
                return jsonify({'error': 'Les durées doivent être des entiers positifs'}), 400
                
        except ValueError:
            return jsonify({'error': 'Les durées doivent être des entiers'}), 400
        
        # Préparer les données de l'exercice
        exercice_data = {
            'nom': data['nom'],
            'description': data['description'],
            'duree_inspiration': duree_inspiration,
            'duree_apnee': duree_apnee,
            'duree_expiration': duree_expiration,
            'cree_par_admin': str(admin_user['_id']),
            'nom_admin': f"{admin_user['prenom']} {admin_user['nom']}",
            'date_creation': datetime.utcnow()
        }
        
        # Vérifier si un exercice avec le même nom existe déjà
        db = get_db()
        existing_exercice = db.exercices.find_one({'nom': exercice_data['nom']})
        if existing_exercice:
            return jsonify({'error': 'Un exercice avec ce nom existe déjà'}), 400
        
        # Insérer l'exercice dans la base de données
        try:
            result = db.exercices.insert_one(exercice_data)
            exercice_id = result.inserted_id
            print(f"Exercice created successfully with ID: {exercice_id}")
            
            # Retourner les informations de l'exercice créé
            created_exercice = {
                'id': str(exercice_id),
                'nom': exercice_data['nom'],
                'description': exercice_data['description'],
                'duree_inspiration': exercice_data['duree_inspiration'],
                'duree_apnee': exercice_data['duree_apnee'],
                'duree_expiration': exercice_data['duree_expiration'],
                'cree_par_admin': exercice_data['nom_admin']
            }
            
            return jsonify({
                'message': 'Exercice créé avec succès',
                'exercice': created_exercice
            }), 201
            
        except Exception as e:
            print(f"Error creating exercice: {str(e)}")
            return jsonify({'error': f'Erreur lors de la création de l\'exercice: {str(e)}'}), 500
    
    except Exception as e:
        print(f"Error in create_exercice: {str(e)}")
        return jsonify({'error': str(e)}), 500 