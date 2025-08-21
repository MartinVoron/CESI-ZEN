from flask import request, jsonify
import jwt
from config.database import get_db
from config.config import SECRET_KEY
from routes.historiques import historiques_bp
from bson import ObjectId

@historiques_bp.route('', methods=['GET'])
def get_historiques():
    print("Received GET /historiques request")
    try:
        # Récupérer le token depuis les cookies (optionnel pour voir tous les historiques)
        token = request.cookies.get('access_token')
        user_id = None
        
        if token:
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                user_id = payload['user_id']
                print(f"User ID from token: {user_id}")
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                pass  # Pas de token valide, mais on peut quand même récupérer tous les historiques
        
        db = get_db()
        
        # Si un utilisateur est connecté, filtrer par son ID
        query = {}
        if user_id:
            try:
                user_id_obj = ObjectId(user_id)
                query = {'id_utilisateur': user_id_obj}
            except Exception:
                pass
        
        # Récupérer les historiques avec jointure sur exercices et utilisateurs
        pipeline = [
            {'$match': query},
            {
                '$lookup': {
                    'from': 'exercices',
                    'localField': 'id_exercice',
                    'foreignField': '_id',
                    'as': 'exercice'
                }
            },
            {
                '$lookup': {
                    'from': 'utilisateurs',
                    'localField': 'id_utilisateur',
                    'foreignField': '_id',
                    'as': 'utilisateur'
                }
            },
            {'$sort': {'date_execution': -1}}  # Trier par date descendante
        ]
        
        historiques_cursor = db.historiques_exercices.aggregate(pipeline)
        historiques_list = []
        
        for historique in historiques_cursor:
            exercice = historique.get('exercice', [{}])[0] if historique.get('exercice') else {}
            utilisateur = historique.get('utilisateur', [{}])[0] if historique.get('utilisateur') else {}
            
            historique_data = {
                'id': str(historique['_id']),
                'date_execution': historique.get('date_execution').isoformat() if historique.get('date_execution') else None,
                'exercice': {
                    'id': str(exercice['_id']) if exercice.get('_id') else None,
                    'nom': exercice.get('nom', ''),
                    'duree_inspiration': exercice.get('duree_inspiration', 0),
                    'duree_apnee': exercice.get('duree_apnee', 0),
                    'duree_expiration': exercice.get('duree_expiration', 0)
                } if exercice else None,
                'utilisateur': {
                    'id': str(utilisateur['_id']) if utilisateur.get('_id') else None,
                    'nom': utilisateur.get('nom', ''),
                    'prenom': utilisateur.get('prenom', '')
                } if utilisateur else None
            }
            historiques_list.append(historique_data)
        
        print(f"Found {len(historiques_list)} historiques")
        return jsonify(historiques_list), 200
        
    except Exception as e:
        print(f"Error in get_historiques: {str(e)}")
        return jsonify({'error': str(e)}), 500 