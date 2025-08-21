#!/bin/bash

# ==========================================
# CESIZEN - TEST DE DÉPLOIEMENT
# ==========================================
# Script pour tester l'environnement de développement

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}"
echo "==========================================="
echo "🧪 CESIZEN - TESTS DE DÉPLOIEMENT"
echo "==========================================="
echo -e "${NC}"

cd "$PROJECT_ROOT"

# Test 1: Vérifier les prérequis
print_info "Test 1: Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker n'est pas en cours d'exécution"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose n'est pas installé"
    exit 1
fi

print_success "Prérequis OK"

# Test 2: Vérifier les fichiers de configuration
print_info "Test 2: Vérification des fichiers de configuration..."

required_files=(
    "docker-compose.yml"
    "docker.env.example"
    "application/backend/Dockerfile"
    "application/frontend/Dockerfile"
)

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_error "Fichier manquant: $file"
        exit 1
    fi
done

print_success "Fichiers de configuration OK"

# Test 3: Vérifier le fichier .env
print_info "Test 3: Vérification du fichier .env..."

if [[ ! -f ".env" ]]; then
    print_warning "Fichier .env manquant, création à partir de l'exemple..."
    cp docker.env.example .env
fi

print_success "Fichier .env OK"

# Test 4: Valider la syntaxe Docker Compose
print_info "Test 4: Validation de la syntaxe Docker Compose..."

if docker compose config > /dev/null 2>&1; then
    print_success "Syntaxe Docker Compose OK"
else
    print_error "Erreur dans la configuration Docker Compose"
    docker compose config
    exit 1
fi

# Test 5: Construction des images
print_info "Test 5: Construction des images Docker..."

if docker compose build --quiet; then
    print_success "Construction des images OK"
else
    print_error "Erreur lors de la construction des images"
    exit 1
fi

# Test 6: Démarrage des services
print_info "Test 6: Démarrage des services..."

if docker compose up -d; then
    print_success "Services démarrés"
else
    print_error "Erreur lors du démarrage des services"
    exit 1
fi

# Attendre que les services soient prêts
print_info "Attente du démarrage complet des services..."
sleep 30

# Test 7: Test de connectivité
print_info "Test 7: Tests de connectivité..."

# Test backend health
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_success "Backend accessible"
else
    print_error "Backend non accessible"
    print_info "Logs du backend:"
    docker compose logs backend --tail 20
fi

# Test frontend
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    print_success "Frontend accessible"
else
    print_warning "Frontend non accessible (normal si pas encore démarré)"
fi

# Test MongoDB
if docker compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_success "MongoDB accessible"
else
    print_error "MongoDB non accessible"
fi

# Test 8: Statut des containers
print_info "Test 8: Statut des containers..."
docker compose ps

# Test 9: Tests de sécurité basiques
print_info "Test 9: Tests de sécurité basiques..."

# Test headers de sécurité
if curl -s -I http://localhost:5000/health | grep -q "X-Content-Type-Options"; then
    print_success "Headers de sécurité présents"
else
    print_warning "Headers de sécurité manquants"
fi

# Test rate limiting (optionnel)
print_info "Test du rate limiting..."
for i in {1..5}; do
    curl -s http://localhost:5000/health > /dev/null
done

# Test 10: Logs et monitoring
print_info "Test 10: Vérification des logs..."

# Vérifier que les logs sont générés
if docker compose logs backend --tail 1 | grep -q "Initializing\|Running\|Started"; then
    print_success "Logs backend OK"
else
    print_warning "Aucun log backend détecté"
fi

echo
echo -e "${GREEN}=========================================="
echo "🎉 TESTS DE DÉPLOIEMENT TERMINÉS"
echo "==========================================${NC}"
echo
echo -e "${BLUE}URLs d'accès:${NC}"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo "Health:   http://localhost:5000/health"
echo "Info:     http://localhost:5000/info"
echo
echo -e "${BLUE}Commandes utiles:${NC}"
echo "- Voir les logs: docker compose logs -f"
echo "- Arrêter: docker compose down"
echo "- Status: docker compose ps"
echo

# Nettoyage optionnel
read -p "Voulez-vous arrêter les services de test ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Arrêt des services..."
    docker compose down
    print_success "Services arrêtés"
fi 