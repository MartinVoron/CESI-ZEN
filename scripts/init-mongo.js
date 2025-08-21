// ==========================================
// CESIZEN - MONGODB INITIALIZATION SCRIPT
// ==========================================
// Script d'initialisation pour MongoDB dans Docker
// Ce script sera exécuté automatiquement lors du premier démarrage

// Utiliser la base de données CesiZen
db = db.getSiblingDB('CesiZen');

// ==========================================
// CRÉER LES COLLECTIONS
// ==========================================

// Collection pour les utilisateurs
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password", "created_at"],
      properties: {
        username: {
          bsonType: "string",
          description: "Nom d'utilisateur unique"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Adresse email valide"
        },
        password: {
          bsonType: "string",
          description: "Mot de passe haché"
        },
        role: {
          bsonType: "string",
          enum: ["user", "admin", "moderator"],
          description: "Rôle de l'utilisateur"
        },
        created_at: {
          bsonType: "date",
          description: "Date de création"
        }
      }
    }
  }
});

// Collection pour les séances de méditation
db.createCollection('meditation_sessions', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "type", "duration", "created_at"],
      properties: {
        user_id: {
          bsonType: "objectId",
          description: "ID de l'utilisateur"
        },
        type: {
          bsonType: "string",
          enum: ["guided", "free", "breathing", "mindfulness"],
          description: "Type de méditation"
        },
        duration: {
          bsonType: "int",
          minimum: 1,
          description: "Durée en minutes"
        },
        completed: {
          bsonType: "bool",
          description: "Séance terminée ou non"
        }
      }
    }
  }
});

// Collection pour les informations de santé
db.createCollection('health_info', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "date"],
      properties: {
        user_id: {
          bsonType: "objectId",
          description: "ID de l'utilisateur"
        },
        stress_level: {
          bsonType: "int",
          minimum: 1,
          maximum: 10,
          description: "Niveau de stress de 1 à 10"
        },
        mood: {
          bsonType: "string",
          enum: ["very_bad", "bad", "neutral", "good", "very_good"],
          description: "Humeur du jour"
        },
        sleep_hours: {
          bsonType: "double",
          minimum: 0,
          maximum: 24,
          description: "Heures de sommeil"
        }
      }
    }
  }
});

// ==========================================
// CRÉER LES INDEX
// ==========================================

// Index sur les utilisateurs
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "created_at": 1 });

// Index sur les séances de méditation
db.meditation_sessions.createIndex({ "user_id": 1 });
db.meditation_sessions.createIndex({ "created_at": 1 });
db.meditation_sessions.createIndex({ "user_id": 1, "created_at": 1 });

// Index sur les informations de santé
db.health_info.createIndex({ "user_id": 1 });
db.health_info.createIndex({ "date": 1 });
db.health_info.createIndex({ "user_id": 1, "date": 1 }, { unique: true });

// ==========================================
// CRÉER UN UTILISATEUR ADMIN PAR DÉFAUT
// ==========================================

// Vérifier si l'admin existe déjà
const adminExists = db.users.findOne({ username: "admin" });

if (!adminExists) {
  // Créer un utilisateur admin par défaut
  // Note: Le mot de passe sera "admin123" - CHANGEZ-LE EN PRODUCTION !
  db.users.insertOne({
    username: "admin",
    email: "admin@cesizen.local",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeUcscEu.WZHJ3rOi", // admin123
    role: "admin",
    profile: {
      first_name: "Admin",
      last_name: "CesiZen",
      bio: "Administrateur par défaut du système CesiZen"
    },
    preferences: {
      theme: "light",
      notifications: true,
      language: "fr"
    },
    created_at: new Date(),
    updated_at: new Date()
  });
  
  print("✅ Utilisateur admin créé avec succès");
  print("📧 Email: admin@cesizen.local");
  print("🔑 Mot de passe: admin123");
  print("⚠️  ATTENTION: Changez ce mot de passe en production !");
} else {
  print("ℹ️  L'utilisateur admin existe déjà");
}

// ==========================================
// CRÉER QUELQUES DONNÉES DE TEST
// ==========================================

// Créer un utilisateur de test
const testUserExists = db.users.findOne({ username: "testuser" });

if (!testUserExists) {
  const testUser = db.users.insertOne({
    username: "testuser",
    email: "test@cesizen.local",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeUcscEu.WZHJ3rOi", // admin123
    role: "user",
    profile: {
      first_name: "Test",
      last_name: "User",
      bio: "Utilisateur de test pour le développement"
    },
    preferences: {
      theme: "light",
      notifications: true,
      language: "fr"
    },
    created_at: new Date(),
    updated_at: new Date()
  });

  // Ajouter quelques séances de méditation de test
  db.meditation_sessions.insertMany([
    {
      user_id: testUser.insertedId,
      type: "guided",
      duration: 10,
      completed: true,
      notes: "Première séance de méditation guidée",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // il y a 7 jours
    },
    {
      user_id: testUser.insertedId,
      type: "breathing",
      duration: 5,
      completed: true,
      notes: "Exercice de respiration rapide",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // il y a 3 jours
    },
    {
      user_id: testUser.insertedId,
      type: "mindfulness",
      duration: 15,
      completed: false,
      notes: "Séance de pleine conscience en cours",
      created_at: new Date() // aujourd'hui
    }
  ]);

  // Ajouter quelques informations de santé de test
  db.health_info.insertMany([
    {
      user_id: testUser.insertedId,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      stress_level: 6,
      mood: "neutral",
      sleep_hours: 7.5,
      notes: "Journée stressante au travail"
    },
    {
      user_id: testUser.insertedId,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      stress_level: 4,
      mood: "good",
      sleep_hours: 8.0,
      notes: "Bonne journée, méditation efficace"
    }
  ]);

  print("✅ Utilisateur de test et données d'exemple créés");
}

// ==========================================
// CONFIGURATION FINALE
// ==========================================

// Afficher les statistiques
const userCount = db.users.countDocuments();
const sessionCount = db.meditation_sessions.countDocuments();
const healthCount = db.health_info.countDocuments();

print("==========================================");
print("🎉 INITIALISATION MONGODB TERMINÉE");
print("==========================================");
print(`👥 Utilisateurs: ${userCount}`);
print(`🧘 Séances de méditation: ${sessionCount}`);
print(`❤️  Informations de santé: ${healthCount}`);
print("==========================================");
print("🚀 Base de données CesiZen prête !");
print("=========================================="); 