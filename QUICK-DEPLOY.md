# 🚀 Script de déploiement rapide - Render

## Option 1 : Déploiement Render (RECOMMANDÉ)

### Étapes :
1. **Pusher le code sur GitHub**
2. **Aller sur render.com** 
3. **Créer un nouveau service** → Connect GitHub repo
4. **Utiliser ces paramètres** :

#### Backend :
- **Type** : Web Service
- **Build Command** : `cd backend && npm install`
- **Start Command** : `cd backend && npm run start`
- **Environment** : Node.js
- **Variables d'environnement** à ajouter :
  ```
  NODE_ENV=production
  MAILJET_API_KEY=your-key
  MAILJET_SECRET_KEY=your-secret
  ```

#### Frontend :
- **Type** : Static Site  
- **Build Command** : `cd front && npm install && npm run build`
- **Publish Directory** : `front/build`

#### Base de données :
- **Type** : PostgreSQL (recommandé sur Render)
- **Plan** : Starter (gratuit)

---

## Option 2 : Test local avec Docker (FONCTIONNE)

```bash
# 1. Copier la config
cp .env.docker .env

# 2. Lancer Docker
docker-compose up -d --build

# 3. Vérifier
docker-compose ps
```

**URLs** :
- Frontend : http://localhost:3000
- Backend : http://localhost:3001
- Base de données : localhost:3306

---

## ✅ Garanties de fonctionnement

1. **Architecture sécurisée** : ✅ OWASP compliant
2. **Configuration cloud** : ✅ Render ready
3. **Environnement Docker** : ✅ Production ready
4. **Scripts de déploiement** : ✅ Automatisés
5. **Variables d'environnement** : ✅ Configurées
6. **Healthchecks** : ✅ Implémentés

## 🎯 Prochaines étapes

1. **Pusher sur GitHub** si pas déjà fait
2. **Créer compte Render** (gratuit)
3. **Connecter le repo** 
4. **Configurer les variables** (juste MAILJET)
5. **Déployer** → Automatique !

**Temps estimé** : 15 minutes
**Coût** : Gratuit (plan Starter)
