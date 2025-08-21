"""
Headers de sécurité pour l'application Flask
"""

from flask import request
from functools import wraps
import os

def add_security_headers(app):
    """Ajouter les headers de sécurité à toutes les réponses"""
    
    @app.after_request
    def security_headers(response):
        # Content Security Policy
        if os.getenv('FLASK_ENV') == 'development':
            # CSP plus permissive pour le développement
            csp = ("default-src 'self'; "
                   "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173; "
                   "style-src 'self' 'unsafe-inline'; "
                   "img-src 'self' data: blob: http://localhost:5173; "
                   "font-src 'self' data:; "
                   "connect-src 'self' http://localhost:5000 http://localhost:5173 ws://localhost:5173; "
                   "media-src 'self'; "
                   "object-src 'none'; "
                   "frame-ancestors 'self';")
        else:
            # CSP stricte pour la production
            csp = ("default-src 'self'; "
                   "script-src 'self'; "
                   "style-src 'self' 'unsafe-inline'; "
                   "img-src 'self' data:; "
                   "font-src 'self'; "
                   "connect-src 'self'; "
                   "object-src 'none'; "
                   "frame-ancestors 'none';")
        
        response.headers['Content-Security-Policy'] = csp
        
        # Autres headers de sécurité
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
        
        # HSTS pour HTTPS (seulement en production)
        if request.is_secure or os.getenv('FLASK_ENV') != 'development':
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Cache control pour les API
        if request.path.startswith('/api/') or request.path.startswith('/auth/'):
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
        
        return response
    
    return app

def require_secure_headers(f):
    """Décorateur pour forcer des headers de sécurité spécifiques"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        response = f(*args, **kwargs)
        # Ajouter des headers spécifiques si nécessaire
        return response
    return decorated_function 