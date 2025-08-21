# ==========================================
# CESIZEN BACKEND - DOCKERFILE
# ==========================================
# Multi-stage Docker build for Flask backend
# Optimized for development environment

# ==========================================
# BASE STAGE - Python environment
# ==========================================
FROM python:3.13-slim as base

# Métadonnées
LABEL maintainer="CesiZen Team <dev@cesizen.app>"
LABEL description="CesiZen Backend API - Flask application"
LABEL version="1.0.0"

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    FLASK_APP=main.py \
    FLASK_ENV=development

# Créer un utilisateur non-root pour la sécurité
RUN groupadd --gid 1000 cesizen \
    && useradd --uid 1000 --gid cesizen --shell /bin/bash --create-home cesizen

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    curl \
    git \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# ==========================================
# DEVELOPMENT STAGE
# ==========================================
FROM base as development

# Installer les outils de développement
RUN pip install --upgrade pip \
    && pip install \
        pytest \
        pytest-cov \
        black \
        flake8 \
        ipython \
        ipdb \
        watchdog

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances en premier (pour le cache Docker)
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Changer les permissions pour l'utilisateur cesizen
RUN chown -R cesizen:cesizen /app

# Basculer vers l'utilisateur non-root
USER cesizen

# Créer les répertoires nécessaires
RUN mkdir -p /app/logs /app/uploads

# Exposer le port Flask
EXPOSE 5000

# Point de santé pour Docker
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Script d'entrée par défaut
CMD ["python", "main.py"]

# ==========================================
# PRODUCTION STAGE (pour référence future)
# ==========================================
FROM base as production

# Installer uniquement les dépendances de production
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Changer les permissions
RUN chown -R cesizen:cesizen /app

USER cesizen

# Variables d'environnement pour la production
ENV FLASK_ENV=production \
    FLASK_DEBUG=False

EXPOSE 5000

# Utiliser Gunicorn pour la production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "main:app"] 