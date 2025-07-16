# Script de déploiement Docker Compose pour Windows
# Usage: .\deploy.ps1 [env]

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "development"
)

Write-Host "🚀 Déploiement Kempo - Environnement: $Environment" -ForegroundColor Green

# Vérifier les prérequis
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé" -ForegroundColor Red
    exit 1
}

if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose n'est pas installé" -ForegroundColor Red
    exit 1
}

# Créer les répertoires nécessaires
New-Item -ItemType Directory -Force -Path "logs\nginx" | Out-Null
New-Item -ItemType Directory -Force -Path "nginx\ssl" | Out-Null

# Copier le fichier d'environnement approprié
if ($Environment -eq "production") {
    if (!(Test-Path ".env.production")) {
        Write-Host "❌ Fichier .env.production introuvable" -ForegroundColor Red
        exit 1
    }
    Copy-Item ".env.production" ".env" -Force
} else {
    if (!(Test-Path ".env.docker")) {
        Write-Host "❌ Fichier .env.docker introuvable" -ForegroundColor Red
        exit 1
    }
    Copy-Item ".env.docker" ".env" -Force
}

# Arrêter les services existants
Write-Host "🛑 Arrêt des services existants..." -ForegroundColor Yellow
docker-compose down

# Nettoyer les images non utilisées
Write-Host "🧹 Nettoyage des images..." -ForegroundColor Yellow
docker system prune -f

# Construire et démarrer les services
Write-Host "🏗️ Construction et démarrage des services..." -ForegroundColor Yellow
if ($Environment -eq "production") {
    docker-compose --profile production up -d --build
} else {
    docker-compose up -d --build
}

# Attendre que les services soient prêts
Write-Host "⏳ Attente de la disponibilité des services..." -ForegroundColor Yellow
Start-Sleep 30

# Vérifier la santé des services
Write-Host "🔍 Vérification de la santé des services..." -ForegroundColor Yellow
docker-compose ps

# Initialiser la base de données si nécessaire
Write-Host "🗄️ Initialisation de la base de données..." -ForegroundColor Yellow
docker-compose exec backend pnpm run init-db
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Erreur lors de l'initialisation de la DB (peut être normale si déjà initialisée)" -ForegroundColor Yellow
}

# Afficher les logs
Write-Host "📋 Logs des services:" -ForegroundColor Yellow
docker-compose logs --tail=50

Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔗 Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📊 Base de données: localhost:3306" -ForegroundColor Cyan

if ($Environment -eq "production") {
    Write-Host "🔒 Nginx: http://localhost:80 (HTTPS: 443)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📝 Commandes utiles:" -ForegroundColor Blue
Write-Host "  - Logs: docker-compose logs -f" -ForegroundColor White
Write-Host "  - Arrêt: docker-compose down" -ForegroundColor White
Write-Host "  - Redémarrage: docker-compose restart" -ForegroundColor White
Write-Host "  - Shell backend: docker-compose exec backend sh" -ForegroundColor White
Write-Host "  - Shell MySQL: docker-compose exec mysql mysql -u root -p" -ForegroundColor White
