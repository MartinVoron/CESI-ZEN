# CesiZen Backend API

API REST pour l'application CesiZen - Exercices de respiration et cohérence cardiaque.

## 🚀 Installation et Configuration

### Prérequis
- Python 3.8+
- MongoDB 4.4+
- pip

### Installation des dépendances
```bash
pip install -r requirements.txt
```

### Configuration
1. Copiez le fichier `config.env` et configurez vos variables d'environnement :
```env
MONGO_URI=mongodb://localhost:27017/
DB_NAME=cesizen_db
SECRET_KEY=votre-clé-secrète-super-sécurisée
JWT_EXPIRATION_DELTA=86400
```

2. Démarrez MongoDB sur votre machine

3. Initialisez la base de données avec des données d'exemple :
```bash
python init_data.py
```

### Démarrage du serveur
```bash
python main.py
```

Le serveur sera disponible sur `http://localhost:5001`

## 📚 Documentation de l'API

### 🔐 Authentification

#### POST /auth/login
Connexion utilisateur

**Body:**
```json
{
  "email": "alice.dupont@example.com",
  "mot_de_passe": "password123"
}
```

**Réponse:**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": "6653ff0a3a6e8a2d4c1b8e11",
    "nom": "Dupont",
    "prenom": "Alice",
    "email": "alice.dupont@example.com",
    "role": "utilisateur"
  }
}
```

### 👥 Utilisateurs

#### GET /users/profile
Récupérer le profil de l'utilisateur connecté (nécessite authentification)

**Réponse:**
```json
{
  "id": "6653ff0a3a6e8a2d4c1b8e11",
  "nom": "Dupont",
  "prenom": "Alice",
  "email": "alice.dupont@example.com",
  "role": "utilisateur",
  "est_actif": true
}
```

#### POST /users
Créer un nouvel utilisateur

**Body:**
```json
{
  "nom": "Martin",
  "prenom": "Jean",
  "email": "jean.martin@example.com",
  "mot_de_passe": "motdepasse123",
  "role": "utilisateur"
}
```

### 🧘 Exercices

#### GET /exercices
Récupérer tous les exercices de respiration

**Réponse:**
```json
[
  {
    "id": "6653ff363a6e8a2d4c1b8e13",
    "nom": "Exercice 7-4-8",
    "description": "Inspire 7s, Apnée 4s, Expire 8s. Pour la cohérence cardiaque.",
    "duree_inspiration": 7,
    "duree_apnee": 4,
    "duree_expiration": 8
  }
]
```

#### GET /exercices/{id}
Récupérer un exercice spécifique

#### POST /exercices
Créer un nouvel exercice

**Body:**
```json
{
  "nom": "Exercice 6-2-6",
  "description": "Nouvel exercice de respiration",
  "duree_inspiration": 6,
  "duree_apnee": 2,
  "duree_expiration": 6
}
```

### 📊 Historiques

#### GET /historiques
Récupérer l'historique des exercices (filtré par utilisateur si connecté)

**Réponse:**
```json
[
  {
    "id": "6653ff473a6e8a2d4c1b8e14",
    "date_execution": "2025-05-20T08:00:00",
    "exercice": {
      "id": "6653ff363a6e8a2d4c1b8e13",
      "nom": "Exercice 7-4-8",
      "duree_inspiration": 7,
      "duree_apnee": 4,
      "duree_expiration": 8
    },
    "utilisateur": {
      "id": "6653ff0a3a6e8a2d4c1b8e11",
      "nom": "Dupont",
      "prenom": "Alice"
    }
  }
]
```

#### POST /historiques
Enregistrer une session d'exercice (nécessite authentification)

**Body:**
```json
{
  "id_exercice": "6653ff363a6e8a2d4c1b8e13",
  "date_execution": "2025-05-27T10:30:00Z"
}
```

## 🗄️ Structure de la Base de Données

### Collection `utilisateurs`
```json
{
  "_id": ObjectId,
  "nom": "string",
  "prenom": "string", 
  "email": "string",
  "mot_de_passe": "string (hashé)",
  "role": "utilisateur|admin",
  "est_actif": boolean,
  "date_creation": Date
}
```

### Collection `exercices`
```json
{
  "_id": ObjectId,
  "nom": "string",
  "description": "string",
  "duree_inspiration": number,
  "duree_apnee": number,
  "duree_expiration": number,
  "date_creation": Date
}
```

### Collection `historiques_exercices`
```json
{
  "_id": ObjectId,
  "date_execution": Date,
  "id_utilisateur": ObjectId,
  "id_exercice": ObjectId
}
```

### Collection `contenus`
```json
{
  "_id": ObjectId,
  "titre": "string",
  "texte": "string",
  "date_creation": Date,
  "date_mise_a_jour": Date
}
```

## 🔑 Comptes de Test

Après l'initialisation de la base de données :

- **Utilisateur standard :** `alice.dupont@example.com` / `password123`
- **Administrateur :** `admin@cesizen.fr` / `admin123`

## 🛠️ Développement

### Structure du projet
```
backend/
├── config/
│   ├── database.py      # Configuration MongoDB
│   └── config.py        # Variables de configuration
├── routes/
│   ├── auth/           # Routes d'authentification
│   ├── users/          # Routes utilisateurs
│   ├── exercices/      # Routes exercices
│   └── historiques/    # Routes historiques
├── main.py             # Point d'entrée de l'application
├── init_data.py        # Script d'initialisation
└── requirements.txt    # Dépendances Python
```

### Tests avec curl

```bash
# Test de connexion
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice.dupont@example.com","mot_de_passe":"password123"}'

# Récupérer les exercices
curl http://localhost:5001/exercices

# Créer un historique (avec cookie de session)
curl -X POST http://localhost:5001/historiques \
  -H "Content-Type: application/json" \
  -b "access_token=YOUR_TOKEN" \
  -d '{"id_exercice":"6653ff363a6e8a2d4c1b8e13"}'
```

## 🔧 Dépannage

### Erreur de connexion MongoDB
- Vérifiez que MongoDB est démarré : `mongod`
- Vérifiez l'URI dans `config.env`

### Erreur de CORS
- L'origine `http://localhost:5173` est autorisée par défaut
- Modifiez `main.py` pour ajouter d'autres origines si nécessaire

## 📝 Notes

- Les mots de passe sont hashés avec bcrypt
- L'authentification utilise JWT avec cookies HttpOnly
- Les ObjectId MongoDB sont automatiquement convertis en strings dans les réponses JSON
- Toutes les dates sont en format ISO 8601 