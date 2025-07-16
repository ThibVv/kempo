# Workflow de développement - Projet Kempo

# Workflow de développement - Projet Kempo

## 🎯 Workflow CI/CD Automatisé

### 🔄 Pipeline Feature Branches
Dès qu'un commit est fait sur une branche `feature/`, `bugfix/`, `hotfix/`, ou `refactor/` :

1. **📦 Validation des dépendances** :
   - Installation des dépendances backend/frontend
   - Audit de sécurité
   - Build validation

2. **🧪 Tests unitaires** :
   - Tests backend avec couverture
   - Tests frontend avec couverture
   - Upload des rapports de couverture

3. **📊 Analyse SonarCloud** :
   - Analyse statique du code
   - Vérification du Quality Gate
   - Rapport de qualité

4. **🔄 Auto-merge vers dev** :
   - Si tous les tests passent
   - Création automatique d'une PR vers `dev`
   - Merge automatique si validé

### 🚀 Pipeline Dev Branch
Quand du code arrive sur `dev` :

1. **🧪 Tests complets** :
   - Tests unitaires
   - Tests d'intégration
   - Tests E2E (futur)

2. **📊 Analyse SonarCloud dev** :
   - Analyse complète de la branche dev
   - Validation du Quality Gate

3. **🏗️ Build et validation** :
   - Build de production
   - Validation des artifacts

4. **🚀 Déploiement staging** :
   - Déploiement automatique en staging
   - Health checks
   - Tests de fumée

### 🏆 Pipeline Master/Main Branch
Pour les releases en production :

1. **🔍 Pré-vérifications production** :
   - Audit de sécurité approfondi
   - Tests de performance
   - Quality Gate final

2. **🏗️ Build production** :
   - Build optimisé pour production
   - Artifacts sécurisés

3. **🏷️ Création de release** :
   - Calcul automatique de version
   - Création de tag et release GitHub
   - Notes de version automatiques

4. **🚀 Déploiement production** :
   - Déploiement automatique
   - Health checks production
   - Monitoring actif

5. **📋 Post-déploiement** :
   - Migrations de base de données
   - Invalidation des caches
   - Notifications équipe

## 🎯 Workflow de développement pratique

### 1. Nouvelle fonctionnalité
```bash
# Depuis dev, créer une nouvelle branche feature
git checkout dev
git pull origin dev
git checkout -b feature/nouvelle-fonctionnalite

# Développer la fonctionnalité
# ... code ...

# Commit et push (déclenche automatiquement la pipeline)
git add .
git commit -m "feat: Ajout de la nouvelle fonctionnalité X"
git push origin feature/nouvelle-fonctionnalite

# 🎉 La pipeline se déclenche automatiquement :
# ✅ Tests des dépendances
# ✅ Build validation
# ✅ Tests unitaires
# ✅ SonarCloud
# ✅ Auto-merge vers dev (si tout passe)
```

### 2. Suivi du pipeline
```bash
# Vérifier le statut des pipelines
gh run list

# Voir les détails d'une pipeline
gh run view <run-id>

# Logs en temps réel
gh run view <run-id> --log
```

### 3. Release vers production
```bash
# Créer une PR de dev vers master
gh pr create --base master --head dev --title "Release v1.x.x"

# Après validation et merge, la pipeline produit se déclenche automatiquement
```

## 📊 Monitoring et notifications

### 🔍 Où vérifier les pipelines
- **GitHub Actions** : https://github.com/ThibVv/kempo/actions
- **SonarCloud** : https://sonarcloud.io/project/overview?id=ThibVv_kempo
- **Staging** : https://staging.kempo-app.com (futur)
- **Production** : https://kempo-app.com (futur)

### 📢 Notifications automatiques
- ✅ Succès des pipelines
- ❌ Échecs avec détails
- 🚀 Déploiements réussis
- 🚨 Alertes de sécurité

## 🏷️ Convention de nommage

### Branches
- `feature/nom-fonctionnalite` : Nouvelles fonctionnalités
- `bugfix/nom-bug` : Corrections de bugs
- `hotfix/nom-urgence` : Corrections urgentes pour prod
- `refactor/nom-refactoring` : Refactorisation de code
- `docs/nom-documentation` : Mise à jour documentation

### Commits (Convention Conventional Commits)
- `feat:` : Nouvelle fonctionnalité
- `fix:` : Correction de bug
- `docs:` : Documentation
- `style:` : Formatage, style
- `refactor:` : Refactorisation
- `test:` : Ajout/modification de tests
- `chore:` : Maintenance, configuration

### Tags
- `v1.0.0` : Version majeure
- `v1.1.0` : Version mineure (nouvelles fonctionnalités)
- `v1.1.1` : Version patch (corrections)

## 🔒 Protections de branches

### Master/Main Branch
- ✅ Pull Request obligatoire
- ✅ Review obligatoire
- ✅ Tests passants obligatoires
- ✅ SonarCloud Quality Gate OK
- ✅ Mise à jour de branche obligatoire

### Dev Branch
- ✅ Tests passants obligatoires
- ✅ SonarCloud Quality Gate OK
- ✅ Mise à jour de branche obligatoire
- ⚠️ Review recommandée

### Feature Branches
- 🔓 Accès libre pour développement
- ✅ Pipeline automatique obligatoire
- ✅ Auto-merge vers dev si validé

## 🚨 Gestion des erreurs

### Pipeline échouée
1. **Vérifier les logs** dans GitHub Actions
2. **Identifier la cause** (tests, build, SonarCloud)
3. **Corriger le problème** sur la branche feature
4. **Repousser** le code (re-déclenche la pipeline)

### SonarCloud Quality Gate échouée
1. **Vérifier le rapport** SonarCloud
2. **Corriger les problèmes** de qualité
3. **Repousser** le code corrigé

### Déploiement échoué
1. **Vérifier les logs** de déploiement
2. **Rollback automatique** (si configuré)
3. **Correction urgente** via hotfix

## � Exemples de messages de commit

```bash
# ✅ Bon
git commit -m "feat: Ajout du système de support avec portail Jira"
git commit -m "fix: Correction du filtrage des tournois par club"
git commit -m "docs: Mise à jour du README avec instructions CI/CD"
git commit -m "test: Ajout de tests unitaires pour le composant Support"
git commit -m "chore: Mise à jour des dépendances de sécurité"

# ❌ Mauvais  
git commit -m "update"
git commit -m "fix stuff"
git commit -m "wip"
```

## 🎯 Avantages de ce workflow

✅ **Automatisation complète** : De la feature à la production
✅ **Qualité garantie** : Tests + SonarCloud obligatoires
✅ **Déploiement sécurisé** : Validation à chaque étape
✅ **Traçabilité** : Historique complet des déploiements
✅ **Rollback facile** : Versions tagguées et artifacts
✅ **Notifications** : Feedback immédiat sur le statut
