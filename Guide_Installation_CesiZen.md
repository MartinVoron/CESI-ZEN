# 🧘‍♀️ Guide d'Installation CesiZen
*Application de respiration et cohérence cardiaque*
---

## 📋 Qu'est-ce que CesiZen ?

CesiZen est une application qui vous aide à :
- Faire des exercices de respiration guidés
- Gérer votre stress et anxiété
- Suivre vos progrès en méditation
- Avoir un moment de calme dans votre journée

---

## 🖥️ Étape 1 : Préparer votre ordinateur

### Ce dont vous avez besoin :
- Un ordinateur sous Windows, Mac ou Linux
- Une connexion internet
- Environ 30 minutes de votre temps

### Logiciels à installer avant de commencer :

#### 1️⃣ Node.js (pour faire fonctionner l'interface)
- **Aller sur** : https://nodejs.org
- **Cliquer sur** le bouton vert "LTS" (version recommandée)
- **Télécharger** et **installer** en suivant les instructions
- **Vérifier l'installation** :
  - Ouvrir l'invite de commande (tapez "cmd" dans le menu Windows)
  - Taper : `node --version`
  - Vous devriez voir quelque chose comme "v18.17.0"

#### 2️⃣ Python (pour faire fonctionner le serveur)
- **Aller sur** : https://python.org
- **Télécharger** Python 3.9 ou plus récent
- ⚠️ **IMPORTANT** : Cocher "Add Python to PATH" pendant l'installation
- **Vérifier l'installation** :
  - Dans l'invite de commande, taper : `python --version`
  - Vous devriez voir "Python 3.x.x"

#### 3️⃣ MongoDB (pour sauvegarder vos données)
- **Aller sur** : https://www.mongodb.com/try/download/community
- **Télécharger** MongoDB Community Server
- **Installer** avec les options par défaut
- Le service MongoDB va se lancer automatiquement

---

## 📁 Étape 2 : Récupérer l'application

### Option A : Si vous avez reçu un dossier
1. **Extraire** le fichier ZIP dans un endroit facile à retrouver (ex: Bureau)
2. **Renommer** le dossier en "CesiZen" si ce n'est pas déjà fait

### Option B : Si vous devez télécharger depuis internet
1. **Télécharger** le code source depuis le lien fourni
2. **Extraire** dans un dossier "CesiZen" sur votre Bureau

---

## 🚀 Étape 3 : Installation de l'application

### 🎯 Ouvrir l'invite de commande
1. **Appuyer** sur `Windows + R`
2. **Taper** `cmd` et appuyer sur Entrée
3. Une fenêtre noire s'ouvre (c'est normal !)

### 🎯 Naviguer jusqu'au dossier de l'application
```bash
# Aller sur le Bureau (remplacez "VotreNom" par votre nom d'utilisateur)
cd C:\Users\VotreNom\Desktop\CesiZen
```

### 🎯 Installer la partie "Interface utilisateur"
```bash
# Aller dans le dossier frontend
cd application\frontend

# Installer les composants nécessaires (cela peut prendre quelques minutes)
npm install
```
*⏳ Patientez... Des milliers de petits fichiers se téléchargent !*

### 🎯 Installer la partie "Serveur"
```bash
# Revenir au dossier principal
cd ..\backend

# Installer les composants Python
pip install -r requirements.txt
```

---

## ⚙️ Étape 4 : Configuration initiale

### 🎯 Configurer la base de données
1. **Vérifier** que MongoDB fonctionne :
   - Ouvrir le "Gestionnaire des tâches" (Ctrl + Shift + Esc)
   - Onglet "Services"
   - Chercher "MongoDB" - il doit être "En cours d'exécution"

### 🎯 Créer le fichier de configuration
Dans le dossier `application/backend`, créer un fichier nommé `.env` avec ce contenu :
```
MONGO_URI=mongodb://localhost:27017/
DB_NAME=cesizen_db
SECRET_KEY=ma-cle-secrete-super-securisee-123456
JWT_EXPIRATION_DELTA=86400
```

---

## 🏃‍♂️ Étape 5 : Démarrer l'application

### 🎯 Démarrer le serveur (Backend)
1. **Ouvrir** une première invite de commande
2. **Naviguer** vers le backend :
   ```bash
   cd C:\Users\VotreNom\Desktop\CesiZen\application\backend
   python main.py
   ```
3. **Vous devriez voir** : "Running on http://127.0.0.1:5001"
4. **⚠️ Laisser cette fenêtre ouverte !**

### 🎯 Démarrer l'interface (Frontend)
1. **Ouvrir** une DEUXIÈME invite de commande
2. **Naviguer** vers le frontend :
   ```bash
   cd C:\Users\VotreNom\Desktop\CesiZen\application\frontend
   npm run dev
   ```
3. **Vous devriez voir** : "Local: http://localhost:5173"
4. **⚠️ Laisser cette fenêtre ouverte aussi !**

---

## 🎉 Étape 6 : Utiliser l'application

### 🎯 Accéder à CesiZen
1. **Ouvrir** votre navigateur web (Chrome, Firefox, Edge...)
2. **Aller à l'adresse** : http://localhost:5173
3. **Vous devriez voir** la page d'accueil de CesiZen !

### 🎯 Créer votre premier compte
1. **Cliquer** sur "S'inscrire"
2. **Remplir** vos informations :
   - Prénom et nom
   - Email (utilisez votre vraie adresse)
   - Mot de passe sécurisé
3. **Cliquer** sur "Créer mon compte"

### 🎯 Votre première session de respiration
1. **Se connecter** avec vos identifiants
2. **Choisir** un exercice de respiration
3. **Suivre** les instructions à l'écran
4. **Profiter** de votre moment de détente !

---

## 🔧 Résolution des problèmes courants

### ❌ "La commande 'node' n'est pas reconnue"
**Solution** : Node.js n'est pas installé ou pas dans le PATH
- Réinstaller Node.js en cochant "Add to PATH"
- Redémarrer l'ordinateur

### ❌ "La commande 'python' n'est pas reconnue"
**Solution** : Python n'est pas installé correctement
- Réinstaller Python en cochant "Add Python to PATH"
- Essayer `py` au lieu de `python`

### ❌ "MongoDB connection failed"
**Solution** : MongoDB ne fonctionne pas
- Aller dans Services Windows
- Redémarrer le service "MongoDB"
- Ou réinstaller MongoDB

### ❌ "Port 5173 already in use"
**Solution** : Le port est déjà utilisé
- Fermer toutes les fenêtres de commande
- Redémarrer les étapes 5

### ❌ L'application ne se charge pas
**Solutions** :
1. Vérifier que les DEUX fenêtres de commande sont ouvertes
2. Attendre quelques secondes supplémentaires
3. Rafraîchir la page (F5)
4. Vérifier l'adresse : http://localhost:5173

---

## 📞 Besoin d'aide ?

### 🆘 Que faire si ça ne marche pas ?
1. **Prendre une capture d'écran** du message d'erreur
2. **Noter** à quelle étape le problème survient
3. **Redémarrer** l'ordinateur et réessayer
4. **Contacter** l'équipe de support avec :
   - La capture d'écran
   - Votre système d'exploitation (Windows 10, 11, Mac...)
   - L'étape où ça bloque

### 📧 Contact Support
- **Email** : martin.voron@cesi.fr
- **Réponse** : Sous 24h en semaine

---

## 🎯 Utilisation quotidienne

### 🌅 Pour démarrer CesiZen chaque jour :

1. **Ouvrir** l'invite de commande
2. **Démarrer le serveur** :
   ```bash
   cd C:\Users\VotreNom\Desktop\CesiZen\application\backend
   python main.py
   ```
3. **Ouvrir** une deuxième invite de commande
4. **Démarrer l'interface** :
   ```bash
   cd C:\Users\VotreNom\Desktop\CesiZen\application\frontend
   npm run dev
   ```
5. **Aller sur** : http://localhost:5173

### 🌙 Pour arrêter CesiZen :
1. **Fermer** les deux fenêtres d'invite de commande
2. **Fermer** l'onglet du navigateur

---

## 🎁 Félicitations !

Vous avez installé CesiZen avec succès ! 🎉

**Vous pouvez maintenant** :
- ✅ Faire des exercices de respiration
- ✅ Suivre vos progrès
- ✅ Gérer votre stress au quotidien
- ✅ Avoir votre coach bien-être personnel

**Prenez quelques minutes chaque jour** pour vous connecter à CesiZen et améliorer votre bien-être !

---

*Guide créé pour CesiZen v1.0 - Application de bien-être et cohérence cardiaque* 