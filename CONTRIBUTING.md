# 🤝 Guide de Contribution - CesiZen

Merci de votre intérêt pour contribuer à **CesiZen** ! Ce guide vous explique comment participer au développement de notre application de bien-être et méditation.

## 📋 Table des matières

- [🎯 Code de conduite](#-code-de-conduite)
- [🚀 Comment contribuer](#-comment-contribuer)
- [🏗️ Configuration de l'environnement](#️-configuration-de-lenvironnement)
- [📝 Conventions de code](#-conventions-de-code)
- [🧪 Tests](#-tests)
- [📤 Soumettre une contribution](#-soumettre-une-contribution)
- [🐛 Signaler des bugs](#-signaler-des-bugs)
- [💡 Proposer des fonctionnalités](#-proposer-des-fonctionnalités)
- [📖 Documentation](#-documentation)
- [🏷️ Versioning et releases](#️-versioning-et-releases)

## 🎯 Code de conduite

En participant à ce projet, vous acceptez de respecter notre [Code de Conduite](CODE_OF_CONDUCT.md). Nous nous engageons à maintenir une communauté accueillante et inclusive.

### Principes fondamentaux

- **Respect** : Traitez tous les contributeurs avec respect
- **Bienveillance** : Soyez constructif dans vos commentaires
- **Inclusion** : Accueillez les nouveaux contributeurs
- **Professionnalisme** : Maintenez un ton professionnel

## 🚀 Comment contribuer

### Types de contributions acceptées

- 🐛 **Correction de bugs**
- ✨ **Nouvelles fonctionnalités**
- 📚 **Amélioration de la documentation**
- 🎨 **Améliorations de l'interface utilisateur**
- ⚡ **Optimisations de performance**
- 🧪 **Ajout de tests**
- 🔒 **Améliorations de sécurité**

### Workflow de contribution

1. **Fork** le repository
2. **Clone** votre fork localement
3. **Créer** une branche pour votre contribution
4. **Développer** et **tester** vos modifications
5. **Commiter** avec des messages clairs
6. **Pusher** votre branche
7. **Créer** une Pull Request

## 🏗️ Configuration de l'environnement

### Prérequis

- **Python** 3.8+ pour le backend
- **Node.js** 18+ pour le frontend
- **MongoDB** 4.4+ (local ou Atlas)
- **Git** pour le versioning
- **pnpm** (recommandé) ou npm

### Installation rapide

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/CesiZen.git
cd CesiZen

# 2. Installer les hooks de pre-commit
pip install pre-commit
pre-commit install

# 3. Configuration backend
cd application/backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp backend.env.example config.env

# 4. Configuration frontend
cd ../frontend
pnpm install
cp frontend.env.example .env.local

# 5. Initialiser la base de données
cd ../backend
python init_data.py
```

### Structure des branches

- **`main`** : Branche principale (production)
- **`develop`** : Branche de développement
- **`feature/nom-feature`** : Nouvelles fonctionnalités
- **`fix/nom-bug`** : Corrections de bugs
- **`docs/nom-doc`** : Améliorations documentation
- **`refactor/nom-refactor`** : Refactoring

## 📝 Conventions de code

### Convention de nommage des branches

```bash
# Nouvelles fonctionnalités
feature/add-meditation-timer
feature/user-profile-settings

# Corrections de bugs
fix/login-validation-error
fix/memory-leak-meditation-session

# Documentation
docs/update-installation-guide
docs/add-api-documentation

# Refactoring
refactor/auth-middleware
refactor/database-queries
```

### Messages de commit

Utilisez la convention **Conventional Commits** :

```bash
# Format
<type>[scope optionnel]: <description>

# Types acceptés
feat:     # Nouvelle fonctionnalité
fix:      # Correction de bug
docs:     # Documentation uniquement
style:    # Changements de formatage
refactor: # Refactoring (ni bug ni fonctionnalité)
test:     # Ajout ou modification de tests
chore:    # Tâches de maintenance

# Exemples
feat(auth): add JWT token refresh mechanism
fix(meditation): resolve timer accuracy issue
docs(readme): update installation instructions
style(frontend): format components with prettier
test(backend): add unit tests for user routes
```

### Standards de code

#### Backend (Python)

- **Style** : Suivre PEP 8
- **Formatter** : Black avec line-length 88
- **Linter** : Flake8
- **Type hints** : Utilisé quand possible
- **Docstrings** : Format Google Style

```python
def create_meditation_session(
    user_id: str, 
    duration_minutes: int, 
    meditation_type: str
) -> Dict[str, Any]:
    """Create a new meditation session for a user.
    
    Args:
        user_id: The unique identifier of the user
        duration_minutes: Duration of the session in minutes
        meditation_type: Type of meditation (guided, free, etc.)
    
    Returns:
        Dictionary containing session details
        
    Raises:
        ValueError: If duration is invalid
        UserNotFoundError: If user doesn't exist
    """
    pass
```

#### Frontend (TypeScript/React)

- **Style** : ESLint + Prettier
- **Naming** : camelCase pour variables, PascalCase pour composants
- **Components** : Fonctionnels avec hooks
- **Types** : TypeScript strict mode

```typescript
interface MeditationSessionProps {
  duration: number;
  type: 'guided' | 'free' | 'breathing';
  onComplete: (session: MeditationSession) => void;
}

const MeditationSession: React.FC<MeditationSessionProps> = ({
  duration,
  type,
  onComplete
}) => {
  // Component logic
};
```

## 🧪 Tests

### Tests requis

- **Backend** : Tests unitaires pour toutes les routes API
- **Frontend** : Tests pour les composants principaux
- **Intégration** : Tests end-to-end pour les workflows critiques

### Lancer les tests

```bash
# Backend
cd application/backend
python -m pytest -v --cov=.

# Frontend
cd application/frontend
pnpm test
pnpm test:coverage

# Tests d'intégration (à venir)
pnpm test:e2e
```

### Écriture de tests

#### Backend (pytest)

```python
def test_create_user_success():
    """Test successful user creation."""
    response = client.post('/api/users', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'SecurePassword123'
    })
    assert response.status_code == 201
    assert 'user_id' in response.json()
```

#### Frontend (Vitest)

```typescript
import { render, screen } from '@testing-library/react';
import { MeditationTimer } from './MeditationTimer';

test('displays correct duration', () => {
  render(<MeditationTimer duration={300} />);
  expect(screen.getByText('5:00')).toBeInTheDocument();
});
```

## 📤 Soumettre une contribution

### Checklist avant soumission

- [ ] 🧪 Tous les tests passent
- [ ] 📝 Code documenté (commentaires, docstrings)
- [ ] 🎨 Code formaté selon les conventions
- [ ] 📋 Pas de conflits avec la branche de base
- [ ] 🔒 Pas de données sensibles dans les commits
- [ ] 📖 Documentation mise à jour si nécessaire

### Créer une Pull Request

1. **Titre clair** : Résumez votre contribution en une phrase
2. **Description détaillée** :
   - Que fait votre contribution ?
   - Pourquoi cette modification est-elle nécessaire ?
   - Comment l'avez-vous testée ?
3. **Screenshots** : Pour les modifications UI
4. **Breaking changes** : Mentionnez les changements incompatibles

#### Template de Pull Request

```markdown
## 📋 Description

Brève description de votre contribution.

## 🔄 Type de changement

- [ ] Bug fix (non-breaking change qui corrige un problème)
- [ ] New feature (non-breaking change qui ajoute une fonctionnalité)
- [ ] Breaking change (changement qui affecte la compatibilité)
- [ ] Documentation update

## 🧪 Tests

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration validés
- [ ] Tests manuels effectués

## 📱 Screenshots (si applicable)

Ajoutez des captures d'écran pour les modifications UI.

## ✅ Checklist

- [ ] Mon code suit les conventions du projet
- [ ] J'ai effectué une auto-révision de mon code
- [ ] J'ai commenté les parties complexes
- [ ] Mes modifications ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests couvrant mes modifications
- [ ] Tous les tests passent en local
```

## 🐛 Signaler des bugs

### Avant de signaler

1. **Vérifiez** si le bug n'a pas déjà été signalé
2. **Reproduisez** le bug de manière consistante
3. **Testez** avec la dernière version

### Informations à inclure

- **Environnement** : OS, navigateur, versions
- **Étapes de reproduction** : Liste détaillée
- **Comportement attendu** vs **comportement observé**
- **Screenshots/vidéos** si pertinent
- **Logs d'erreur** si disponibles

## 💡 Proposer des fonctionnalités

### Process de proposition

1. **Discuter** d'abord dans les Issues
2. **Créer** un RFC (Request for Comments) si complexe
3. **Obtenir** un accord avant de commencer le développement

### Template de proposition

```markdown
## 🎯 Problème à résoudre

Décrivez le problème ou le besoin.

## 💡 Solution proposée

Décrivez votre idée de solution.

## 🔄 Alternatives considérées

Autres approches envisagées.

## 📊 Impact

- Impact sur les utilisateurs
- Impact technique
- Effort de développement estimé
```

## 📖 Documentation

### Types de documentation

- **README** : Instructions d'installation et usage
- **Code comments** : Explications in-line
- **API docs** : Documentation des endpoints
- **User guides** : Guides d'utilisation
- **Developer docs** : Documentation technique

### Standards de documentation

- **Clarté** : Langage simple et direct
- **Exemples** : Code d'exemple fonctionnel
- **Structure** : Organisation logique
- **Mise à jour** : Synchronisé avec le code

## 🏷️ Versioning et releases

### Semantic Versioning

- **MAJOR** : Changements incompatibles (2.0.0)
- **MINOR** : Nouvelles fonctionnalités compatibles (1.1.0)
- **PATCH** : Corrections de bugs (1.0.1)

### Process de release

1. **Feature freeze** sur develop
2. **Tests** complets et validation
3. **Merge** vers main
4. **Tag** de version
5. **Publication** des notes de release

## 🙋‍♀️ Support et questions

- **💬 Discussions** : Pour les questions générales
- **🐛 Issues** : Pour les bugs et feature requests
- **📧 Email** : [contact@cesizen.app](mailto:contact@cesizen.app)
- **💬 Discord** : [Serveur CesiZen](https://discord.gg/cesizen)

## 🙏 Remerciements

Merci à tous les contributeurs qui font de CesiZen un projet formidable !

- Chaque contribution, petite ou grande, est précieuse
- Votre engagement aide à créer une meilleure expérience pour tous
- Ensemble, nous construisons quelque chose d'important

---

<div align="center">

**[⬆ Retour au sommet](#-guide-de-contribution---cesizen)**

Happy coding! 🚀

</div> 