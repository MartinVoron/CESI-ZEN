# ==========================================
# CESIZEN - BACKUP & RESTORE SCRIPT
# ==========================================
# Script PowerShell pour la gestion des sauvegardes MongoDB

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("backup", "restore", "list", "cleanup")]
    [string]$Action,
    
    [string]$BackupFile = "",
    [int]$KeepDays = 7
)

# Configuration
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackupDir = Join-Path $ProjectRoot "backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$DefaultBackupFile = "mongodb_backup_$Timestamp.archive"

# Couleurs pour l'affichage
function Write-Success { param([string]$Message); Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param([string]$Message); Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param([string]$Message); Write-Host "⚠️ $Message" -ForegroundColor Yellow }
function Write-Info { param([string]$Message); Write-Host "ℹ️ $Message" -ForegroundColor Blue }
function Write-Step { param([string]$Message); Write-Host "🔄 $Message" -ForegroundColor Magenta }

function Show-Header {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "🗄️ CESIZEN - BACKUP & RESTORE MANAGER" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-DockerRunning {
    try {
        $null = docker info 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker n'est pas en cours d'exécution. Veuillez le démarrer."
            exit 1
        }
        
        # Vérifier si MongoDB est en cours d'exécution
        $mongoStatus = docker compose ps mongodb --format json | ConvertFrom-Json
        if (-not $mongoStatus -or $mongoStatus.State -ne "running") {
            Write-Error "Le container MongoDB n'est pas en cours d'exécution."
            Write-Info "Démarrez-le avec: docker compose up -d mongodb"
            exit 1
        }
    }
    catch {
        Write-Error "Erreur lors de la vérification de Docker: $($_.Exception.Message)"
        exit 1
    }
}

function Initialize-BackupDirectory {
    if (-not (Test-Path $BackupDir)) {
        Write-Step "Création du répertoire de sauvegarde..."
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        Write-Success "Répertoire de sauvegarde créé: $BackupDir"
    }
}

function Invoke-Backup {
    Write-Step "Démarrage de la sauvegarde MongoDB..."
    
    Initialize-BackupDirectory
    
    $BackupPath = Join-Path $BackupDir $DefaultBackupFile
    
    try {
        # Créer la sauvegarde
        Write-Info "Sauvegarde en cours vers: $BackupPath"
        
        $backupCmd = "docker compose exec -T mongodb mongodump --archive --gzip --db CesiZen"
        $output = Invoke-Expression $backupCmd
        
        if ($LASTEXITCODE -eq 0) {
            # Sauvegarder la sortie dans un fichier
            $output | Out-File -FilePath $BackupPath -Encoding UTF8
            
            $fileSize = (Get-Item $BackupPath).Length
            Write-Success "Sauvegarde terminée avec succès!"
            Write-Info "Fichier: $BackupPath"
            Write-Info "Taille: $([math]::Round($fileSize / 1MB, 2)) MB"
            
            # Créer un fichier de métadonnées
            $metadata = @{
                timestamp = $Timestamp
                database = "CesiZen"
                size_bytes = $fileSize
                created_by = $env:USERNAME
                docker_compose_version = (docker compose version --short)
            } | ConvertTo-Json -Depth 3
            
            $metadataPath = $BackupPath -replace '\.archive$', '.json'
            $metadata | Out-File -FilePath $metadataPath -Encoding UTF8
            
            Write-Success "Métadonnées sauvegardées: $metadataPath"
        }
        else {
            Write-Error "Erreur lors de la sauvegarde (Code: $LASTEXITCODE)"
            exit 1
        }
    }
    catch {
        Write-Error "Erreur lors de la sauvegarde: $($_.Exception.Message)"
        exit 1
    }
}

function Invoke-Restore {
    if (-not $BackupFile) {
        Write-Error "Veuillez spécifier un fichier de sauvegarde avec -BackupFile"
        exit 1
    }
    
    $BackupPath = if (Test-Path $BackupFile) { $BackupFile } else { Join-Path $BackupDir $BackupFile }
    
    if (-not (Test-Path $BackupPath)) {
        Write-Error "Fichier de sauvegarde non trouvé: $BackupPath"
        exit 1
    }
    
    Write-Warning "⚠️ ATTENTION: Cette opération va remplacer toutes les données existantes!"
    $confirm = Read-Host "Êtes-vous sûr de vouloir continuer? (tapez 'oui' pour confirmer)"
    
    if ($confirm -ne "oui") {
        Write-Info "Restauration annulée."
        exit 0
    }
    
    Write-Step "Démarrage de la restauration MongoDB..."
    
    try {
        Write-Info "Restauration depuis: $BackupPath"
        
        # Restaurer la sauvegarde
        $restoreCmd = "Get-Content '$BackupPath' | docker compose exec -T mongodb mongorestore --archive --gzip --drop"
        Invoke-Expression $restoreCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Restauration terminée avec succès!"
            
            # Vérifier la connexion à la base
            $testCmd = "docker compose exec -T mongodb mongosh --eval 'db.adminCommand(`"ping`")'"
            $null = Invoke-Expression $testCmd
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Base de données accessible après restauration"
            }
        }
        else {
            Write-Error "Erreur lors de la restauration (Code: $LASTEXITCODE)"
            exit 1
        }
    }
    catch {
        Write-Error "Erreur lors de la restauration: $($_.Exception.Message)"
        exit 1
    }
}

function Show-BackupList {
    Write-Step "Liste des sauvegardes disponibles..."
    
    if (-not (Test-Path $BackupDir)) {
        Write-Warning "Aucun répertoire de sauvegarde trouvé."
        return
    }
    
    $backups = Get-ChildItem -Path $BackupDir -Filter "*.archive" | Sort-Object LastWriteTime -Descending
    
    if ($backups.Count -eq 0) {
        Write-Warning "Aucune sauvegarde trouvée dans: $BackupDir"
        return
    }
    
    Write-Host ""
    Write-Host "Sauvegardes disponibles:" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    
    foreach ($backup in $backups) {
        $size = [math]::Round($backup.Length / 1MB, 2)
        $age = (Get-Date) - $backup.LastWriteTime
        
        $metadataPath = $backup.FullName -replace '\.archive$', '.json'
        $metadata = if (Test-Path $metadataPath) {
            Get-Content $metadataPath | ConvertFrom-Json
        } else { $null }
        
        Write-Host "📁 $($backup.Name)" -ForegroundColor Green
        Write-Host "   Taille: $size MB" -ForegroundColor Gray
        Write-Host "   Date: $($backup.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
        Write-Host "   Age: $([math]::Floor($age.TotalDays)) jours, $([math]::Floor($age.TotalHours % 24)) heures" -ForegroundColor Gray
        
        if ($metadata) {
            Write-Host "   Base: $($metadata.database)" -ForegroundColor Gray
            Write-Host "   Créé par: $($metadata.created_by)" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

function Invoke-Cleanup {
    Write-Step "Nettoyage des anciennes sauvegardes..."
    
    if (-not (Test-Path $BackupDir)) {
        Write-Info "Aucun répertoire de sauvegarde à nettoyer."
        return
    }
    
    $cutoffDate = (Get-Date).AddDays(-$KeepDays)
    $oldBackups = Get-ChildItem -Path $BackupDir -Filter "*.archive" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
    
    if ($oldBackups.Count -eq 0) {
        Write-Info "Aucune sauvegarde ancienne à supprimer (conservation: $KeepDays jours)."
        return
    }
    
    Write-Info "Sauvegardes à supprimer (plus de $KeepDays jours):"
    foreach ($backup in $oldBackups) {
        Write-Host "  - $($backup.Name) ($($backup.LastWriteTime.ToString('yyyy-MM-dd')))" -ForegroundColor Gray
    }
    
    $confirm = Read-Host "Confirmer la suppression? (o/N)"
    if ($confirm -eq "o" -or $confirm -eq "oui") {
        foreach ($backup in $oldBackups) {
            Remove-Item $backup.FullName -Force
            
            # Supprimer aussi le fichier de métadonnées
            $metadataPath = $backup.FullName -replace '\.archive$', '.json'
            if (Test-Path $metadataPath) {
                Remove-Item $metadataPath -Force
            }
            
            Write-Success "Supprimé: $($backup.Name)"
        }
    }
    else {
        Write-Info "Nettoyage annulé."
    }
}

# ==========================================
# SCRIPT PRINCIPAL
# ==========================================

Show-Header

# Vérifier les prérequis
Test-DockerRunning

# Changer vers le répertoire du projet
Set-Location $ProjectRoot

# Exécuter l'action demandée
switch ($Action) {
    "backup" { Invoke-Backup }
    "restore" { Invoke-Restore }
    "list" { Show-BackupList }
    "cleanup" { Invoke-Cleanup }
}

Write-Host ""
Write-Success "Operation '$Action' terminee avec succes!"
Write-Host "" 