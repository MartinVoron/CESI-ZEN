# ==========================================
# CESIZEN - DOCKER DEVELOPMENT SCRIPT (PowerShell)
# ==========================================
# Script PowerShell pour gérer l'environnement de développement Docker sous Windows

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Service = "",
    
    [switch]$Verbose,
    [switch]$Quiet,
    [string]$Profile = ""
)

# Configuration
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ComposeFile = Join-Path $ProjectRoot "docker-compose.yml"
$EnvFile = Join-Path $ProjectRoot ".env"
$EnvExample = Join-Path $ProjectRoot "docker.env.example"

# ==========================================
# FONCTIONS UTILITAIRES
# ==========================================

function Write-Header {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "🧘‍♀️ CESIZEN - DOCKER DEVELOPMENT MANAGER" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️ $Message" -ForegroundColor Blue
}

function Write-Step {
    param([string]$Message)
    Write-Host "🔄 $Message" -ForegroundColor Magenta
}

# Vérifier si Docker est installé et en cours d'exécution
function Test-Docker {
    try {
        if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
            Write-Error "Docker n'est pas installé. Veuillez l'installer d'abord."
            exit 1
        }

        $null = docker info 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker n'est pas en cours d'exécution. Veuillez le démarrer."
            exit 1
        }

        $composeVersion = docker compose version 2>$null
        if ($LASTEXITCODE -ne 0) {
            $composeVersion = docker-compose version 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
                exit 1
            }
        }
    }
    catch {
        Write-Error "Erreur lors de la vérification de Docker: $_"
        exit 1
    }
}

# Vérifier si le fichier .env existe
function Test-EnvFile {
    if (-not (Test-Path $EnvFile)) {
        Write-Warning "Fichier .env non trouvé. Création à partir de l'exemple..."
        Copy-Item $EnvExample $EnvFile
        Write-Info "Fichier .env créé. Vous pouvez le modifier selon vos besoins."
        Write-Info "Localisation: $EnvFile"
    }
}

# Obtenir la commande Docker Compose
function Get-ComposeCommand {
    $composeVersion = docker compose version 2>$null
    if ($LASTEXITCODE -eq 0) {
        return "docker compose"
    } else {
        return "docker-compose"
    }
}

# Afficher l'aide
function Show-Help {
    Write-Host @"
Usage: .\docker-dev.ps1 [COMMANDE] [OPTIONS]

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
  -Verbose        Mode verbeux
  -Quiet          Mode silencieux
  -Profile        Utiliser un profil spécifique

EXEMPLES:
  .\docker-dev.ps1 start                 # Démarrer l'environnement de base
  .\docker-dev.ps1 start -Profile tools  # Démarrer avec Mongo Express
  .\docker-dev.ps1 logs backend          # Voir les logs du backend
  .\docker-dev.ps1 shell backend         # Ouvrir un shell dans le conteneur backend
  .\docker-dev.ps1 test                  # Lancer tous les tests
"@
}

# ==========================================
# COMMANDES PRINCIPALES
# ==========================================

function Start-Services {
    param([string]$ProfileName = "")
    
    $composeCmd = Get-ComposeCommand
    
    Write-Step "Démarrage des services CesiZen..."
    
    if ($ProfileName) {
        Write-Info "Profil activé: $ProfileName"
        $env:COMPOSE_PROFILES = $ProfileName
        & $composeCmd.Split() up -d
    } else {
        & $composeCmd.Split() up -d
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services démarrés avec succès!"
        Show-Status
        Show-Urls
    } else {
        Write-Error "Erreur lors du démarrage des services."
    }
}

function Stop-Services {
    $composeCmd = Get-ComposeCommand
    
    Write-Step "Arrêt des services CesiZen..."
    & $composeCmd.Split() down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services arrêtés avec succès!"
    } else {
        Write-Error "Erreur lors de l'arrêt des services."
    }
}

function Restart-Services {
    param([string]$ProfileName = "")
    
    Write-Step "Redémarrage des services CesiZen..."
    Stop-Services
    Start-Sleep -Seconds 2
    Start-Services $ProfileName
}

function Build-Images {
    param([switch]$NoCache)
    
    $composeCmd = Get-ComposeCommand
    
    Write-Step "Construction des images Docker..."
    
    if ($NoCache) {
        Write-Info "Construction sans cache..."
        & $composeCmd.Split() build --no-cache
    } else {
        & $composeCmd.Split() build
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Images construites avec succès!"
    } else {
        Write-Error "Erreur lors de la construction des images."
    }
}

function Show-Status {
    $composeCmd = Get-ComposeCommand
    
    Write-Step "Statut des services CesiZen:"
    Write-Host ""
    & $composeCmd.Split() ps
    Write-Host ""
}

function Show-Logs {
    param([string]$ServiceName = "")
    
    $composeCmd = Get-ComposeCommand
    
    if ($ServiceName) {
        Write-Info "Logs du service: $ServiceName"
        & $composeCmd.Split() logs -f $ServiceName
    } else {
        Write-Info "Logs de tous les services (Ctrl+C pour quitter)"
        & $composeCmd.Split() logs -f
    }
}

function Open-Shell {
    param([string]$ServiceName = "backend")
    
    $composeCmd = Get-ComposeCommand
    
    Write-Info "Ouverture d'un shell dans le conteneur: $ServiceName"
    
    switch ($ServiceName) {
        "backend" {
            & $composeCmd.Split() exec $ServiceName /bin/bash
        }
        "frontend" {
            & $composeCmd.Split() exec $ServiceName /bin/sh
        }
        "mongodb" {
            & $composeCmd.Split() exec $ServiceName mongosh
        }
        default {
            & $composeCmd.Split() exec $ServiceName /bin/sh
        }
    }
}

# ==========================================
# COMMANDES DE MAINTENANCE
# ==========================================

function Clear-Docker {
    Write-Step "Nettoyage des ressources Docker non utilisées..."
    
    # Arrêter les services d'abord
    docker-compose down 2>$null
    
    # Nettoyer les images, conteneurs et volumes non utilisés
    docker system prune -f
    docker volume prune -f
    
    Write-Success "Nettoyage terminé!"
}

function Reset-Environment {
    Write-Warning "⚠️ Cette action va supprimer TOUTES les données !"
    $confirm = Read-Host "Êtes-vous sûr ? (tapez 'oui' pour confirmer)"
    
    if ($confirm -eq "oui") {
        Write-Step "Réinitialisation complète de l'environnement..."
        
        # Arrêter et supprimer tout
        docker-compose down -v --remove-orphans 2>$null
        
        # Supprimer les images du projet
        $images = docker images --format "table {{.Repository}}:{{.Tag}}" | Where-Object { $_ -match "cesizen" }
        if ($images) {
            $images | ForEach-Object { docker rmi $_ -f 2>$null }
        }
        
        # Supprimer les volumes nommés
        $volumes = docker volume ls --format "{{.Name}}" | Where-Object { $_ -match "cesizen" }
        if ($volumes) {
            $volumes | ForEach-Object { docker volume rm $_ 2>$null }
        }
        
        Write-Success "Environnement réinitialisé!"
        Write-Info "Utilisez '.\docker-dev.ps1 start' pour redémarrer."
    } else {
        Write-Info "Réinitialisation annulée."
    }
}

function Backup-MongoDB {
    $backupDir = Join-Path $ProjectRoot "backups"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = Join-Path $backupDir "mongodb_backup_$timestamp.archive"
    
    Write-Step "Sauvegarde de MongoDB..."
    
    # Créer le répertoire de sauvegarde
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    # Effectuer la sauvegarde
    docker-compose exec -T mongodb mongodump --archive | Out-File -FilePath $backupFile -Encoding byte
    
    Write-Success "Sauvegarde créée: $backupFile"
}

# ==========================================
# COMMANDES DE DÉVELOPPEMENT
# ==========================================

function Invoke-Tests {
    $composeCmd = Get-ComposeCommand
    
    Write-Step "Lancement des tests CesiZen..."
    
    # Tests backend
    Write-Info "Tests backend (Python)..."
    & $composeCmd.Split() exec backend python -m pytest -v
    
    # Tests frontend
    Write-Info "Tests frontend (React)..."
    & $composeCmd.Split() exec frontend pnpm test --run
    
    Write-Success "Tests terminés!"
}

function Invoke-Lint {
    $composeCmd = Get-ComposeCommand
    
    Write-Step "Vérification du code..."
    
    # Lint backend
    Write-Info "Lint backend (Python)..."
    & $composeCmd.Split() exec backend flake8 .
    & $composeCmd.Split() exec backend black --check .
    
    # Lint frontend
    Write-Info "Lint frontend (TypeScript)..."
    & $composeCmd.Split() exec frontend pnpm lint
    
    Write-Success "Vérification terminée!"
}

function Update-Dependencies {
    $composeCmd = Get-ComposeCommand
    
    Write-Step "Mise à jour des dépendances..."
    
    # Backend
    Write-Info "Mise à jour des dépendances Python..."
    & $composeCmd.Split() exec backend pip install --upgrade -r requirements.txt
    
    # Frontend
    Write-Info "Mise à jour des dépendances Node.js..."
    & $composeCmd.Split() exec frontend pnpm update
    
    Write-Success "Dépendances mises à jour!"
}

# ==========================================
# AFFICHAGE DES INFORMATIONS
# ==========================================

function Show-Urls {
    $host = if ($env:DOCKER_HOST) { $env:DOCKER_HOST } else { "localhost" }
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "🌐 URLS D'ACCÈS" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Frontend (React):     http://$host:5173" -ForegroundColor Green
    Write-Host "Backend API (Flask):  http://$host:5000" -ForegroundColor Green
    Write-Host "MongoDB:              mongodb://$host:27017" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services optionnels:" -ForegroundColor Yellow
    Write-Host "Mongo Express:        http://$host:8081 (profile: tools)" -ForegroundColor Blue
    Write-Host "Redis:                redis://$host:6379 (profile: cache)" -ForegroundColor Blue
    Write-Host "Nginx:                http://$host:80 (profile: proxy)" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Comptes par défaut:" -ForegroundColor Magenta
    Write-Host "Admin:                admin@cesizen.local / admin123" -ForegroundColor Blue
    Write-Host "Test User:            test@cesizen.local / admin123" -ForegroundColor Blue
    Write-Host ""
}

# ==========================================
# SCRIPT PRINCIPAL
# ==========================================

function Main {
    Write-Header
    
    # Vérifier les prérequis
    Test-Docker
    Test-EnvFile
    
    # Changer vers le répertoire du projet
    Set-Location $ProjectRoot
    
    # Exécuter la commande
    switch ($Command.ToLower()) {
        { $_ -in @("start", "up") } {
            Start-Services $Profile
        }
        { $_ -in @("stop", "down") } {
            Stop-Services
        }
        "restart" {
            Restart-Services $Profile
        }
        "build" {
            Build-Images
        }
        "rebuild" {
            Build-Images -NoCache
        }
        { $_ -in @("status", "ps") } {
            Show-Status
        }
        "logs" {
            Show-Logs $Service
        }
        { $_ -in @("shell", "exec") } {
            Open-Shell $Service
        }
        "clean" {
            Clear-Docker
        }
        "reset" {
            Reset-Environment
        }
        "backup" {
            Backup-MongoDB
        }
        { $_ -in @("dev", "develop") } {
            Start-Services "tools"
        }
        "test" {
            Invoke-Tests
        }
        "lint" {
            Invoke-Lint
        }
        { $_ -in @("deps", "dependencies") } {
            Update-Dependencies
        }
        "tools" {
            Start-Services "tools"
        }
        "cache" {
            Start-Services "cache"
        }
        "proxy" {
            Start-Services "proxy"
        }
        { $_ -in @("urls", "info") } {
            Show-Urls
        }
        default {
            Show-Help
        }
    }
}

# Exécuter le script principal
Main 