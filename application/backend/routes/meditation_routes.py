from flask import Blueprint, request, jsonify
from models.meditation import Meditation
from utils.auth import token_required
from bson import ObjectId

meditation_routes = Blueprint('meditations', __name__)

@meditation_routes.route('/', methods=['GET'])
def get_meditations():
    """Récupère toutes les méditations avec filtres optionnels"""
    try:
        # Récupérer les paramètres de filtre
        filters = {}
        
        if request.args.get('type'):
            filters['type_meditation'] = request.args.get('type')
        
        if request.args.get('niveau'):
            filters['niveau_difficulte'] = request.args.get('niveau')
        
        if request.args.get('duree_max'):
            try:
                filters['duree_max'] = int(request.args.get('duree_max'))
            except ValueError:
                pass
        
        if request.args.get('tags'):
            tags = request.args.get('tags').split(',')
            filters['tags'] = [tag.strip() for tag in tags]
        
        # Récupérer les méditations
        meditations = Meditation.find_all(filters)
        
        # Convertir en dictionnaires
        meditations_data = []
        for meditation in meditations:
            meditation_dict = meditation.to_dict()
            meditation_dict['_id'] = str(meditation_dict['_id'])
            meditations_data.append(meditation_dict)
        
        return jsonify({
            'meditations': meditations_data,
            'total': len(meditations_data)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la récupération des méditations'}), 500

@meditation_routes.route('/<meditation_id>', methods=['GET'])
def get_meditation(meditation_id):
    """Récupère une méditation spécifique"""
    try:
        # Valider l'ID
        if not ObjectId.is_valid(meditation_id):
            return jsonify({'message': 'ID de méditation invalide'}), 400
        
        meditation = Meditation.find_by_id(meditation_id)
        
        if not meditation:
            return jsonify({'message': 'Méditation non trouvée'}), 404
        
        meditation_dict = meditation.to_dict()
        meditation_dict['_id'] = str(meditation_dict['_id'])
        
        return jsonify({
            'meditation': meditation_dict
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la récupération de la méditation'}), 500

@meditation_routes.route('/recommended', methods=['GET'])
@token_required
def get_recommended_meditations(current_user):
    """Récupère les méditations recommandées pour l'utilisateur"""
    try:
        meditations = Meditation.find_recommended(
            current_user.niveau_experience,
            current_user.preferences
        )
        
        meditations_data = []
        for meditation in meditations:
            meditation_dict = meditation.to_dict()
            meditation_dict['_id'] = str(meditation_dict['_id'])
            meditations_data.append(meditation_dict)
        
        return jsonify({
            'meditations': meditations_data,
            'total': len(meditations_data)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la récupération des recommandations'}), 500

@meditation_routes.route('/create', methods=['POST'])
@token_required
def create_meditation(current_user):
    """Crée une nouvelle méditation (pour les administrateurs)"""
    try:
        data = request.get_json()
        
        # Validation des données requises
        required_fields = ['titre', 'description', 'duree_minutes', 'type_meditation', 'niveau_difficulte']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'Le champ {field} est requis'}), 400
        
        # Validation des valeurs
        valid_types = ['mindfulness', 'respiration', 'body_scan', 'visualisation', 'mantra']
        if data['type_meditation'] not in valid_types:
            return jsonify({'message': 'Type de méditation invalide'}), 400
        
        valid_niveaux = ['debutant', 'intermediaire', 'avance']
        if data['niveau_difficulte'] not in valid_niveaux:
            return jsonify({'message': 'Niveau de difficulté invalide'}), 400
        
        if not isinstance(data['duree_minutes'], int) or data['duree_minutes'] < 1:
            return jsonify({'message': 'Durée invalide'}), 400
        
        # Créer la méditation
        meditation = Meditation.create_meditation(data)
        
        meditation_dict = meditation.to_dict()
        meditation_dict['_id'] = str(meditation_dict['_id'])
        
        return jsonify({
            'message': 'Méditation créée avec succès',
            'meditation': meditation_dict
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la création de la méditation'}), 500

@meditation_routes.route('/types', methods=['GET'])
def get_meditation_types():
    """Récupère les types de méditation disponibles"""
    try:
        types = [
            {
                'id': 'mindfulness',
                'nom': 'Pleine conscience',
                'description': 'Méditation de pleine conscience pour développer l\'attention au moment présent'
            },
            {
                'id': 'respiration',
                'nom': 'Respiration',
                'description': 'Méditations centrées sur la respiration pour la relaxation et la concentration'
            },
            {
                'id': 'body_scan',
                'nom': 'Scan corporel',
                'description': 'Exploration progressive du corps pour la détente et la conscience corporelle'
            },
            {
                'id': 'visualisation',
                'nom': 'Visualisation',
                'description': 'Méditations guidées avec des images mentales apaisantes'
            },
            {
                'id': 'mantra',
                'nom': 'Mantra',
                'description': 'Répétition de sons ou phrases pour la concentration et l\'apaisement'
            }
        ]
        
        return jsonify({
            'types': types
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la récupération des types'}), 500

@meditation_routes.route('/search', methods=['GET'])
def search_meditations():
    """Recherche de méditations par mots-clés"""
    try:
        query = request.args.get('q', '').strip()
        
        if not query:
            return jsonify({'message': 'Terme de recherche requis'}), 400
        
        from config.database import db_instance
        collection = db_instance.get_collection('meditations')
        
        # Recherche textuelle simple
        search_results = collection.find({
            "$and": [
                {"is_active": True},
                {
                    "$or": [
                        {"titre": {"$regex": query, "$options": "i"}},
                        {"description": {"$regex": query, "$options": "i"}},
                        {"tags": {"$regex": query, "$options": "i"}}
                    ]
                }
            ]
        }).sort("note_moyenne", -1)
        
        meditations_data = []
        for meditation_data in search_results:
            meditation = Meditation.__new__(Meditation)
            meditation.__dict__.update(meditation_data)
            meditation_dict = meditation.to_dict()
            meditation_dict['_id'] = str(meditation_dict['_id'])
            meditations_data.append(meditation_dict)
        
        return jsonify({
            'meditations': meditations_data,
            'total': len(meditations_data),
            'query': query
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la recherche'}), 500

@meditation_routes.route('/<meditation_id>/rate', methods=['POST'])
@token_required
def rate_meditation(current_user, meditation_id):
    """Évalue une méditation"""
    try:
        # Valider l'ID
        if not ObjectId.is_valid(meditation_id):
            return jsonify({'message': 'ID de méditation invalide'}), 400
        
        data = request.get_json()
        
        if not data or 'note' not in data:
            return jsonify({'message': 'Note requise'}), 400
        
        note = data['note']
        if not isinstance(note, (int, float)) or not 1 <= note <= 5:
            return jsonify({'message': 'La note doit être entre 1 et 5'}), 400
        
        # Vérifier que la méditation existe
        meditation = Meditation.find_by_id(meditation_id)
        if not meditation:
            return jsonify({'message': 'Méditation non trouvée'}), 404
        
        # Vérifier que l'utilisateur a bien fait une session de cette méditation
        from config.database import db_instance
        sessions_collection = db_instance.get_collection('sessions')
        
        user_session = sessions_collection.find_one({
            "user_id": current_user._id,
            "meditation_id": ObjectId(meditation_id),
            "statut": "completee"
        })
        
        if not user_session:
            return jsonify({'message': 'Vous devez avoir complété une session pour évaluer cette méditation'}), 400
        
        # Compter le nombre d'évaluations existantes
        evaluations_collection = db_instance.get_collection('evaluations')
        
        # Vérifier si l'utilisateur a déjà évalué cette méditation
        existing_evaluation = evaluations_collection.find_one({
            "user_id": current_user._id,
            "meditation_id": ObjectId(meditation_id)
        })
        
        if existing_evaluation:
            # Mettre à jour l'évaluation existante
            evaluations_collection.update_one(
                {"_id": existing_evaluation["_id"]},
                {"$set": {"note": note, "date_modification": datetime.utcnow()}}
            )
        else:
            # Créer une nouvelle évaluation
            from datetime import datetime
            evaluations_collection.insert_one({
                "user_id": current_user._id,
                "meditation_id": ObjectId(meditation_id),
                "note": note,
                "date_creation": datetime.utcnow()
            })
        
        # Recalculer la note moyenne
        pipeline = [
            {"$match": {"meditation_id": ObjectId(meditation_id)}},
            {"$group": {"_id": None, "moyenne": {"$avg": "$note"}, "count": {"$sum": 1}}}
        ]
        
        result = list(evaluations_collection.aggregate(pipeline))
        if result:
            nouvelle_moyenne = result[0]["moyenne"]
            nombre_evaluations = result[0]["count"]
            
            # Mettre à jour la méditation
            meditation.update_rating(nouvelle_moyenne, nombre_evaluations)
        
        return jsonify({
            'message': 'Évaluation enregistrée avec succès',
            'note': note,
            'nouvelle_moyenne': meditation.note_moyenne
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de l\'évaluation'}), 500 