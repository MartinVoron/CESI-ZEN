"""
Rate Limiter simple pour l'API Flask
"""

import time
from collections import defaultdict, deque
from flask import request, jsonify
from functools import wraps
import os

class SimpleRateLimiter:
    def __init__(self):
        # Stockage en mémoire pour le développement
        # En production, utiliser Redis
        self.requests = defaultdict(deque)
        self.blocked_ips = defaultdict(float)
    
    def is_allowed(self, ip, limit=100, window=3600, block_duration=600):
        """
        Vérifier si une IP est autorisée
        
        Args:
            ip: Adresse IP
            limit: Nombre max de requêtes par fenêtre
            window: Fenêtre de temps en secondes (défaut: 1h)
            block_duration: Durée de blocage en secondes (défaut: 10min)
        """
        current_time = time.time()
        
        # Vérifier si l'IP est bloquée
        if ip in self.blocked_ips:
            if current_time < self.blocked_ips[ip]:
                return False
            else:
                # Débloquer l'IP
                del self.blocked_ips[ip]
        
        # Nettoyer les anciennes requêtes
        request_times = self.requests[ip]
        while request_times and request_times[0] < current_time - window:
            request_times.popleft()
        
        # Vérifier la limite
        if len(request_times) >= limit:
            # Bloquer l'IP
            self.blocked_ips[ip] = current_time + block_duration
            return False
        
        # Ajouter la requête actuelle
        request_times.append(current_time)
        return True
    
    def get_rate_limit_info(self, ip, limit=100, window=3600):
        """Obtenir les informations de rate limiting pour une IP"""
        current_time = time.time()
        request_times = self.requests[ip]
        
        # Nettoyer les anciennes requêtes
        while request_times and request_times[0] < current_time - window:
            request_times.popleft()
        
        remaining = max(0, limit - len(request_times))
        reset_time = int(current_time + window) if request_times else int(current_time)
        
        return {
            'limit': limit,
            'remaining': remaining,
            'reset': reset_time,
            'window': window
        }

# Instance globale pour le développement
rate_limiter = SimpleRateLimiter()

def rate_limit(limit=100, window=3600, per_route=False):
    """
    Décorateur de rate limiting
    
    Args:
        limit: Nombre max de requêtes
        window: Fenêtre de temps en secondes
        per_route: Si True, limite par route, sinon globale
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Désactiver en mode debug si configuré
            if os.getenv('DISABLE_RATE_LIMIT') == 'true':
                return f(*args, **kwargs)
            
            # Obtenir l'IP du client
            ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            if ip and ',' in ip:
                ip = ip.split(',')[0].strip()
            
            # Créer une clé unique si per_route est activé
            key = f"{ip}:{request.endpoint}" if per_route else ip
            
            # Vérifier la limite
            if not rate_limiter.is_allowed(key, limit, window):
                response = jsonify({
                    'error': 'Too Many Requests',
                    'message': f'Rate limit exceeded. Max {limit} requests per {window} seconds.',
                    'status_code': 429
                })
                response.status_code = 429
                
                # Ajouter les headers de rate limiting
                rate_info = rate_limiter.get_rate_limit_info(key, limit, window)
                response.headers['X-RateLimit-Limit'] = str(rate_info['limit'])
                response.headers['X-RateLimit-Remaining'] = '0'
                response.headers['X-RateLimit-Reset'] = str(rate_info['reset'])
                response.headers['Retry-After'] = str(600)  # 10 minutes
                
                return response
            
            # Exécuter la fonction
            response = f(*args, **kwargs)
            
            # Ajouter les headers informatifs
            rate_info = rate_limiter.get_rate_limit_info(key, limit, window)
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Limit'] = str(rate_info['limit'])
                response.headers['X-RateLimit-Remaining'] = str(rate_info['remaining'])
                response.headers['X-RateLimit-Reset'] = str(rate_info['reset'])
            
            return response
        
        return decorated_function
    return decorator

# Rate limiter spécialisés
def rate_limit_auth(limit=10, window=900):  # 10 requêtes par 15 min pour auth
    return rate_limit(limit=limit, window=window, per_route=True)

def rate_limit_api(limit=1000, window=3600):  # 1000 requêtes par heure pour API
    return rate_limit(limit=limit, window=window, per_route=False) 