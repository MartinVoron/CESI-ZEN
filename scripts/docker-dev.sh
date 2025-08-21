#!/bin/bash

# ==========================================
# CESIZEN - DOCKER DEVELOPMENT SCRIPT
# ==========================================
# Script pour gérer l'environnement de développement Docker

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE="$PROJECT_ROOT/docker.env.example"

# ==========================================
# FONCTIONS UTILITAIRES
# ==========================================

print_header() {
    echo -e "${CYAN}"
    echo "==========================================="
    echo "🧘‍♀️ CESIZEN - DOCKER DEVELOPMENT MANAGER"
    echo "==========================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# Vérifier si Docker est installé et en cours d'exécution
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker n'est pas en cours d'exécution. Veuillez le démarrer."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
}

# Vérifier si le fichier .env existe
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_warning "Fichier .env non trouvé. Création à partir de l'exemple..."
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        print_info "Fichier .env créé. Vous pouvez le modifier selon vos besoins."
        print_info "Localisation: $ENV_FILE"
    fi
}

# Afficher l'aide
show_help() {
    cat << EOF
Usage: $0 [COMMANDE] [OPTIONS]

COMMANDES PRINCIPALES:
  start, up       Démarrer tous les services
  stop, down      Arrêter tous les services
  restart         Redémarrer tous les services
  build           Construire les images Docker
  rebuild         Reconstruire les images (sans cache)
  status          Afficher le statut des services
  logs            Afficher les logs des services
  shell           Ouvrir un shell dans un conteneur

COMMANDES DE MAINTENANCE:
  clean           Nettoyer les images et volumes non utilisés
  reset           Réinitialiser complètement l'environnement
  backup          Sauvegarder les données MongoDB
  restore         Restaurer les données MongoDB

COMMANDES DE DÉVELOPPEMENT:
  dev             Mode développement avec hot reload
  test            Lancer les tests
  lint            Vérifier le code (linting)
  deps            Installer/mettre à jour les dépendances

SERVICES OPTIONNELS:
  tools           Démarrer avec les outils (Mongo Express)
  cache           Démarrer avec Redis
  proxy           Démarrer avec Nginx

OPTIONS:
  -h, --help      Afficher cette aide
  -v, --verbose   Mode verbeux
  -q, --quiet     Mode silencieux
  --profile       Utiliser un profil spécifique

EXEMPLES:
  $0 start                    # Démarrer l'environnement de base
  $0 start --profile tools    # Démarrer avec Mongo Express
  $0 logs backend             # Voir les logs du backend
  $0 shell backend            # Ouvrir un shell dans le conteneur backend
  $0 test                     # Lancer tous les tests
EOF
}

# Obtenir la commande Docker Compose
get_compose_cmd() {
    if docker compose version &> /dev/null; then
        echo "docker compose"
    else
        echo "docker-compose"
    fi
}

# ==========================================
# COMMANDES PRINCIPALES
# ==========================================

start_services() {
    local profile="${1:-""}"
    local compose_cmd=$(get_compose_cmd)
    
    print_step "Démarrage des services CesiZen..."
    
    if [ -n "$profile" ]; then
        print_info "Profil activé: $profile"
        COMPOSE_PROFILES="$profile" $compose_cmd up -d
    else
        $compose_cmd up -d
    fi
    
    print_success "Services démarrés avec succès!"
    show_status
    show_urls
}

stop_services() {
    local compose_cmd=$(get_compose_cmd)
    
    print_step "Arrêt des services CesiZen..."
    $compose_cmd down
    print_success "Services arrêtés avec succès!"
}

restart_services() {
    print_step "Redémarrage des services CesiZen..."
    stop_services
    sleep 2
    start_services "$1"
}

build_images() {
    local compose_cmd=$(get_compose_cmd)
    local no_cache="${1:-false}"
    
    print_step "Construction des images Docker..."
    
    if [ "$no_cache" = "true" ]; then
        print_info "Construction sans cache..."
        $compose_cmd build --no-cache
    else
        $compose_cmd build
    fi
    
    print_success "Images construites avec succès!"
}

show_status() {
    local compose_cmd=$(get_compose_cmd)
    
    print_step "Statut des services CesiZen:"
    echo
    $compose_cmd ps
    echo
}

show_logs() {
    local service="${1:-""}"
    local compose_cmd=$(get_compose_cmd)
    
    if [ -n "$service" ]; then
        print_info "Logs du service: $service"
        $compose_cmd logs -f "$service"
    else
        print_info "Logs de tous les services (Ctrl+C pour quitter)"
        $compose_cmd logs -f
    fi
}

open_shell() {
    local service="${1:-backend}"
    local compose_cmd=$(get_compose_cmd)
    
    print_info "Ouverture d'un shell dans le conteneur: $service"
    
    case "$service" in
        "backend")
            $compose_cmd exec "$service" /bin/bash
            ;;
        "frontend")
            $compose_cmd exec "$service" /bin/sh
            ;;
        "mongodb")
            $compose_cmd exec "$service" mongosh
            ;;
        *)
            $compose_cmd exec "$service" /bin/sh
            ;;
    esac
}

# ==========================================
# COMMANDES DE MAINTENANCE
# ==========================================

clean_docker() {
    print_step "Nettoyage des ressources Docker non utilisées..."
    
    # Arrêter les services d'abord
    docker-compose down 2>/dev/null || true
    
    # Nettoyer les images, conteneurs et volumes non utilisés
    docker system prune -f
    docker volume prune -f
    
    print_success "Nettoyage terminé!"
}

reset_environment() {
    print_warning "⚠️ Cette action va supprimer TOUTES les données !"
    read -p "Êtes-vous sûr ? (tapez 'oui' pour confirmer): " confirm
    
    if [ "$confirm" = "oui" ]; then
        print_step "Réinitialisation complète de l'environnement..."
        
        # Arrêter et supprimer tout
        docker-compose down -v --remove-orphans 2>/dev/null || true
        
        # Supprimer les images du projet
        docker images | grep cesizen | awk '{print $3}' | xargs -r docker rmi -f
        
        # Supprimer les volumes nommés
        docker volume ls | grep cesizen | awk '{print $2}' | xargs -r docker volume rm
        
        print_success "Environnement réinitialisé!"
        print_info "Utilisez '$0 start' pour redémarrer."
    else
        print_info "Réinitialisation annulée."
    fi
}

backup_mongodb() {
    local backup_dir="$PROJECT_ROOT/backups"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$backup_dir/mongodb_backup_$timestamp.archive"
    
    print_step "Sauvegarde de MongoDB..."
    
    # Créer le répertoire de sauvegarde
    mkdir -p "$backup_dir"
    
    # Effectuer la sauvegarde
    docker-compose exec -T mongodb mongodump --archive > "$backup_file"
    
    print_success "Sauvegarde créée: $backup_file"
}

# ==========================================
# COMMANDES DE DÉVELOPPEMENT
# ==========================================

run_tests() {
    local compose_cmd=$(get_compose_cmd)
    
    print_step "Lancement des tests CesiZen..."
    
    # Tests backend
    print_info "Tests backend (Python)..."
    $compose_cmd exec backend python -m pytest -v
    
    # Tests frontend
    print_info "Tests frontend (React)..."
    $compose_cmd exec frontend pnpm test --run
    
    print_success "Tests terminés!"
}

run_lint() {
    local compose_cmd=$(get_compose_cmd)
    
    print_step "Vérification du code..."
    
    # Lint backend
    print_info "Lint backend (Python)..."
    $compose_cmd exec backend flake8 .
    $compose_cmd exec backend black --check .
    
    # Lint frontend
    print_info "Lint frontend (TypeScript)..."
    $compose_cmd exec frontend pnpm lint
    
    print_success "Vérification terminée!"
}

update_dependencies() {
    local compose_cmd=$(get_compose_cmd)
    
    print_step "Mise à jour des dépendances..."
    
    # Backend
    print_info "Mise à jour des dépendances Python..."
    $compose_cmd exec backend pip install --upgrade -r requirements.txt
    
    # Frontend
    print_info "Mise à jour des dépendances Node.js..."
    $compose_cmd exec frontend pnpm update
    
    print_success "Dépendances mises à jour!"
}

# ==========================================
# AFFICHAGE DES INFORMATIONS
# ==========================================

show_urls() {
    local host="${DOCKER_HOST:-localhost}"
    
    echo -e "${CYAN}"
    echo "==========================================="
    echo "🌐 URLS D'ACCÈS"
    echo "==========================================="
    echo -e "${NC}"
    echo -e "${GREEN}Frontend (React):${NC}     http://$host:5173"
    echo -e "${GREEN}Backend API (Flask):${NC}  http://$host:5000"
    echo -e "${GREEN}MongoDB:${NC}              mongodb://$host:27017"
    echo
    echo -e "${YELLOW}Services optionnels:${NC}"
    echo -e "${BLUE}Mongo Express:${NC}        http://$host:8081 (profile: tools)"
    echo -e "${BLUE}Redis:${NC}                redis://$host:6379 (profile: cache)"
    echo -e "${BLUE}Nginx:${NC}                http://$host:80 (profile: proxy)"
    echo
    echo -e "${PURPLE}Comptes par défaut:${NC}"
    echo -e "${BLUE}Admin:${NC}                admin@cesizen.local / admin123"
    echo -e "${BLUE}Test User:${NC}            test@cesizen.local / admin123"
    echo
}

# ==========================================
# SCRIPT PRINCIPAL
# ==========================================

main() {
    print_header
    
    # Vérifier les prérequis
    check_docker
    check_env_file
    
    # Changer vers le répertoire du projet
    cd "$PROJECT_ROOT"
    
    # Parser les arguments
    case "${1:-help}" in
        "start"|"up")
            start_services "${2}"
            ;;
        "stop"|"down")
            stop_services
            ;;
        "restart")
            restart_services "${2}"
            ;;
        "build")
            build_images
            ;;
        "rebuild")
            build_images "true"
            ;;
        "status"|"ps")
            show_status
            ;;
        "logs")
            show_logs "${2}"
            ;;
        "shell"|"exec")
            open_shell "${2}"
            ;;
        "clean")
            clean_docker
            ;;
        "reset")
            reset_environment
            ;;
        "backup")
            backup_mongodb
            ;;
        "dev"|"develop")
            start_services "tools"
            ;;
        "test")
            run_tests
            ;;
        "lint")
            run_lint
            ;;
        "deps"|"dependencies")
            update_dependencies
            ;;
        "tools")
            start_services "tools"
            ;;
        "cache")
            start_services "cache"
            ;;
        "proxy")
            start_services "proxy"
            ;;
        "urls"|"info")
            show_urls
            ;;
        "help"|"-h"|"--help"|*)
            show_help
            ;;
    esac
}

# Exécuter le script principal
main "$@" 