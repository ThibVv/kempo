# 🚀 Guide de Déploiement - Application Kempo

## 📋 Table des matières
1. [Déploiement Docker Local](#déploiement-docker-local)
2. [Déploiement Render](#déploiement-render)
3. [Configuration SSL](#configuration-ssl)
4. [Monitoring et Logs](#monitoring-et-logs)
5. [Troubleshooting](#troubleshooting)

---

## 🐳 Déploiement Docker Local

### Prérequis
- Docker et Docker Compose installés
- Port 3000, 3001, 3306 disponibles

### 🎯 Déploiement rapide

```bash
# 1. Cloner le projet
git clone <your-repo>
cd kempo

# 2. Configurer l'environnement
cp .env.docker .env
# Modifier les valeurs dans .env selon vos besoins

# 3. Déployer avec le script
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows
.\deploy.ps1
```

### 🔧 Déploiement manuel

```bash
# 1. Construire et démarrer
docker-compose up -d --build

# 2. Vérifier les services
docker-compose ps

# 3. Initialiser la base de données
docker-compose exec backend pnpm run init-db

# 4. Voir les logs
docker-compose logs -f
```

### 🏗️ Services déployés
- **Frontend**: http://localhost:3000 (React + Nginx)
- **Backend**: http://localhost:3001 (Node.js + Hono)
- **Database**: localhost:3306 (MySQL 8.0)

---

## ☁️ Déploiement Render

### Configuration automatique
Le fichier `render.yaml` configure automatiquement :
- Service web backend (Node.js)
- Service web frontend (Static site)
- Base de données MySQL

### 🎯 Étapes de déploiement

1. **Connecter le repo GitHub à Render**
2. **Variables d'environnement à configurer :**
   ```env
   MAILJET_API_KEY=your-mailjet-api-key
   MAILJET_SECRET_KEY=your-mailjet-secret-key
   ```
3. **Render générera automatiquement :**
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`
   - `ENCRYPTION_SALT`
   - `DB_PASSWORD`

### 🔗 URLs de production
- **Frontend**: https://kempo-frontend.onrender.com
- **Backend API**: https://kempo-backend.onrender.com
- **Base de données**: Automatiquement configurée

---

## 🔒 Configuration SSL

### Développement local
```bash
# Générer des certificats auto-signés
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=FR/ST=France/L=Paris/O=Kempo/CN=localhost"

# Déployer avec SSL
docker-compose --profile production up -d
```

### Production
1. **Obtenir un certificat SSL** (Let's Encrypt, CloudFlare)
2. **Placer les certificats dans** `nginx/ssl/`
3. **Configurer les variables d'environnement** :
   ```env
   SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
   SSL_KEY_PATH=/etc/nginx/ssl/key.pem
   ```

---

## 📊 Monitoring et Logs

### Commandes utiles
```bash
# Voir les logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend

# Statut des services
docker-compose ps

# Utilisation des ressources
docker stats

# Entrer dans un container
docker-compose exec backend sh
```

### Emplacements des logs
- **Application**: `./logs/`
- **Nginx**: `./logs/nginx/`
- **Base de données**: Logs Docker

### Health checks
- **Backend**: http://localhost:3001/health
- **Frontend**: http://localhost:3000/
- **Database**: Automatique via Docker

---

## 🔧 Troubleshooting

### Problèmes courants

#### 1. **Service ne démarre pas**
```bash
# Vérifier les logs
docker-compose logs service-name

# Reconstruire l'image
docker-compose build --no-cache service-name
```

#### 2. **Base de données inaccessible**
```bash
# Vérifier la santé de MySQL
docker-compose exec mysql mysqladmin ping -h localhost

# Réinitialiser la base
docker-compose down -v
docker-compose up -d
```

#### 3. **Problème de réseau**
```bash
# Recréer le réseau
docker-compose down
docker network prune
docker-compose up -d
```

#### 4. **Erreur de permissions**
```bash
# Corriger les permissions des logs
sudo chown -R $USER:$USER logs/
```

### Variables d'environnement essentielles

```env
# Obligatoires
JWT_SECRET=minimum-32-caractères
ENCRYPTION_KEY=clé-très-longue-et-sécurisée
DB_PASSWORD=mot-de-passe-sécurisé

# Optionnelles
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=production
```

---

## 🛠️ Maintenance

### Mise à jour
```bash
# Arrêter les services
docker-compose down

# Mettre à jour le code
git pull origin main

# Reconstruire et redémarrer
docker-compose up -d --build
```

### Sauvegarde base de données
```bash
# Export
docker-compose exec mysql mysqldump -u root -p kempo_db > backup.sql

# Import
docker-compose exec mysql mysql -u root -p kempo_db < backup.sql
```

### Nettoyage
```bash
# Nettoyer les images inutilisées
docker system prune -a

# Nettoyer les volumes
docker volume prune
```

---

## 🚨 Sécurité en production

### Checklist sécurité
- [ ] Certificats SSL valides
- [ ] Variables d'environnement sécurisées
- [ ] Rate limiting configuré
- [ ] Firewall configuré
- [ ] Logs de sécurité activés
- [ ] Monitoring en place
- [ ] Sauvegardes automatiques

### Recommandations
1. **Changer tous les secrets par défaut**
2. **Utiliser des mots de passe forts**
3. **Configurer des sauvegardes automatiques**
4. **Surveiller les logs d'sécurité**
5. **Mettre à jour régulièrement**

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `docker-compose logs`
2. Consulter la documentation
3. Vérifier les issues GitHub
4. Contacter l'équipe de développement

**Bonne chance avec votre déploiement ! 🎉**
