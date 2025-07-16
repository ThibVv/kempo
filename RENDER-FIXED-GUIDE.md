# 🚀 Guide de déploiement Render - Version corrigée

## 🔧 Problèmes identifiés et solutions

### ❌ Erreur rencontrée :
```
invalid service property url Valid properties are connectionString, host, hostport, port
```

### ✅ Solution : Utiliser des valeurs hardcodées

## 📋 Étapes de déploiement

### 1. Choisir le bon fichier de configuration

**Pour tester rapidement** (recommandé) :
```bash
# Utilisez render-test.yaml
mv render-test.yaml render.yaml
```

**Pour déploiement complet** :
```bash
# Utilisez render-fixed.yaml
mv render-fixed.yaml render.yaml
```

### 2. Pousser sur GitHub

```bash
git add .
git commit -m "Fix render configuration for deployment"
git push origin prod
```

### 3. Déployer sur Render

1. **Aller sur render.com**
2. **New → Blueprint**
3. **Connecter le repo** : `ThibVv/kempo`
4. **Branche** : `prod`
5. **Nom du Blueprint** : `kempo-app`

### 4. Vérifier le déploiement

#### Test Backend :
```bash
curl https://kempo-backend-test.onrender.com/health
```

**Réponse attendue** :
```json
{
  "status": "OK",
  "timestamp": "2025-01-16T...",
  "database": "disconnected",
  "environment": "production"
}
```

## 🎯 Configurations disponibles

### render-test.yaml (Mode test)
- ✅ **Backend seulement**
- ✅ **Pas de base de données**
- ✅ **Variables hardcodées**
- ✅ **Déploiement rapide**

### render-fixed.yaml (Mode complet)
- ✅ **Backend + Frontend**
- ✅ **Base de données MySQL**
- ✅ **Variables hardcodées**
- ✅ **Configuration complète**

## 🔍 Diagnostic des erreurs

### Si le build échoue :
```bash
# Vérifier les logs dans Render Dashboard
# Chercher les erreurs de dépendances
```

### Si le health check échoue :
```bash
# Vérifier que le port 10000 est utilisé
# Vérifier que /health répond
```

### Si la base de données échoue :
```bash
# Utiliser render-test.yaml d'abord
# Ajouter la DB après que le backend fonctionne
```

## 🎉 Prochaines étapes

1. **Tester avec render-test.yaml** (backend seulement)
2. **Vérifier le health check**
3. **Passer à render-fixed.yaml** (complet)
4. **Configurer les vraies clés Mailjet**

## 🛠️ Commandes utiles

```bash
# Changer de configuration
cp render-test.yaml render.yaml

# Tester localement
npm run start

# Vérifier les variables d'environnement
printenv | grep -E "(NODE_ENV|PORT|DATABASE_URL)"
```

---

💡 **Conseil** : Commencez par `render-test.yaml` pour vérifier que le backend se déploie, puis passez à `render-fixed.yaml` pour la version complète !
