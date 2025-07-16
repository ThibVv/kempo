#!/bin/bash

# Script de déploiement Docker Compose
# Usage: ./deploy.sh [env]

set -e

ENV=${1:-development}

echo "🚀 Déploiement Kempo - Environnement: $ENV"

# Vérifier les prérequis
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Créer les répertoires nécessaires
mkdir -p logs/nginx
mkdir -p nginx/ssl

# Copier le fichier d'environnement approprié
if [ "$ENV" = "production" ]; then
    if [ ! -f ".env.production" ]; then
        echo "❌ Fichier .env.production introuvable"
        exit 1
    fi
    cp .env.production .env
else
    if [ ! -f ".env.docker" ]; then
        echo "❌ Fichier .env.docker introuvable"
        exit 1
    fi
    cp .env.docker .env
fi

# Arrêter les services existants
echo "🛑 Arrêt des services existants..."
docker-compose down

# Nettoyer les images non utilisées
echo "🧹 Nettoyage des images..."
docker system prune -f

# Construire et démarrer les services
echo "🏗️ Construction et démarrage des services..."
if [ "$ENV" = "production" ]; then
    docker-compose --profile production up -d --build
else
    docker-compose up -d --build
fi

# Attendre que les services soient prêts
echo "⏳ Attente de la disponibilité des services..."
sleep 30

# Vérifier la santé des services
echo "🔍 Vérification de la santé des services..."
docker-compose ps

# Initialiser la base de données si nécessaire
echo "🗄️ Initialisation de la base de données..."
docker-compose exec backend pnpm run init-db || echo "⚠️ Erreur lors de l'initialisation de la DB (peut être normale si déjà initialisée)"

# Afficher les logs
echo "📋 Logs des services:"
docker-compose logs --tail=50

echo "✅ Déploiement terminé!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend: http://localhost:3001"
echo "📊 Base de données: localhost:3306"

if [ "$ENV" = "production" ]; then
    echo "🔒 Nginx: http://localhost:80 (HTTPS: 443)"
fi

echo ""
echo "📝 Commandes utiles:"
echo "  - Logs: docker-compose logs -f"
echo "  - Arrêt: docker-compose down"
echo "  - Redémarrage: docker-compose restart"
echo "  - Shell backend: docker-compose exec backend sh"
echo "  - Shell MySQL: docker-compose exec mysql mysql -u root -p"
