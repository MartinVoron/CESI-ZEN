from flask import Flask, jsonify
from flask_cors import CORS
from config.database import get_db
from utils.security_headers import add_security_headers
from utils.performance import monitor_performance
import os
import datetime

from routes.auth import auth_bp
from routes.users import users_bp
from routes.exercices import exercices_bp
from routes.historiques import historiques_bp
from routes.informations_sante import informations_sante_bp

app = Flask(__name__)

# Configuration CORS améliorée
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
CORS(app, 
     supports_credentials=True, 
     origins=cors_origins
     )

# Ajouter les headers de sécurité
app = add_security_headers(app)

# Ajouter le monitoring de performance
app = monitor_performance(app)

print("Initializing database connection...")
db = get_db()
print("Database connection initialized")

# Endpoint de health check
@app.route('/health')
def health_check():
    """Endpoint de vérification de santé pour Docker et monitoring"""
    try:
        # Test de connexion à la base de données
        db.command('ping')
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    health_data = {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": os.getenv('FLASK_ENV', 'development'),
        "services": {
            "database": db_status,
            "api": "healthy"
        }
    }
    
    status_code = 200 if health_data["status"] == "healthy" else 503
    return jsonify(health_data), status_code

# Route d'information système
@app.route('/info')
def app_info():
    """Informations sur l'application"""
    return jsonify({
        "name": "CesiZen Backend API",
        "version": "1.0.0",
        "environment": os.getenv('FLASK_ENV', 'development'),
        "python_version": os.sys.version.split()[0],
        "uptime": datetime.datetime.utcnow().isoformat()
    })

# Enregistrement des blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(users_bp, url_prefix='/users')
app.register_blueprint(exercices_bp, url_prefix='/exercices')
app.register_blueprint(historiques_bp, url_prefix='/historiques')
app.register_blueprint(informations_sante_bp, url_prefix='/informations-sante')

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port) 