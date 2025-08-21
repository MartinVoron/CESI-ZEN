from flask import Flask
from flask_cors import CORS
from config.database import get_db

from routes.auth import auth_bp
from routes.users import users_bp
from routes.exercices import exercices_bp
from routes.historiques import historiques_bp
from routes.informations_sante import informations_sante_bp

app = Flask(__name__)
CORS(app, 
     supports_credentials=True, 
     origins=["http://localhost:5173"]  # Port Vite par défaut
     )

print("Initializing database connection...")
db = get_db()
print("Database connection initialized")

# Enregistrement des blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(users_bp, url_prefix='/users')
app.register_blueprint(exercices_bp, url_prefix='/exercices')
app.register_blueprint(historiques_bp, url_prefix='/historiques')
app.register_blueprint(informations_sante_bp, url_prefix='/informations-sante')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 