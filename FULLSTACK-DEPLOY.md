# Guide de Déploiement Fullstack - Frontend + Backend

## 🚀 Déploiement avec render-fullstack.yaml

### 📋 Services créés :

1. **Backend API** (`kempo-backend`)
   - URL: `https://kempo-backend.onrender.com`
   - Port: 10000
   - Health Check: `/health`

2. **Frontend React** (`kempo-frontend`)
   - URL: `https://kempo-frontend.onrender.com`
   - Build: React optimisé
   - Variables: `REACT_APP_API_URL` pointant vers le backend

### 🔧 Configuration automatique :

- ✅ **CORS configuré** : Frontend autorisé à accéder au backend
- ✅ **Variables d'environnement** : `REACT_APP_API_URL` définie automatiquement
- ✅ **Build optimisé** : React compilé pour la production
- ✅ **Routing** : SPA avec fallback vers `index.html`

### 📝 Étapes pour déployer :

1. **Remplacer render.yaml** (fait ✅)
2. **Pousser vers GitHub** 
3. **Créer nouveau Blueprint sur Render**
4. **Attendre le déploiement** (5-10 minutes)

### 🎯 URLs finales :

- **Frontend** : `https://kempo-frontend.onrender.com`
- **Backend API** : `https://kempo-backend.onrender.com`
- **Health Check** : `https://kempo-backend.onrender.com/health`

### 💰 Coût estimé :

- **Backend** : $7/mois (Starter)
- **Frontend** : $7/mois (Starter)
- **Total** : $14/mois

### 🔍 Tests après déploiement :

```bash
# Test backend
curl https://kempo-backend.onrender.com/health

# Test frontend
curl https://kempo-frontend.onrender.com

# Test API depuis le frontend
# Naviguer vers https://kempo-frontend.onrender.com
```

### 🛠️ Modifications apportées :

1. **api.config.js** : Utilise `process.env.REACT_APP_API_URL`
2. **render.yaml** : Configuration fullstack
3. **CORS** : Backend autorise le frontend

### 🚨 Important :

- **Variables Mailjet** : Ajoutées au backend
- **CORS** : Configuré pour le frontend Render
- **Build** : React compile automatiquement

---

**Prêt pour le déploiement fullstack !** 🎉
