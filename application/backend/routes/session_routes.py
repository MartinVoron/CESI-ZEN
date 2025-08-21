from flask import Blueprint, request, jsonify
from models.session import Session
from models.meditation import Meditation
from models.user import User
from utils.auth import token_required
from bson import ObjectId

session_routes = Blueprint('sessions', __name__)

@session_routes.route('/start', methods=['POST'])
@token_required
def start_session(current_user):
    """Démarre une nouvelle session de méditation"""
    try:
        data = request.get_json()
        
        if not data or 'meditation_id' not in data:
            return jsonify({'message': 'ID de méditation requis'}), 400
        
        meditation_id = data['meditation_id']
        
        # Valider l'ID de méditation
        if not ObjectId.is_valid(meditation_id):
            return jsonify({'message': 'ID de méditation invalide'}), 400
        
        # Vérifier que la méditation existe
        meditation = Meditation.find_by_id(meditation_id)
        if not meditation:
            return jsonify({'message': 'Méditation non trouvée'}), 404
        
        # Récupérer l'humeur avant (optionnel)
        humeur_avant = data.get('humeur_avant')
        if humeur_avant is not None:
            if not isinstance(humeur_avant, int) or not 1 <= humeur_avant <= 10:
                return jsonify({'message': 'L\'humeur doit être entre 1 et 10'}), 400
        
        # Créer la session
        session_data = {
            'user_id': str(current_user._id),
            'meditation_id': meditation_id,
            'duree_prevue': meditation.duree_minutes
        }
        
        session = Session.create_session(session_data)
        
        # Définir l'humeur avant si fournie
        if humeur_avant is not None:
            session.set_mood_before(humeur_avant)
        
        # Incrémenter le compteur de sessions de la méditation
        meditation.increment_session_count()
        
        session_dict = session.to_dict()
        session_dict['_id'] = str(session_dict['_id'])
        session_dict['user_id'] = str(session_dict['user_id'])
        session_dict['meditation_id'] = str(session_dict['meditation_id'])
        
        return jsonify({
            'message': 'Session démarrée avec succès',
            'session': session_dict,
            'meditation': {
                'titre': meditation.titre,
                'duree_minutes': meditation.duree_minutes,
                'type_meditation': meditation.type_meditation,
                'instructions': meditation.instructions
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors du démarrage de la session'}), 500

@session_routes.route('/<session_id>/complete', methods=['POST'])
@token_required
def complete_session(current_user, session_id):
    """Termine une session de méditation"""
    try:
        # Valider l'ID de session
        if not ObjectId.is_valid(session_id):
            return jsonify({'message': 'ID de session invalide'}), 400
        
        data = request.get_json()
        
        if not data or 'duree_reelle' not in data:
            return jsonify({'message': 'Durée réelle requise'}), 400
        
        duree_reelle = data['duree_reelle']
        if not isinstance(duree_reelle, (int, float)) or duree_reelle <= 0:
            return jsonify({'message': 'Durée réelle invalide'}), 400
        
        # Récupérer la session
        session = Session.find_by_id(session_id)
        if not session:
            return jsonify({'message': 'Session non trouvée'}), 404
        
        # Vérifier que la session appartient à l'utilisateur
        if session.user_id != current_user._id:
            return jsonify({'message': 'Accès non autorisé à cette session'}), 403
        
        # Vérifier que la session est en cours
        if session.statut != 'en_cours':
            return jsonify({'message': 'Cette session n\'est pas en cours'}), 400
        
        # Récupérer les données optionnelles
        note = data.get('note')
        if note is not None:
            if not isinstance(note, (int, float)) or not 1 <= note <= 5:
                return jsonify({'message': 'La note doit être entre 1 et 5'}), 400
        
        commentaire = data.get('commentaire')
        humeur_apres = data.get('humeur_apres')
        if humeur_apres is not None:
            if not isinstance(humeur_apres, int) or not 1 <= humeur_apres <= 10:
                return jsonify({'message': 'L\'humeur après doit être entre 1 et 10'}), 400
        
        # Compléter la session
        session.complete_session(duree_reelle, note, commentaire, humeur_apres)
        
        session_dict = session.to_dict()
        session_dict['_id'] = str(session_dict['_id'])
        session_dict['user_id'] = str(session_dict['user_id'])
        session_dict['meditation_id'] = str(session_dict['meditation_id'])
        
        return jsonify({
            'message': 'Session complétée avec succès',
            'session': session_dict
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la completion de la session'}), 500

@session_routes.route('/<session_id>/interrupt', methods=['POST'])
@token_required
def interrupt_session(current_user, session_id):
    """Interrompt une session de méditation"""
    try:
        # Valider l'ID de session
        if not ObjectId.is_valid(session_id):
            return jsonify({'message': 'ID de session invalide'}), 400
        
        data = request.get_json()
        
        if not data or 'duree_reelle' not in data:
            return jsonify({'message': 'Durée réelle requise'}), 400
        
        duree_reelle = data['duree_reelle']
        if not isinstance(duree_reelle, (int, float)) or duree_reelle < 0:
            return jsonify({'message': 'Durée réelle invalide'}), 400
        
        # Récupérer la session
        session = Session.find_by_id(session_id)
        if not session:
            return jsonify({'message': 'Session non trouvée'}), 404
        
        # Vérifier que la session appartient à l'utilisateur
        if session.user_id != current_user._id:
            return jsonify({'message': 'Accès non autorisé à cette session'}), 403
        
        # Vérifier que la session est en cours
        if session.statut != 'en_cours':
            return jsonify({'message': 'Cette session n\'est pas en cours'}), 400
        
        # Interrompre la session
        session.interrupt_session(duree_reelle)
        
        session_dict = session.to_dict()
        session_dict['_id'] = str(session_dict['_id'])
        session_dict['user_id'] = str(session_dict['user_id'])
        session_dict['meditation_id'] = str(session_dict['meditation_id'])
        
        return jsonify({
            'message': 'Session interrompue',
            'session': session_dict
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de l\'interruption de la session'}), 500

@session_routes.route('/history', methods=['GET'])
@token_required
def get_session_history(current_user):
    """Récupère l'historique des sessions de l'utilisateur"""
    try:
        # Récupérer les paramètres de pagination
        limit = request.args.get('limit', 20)
        try:
            limit = int(limit)
            if limit > 100:  # Limiter à 100 pour éviter les surcharges
                limit = 100
        except ValueError:
            limit = 20
        
        # Récupérer les sessions
        sessions = Session.find_by_user(current_user._id, limit)
        
        # Enrichir avec les informations de méditation
        sessions_data = []
        for session in sessions:
            session_dict = session.to_dict()
            session_dict['_id'] = str(session_dict['_id'])
            session_dict['user_id'] = str(session_dict['user_id'])
            session_dict['meditation_id'] = str(session_dict['meditation_id'])
            
            # Récupérer les infos de la méditation
            meditation = Meditation.find_by_id(str(session.meditation_id))
            if meditation:
                session_dict['meditation'] = {
                    'titre': meditation.titre,
                    'type_meditation': meditation.type_meditation,
                    'niveau_difficulte': meditation.niveau_difficulte
                }
            
            sessions_data.append(session_dict)
        
        return jsonify({
            'sessions': sessions_data,
            'total': len(sessions_data)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la récupération de l\'historique'}), 500

@session_routes.route('/<session_id>', methods=['GET'])
@token_required
def get_session(current_user, session_id):
    """Récupère une session spécifique"""
    try:
        # Valider l'ID de session
        if not ObjectId.is_valid(session_id):
            return jsonify({'message': 'ID de session invalide'}), 400
        
        session = Session.find_by_id(session_id)
        if not session:
            return jsonify({'message': 'Session non trouvée'}), 404
        
        # Vérifier que la session appartient à l'utilisateur
        if session.user_id != current_user._id:
            return jsonify({'message': 'Accès non autorisé à cette session'}), 403
        
        session_dict = session.to_dict()
        session_dict['_id'] = str(session_dict['_id'])
        session_dict['user_id'] = str(session_dict['user_id'])
        session_dict['meditation_id'] = str(session_dict['meditation_id'])
        
        # Ajouter les informations de la méditation
        meditation = Meditation.find_by_id(str(session.meditation_id))
        if meditation:
            session_dict['meditation'] = {
                'titre': meditation.titre,
                'description': meditation.description,
                'type_meditation': meditation.type_meditation,
                'niveau_difficulte': meditation.niveau_difficulte,
                'duree_minutes': meditation.duree_minutes
            }
        
        return jsonify({
            'session': session_dict
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la récupération de la session'}), 500

@session_routes.route('/current', methods=['GET'])
@token_required
def get_current_session(current_user):
    """Récupère la session en cours de l'utilisateur s'il y en a une"""
    try:
        from config.database import db_instance
        collection = db_instance.get_collection('sessions')
        
        # Chercher une session en cours pour cet utilisateur
        current_session_data = collection.find_one({
            "user_id": current_user._id,
            "statut": "en_cours"
        })
        
        if not current_session_data:
            return jsonify({
                'current_session': None,
                'message': 'Aucune session en cours'
            }), 200
        
        # Convertir en objet Session
        session = Session.__new__(Session)
        session.__dict__.update(current_session_data)
        
        session_dict = session.to_dict()
        session_dict['_id'] = str(session_dict['_id'])
        session_dict['user_id'] = str(session_dict['user_id'])
        session_dict['meditation_id'] = str(session_dict['meditation_id'])
        
        # Ajouter les informations de la méditation
        meditation = Meditation.find_by_id(str(session.meditation_id))
        if meditation:
            session_dict['meditation'] = {
                'titre': meditation.titre,
                'type_meditation': meditation.type_meditation,
                'duree_minutes': meditation.duree_minutes,
                'instructions': meditation.instructions
            }
        
        return jsonify({
            'current_session': session_dict
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erreur lors de la récupération de la session courante'}), 500 