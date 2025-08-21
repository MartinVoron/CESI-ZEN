# Documentation Projet CesiZen

## 📋 Présentation du Projet

### Nom du Projet
**CesiZen** - Application de respiration et cohérence cardiaque

### Contexte
CesiZen est une application développée dans le cadre de la formation CDA3 (Concepteur Développeur d'Applications niveau 3) au CESI. Cette application vise à promouvoir le bien-être et la gestion du stress par des exercices de respiration guidés et de cohérence cardiaque.

### Objectifs
- Proposer des exercices de respiration guidés
- Aider les utilisateurs à gérer leur stress et anxiété
- Suivre l'évolution des pratiques de méditation
- Offrir une interface intuitive et apaisante

---

## 🏗️ Architecture Technique

### Stack Technologique

#### Frontend
- **Framework** : React 18 avec TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS
- **State Management** : Zustand
- **Routing** : React Router DOM v7
- **Icons** : Lucide React
- **HTTP Client** : Axios
- **PWA** : Vite Plugin PWA avec Workbox

#### Backend
- **Framework** : Flask (Python)
- **Base de données** : MongoDB
- **Authentification** : JWT (JSON Web Tokens)
- **Hachage des mots de passe** : BCrypt
- **CORS** : Flask-CORS

### Structure du Projet

```
CesiZen/
├── application/
│   ├── frontend/          # Interface utilisateur React
│   ├── backend/           # API REST Flask/Python
│   └── backend-node/      # Alternative Node.js (si applicable)
├── test-automation/       # Tests automatisés
├── cahier-de-tests.md    # Documentation des tests
└── documentation/         # Documentation technique
```

---

## 🎯 Fonctionnalités Principales

### 1. Authentification et Gestion Utilisateur
- **Inscription** : Création de compte utilisateur
- **Connexion** : Authentification avec email/mot de passe
- **Profil utilisateur** : Gestion des informations personnelles
- **Rôles** : Différenciation utilisateur/administrateur

### 2. Exercices de Respiration
- **Bibliothèque d'exercices** : Collection d'exercices prédéfinis
- **Exercices personnalisés** : Création d'exercices par les administrateurs
- **Types d'exercices** :
  - Exercice 7-4-8 (Inspiration 7s, Apnée 4s, Expiration 8s)
  - Exercices de cohérence cardiaque
  - Respirations adaptables selon les besoins

### 3. Session de Méditation
- **Timer interactif** : Minuteur visuel pour guider la respiration
- **Instructions visuelles** : Animations synchronisées avec les phases
- **Contrôles** : Pause, reprise, arrêt des sessions
- **Feedback** : Retour en fin de session

### 4. Historique et Suivi
- **Enregistrement automatique** : Sauvegarde des sessions complétées
- **Historique personnel** : Consultation des sessions passées
- **Statistiques** : Métriques de progression
- **Filtrage** : Tri par date, type d'exercice, durée

### 5. Dashboard Utilisateur
- **Vue d'ensemble** : Résumé de l'activité
- **Graphiques de progression** : Évolution des pratiques
- **Statistiques personnalisées** : Temps total, sessions par semaine
- **Recommandations** : Suggestions d'exercices

---

## 🗃️ Modèle de Données

### Collection Utilisateurs
```json
{
  "_id": "ObjectId",
  "nom": "string",
  "prenom": "string",
  "email": "string (unique)",
  "mot_de_passe": "string (hashé BCrypt)",
  "role": "utilisateur|admin",
  "est_actif": "boolean",
  "date_creation": "Date"
}
```

### Collection Exercices
```json
{
  "_id": "ObjectId",
  "nom": "string",
  "description": "string",
  "duree_inspiration": "number (secondes)",
  "duree_apnee": "number (secondes)",
  "duree_expiration": "number (secondes)",
  "date_creation": "Date"
}
```

### Collection Historiques
```json
{
  "_id": "ObjectId",
  "id_utilisateur": "ObjectId (référence)",
  "id_exercice": "ObjectId (référence)",
  "date_execution": "Date",
  "duree_session": "number (secondes)",
  "completee": "boolean"
}
```

---

## 🔗 API REST

### Endpoints Authentification
- `POST /auth/login` - Connexion utilisateur
- `POST /auth/register` - Inscription utilisateur
- `POST /auth/logout` - Déconnexion

### Endpoints Utilisateurs
- `GET /users/profile` - Profil utilisateur connecté
- `POST /users` - Créer un utilisateur
- `PUT /users/profile` - Modifier le profil
- `DELETE /users/{id}` - Supprimer un utilisateur (admin)

### Endpoints Exercices
- `GET /exercices` - Liste tous les exercices
- `GET /exercices/{id}` - Détail d'un exercice
- `POST /exercices` - Créer un exercice (admin)
- `PUT /exercices/{id}` - Modifier un exercice (admin)
- `DELETE /exercices/{id}` - Supprimer un exercice (admin)

### Endpoints Historiques
- `GET /historiques` - Historique utilisateur
- `POST /historiques` - Enregistrer une session
- `GET /historiques/stats` - Statistiques utilisateur

---

## 🧪 Stratégie de Tests

### Tests Unitaires
- **Frontend** : Tests des composants React, stores Zustand, services API
- **Backend** : Tests des routes, modèles, utilitaires

### Tests d'Intégration
- **Frontend-Backend** : Flux d'authentification, synchronisation des données
- **Base de données** : CRUD operations, requêtes complexes

### Tests Fonctionnels
- **Authentification** : Login, register, autorizations
- **Exercices** : CRUD, sessions de méditation
- **Historique** : Enregistrement, consultation, statistiques

### Tests End-to-End
- **Parcours utilisateur** : Inscription → Exercice → Historique
- **Cross-browser** : Chrome, Firefox, Safari
- **Responsive** : Desktop, tablet, mobile

### Tests de Performance
- **Temps de réponse** : < 200ms pour les API
- **Concurrence** : Support de 100 utilisateurs simultanés
- **Optimisation** : Bundle size, lazy loading

---

## 🚀 Déploiement et Configuration

### Environnement de Développement
```bash
# Frontend
cd application/frontend
npm install
npm run dev

# Backend
cd application/backend
pip install -r requirements.txt
python main.py
```

### Variables d'Environnement
```env
MONGO_URI=mongodb://localhost:27017/
DB_NAME=cesizen_db
SECRET_KEY=votre-clé-secrète-super-sécurisée
JWT_EXPIRATION_DELTA=86400
```

### Build Production
```bash
# Frontend
npm run build

# Backend
python -m flask run --host=0.0.0.0 --port=5001
```

---

## 🔐 Sécurité

### Authentification
- **JWT Tokens** : Gestion sécurisée des sessions
- **Expiration** : Tokens avec durée de vie limitée
- **Hachage** : BCrypt pour les mots de passe

### Protection des Routes
- **Middleware d'authentification** : Vérification des tokens
- **Autorisation basée sur les rôles** : Admin vs Utilisateur
- **CORS** : Configuration des origines autorisées

### Validation des Données
- **Validation côté serveur** : Tous les inputs validés
- **Sanitisation** : Protection contre les injections
- **Rate limiting** : Protection contre les attaques DDoS

---

## 📱 Interface Utilisateur

### Design System
- **Palette de couleurs** : Tons apaisants et naturels
- **Typographie** : Police lisible et moderne
- **Iconographie** : Icônes cohérentes (Lucide React)
- **Responsive** : Adaptation mobile-first

### Expérience Utilisateur
- **Navigation intuitive** : Menu clair et accessible
- **Feedback visuel** : États de chargement, confirmations
- **Accessibilité** : Support des lecteurs d'écran
- **Performance** : Temps de chargement optimisés

### Progressive Web App (PWA)
- **Installation** : Ajout à l'écran d'accueil
- **Offline** : Fonctionnement hors connexion
- **Notifications** : Rappels de sessions
- **Cache** : Optimisation avec Workbox

---

## 📊 Métriques et Analytics

### Indicateurs Clés
- **Utilisateurs actifs** : Daily/Weekly/Monthly Active Users
- **Rétention** : Taux de retour des utilisateurs
- **Sessions** : Nombre et durée des exercices
- **Progression** : Amélioration des utilisateurs

### Données Collectées
- **Sessions de méditation** : Fréquence, durée, types
- **Préférences utilisateur** : Exercices favoris
- **Parcours utilisateur** : Navigation dans l'app
- **Performance** : Temps de chargement, erreurs

---

## 🚧 Roadmap et Évolutions

### Version Actuelle (v1.0)
- ✅ Authentification utilisateur
- ✅ Exercices de respiration de base
- ✅ Historique des sessions
- ✅ Interface responsive

### Prochaines Versions

#### v1.1 - Amélirations UX
- 🔄 Notifications push
- 🔄 Thèmes personnalisables
- 🔄 Mode sombre
- 🔄 Sons d'ambiance

#### v1.2 - Fonctionnalités Avancées
- 📋 Programmes d'entraînement
- 📋 Partage social
- 📋 Intégration capteurs (fréquence cardiaque)
- 📋 Coach IA personnalisé

#### v2.0 - Écosystème Wellness
- 📋 Méditation guidée avec audio
- 📋 Journal de bien-être
- 📋 Communauté d'utilisateurs
- 📋 API publique pour développeurs

---

## 📞 Contact et Support

### Équipe de Développement
- **Développeur Principal** : [Martin Voron]
- **Formation** : CDA3 - CESI
- **Email** : [martin.voron@cesi.fr]

### Ressources
- **Repository** : `/desktop/CESI/CDA3/CesiZen`
- **Documentation** : `cahier-de-tests.md`
- **Tests** : `test-automation/`

### Support Technique
- **Issues** : Via le système de tickets interne
- **Documentation** : README.md dans chaque module
- **Tests** : Suite de tests automatisée

---

## 📄 Licence et Conformité

### Licence
Projet éducatif développé dans le cadre de la formation CESI CDA3

### Conformité RGPD
- **Collecte de données** : Minimale et consentie
- **Stockage** : Sécurisé et chiffré
- **Droit à l'oubli** : Suppression des données utilisateur
- **Portabilité** : Export des données personnelles

### Standards de Qualité
- **Code Quality** : ESLint, TypeScript strict
- **Testing** : Couverture > 80%
- **Documentation** : Complète et maintenue
- **Performance** : Lighthouse score > 90

---

*Documentation générée le {{ date }} pour le projet CesiZen v1.0* 