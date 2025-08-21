#!/usr/bin/env python3
"""
Script d'initialisation des informations de santé
Peuple la base avec les informations de santé sur la respiration
"""

from datetime import datetime
from config.database import get_db
from bson import ObjectId

def init_informations_sante():
    """Initialise la collection informations_sante avec des données d'exemple"""
    print("🩺 Initialisation des informations de santé...")
    
    db = get_db()
    if db is None:
        print("❌ Erreur: Impossible de se connecter à la base de données")
        return False
    
    try:
        # Nettoyer la collection existante
        print("🧹 Nettoyage de la collection informations_sante...")
        db.informations_sante.delete_many({})
        
        # Créer les informations de santé
        informations_sante = [
            {
                "type": "introduction",
                "titre": "Les bienfaits scientifiques de la respiration consciente",
                "contenu": "Découvrez comment la respiration contrôlée peut transformer votre santé physique et mentale.",
                "icone": "BookOpen",
                "couleur": "blue",
                "ordre": 1,
                "date_creation": datetime.utcnow(),
                "date_mise_a_jour": datetime.utcnow()
            },
            {
                "type": "article",
                "titre": "Cohérence cardiaque",
                "contenu": "La cohérence cardiaque est un état physiologique où le cœur, l'esprit et les émotions sont en équilibre énergétique et en harmonie.",
                "points": [
                    "Améliore la variabilité de la fréquence cardiaque",
                    "Régule le système nerveux autonome", 
                    "Optimise les fonctions cognitives"
                ],
                "icone": "Heart",
                "couleur": "red",
                "ordre": 2,
                "date_creation": datetime.utcnow(),
                "date_mise_a_jour": datetime.utcnow()
            },
            {
                "type": "article", 
                "titre": "Gestion du stress",
                "contenu": "Les techniques de respiration activent le système nerveux parasympathique, favorisant la relaxation et la récupération.",
                "points": [
                    "Diminue les niveaux de cortisol",
                    "Réduit l'anxiété et la tension",
                    "Améliore la qualité du sommeil"
                ],
                "icone": "Shield",
                "couleur": "green",
                "ordre": 3,
                "date_creation": datetime.utcnow(),
                "date_mise_a_jour": datetime.utcnow()
            },
            {
                "type": "article",
                "titre": "Performance cognitive",
                "contenu": "La respiration contrôlée améliore l'oxygénation du cerveau et optimise les performances mentales.",
                "points": [
                    "Augmente la concentration et l'attention",
                    "Améliore la mémoire de travail",
                    "Favorise la créativité"
                ],
                "icone": "Brain",
                "couleur": "purple",
                "ordre": 4,
                "date_creation": datetime.utcnow(),
                "date_mise_a_jour": datetime.utcnow()
            },
            {
                "type": "article",
                "titre": "Bienfaits physiques",
                "contenu": "La pratique régulière de la respiration consciente apporte de nombreux bénéfices pour la santé physique.",
                "points": [
                    "Améliore la capacité pulmonaire",
                    "Régule la pression artérielle",
                    "Renforce le système immunitaire"
                ],
                "icone": "Activity",
                "couleur": "blue",
                "ordre": 5,
                "date_creation": datetime.utcnow(),
                "date_mise_a_jour": datetime.utcnow()
            },
            {
                "type": "conseils",
                "titre": "Conseils pour une pratique optimale",
                "contenu": "Optimisez votre pratique de la respiration consciente avec ces recommandations.",
                "conseils": [
                    {
                        "titre": "Régularité",
                        "description": "Pratiquez 5-10 minutes par jour, de préférence à heures fixes pour créer une routine.",
                        "icone": "Clock",
                        "couleur": "blue"
                    },
                    {
                        "titre": "Environnement", 
                        "description": "Choisissez un endroit calme, bien aéré, et adoptez une posture confortable.",
                        "icone": "Wind",
                        "couleur": "green"
                    },
                    {
                        "titre": "Progression",
                        "description": "Commencez par des exercices simples et augmentez progressivement la durée et la complexité.",
                        "icone": "Heart",
                        "couleur": "purple"
                    }
                ],
                "ordre": 6,
                "date_creation": datetime.utcnow(),
                "date_mise_a_jour": datetime.utcnow()
            },
            {
                "type": "avertissement",
                "titre": "Avertissement médical",
                "contenu": "Ces exercices de respiration ne remplacent pas un traitement médical. Si vous souffrez de troubles respiratoires, cardiovasculaires ou de tout autre problème de santé, consultez votre médecin avant de pratiquer ces exercices.",
                "icone": "AlertTriangle",
                "couleur": "amber",
                "ordre": 7,
                "date_creation": datetime.utcnow(),
                "date_mise_a_jour": datetime.utcnow()
            }
        ]
        
        # Insérer les informations de santé
        result = db.informations_sante.insert_many(informations_sante)
        print(f"✅ {len(result.inserted_ids)} informations de santé créées avec succès!")
        
        # Afficher les IDs créés
        for i, info_id in enumerate(result.inserted_ids):
            print(f"   - {informations_sante[i]['titre']}: {info_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation des informations de santé: {e}")
        return False

if __name__ == "__main__":
    success = init_informations_sante()
    if success:
        print("\n🎉 Initialisation des informations de santé terminée avec succès!")
    else:
        print("\n💥 Échec de l'initialisation des informations de santé") 