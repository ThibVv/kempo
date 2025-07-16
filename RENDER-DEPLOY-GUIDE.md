# Guide de déploiement sur Render.com

## 📋 Prérequis

1. Compte Render.com
2. Repository GitHub avec branche `prod`
3. Fichier `render.yaml` ou `render-simple.yaml` configuré

## 🚀 Étapes de déploiement

### 1. Création du Blueprint

1. Allez sur [render.com](https://render.com)
2. Cliquez sur "New" → "Blueprint"
3. Connectez votre repository GitHub `ThibVv/kempo`
4. Sélectionnez la branche `prod`

### 2. Configuration du Blueprint

**Nom du Blueprint**: `kempo-app` (ou le nom de votre choix)

**Branche**: `prod`

**Fichier de configuration**: `render.yaml` (ou `render-simple.yaml`)

### 3. Fichiers de configuration disponibles

#### Option 1: render.yaml (complet)
- Inclut base de données MySQL
- Configuration avancée avec toutes les variables d'environnement
- Recommandé pour production complète

#### Option 2: render-simple.yaml (simplifié)
- Configuration minimale
- Plus facile à déboguer
- Bon pour premiers tests

### 4. Variables d'environnement importantes

Les variables suivantes seront générées automatiquement :
- `JWT_SECRET` (généré automatiquement)
- `ENCRYPTION_KEY` (généré automatiquement)
- `ENCRYPTION_SALT` (généré automatiquement)
- `DATABASE_URL` (depuis la base de données)

Variables à configurer manuellement (optionnel) :
- `MAILJET_API_KEY` (pour les emails)
- `MAILJET_SECRET_KEY` (pour les emails)

### 5. Services créés

#### Backend (kempo-backend)
- **URL**: `https://kempo-backend.onrender.com`
- **Port**: 10000
- **Health Check**: `/health`

#### Frontend (kempo-frontend)
- **URL**: `https://kempo-frontend.onrender.com`
- **Type**: Site statique
- **Build**: React optimisé

#### Base de données (kempo-mysql)
- **Type**: MySQL
- **Plan**: Starter
- **Nom**: `kempo_db`

### 6. Résolution des problèmes courants

#### Erreur "Invalid service property url"
- ✅ **Solution**: Utilisez `render-simple.yaml` qui a des URLs hardcodées
- ✅ **Vérifiez**: Que les noms de services correspondent

#### Erreur "Invalid connectionString"
- ✅ **Solution**: Utilisez `DATABASE_URL` au lieu de variables individuelles
- ✅ **Vérifiez**: Configuration MikroORM mise à jour

#### Build qui échoue
- ✅ **Backend**: Vérifiez que `pnpm` est installé
- ✅ **Frontend**: Vérifiez que `npm run build` fonctionne localement

### 7. Commandes de déploiement

#### Pousser les changements
```bash
git add .
git commit -m "Configure render deployment"
git push origin prod
```

#### Redéployer manuellement
1. Allez dans le Dashboard Render
2. Cliquez sur votre service
3. Cliquez "Manual Deploy"

### 8. Monitoring

#### Vérifier le statut
- **Backend Health**: `https://kempo-backend.onrender.com/health`
- **Frontend**: `https://kempo-frontend.onrender.com`

#### Logs
- Consultez les logs dans le Dashboard Render
- Cherchez les erreurs de connexion DB ou de build

### 9. Configuration recommandée

Pour votre premier déploiement, je recommande :

1. **Utilisez `render-simple.yaml`** (plus simple à déboguer)
2. **Configurez d'abord sans Mailjet** (ajoutez les clés plus tard)
3. **Testez le health check** avant de tester l'interface

### 10. Commande de test post-déploiement

```bash
# Test backend
curl https://kempo-backend.onrender.com/health

# Test frontend
curl https://kempo-frontend.onrender.com
```

## 🎯 Étapes suivantes

1. **Créer le Blueprint** avec `render-simple.yaml`
2. **Vérifier les logs** de build
3. **Tester les endpoints** health check
4. **Configurer le domaine** personnalisé (optionnel)
5. **Ajouter les clés Mailjet** quand nécessaire

---

💡 **Conseil** : Commencez avec `render-simple.yaml` pour une configuration plus simple, puis migrez vers `render.yaml` une fois que tout fonctionne !
