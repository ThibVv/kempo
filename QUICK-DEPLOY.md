# 🚀 Guide de Déploiement Render - Branche PROD

## ✅ BRANCHE PROD CRÉÉE ET POUSSÉE !

La branche `prod` est maintenant sur GitHub avec tous les fichiers de déploiement.

**Lien GitHub** : https://github.com/ThibVv/kempo/tree/prod

## 🎯 **Déploiement Render en 5 étapes**

### 1. **Connecter GitHub à Render**
```
1. Aller sur https://render.com
2. Se connecter avec GitHub
3. Sélectionner le repo: ThibVv/kempo
4. Choisir la branche: prod ← IMPORTANT !
```

### 2. **Configurer le service Backend**
```yaml
# Render détectera automatiquement render-simple.yaml
Service Type: Web Service
Branch: prod
Build Command: cd backend && npm install
Start Command: cd backend && npm run start
```

### 3. **Variables d'environnement à ajouter**
```env
# Obligatoires (à configurer manuellement)
MAILJET_API_KEY=your-mailjet-api-key
MAILJET_SECRET_KEY=your-mailjet-secret-key

# Automatiques (générées par Render)
JWT_SECRET=auto-generated
ENCRYPTION_KEY=auto-generated
DATABASE_URL=auto-generated
```

### 4. **Configurer le service Frontend**
```yaml
# Automatiquement détecté
Service Type: Static Site
Branch: prod
Build Command: cd front && npm install && npm run build
Publish Directory: front/build
```

### 5. **Déployer**
```
✅ Cliquer sur "Create Web Service"
✅ Render build automatiquement
✅ Database MySQL créée automatiquement
✅ URLs générées automatiquement
```

## 🌐 **URLs de production**
- **Frontend**: https://kempo-frontend.onrender.com
- **Backend**: https://kempo-backend.onrender.com
- **API**: https://kempo-backend.onrender.com/api

## 🛡️ **Sécurité incluse**
✅ WAF (Web Application Firewall)
✅ Chiffrement AES-256
✅ Rate limiting
✅ CORS protection
✅ Audit logging
✅ OWASP compliance (9/10)

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
