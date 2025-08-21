# ==========================================
# CESIZEN - MONGODB ATLAS BACKUP SCRIPT
# ==========================================
# Script PowerShell pour la gestion des sauvegardes MongoDB Atlas

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
$DefaultBackupFile = "atlas_backup_$Timestamp.gz"

# MongoDB Atlas connection (from environment)
$MongoUri = $env:MONGO_URI
if (-not $MongoUri) {
    $MongoUri = "mongodb+srv://martinvoron:IWKVrumdRMmkZdHS@cluster.btoi0.mongodb.net/"
}

# Couleurs pour l'affichage
function Write-Success { param([string]$Message); Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param([string]$Message); Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param([string]$Message); Write-Host "ℹ️ $Message" -ForegroundColor Blue }
function Write-Warning { param([string]$Message); Write-Host "⚠️ $Message" -ForegroundColor Yellow }

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "🗄️  CESIZEN - MONGODB ATLAS BACKUP" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Créer le dossier de sauvegarde si nécessaire
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Info "Dossier de sauvegarde cree: $BackupDir"
}

switch ($Action) {
    "backup" {
        Write-Info "Demarrage de la sauvegarde MongoDB Atlas..."
        
        $BackupPath = Join-Path $BackupDir $DefaultBackupFile
        
        try {
            # Vérifier si mongodump est disponible
            $mongodumpVersion = mongodump --version 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-Error "mongodump n'est pas installe ou accessible."
                Write-Info "Installez MongoDB Database Tools: https://www.mongodb.com/try/download/database-tools"
                exit 1
            }
            
            Write-Info "Version mongodump: $($mongodumpVersion.Split("`n")[0])"
            Write-Info "Sauvegarde vers: $BackupPath"
            
            # Effectuer la sauvegarde
            mongodump --uri="$MongoUri" --db="CesiZen" --archive="$BackupPath" --gzip
            
            if ($LASTEXITCODE -eq 0) {
                $BackupSize = (Get-Item $BackupPath).Length
                $BackupSizeMB = [math]::Round($BackupSize / 1MB, 2)
                Write-Success "Sauvegarde terminee avec succes!"
                Write-Info "Taille: $BackupSizeMB MB"
                Write-Info "Fichier: $BackupPath"
            } else {
                Write-Error "Erreur lors de la sauvegarde"
                exit 1
            }
        }
        catch {
            Write-Error "Erreur: $($_.Exception.Message)"
            exit 1
        }
    }
    
    "restore" {
        if (-not $BackupFile) {
            Write-Error "Le parametre -BackupFile est requis pour la restauration"
            exit 1
        }
        
        $RestorePath = Join-Path $BackupDir $BackupFile
        if (-not (Test-Path $RestorePath)) {
            Write-Error "Fichier de sauvegarde non trouve: $RestorePath"
            exit 1
        }
        
        Write-Warning "ATTENTION: Cette operation va remplacer les donnees existantes!"
        $confirmation = Read-Host "Tapez 'CONFIRMER' pour continuer"
        
        if ($confirmation -ne "CONFIRMER") {
            Write-Info "Operation annulee"
            exit 0
        }
        
        try {
            Write-Info "Restauration depuis: $RestorePath"
            mongorestore --uri="$MongoUri" --archive="$RestorePath" --gzip --drop
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Restauration terminee avec succes!"
            } else {
                Write-Error "Erreur lors de la restauration"
                exit 1
            }
        }
        catch {
            Write-Error "Erreur: $($_.Exception.Message)"
            exit 1
        }
    }
    
    "list" {
        Write-Info "Sauvegardes disponibles dans: $BackupDir"
        Write-Host ""
        
        if (Test-Path $BackupDir) {
            $backups = Get-ChildItem $BackupDir -Filter "*.gz" | Sort-Object LastWriteTime -Descending
            
            if ($backups.Count -eq 0) {
                Write-Warning "Aucune sauvegarde trouvee"
            } else {
                Write-Host "FICHIER" -PadRight 35 -ForegroundColor Yellow -NoNewline
                Write-Host "TAILLE" -PadRight 15 -ForegroundColor Yellow -NoNewline
                Write-Host "DATE" -ForegroundColor Yellow
                Write-Host ("-" * 65) -ForegroundColor Gray
                
                foreach ($backup in $backups) {
                    $sizeMB = [math]::Round($backup.Length / 1MB, 2)
                    $name = $backup.Name.PadRight(35)
                    $size = "$sizeMB MB".PadRight(15)
                    $date = $backup.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
                    
                    Write-Host $name -NoNewline -ForegroundColor White
                    Write-Host $size -NoNewline -ForegroundColor Cyan
                    Write-Host $date -ForegroundColor Gray
                }
            }
        } else {
            Write-Warning "Dossier de sauvegarde non trouve"
        }
    }
    
    "cleanup" {
        Write-Info "Nettoyage des anciennes sauvegardes (> $KeepDays jours)..."
        
        if (Test-Path $BackupDir) {
            $cutoffDate = (Get-Date).AddDays(-$KeepDays)
            $oldBackups = Get-ChildItem $BackupDir -Filter "*.gz" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
            
            if ($oldBackups.Count -eq 0) {
                Write-Info "Aucune ancienne sauvegarde a nettoyer"
            } else {
                foreach ($backup in $oldBackups) {
                    Remove-Item $backup.FullName -Force
                    Write-Info "Supprime: $($backup.Name)"
                }
                Write-Success "Nettoyage termine: $($oldBackups.Count) fichiers supprimes"
            }
        }
    }
}

Write-Host ""
Write-Success "Operation '$Action' terminee!" 