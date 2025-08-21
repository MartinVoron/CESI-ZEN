# 🧘‍♀️ CesiZen - Application de Bien-être et Méditation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248.svg)](https://www.mongodb.com/)

> Une application web moderne dédiée au bien-être mental, proposant des séances de méditation, des exercices de relaxation et un suivi personnalisé de la santé mentale.

## 📋 Table des matières

- [🎯 À propos](#-à-propos)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Installation rapide](#-installation-rapide)
- [📖 Documentation détaillée](#-documentation-détaillée)
- [🧪 Tests](#-tests)
- [🤝 Contribution](#-contribution)
- [📝 License](#-license)

## 🎯 À propos

CesiZen est une application web full-stack développée pour promouvoir le bien-être mental et la relaxation. Elle offre une expérience utilisateur moderne et intuitive pour la pratique de la méditation, le suivi de la santé mentale et la gestion du stress.

### 🎯 Objectifs du projet

- Démocratiser l'accès aux pratiques de bien-être
- Fournir un suivi personnalisé de la santé mentale
- Créer une communauté bienveillante autour du bien-être
- Proposer des outils scientifiquement validés

## ✨ Fonctionnalités

### 🧘‍♂️ Méditation & Relaxation
- **Séances guidées** : Méditations audio avec différents niveaux
- **Timer personnalisé** : Sessions libres avec minuteur configurable
- **Programmes thématiques** : Stress, sommeil, concentration, etc.
- **Suivi des progrès** : Historique des séances et statistiques

### 👤 Gestion utilisateur
- **Authentification sécurisée** : Inscription/connexion avec JWT
- **Profils personnalisés** : Préférences et objectifs individuels
- **Tableaux de bord** : Vue d'ensemble des activités et progrès
- **Rôles utilisateur** : Système d'administration intégré

### 📊 Suivi de santé
- **Questionnaires bien-être** : Évaluation régulière de l'état mental
- **Graphiques de progression** : Visualisation des tendances
- **Recommandations** : Suggestions personnalisées d'activités
- **Exports de données** : Rapports pour professionnels de santé

### 📱 Expérience utilisateur
- **Design responsive** : Optimisé pour tous les appareils
- **PWA Ready** : Installation possible sur mobile/desktop
- **Interface moderne** : Design épuré avec Tailwind CSS
- **Accessibilité** : Conforme aux standards WCAG

## 🏗️ Architecture

```
CesiZen/
├── 🖥️  application/
│   ├── 🐍 backend/           # API Flask + MongoDB
│   │   ├── routes/           # Endpoints API REST
│   │   ├── models/           # Modèles de données
│   │   ├── utils/            # Utilitaires et middleware
│   │   └── config/           # Configuration et base de données
│   └── ⚛️  frontend/         # Application React + TypeScript
│       ├── src/
│       │   ├── components/   # Composants réutilisables
│       │   ├── pages/        # Pages de l'application
│       │   ├── services/     # Services API
│       │   ├── stores/       # Gestion d'état (Zustand)
│       │   └── types/        # Types TypeScript
│       └── public/           # Assets statiques
├── 📚 Documentation/         # Guides et documentation
└── 🧪 Tests/                # Tests unitaires et d'intégration
```

### 🔧 Stack technique

**Backend**
- **Runtime** : Python 3.8+
- **Framework** : Flask 2.3.3
- **Base de données** : MongoDB
- **Authentification** : JWT (PyJWT)
- **Sécurité** : bcrypt, CORS
- **ORM** : PyMongo

**Frontend**
- **Framework** : React 18.2+
- **Langage** : TypeScript 5.2+
- **Bundler** : Vite
- **Styling** : Tailwind CSS
- **State Management** : Zustand
- **HTTP Client** : Axios
- **Routing** : React Router Dom 7.6+
- **PWA** : Vite Plugin PWA

**DevOps & Outils**
- **Conteneurisation** : Docker & Docker Compose
- **Tests** : Vitest (frontend), pytest (backend)
- **Linting** : ESLint, Prettier
- **CI/CD** : GitHub Actions
- **Package Manager** : pnpm (frontend), pip (backend)
- **Monitoring** : Health checks intégrés
- **Sécurité** : Dependabot, Trivy scanner

## 🚀 Installation rapide

### 🐳 Option 1: Docker (Recommandé pour le développement)

#### Prérequis
- **Docker** & **Docker Compose** installés
- **Git** pour cloner le repository

#### Installation en une commande
```bash
# Cloner le repository
git clone https://github.com/votre-username/CesiZen.git
cd CesiZen

# Copier les fichiers d'environnement
cp application/backend/env.dev.template application/backend/.env.dev
cp application/frontend/env.local.template application/frontend/.env.local

# Lancer la stack complète
docker compose -f docker-compose.dev.yml up --build
```

#### Accès aux services
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000
- **MongoDB** : http://localhost:27017
- **Mongo Express** : http://localhost:8081

#### Vérification santé
```bash
# Test du backend
curl http://localhost:5000/health

# Test du frontend
curl http://localhost:5173

# Test de l'API via le proxy frontend
curl http://localhost:5173/api/health
```

### 🔧 Option 2: Installation locale

#### Prérequis
- **Python** 3.11+ 
- **Node.js** 18+ 
- **MongoDB** 4.4+ (local ou Atlas)
- **pnpm** (recommandé) ou npm

#### 1️⃣ Cloner le repository

```bash
git clone https://github.com/votre-username/CesiZen.git
cd CesiZen
```

#### 2️⃣ Configuration Backend

```bash
cd application/backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configuration
cp env.dev.template .env.dev
# Éditer .env.dev avec vos valeurs MongoDB locales

# Initialiser la base de données
python init_data.py
python init_informations_sante.py

# Lancer le serveur
python main.py
```

#### 3️⃣ Configuration Frontend

```bash
cd application/frontend

# Installer les dépendances
pnpm install

# Configuration
cp env.local.template .env.local
# Éditer .env.local avec vos valeurs

# Lancer en développement
pnpm dev
```

#### 4️⃣ Accès à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000
- **Health Check** : http://localhost:5000/health

### 🔧 Dépannage

#### Docker
```bash
# Voir les logs des services
docker compose -f docker-compose.dev.yml logs backend
docker compose -f docker-compose.dev.yml logs frontend

# Rebuild complet
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build

# Vérifier l'état des services
docker compose -f docker-compose.dev.yml ps
```

#### Problèmes courants
- **Port déjà utilisé** : Modifier les ports dans `docker-compose.dev.yml`
- **Erreur MongoDB** : Vérifier que Docker dispose d'assez de mémoire (>2GB)
- **Hot-reload ne fonctionne pas** : Vérifier les volumes dans docker-compose
- **CORS errors** : Vérifier la configuration `CORS_ORIGINS` dans `.env.dev`

## 📖 Documentation détaillée

- 📘 **[Guide d'installation complet](Guide_Installation_CesiZen.md)**
- 📗 **[Documentation technique](Documentation_CesiZen.md)**
- 📙 **[Cahier de tests](cahier-de-tests.md)**
- 📕 **[Spécifications projet](Sujet%20Détaillé%20Projet%20CESIZen.pdf)**

### 🔗 Liens utiles

- **Backend README** : [application/backend/README.md](application/backend/README.md)
- **Frontend README** : [application/frontend/README.md](application/frontend/README.md)
- **API Documentation** : À venir
- **Contributing Guide** : [CONTRIBUTING.md](CONTRIBUTING.md)

## 🧪 Tests

### Backend
```bash
cd application/backend
python -m pytest tests/
# ou
python test_admin_create.py
python test_health_api.py
python test_user_forbidden.py
```

### Frontend
```bash
cd application/frontend
pnpm test        # Tests unitaires
pnpm test:ui     # Interface graphique des tests
pnpm coverage    # Rapport de couverture
```

## 🤝 Contribution

Nous accueillons toutes les contributions ! Voici comment participer :

1. **Fork** le projet
2. **Créer** une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Commiter** vos changements (`git commit -m 'Add: Amazing Feature'`)
4. **Pusher** sur la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### 📋 Guidelines

- Suivre les conventions de code existantes
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation si nécessaire
- Respecter le [Code of Conduct](CODE_OF_CONDUCT.md)

## 🏷️ Versioning

Nous utilisons [SemVer](https://semver.org/) pour la gestion des versions.

- **Actuelle** : v1.0.0-beta
- **Prochaine** : v1.0.0 (stable)

## 👥 Équipe

- **[Votre Nom]** - *Développeur Full-Stack* - [@votre-github](https://github.com/votre-username)

## 📝 License

Ce projet est sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **CESI École d'Ingénieurs** pour le cadre pédagogique
- **Communauté Open Source** pour les outils et bibliothèques
- **Beta testeurs** pour leurs retours précieux

---

<div align="center">

**[⬆ Retour au sommet](#-cesizen---application-de-bien-être-et-méditation)**

Made with ❤️ by **CesiZen Team**

test commit

</div> 