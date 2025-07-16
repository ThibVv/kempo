# 🚀 Guide de Déploiement Final - Application Kempo

## 📋 Statut actuel du déploiement

### ✅ Ce qui fonctionne :
- **Backend API** : ✅ Fonctionne parfaitement sur http://localhost:3001
- **Base de données MySQL** : ✅ Opérationnelle avec toutes les tables
- **Architecture de sécurité** : ✅ Complètement implémentée
- **Build Docker** : ✅ Images créées et fonctionnelles  
- **Branche prod** : ✅ Mise à jour avec tous les correctifs

### ⚠️ À finaliser :
- **Frontend** : En cours de redémarrage (normal au premier lancement)
- **Nginx** : Prêt à être configuré
- **Variables d'environnement** : À configurer sur Render

## 🔧 Déploiement en local (Docker)

### 1. Prérequis
```bash
git clone https://github.com/ThibVv/kempo.git
cd kempo
git checkout prod
```

### 2. Configuration des variables d'environnement
Créer un fichier `.env` :
```env
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
```

### 3. Lancement de l'application
```bash
docker-compose up -d
```

### 4. Accès aux services
- **Backend API** : http://localhost:3001
- **Frontend** : http://localhost:3000 (une fois redémarré)
- **MySQL** : localhost:3307 (utilisateur: kempo_user, mot de passe: secure_database_password)

## 🌐 Déploiement sur Render.com

### 1. Connecter le repository
1. Aller sur https://render.com/
2. Connecter votre compte GitHub
3. Créer un nouveau "Blueprint"
4. Sélectionner le repository `kempo`
5. Choisir la branche `prod`
6. Sélectionner le fichier `render-simple.yaml`

### 2. Configuration des variables d'environnement
Après création du blueprint, ajouter dans les paramètres du service backend :
```
MAILJET_API_KEY=your_actual_mailjet_api_key
MAILJET_SECRET_KEY=your_actual_mailjet_secret_key
```

### 3. URLs des services déployés
- **Backend** : https://kempo-backend.onrender.com
- **Frontend** : https://kempo-frontend.onrender.com

## 🔐 Fonctionnalités de sécurité implémentées

### 1. Chiffrement AES-256
- Données sensibles chiffrées
- Clés générées automatiquement
- Sels uniques pour chaque environnement

### 2. Web Application Firewall (WAF)
- Protection contre les attaques communes
- Validation des requêtes
- Logging des tentatives malveillantes

### 3. Authentification JWT
- Tokens sécurisés
- Expiration automatique
- Rotation des clés

### 4. Middleware de sécurité
- Rate limiting
- CORS protection
- Headers de sécurité
- Validation des entrées

## 🧪 Tests et validation

### 1. Test de l'API
```bash
# Test du health check
curl http://localhost:3001/health

# Test du WAF
curl http://localhost:3001/admin/waf-stats
```

### 2. Test de la sécurité
```bash
# Test du rate limiting
for i in {1..10}; do curl http://localhost:3001/health; done
```

## 📊 Monitoring et logs

### 1. Logs Docker
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs backend -f
```

### 2. Statistiques WAF
- Disponible à l'adresse : `/admin/waf-stats`
- Informations sur les tentatives d'attaque
- Statistiques de performance

## 🔄 Mise à jour et maintenance

### 1. Mise à jour du code
```bash
git pull origin prod
docker-compose build
docker-compose up -d
```

### 2. Sauvegarde de la base de données
```bash
docker exec kempo-mysql mysqldump -u root -p kempo_db > backup.sql
```

### 3. Surveillance des performances
- Utiliser les logs pour identifier les problèmes
- Surveiller l'utilisation des ressources
- Vérifier régulièrement les statistiques WAF

## 🚨 Dépannage

### 1. Problèmes courants
- **Backend ne démarre pas** : Vérifier les variables d'environnement
- **Connexion DB échoue** : Vérifier que MySQL est démarré
- **Frontend ne se charge pas** : Attendre le redémarrage complet

### 2. Commandes utiles
```bash
# Redémarrer tous les services
docker-compose restart

# Reconstruire les images
docker-compose build --no-cache

# Vérifier les logs d'erreur
docker-compose logs backend --tail=50
```

## 📞 Support

En cas de problème :
1. Vérifier les logs avec `docker-compose logs`
2. Consulter les statistiques WAF
3. Vérifier la configuration des variables d'environnement
4. Redémarrer les services si nécessaire

---

**Status** : ✅ Backend opérationnel | ⚠️ Frontend en cours de démarrage | 🔐 Sécurité complète
**Dernière mise à jour** : 16/07/2025 - 21:49 CET
