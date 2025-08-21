from flask import Blueprint, jsonify, request
from config.database import get_db
from bson import ObjectId
from datetime import datetime
from utils.auth_middleware import require_admin

informations_sante_bp = Blueprint('informations_sante', __name__)

@informations_sante_bp.route('/', methods=['GET'])
def get_informations_sante():
    """Récupérer tous les contenus de santé"""
    try:
        db = get_db()
        if db is None:
            return jsonify({'error': 'Connexion à la base de données échouée'}), 500

        # Récupérer tous les contenus triés par date de création
        contenus = list(db.contenus.find({}).sort('date_creation', 1))
        
        # Convertir les ObjectId en string pour la sérialisation JSON
        for contenu in contenus:
            contenu['id'] = str(contenu['_id'])
            del contenu['_id']
            
            # Formater les dates pour l'affichage
            if 'date_creation' in contenu and contenu['date_creation']:
                contenu['date_creation'] = contenu['date_creation'].isoformat()
            if 'date_mise_a_jour' in contenu and contenu['date_mise_a_jour']:
                contenu['date_mise_a_jour'] = contenu['date_mise_a_jour'].isoformat()

        return jsonify(contenus), 200

    except Exception as e:
        print(f"Erreur lors de la récupération des contenus: {e}")
        return jsonify({'error': 'Erreur lors de la récupération des contenus'}), 500

@informations_sante_bp.route('/<string:contenu_id>', methods=['GET'])
def get_contenu_by_id(contenu_id):
    """Récupérer un contenu spécifique par son ID"""
    try:
        db = get_db()
        if db is None:
            return jsonify({'error': 'Connexion à la base de données échouée'}), 500

        # Vérifier que l'ID est valide
        try:
            object_id = ObjectId(contenu_id)
        except:
            return jsonify({'error': 'ID invalide'}), 400

        # Rechercher le contenu
        contenu = db.contenus.find_one({'_id': object_id})
        
        if not contenu:
            return jsonify({'error': 'Contenu non trouvé'}), 404

        # Convertir l'ObjectId en string
        contenu['id'] = str(contenu['_id'])
        del contenu['_id']
        
        # Formater les dates
        if 'date_creation' in contenu and contenu['date_creation']:
            contenu['date_creation'] = contenu['date_creation'].isoformat()
        if 'date_mise_a_jour' in contenu and contenu['date_mise_a_jour']:
            contenu['date_mise_a_jour'] = contenu['date_mise_a_jour'].isoformat()

        return jsonify(contenu), 200

    except Exception as e:
        print(f"Erreur lors de la récupération du contenu: {e}")
        return jsonify({'error': 'Erreur lors de la récupération du contenu'}), 500

@informations_sante_bp.route('/', methods=['POST'])
@require_admin
def create_contenu():
    """Créer un nouveau contenu de santé (admin seulement)"""
    try:

        db = get_db()
        if db is None:
            return jsonify({'error': 'Connexion à la base de données échouée'}), 500

        data = request.get_json()
        
        # Validation des données requises
        if not data or not data.get('titre') or not data.get('texte'):
            return jsonify({'error': 'Titre et texte sont requis'}), 400

        # Créer le nouveau contenu
        nouveau_contenu = {
            'titre': data['titre'].strip(),
            'texte': data['texte'].strip(),
            'date_creation': datetime.utcnow(),
            'date_mise_a_jour': datetime.utcnow()
        }

        result = db.contenus.insert_one(nouveau_contenu)
        
        # Retourner le contenu créé
        nouveau_contenu['id'] = str(result.inserted_id)
        del nouveau_contenu['_id']
        nouveau_contenu['date_creation'] = nouveau_contenu['date_creation'].isoformat()
        nouveau_contenu['date_mise_a_jour'] = nouveau_contenu['date_mise_a_jour'].isoformat()

        print(f"Contenu créé par admin: {nouveau_contenu['titre']}")
        return jsonify(nouveau_contenu), 201

    except Exception as e:
        print(f"Erreur lors de la création du contenu: {e}")
        return jsonify({'error': 'Erreur lors de la création du contenu'}), 500

@informations_sante_bp.route('/<string:contenu_id>', methods=['PUT'])
@require_admin
def update_contenu(contenu_id):
    """Modifier un contenu existant (admin seulement)"""
    try:

        db = get_db()
        if db is None:
            return jsonify({'error': 'Connexion à la base de données échouée'}), 500

        # Vérifier que l'ID est valide
        try:
            object_id = ObjectId(contenu_id)
        except:
            return jsonify({'error': 'ID invalide'}), 400

        data = request.get_json()
        
        # Validation des données
        if not data:
            return jsonify({'error': 'Données requises'}), 400

        # Préparer les données de mise à jour
        update_data = {'date_mise_a_jour': datetime.utcnow()}
        
        if 'titre' in data and data['titre'].strip():
            update_data['titre'] = data['titre'].strip()
        if 'texte' in data and data['texte'].strip():
            update_data['texte'] = data['texte'].strip()

        # Mettre à jour le contenu
        result = db.contenus.update_one(
            {'_id': object_id},
            {'$set': update_data}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Contenu non trouvé'}), 404

        # Récupérer le contenu mis à jour
        contenu_modifie = db.contenus.find_one({'_id': object_id})
        if contenu_modifie:
            contenu_modifie['id'] = str(contenu_modifie['_id'])
            del contenu_modifie['_id']
            
            if 'date_creation' in contenu_modifie and contenu_modifie['date_creation']:
                contenu_modifie['date_creation'] = contenu_modifie['date_creation'].isoformat()
            if 'date_mise_a_jour' in contenu_modifie and contenu_modifie['date_mise_a_jour']:
                contenu_modifie['date_mise_a_jour'] = contenu_modifie['date_mise_a_jour'].isoformat()

        print(f"Contenu modifié par admin: {contenu_modifie.get('titre', 'N/A')}")
        return jsonify(contenu_modifie), 200

    except Exception as e:
        print(f"Erreur lors de la modification du contenu: {e}")
        return jsonify({'error': 'Erreur lors de la modification du contenu'}), 500

@informations_sante_bp.route('/<string:contenu_id>', methods=['DELETE'])
@require_admin
def delete_contenu(contenu_id):
    """Supprimer un contenu (admin seulement)"""
    try:

        db = get_db()
        if db is None:
            return jsonify({'error': 'Connexion à la base de données échouée'}), 500

        # Vérifier que l'ID est valide
        try:
            object_id = ObjectId(contenu_id)
        except:
            return jsonify({'error': 'ID invalide'}), 400

        # Vérifier que le contenu existe avant de le supprimer
        contenu_existant = db.contenus.find_one({'_id': object_id})
        if not contenu_existant:
            return jsonify({'error': 'Contenu non trouvé'}), 404

        # Supprimer le contenu
        result = db.contenus.delete_one({'_id': object_id})

        if result.deleted_count == 0:
            return jsonify({'error': 'Erreur lors de la suppression'}), 500

        print(f"Contenu supprimé par admin: {contenu_existant.get('titre', 'N/A')}")
        return jsonify({'message': 'Contenu supprimé avec succès'}), 200

    except Exception as e:
        print(f"Erreur lors de la suppression du contenu: {e}")
        return jsonify({'error': 'Erreur lors de la suppression du contenu'}), 500 