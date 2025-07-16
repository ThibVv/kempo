
# Workflow de développement - Projet Kempo

## 🎯 Workflow CI/CD Professionnel

### 🔄 Pipeline Feature Branches (`ci-feature.yml`)
Déclenché sur push vers `feature/**`, `bugfix/**`, `hotfix/**`, `refactor/**`

**Étapes du pipeline :**
1. **📦 Dependencies & Security** : Installation des dépendances avec cache, audit de sécurité
2. **🏗️ Build & Validate** : Compilation TypeScript backend, build React frontend
3. **🧪 Unit Tests** : Tests unitaires backend/frontend avec couverture
4. **📊 SonarCloud Analysis** : Analyse statique de qualité du code
5. **🚪 Quality Gate** : Validation des seuils de qualité
6. **🔗 Integration Check** : Vérification de l'intégration complète

### 🚀 Pipeline Dev Branch (`ci-dev.yml`)
Déclenché sur push/PR vers `dev`

**Étapes du pipeline :**
1. **📦 Setup & Validation** : Installation et validation des dépendances
2. **🧪 Comprehensive Tests** : Tests unitaires et d'intégration (matrix strategy)
3. **🏗️ Production Build** : Build optimisé pour la production
4. **📊 SonarCloud Dev Analysis** : Analyse spécifique branche dev
5. **🚪 Dev Quality Gate** : Validation qualité pour staging
6. **🚀 Staging Deployment** : Déploiement automatique en staging

### 🏆 Pipeline Production (`ci-production.yml`)
Déclenché sur push/PR vers `master`/`main`

**Étapes du pipeline :**
1. **🔍 Pre-production Checks** : Audit sécurité approfondi, tests complets
2. **🏗️ Production Build** : Build optimisé avec dépendances de production
3. **📊 Production Quality Analysis** : Analyse SonarCloud finale
4. **🏷️ Create Release** : Création automatique de version et release
5. **🚀 Production Deployment** : Déploiement en production avec health checks
6. **📋 Post-deployment Tasks** : Migrations, cache, monitoring

### 🔍 Pipeline Pull Request (`pr-validation.yml`)
Déclenché sur toute PR

**Étapes du pipeline :**
1. **🔍 PR Validation** : Tests rapides, build check, validation des changements

### 📊 Pipeline SonarCloud (`sonarcloud.yml`)
Analyse continue de qualité (déclenchement manuel et hebdomadaire)

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

# 🎉 La pipeline ci-feature.yml se déclenche automatiquement :
# ✅ Dependencies & Security
# ✅ Build & Validate  
# ✅ Unit Tests
# ✅ SonarCloud Analysis
# ✅ Quality Gate
# ✅ Integration Check
```

### 2. Merge vers dev
```bash
# Créer une PR vers dev
gh pr create --base dev --head feature/nouvelle-fonctionnalite --title "feat: Nouvelle fonctionnalité"

# Après review et merge vers dev :
# 🎉 La pipeline ci-dev.yml se déclenche :
# ✅ Comprehensive Tests
# ✅ Production Build
# ✅ SonarCloud Dev Analysis
# ✅ Staging Deployment
```

### 3. Release vers production
```bash
# Créer une PR de dev vers master
gh pr create --base master --head dev --title "Release v1.x.x"

# Après merge vers master :
# 🎉 La pipeline ci-production.yml se déclenche :
# ✅ Pre-production Checks
# ✅ Production Build
# ✅ Quality Analysis
# ✅ Create Release
# ✅ Production Deployment
```

## 📊 Workflows disponibles

### 🔍 Où vérifier les pipelines
- **GitHub Actions** : https://github.com/ThibVv/kempo/actions
- **SonarCloud** : https://sonarcloud.io/project/overview?id=ThibVv_kempo
- **Staging** : https://staging.kempo-app.com (futur)
- **Production** : https://kempo-app.com (futur)

### � Liste des workflows
- **`ci-feature.yml`** : Pipeline complète pour branches feature
- **`ci-dev.yml`** : Pipeline dev avec tests complets et staging
- **`ci-production.yml`** : Pipeline production avec release et déploiement
- **`pr-validation.yml`** : Validation rapide des Pull Requests
- **`sonarcloud.yml`** : Analyse SonarCloud manuelle et programmée

### �📢 Notifications automatiques
- ✅ Succès des pipelines avec résumé détaillé
- ❌ Échecs avec détails et étapes à suivre
- 🚀 Déploiements réussis avec URLs
- 🚨 Alertes de sécurité et qualité
- 📊 Rapports de couverture et métriques

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

## 🎯 Avantages du workflow professionnel

✅ **Pipelines spécialisées** : Workflows séparés pour chaque environnement
✅ **Performance optimisée** : Cache des dépendances, jobs parallèles
✅ **Qualité garantie** : Tests complets + SonarCloud + Quality Gates
✅ **Déploiement sécurisé** : Validation à chaque étape avec health checks
✅ **Releases automatiques** : Versioning et release notes automatiques
✅ **Monitoring avancé** : Résumés détaillés dans GitHub Actions
✅ **Artifacts sécurisés** : Builds optimisés avec rétention configurée
✅ **Rollback facilité** : Versions tagguées et packages de déploiement
✅ **Feedback immédiat** : Notifications claires sur succès/échecs
✅ **Conformité** : Audits de sécurité et standards de qualité respectés
