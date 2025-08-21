from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from routes.exercices import exercices_bp
from utils.auth_middleware import require_admin, get_current_user

@exercices_bp.route('/<exercice_id>', methods=['PUT'])
@require_admin
def update_exercice(exercice_id):
    print(f"Received PUT /exercices/{exercice_id} request")
    try:
        # Récupérer l'admin qui modifie l'exercice
        admin_user = get_current_user()
        print(f"Admin updating exercice: {admin_user['email']}")
        
        # Vérifier que l'ID de l'exercice est valide
        try:
            exercice_id_obj = ObjectId(exercice_id)
        except Exception as e:
            print(f"Invalid exercice ID: {exercice_id}")
            return jsonify({'error': 'ID d\'exercice invalide'}), 400
        
        # Vérifier que l'exercice existe
        db = get_db()
        exercice = db.exercices.find_one({'_id': exercice_id_obj})
        if not exercice:
            print(f"Exercice {exercice_id} not found")
            return jsonify({'error': 'Exercice non trouvé'}), 404
        
        # Récupérer les données de mise à jour
        data = request.get_json()
        print(f"Received data for exercice update: {data}")
        
        if not data:
            print("No data received")
            return jsonify({'error': 'Aucune donnée reçue'}), 400
        
        # Préparer les champs à mettre à jour
        update_fields = {}
        
        # Nom (optionnel)
        if 'nom' in data and data['nom']:
            # Vérifier si un autre exercice avec ce nom existe déjà
            existing_exercice = db.exercices.find_one({
                'nom': data['nom'],
                '_id': {'$ne': exercice_id_obj}
            })
            if existing_exercice:
                return jsonify({'error': 'Un exercice avec ce nom existe déjà'}), 400
            update_fields['nom'] = data['nom']
        
        # Description (optionnel)
        if 'description' in data and data['description']:
            update_fields['description'] = data['description']
        
        # Durées (optionnelles mais doivent être valides si fournies)
        if 'duree_inspiration' in data:
            try:
                duree_inspiration = int(data['duree_inspiration'])
                if duree_inspiration <= 0:
                    return jsonify({'error': 'La durée d\'inspiration doit être positive'}), 400
                update_fields['duree_inspiration'] = duree_inspiration
            except ValueError:
                return jsonify({'error': 'La durée d\'inspiration doit être un entier'}), 400
        
        if 'duree_apnee' in data:
            try:
                duree_apnee = int(data['duree_apnee'])
                if duree_apnee < 0:
                    return jsonify({'error': 'La durée d\'apnée doit être positive ou nulle'}), 400
                update_fields['duree_apnee'] = duree_apnee
            except ValueError:
                return jsonify({'error': 'La durée d\'apnée doit être un entier'}), 400
        
        if 'duree_expiration' in data:
            try:
                duree_expiration = int(data['duree_expiration'])
                if duree_expiration <= 0:
                    return jsonify({'error': 'La durée d\'expiration doit être positive'}), 400
                update_fields['duree_expiration'] = duree_expiration
            except ValueError:
                return jsonify({'error': 'La durée d\'expiration doit être un entier'}), 400
        
        # Vérifier qu'au moins un champ est à mettre à jour
        if not update_fields:
            return jsonify({'error': 'Aucun champ valide à mettre à jour'}), 400
        
        # Ajouter les métadonnées de modification
        update_fields['date_modification'] = datetime.utcnow()
        update_fields['modifie_par_admin'] = str(admin_user['_id'])
        update_fields['nom_admin_modificateur'] = f"{admin_user['prenom']} {admin_user['nom']}"
        
        # Mettre à jour l'exercice
        try:
            result = db.exercices.update_one(
                {'_id': exercice_id_obj},
                {'$set': update_fields}
            )
            
            if result.modified_count == 0:
                return jsonify({'error': 'Aucune modification effectuée'}), 400
            
            print(f"Exercice updated successfully: {exercice_id}")
            
            # Récupérer l'exercice mis à jour
            updated_exercice = db.exercices.find_one({'_id': exercice_id_obj})
            
            # Retourner les informations de l'exercice mis à jour
            exercice_data = {
                'id': str(updated_exercice['_id']),
                'nom': updated_exercice['nom'],
                'description': updated_exercice['description'],
                'duree_inspiration': updated_exercice['duree_inspiration'],
                'duree_apnee': updated_exercice['duree_apnee'],
                'duree_expiration': updated_exercice['duree_expiration'],
                'cree_par_admin': updated_exercice.get('nom_admin', 'Système'),
                'date_creation': updated_exercice.get('date_creation'),
                'date_modification': updated_exercice.get('date_modification'),
                'modifie_par_admin': updated_exercice.get('nom_admin_modificateur')
            }
            
            return jsonify({
                'message': 'Exercice mis à jour avec succès',
                'exercice': exercice_data
            }), 200
            
        except Exception as e:
            print(f"Error updating exercice: {str(e)}")
            return jsonify({'error': f'Erreur lors de la mise à jour de l\'exercice: {str(e)}'}), 500
    
    except Exception as e:
        print(f"Error in update_exercice: {str(e)}")
        return jsonify({'error': str(e)}), 500 