# ==========================================
# CESIZEN FRONTEND - DOCKERFILE
# ==========================================
# Multi-stage Docker build for React frontend
# Optimized for development environment

# ==========================================
# BASE STAGE - Node.js environment
# ==========================================
FROM node:18-alpine as base

# Métadonnées
LABEL maintainer="CesiZen Team <dev@cesizen.app>"
LABEL description="CesiZen Frontend - React TypeScript application"
LABEL version="1.0.0"

# Installer pnpm globalement
RUN npm install -g pnpm@8

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S cesizen \
    && adduser -S cesizen -u 1001 -G cesizen

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# ==========================================
# DEVELOPMENT STAGE
# ==========================================
FROM base as development

# Variables d'environnement pour le développement
ENV NODE_ENV=development \
    VITE_NODE_ENV=development \
    CHOKIDAR_USEPOLLING=true \
    WATCHPACK_POLLING=true

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances en premier (pour le cache Docker)
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Changer les permissions pour l'utilisateur cesizen
RUN chown -R cesizen:cesizen /app

# Basculer vers l'utilisateur non-root
USER cesizen

# Exposer le port Vite
EXPOSE 5173

# Exposer le port preview
EXPOSE 4173

# Point de santé pour Docker
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5173 || exit 1

# Script d'entrée par défaut (serveur de développement)
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# ==========================================
# BUILD STAGE - Construction pour production
# ==========================================
FROM base as build

ENV NODE_ENV=production

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances (y compris devDependencies pour le build)
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Construire l'application
RUN pnpm build

# ==========================================
# PRODUCTION STAGE - Serveur de production
# ==========================================
FROM nginx:alpine as production

# Métadonnées pour la production
LABEL stage="production"

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers construits depuis l'étape build
COPY --from=build /app/dist /usr/share/nginx/html

# Créer un utilisateur non-root pour Nginx
RUN addgroup -g 1001 -S cesizen \
    && adduser -S cesizen -u 1001 -G cesizen \
    && chown -R cesizen:cesizen /usr/share/nginx/html \
    && chown -R cesizen:cesizen /var/cache/nginx \
    && chown -R cesizen:cesizen /var/log/nginx \
    && chown -R cesizen:cesizen /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R cesizen:cesizen /var/run/nginx.pid

USER cesizen

# Exposer le port 80
EXPOSE 80

# Point de santé pour la production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"] 