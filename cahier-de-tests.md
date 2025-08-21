# Cahier de Tests - Application CesiZen

## 📋 Table des Matières
1. [Introduction](#introduction)
2. [Environnement de Test](#environnement-de-test)
3. [Tests Unitaires](#tests-unitaires)
4. [Tests d'Intégration](#tests-dintégration)
5. [Tests Fonctionnels](#tests-fonctionnels)
6. [Tests End-to-End](#tests-end-to-end)
7. [Tests de Non-Régression](#tests-de-non-régression)
8. [Tests de Performance](#tests-de-performance)
9. [Tests de Sécurité](#tests-de-sécurité)
10. [Critères d'Acceptation](#critères-dacceptation)

---

##  Introduction

### Objectif
Ce cahier de tests définit l'ensemble des tests à effectuer pour valider le bon fonctionnement de l'application CesiZen - une application de respiration et cohérence cardiaque.

### Périmètre de l'Application
- **Frontend**: React/TypeScript avec Vite, Tailwind CSS
- **Backend**: Flask/Python avec MongoDB
- **Fonctionnalités principales**:
  - Authentification utilisateur
  - Gestion des exercices de respiration
  - Suivi de l'historique des sessions
  - Interface de méditation guidée
  - Dashboard utilisateur

---

##  Environnement de Test

### Configurations de Test
- **Développement**: localhost:5173 (frontend) + localhost:5001 (backend)
- **Staging**: Environnement de pré-production
- **Production**: Environnement final

### Données de Test
- Base de données MongoDB de test avec jeux de données anonymisées
- Utilisateurs de test avec différents rôles (utilisateur, admin)
- Exercices de respiration variés

---

##  Tests Unitaires

### Frontend (React/TypeScript)

#### 1. Composants d'Interface
| Test ID | Composant | Description | Critère de Validation |
|---------|-----------|-------------|----------------------|
| FU-001 | LoginForm | Validation des champs email/password | Affichage des erreurs appropriées |
| FU-002 | RegisterForm | Validation de l'inscription | Vérification des contraintes de mot de passe |
| FU-003 | ExerciseCard | Affichage des informations d'exercice | Durées correctement formatées |
| FU-004 | MeditationTimer | Fonctionnement du timer | Décompte précis des secondes |
| FU-005 | Dashboard | Affichage des statistiques | Calculs corrects des métriques |

#### 2. Stores Zustand
| Test ID | Store | Description | Critère de Validation |
|---------|-------|-------------|----------------------|
| FU-006 | authStore | Gestion de l'authentification | État utilisateur persistant |
| FU-007 | exerciseStore | Gestion des exercices | CRUD operations correctes |
| FU-008 | historyStore | Gestion de l'historique | Tri et filtrage fonctionnels |

#### 3. Services API
| Test ID | Service | Description | Critère de Validation |
|---------|---------|-------------|----------------------|
| FU-009 | authService | Appels API authentification | Gestion des tokens JWT |
| FU-010 | exerciseService | Appels API exercices | Réponses correctement formatées |
| FU-011 | userService | Appels API utilisateurs | Gestion des erreurs HTTP |

### Backend (Flask/Python)

#### 4. Routes API
| Test ID | Route | Méthode | Description | Critère de Validation |
|---------|-------|---------|-------------|----------------------|
| BU-001 | /auth/login | POST | Connexion utilisateur | Token JWT valide retourné |
| BU-002 | /auth/register | POST | Inscription utilisateur | Hachage du mot de passe |
| BU-003 | /users/profile | GET | Profil utilisateur | Données complètes retournées |
| BU-004 | /exercices | GET | Liste des exercices | Format JSON correct |
| BU-005 | /exercices | POST | Création d'exercice | Validation des durées |
| BU-006 | /historiques | GET | Historique sessions | Filtrage par utilisateur |
| BU-007 | /historiques | POST | Enregistrer session | Timestamp correct |

#### 5. Modèles de Données
| Test ID | Modèle | Description | Critère de Validation |
|---------|--------|-------------|----------------------|
| BU-008 | User | Modèle utilisateur | Validation email unique |
| BU-009 | Exercise | Modèle exercice | Durées en secondes valides |
| BU-010 | History | Modèle historique | Référence utilisateur/exercice |

#### 6. Utilitaires
| Test ID | Utilitaire | Description | Critère de Validation |
|---------|------------|-------------|----------------------|
| BU-011 | JWT Helper | Génération/validation tokens | Expiration correcte |
| BU-012 | Password Hash | Hachage sécurisé | BCrypt avec salt |
| BU-013 | Database Connection | Connexion MongoDB | Pool de connexions |

---

##  Tests d'Intégration

### Frontend-Backend
| Test ID | Description | Scénario | Critère de Validation |
|---------|-------------|----------|----------------------|
| INT-001 | Flux d'authentification complet | Login → Token → Accès protégé | Session maintenue |
| INT-002 | Création et exécution d'exercice | Sélection → Configuration → Exécution | Sauvegarde historique |
| INT-003 | Synchronisation des données | Actions frontend → Persistance backend | Cohérence des données |

### Base de Données
| Test ID | Description | Scénario | Critère de Validation |
|---------|-------------|----------|----------------------|
| INT-004 | CRUD Utilisateurs | Create, Read, Update, Delete | Intégrité référentielle |
| INT-005 | CRUD Exercices | Gestion complète exercices | Contraintes respectées |
| INT-006 | Requêtes complexes | Jointures et agrégations | Performance acceptable |

---

##  Tests Fonctionnels

### 1. Authentification et Autorisation
| Test ID | Fonctionnalité | Scénario de Test | Données d'Entrée | Résultat Attendu |
|---------|----------------|------------------|-------------------|------------------|
| TF-001 | Connexion utilisateur valide | Saisie email/password corrects | alice@test.com / password123 | Redirection vers dashboard |
| TF-002 | Connexion échouée | Saisie credentials incorrects | wrong@test.com / wrongpass | Message d'erreur affiché |
| TF-003 | Inscription utilisateur | Création nouveau compte | Formulaire complet | Compte créé, email confirmation |
| TF-004 | Déconnexion | Clic sur bouton déconnexion | Session active | Token supprimé, redirection |
| TF-005 | Accès pages protégées | Tentative accès sans authentification | URL directe | Redirection vers login |

### 2. Gestion des Exercices
| Test ID | Fonctionnalité | Scénario de Test | Données d'Entrée | Résultat Attendu |
|---------|----------------|------------------|-------------------|------------------|
| TF-006 | Affichage liste exercices | Accès page exercices | - | Liste complète affichée |
| TF-007 | Détail d'un exercice | Clic sur exercice | ID exercice valide | Informations détaillées |
| TF-008 | Création exercice (admin) | Formulaire création | Nom, durées valides | Exercice créé et visible |
| TF-009 | Modification exercice (admin) | Édition exercice existant | Nouvelles durées | Modifications sauvegardées |
| TF-010 | Suppression exercice (admin) | Suppression avec confirmation | ID exercice | Exercice supprimé |

### 3. Méditation et Respiration
| Test ID | Fonctionnalité | Scénario de Test | Données d'Entrée | Résultat Attendu |
|---------|----------------|------------------|-------------------|------------------|
| TF-011 | Démarrage session | Sélection exercice + start | Exercice 7-4-8 | Timer démarre correctement |
| TF-012 | Pause/Reprise session | Pause pendant exercice | Clic pause/play | État conservé |
| TF-013 | Arrêt prématuré | Stop avant fin | Clic stop | Session enregistrée partiellement |
| TF-014 | Fin de session complète | Exercice jusqu'au bout | Timer à 0 | Session sauvegardée, félicitations |
| TF-015 | Instructions visuelles | Affichage guide respiration | Exercice en cours | Animations synchronisées |

### 4. Historique et Statistiques
| Test ID | Fonctionnalité | Scénario de Test | Données d'Entrée | Résultat Attendu |
|---------|----------------|------------------|-------------------|------------------|
| TF-016 | Affichage historique | Accès page historique | - | Sessions triées par date |
| TF-017 | Filtrage historique | Filtre par exercice | Type exercice | Liste filtrée |
| TF-018 | Statistiques utilisateur | Dashboard personnel | - | Métriques calculées |
| TF-019 | Graphiques progression | Évolution dans le temps | Sessions sur 30j | Courbes affichées |
| TF-020 | Export données | Téléchargement CSV | Période sélectionnée | Fichier généré |

### 5. Profil Utilisateur
| Test ID | Fonctionnalité | Scénario de Test | Données d'Entrée | Résultat Attendu |
|---------|----------------|------------------|-------------------|------------------|
| TF-021 | Affichage profil | Accès page profil | - | Informations utilisateur |
| TF-022 | Modification profil | Édition nom/prénom | Nouvelles valeurs | Profil mis à jour |
| TF-023 | Changement mot de passe | Formulaire changement | Ancien + nouveau MDP | Mot de passe modifié |
| TF-024 | Gestion préférences | Configuration personnelle | Options UI | Préférences sauvegardées |

---

##  Tests End-to-End

### Parcours Utilisateur Complets
| Test ID | Parcours | Description | Étapes | Validation |
|---------|----------|-------------|---------|------------|
| E2E-001 | Première utilisation | Inscription → Premier exercice | 1. Inscription<br>2. Connexion<br>3. Découverte exercices<br>4. Session complète | Utilisateur autonome |
| E2E-002 | Utilisation régulière | Retour utilisateur habituel | 1. Connexion<br>2. Consultation historique<br>3. Nouvel exercice<br>4. Déconnexion | Workflow fluide |
| E2E-003 | Administration | Gestion par admin | 1. Connexion admin<br>2. Création exercice<br>3. Gestion utilisateurs<br>4. Statistiques | Fonctions admin opérationnelles |

### Tests Cross-Browser
| Test ID | Navigateur | Résolution | Fonctionnalités Testées | Critère de Validation |
|---------|------------|------------|-------------------------|----------------------|
| E2E-004 | Chrome | 1920x1080 | Toutes fonctionnalités | 100% fonctionnel |
| E2E-005 | Firefox | 1920x1080 | Toutes fonctionnalités | 100% fonctionnel |
| E2E-006 | Safari | 1920x1080 | Toutes fonctionnalités | 100% fonctionnel |
| E2E-007 | Mobile Chrome | 375x667 | Interface responsive | Utilisabilité mobile |

---

##  Tests de Non-Régression

### Suites de Tests Automatisées
| Suite ID | Description | Fréquence | Déclencheur |
|----------|-------------|-----------|-------------|
| NR-001 | Tests critiques | À chaque commit | CI/CD Pipeline |
| NR-002 | Tests complets | Nightly | Nightly Build |
| NR-003 | Tests performance | Hebdomadaire | Release candidate |
| NR-004 | Tests sécurité | Avant release | Déploiement production |

### Scénarios de Régression
| Test ID | Fonctionnalité | Description | Impact |
|---------|----------------|-------------|---------|
| NR-005 | Authentification | Vérification non-régression login | Critique |
| NR-006 | Timer méditation | Précision du décompte | Haute |
| NR-007 | Sauvegarde historique | Persistance des données | Haute |
| NR-008 | Interface responsive | Affichage multi-devices | Moyenne |

---

##  Tests de Performance

### Métriques de Performance
| Métrique | Valeur Cible | Valeur Limite | Test |
|----------|--------------|---------------|------|
| Temps de chargement initial | < 2s | < 3s | Lighthouse |
| Temps de réponse API | < 200ms | < 500ms | Load Testing |
| Taille bundle JS | < 500KB | < 1MB | Bundle Analyzer |
| Score Lighthouse | > 90 | > 80 | Automated Testing |

### Tests de Charge
| Test ID | Scénario | Utilisateurs Simultanés | Durée | Critère |
|---------|----------|-------------------------|-------|---------|
| PERF-001 | Charge normale | 100 | 5 min | < 500ms réponse |
| PERF-002 | Pic de charge | 500 | 2 min | < 1s réponse |
| PERF-003 | Stress test | 1000 | 30s | Pas de crash |

---

##  Tests de Sécurité

### Vulnérabilités à Tester
| Test ID | Type | Description | Outil | Critère |
|---------|------|-------------|-------|---------|
| SEC-001 | Injection SQL | Tentatives injection | SQLMap | Aucune vulnérabilité |
| SEC-002 | XSS | Cross-site scripting | Burp Suite | Pas d'exécution script |
| SEC-003 | CSRF | Cross-site request forgery | OWASP ZAP | Tokens CSRF valides |
| SEC-004 | Authentication | Bypass tentatives | Manuel | Accès restreint |
| SEC-005 | Authorization | Élévation privilèges | Manuel | Rôles respectés |

### Tests d'Authentification
| Test ID | Scénario | Description | Résultat Attendu |
|---------|----------|-------------|------------------|
| SEC-006 | JWT Manipulation | Modification token | Accès refusé |
| SEC-007 | Session Fixation | Réutilisation session | Nouvelle session |
| SEC-008 | Brute Force | Tentatives multiples | Compte bloqué |
| SEC-009 | Password Policy | Mots de passe faibles | Rejet avec message |

---

##  Critères d'Acceptation

### Critères de Passage
- **Tests Unitaires**: 95% de couverture de code
- **Tests Fonctionnels**: 100% des cas critiques passent
- **Tests Performance**: Toutes les métriques dans les cibles
- **Tests Sécurité**: Aucune vulnérabilité critique
- **Tests Cross-Browser**: Support total Chrome, Firefox, Safari

### Critères de Livraison
- Tous les tests de non-régression passent
- Documentation des tests à jour
- Rapports de test générés et archivés
- Formation équipe sur nouveaux tests

### Gestion des Anomalies
- **Critique**: Blocage livraison, correction immédiate
- **Majeure**: Correction avant livraison
- **Mineure**: Correction version suivante
- **Cosmétique**: Backlog produit

---

##  Suivi et Métriques

### Indicateurs de Qualité
- Taux de succès des tests (objectif: > 98%)
- Temps d'exécution des suites de tests
- Couverture de code par composant
- Nombre d'anomalies par sévérité

### Rapports de Test
- Rapport quotidien (tests automatisés)
- Rapport de sprint (tests manuels)
- Rapport de release (bilan complet)
- Tableaux de bord temps réel

---

*Version: 1.0 | Date: $(date) | Responsable: Équipe QA CesiZen* 
