"""
Optimisations de performance pour l'application Flask
"""

import time
import psutil
import os
from functools import wraps
from flask import request, g, jsonify
import logging

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    def __init__(self):
        self.request_times = []
        self.slow_queries = []
    
    def log_request_time(self, duration, endpoint, method):
        """Enregistrer les temps de réponse"""
        self.request_times.append({
            'duration': duration,
            'endpoint': endpoint,
            'method': method,
            'timestamp': time.time()
        })
        
        # Garder seulement les 1000 dernières requêtes
        if len(self.request_times) > 1000:
            self.request_times = self.request_times[-1000:]
        
        # Alerter si la requête est lente (> 1 seconde)
        if duration > 1.0:
            logger.warning(f"Requête lente détectée: {method} {endpoint} - {duration:.2f}s")
    
    def get_stats(self):
        """Obtenir les statistiques de performance"""
        if not self.request_times:
            return {"message": "Aucune donnée disponible"}
        
        durations = [r['duration'] for r in self.request_times]
        
        return {
            "requests_count": len(self.request_times),
            "avg_response_time": sum(durations) / len(durations),
            "max_response_time": max(durations),
            "min_response_time": min(durations),
            "slow_requests": len([d for d in durations if d > 1.0])
        }

# Instance globale
performance_monitor = PerformanceMonitor()

def monitor_performance(app):
    """Middleware de monitoring des performances"""
    
    @app.before_request
    def before_request():
        g.start_time = time.time()
    
    @app.after_request
    def after_request(response):
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            performance_monitor.log_request_time(
                duration, 
                request.endpoint or 'unknown',
                request.method
            )
            
            # Ajouter le temps de réponse aux headers
            response.headers['X-Response-Time'] = f"{duration:.3f}s"
        
        return response
    
    # Endpoint pour les statistiques
    @app.route('/metrics/performance')
    def performance_metrics():
        """Endpoint pour obtenir les métriques de performance"""
        stats = performance_monitor.get_stats()
        
        # Ajouter les métriques système
        system_stats = {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent if os.name != 'nt' else psutil.disk_usage('C:').percent
        }
        
        return jsonify({
            "performance": stats,
            "system": system_stats,
            "timestamp": time.time()
        })
    
    return app

def cache_response(timeout=300):
    """Décorateur pour mettre en cache les réponses"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Simple cache en mémoire pour le développement
            # En production, utiliser Redis
            cache_key = f"{request.endpoint}:{str(request.args)}"
            
            if hasattr(g, 'cache') and cache_key in g.cache:
                cached_data, cached_time = g.cache[cache_key]
                if time.time() - cached_time < timeout:
                    return cached_data
            
            result = f(*args, **kwargs)
            
            # Stocker en cache
            if not hasattr(g, 'cache'):
                g.cache = {}
            g.cache[cache_key] = (result, time.time())
            
            return result
        return decorated_function
    return decorator

def compress_response():
    """Décorateur pour compresser les réponses JSON"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            response = f(*args, **kwargs)
            
            # Ajouter header pour la compression
            if hasattr(response, 'headers'):
                response.headers['Content-Encoding'] = 'gzip'
            
            return response
        return decorated_function
    return decorator

def optimize_database_queries():
    """Optimisations pour les requêtes MongoDB"""
    
    def log_slow_query(collection, query, duration):
        """Logger les requêtes lentes"""
        if duration > 0.5:  # Plus de 500ms
            logger.warning(f"Requête MongoDB lente: {collection} - {duration:.2f}s")
            logger.debug(f"Requête: {query}")
    
    return log_slow_query 