# Workflow de développement - Projet Kempo

## 🎯 Workflow recommandé

### 1. Nouvelle fonctionnalité
```bash
# Depuis dev, créer une nouvelle branche feature
git checkout dev
git pull origin dev
git checkout -b feature/nouvelle-fonctionnalite

# Développer la fonctionnalité
# ... code ...

# Commit réguliers avec messages clairs
git add .
git commit -m "feat: Ajout de la nouvelle fonctionnalité X"

# Push de la branche feature
git push origin feature/nouvelle-fonctionnalite
```

### 2. Intégration vers dev
```bash
# Créer une Pull Request : feature/nouvelle-fonctionnalite → dev
# Attendre validation des tests automatiques
# Merger la PR
# Supprimer la branche feature après merge
```

### 3. Release vers master
```bash
# Créer une Pull Request : dev → master
# Validation complète (tests, SonarCloud, etc.)
# Merger uniquement si tout est OK
# Créer un tag de version
git tag -a "v1.2.0" -m "Version 1.2.0 - Description"
git push --tags
```

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

## 📊 Exemples de messages de commit

```bash
# ✅ Bon
git commit -m "feat: Ajout du système de support avec portail Jira"
git commit -m "fix: Correction du filtrage des tournois par club"
git commit -m "docs: Mise à jour du README avec instructions SonarCloud"

# ❌ Mauvais  
git commit -m "update"
git commit -m "fix stuff"
git commit -m "wip"
```

## 🔄 Règles de merge

### Vers dev
- Tests passants
- Code review (même si seul, relecture du code)
- Fonctionnalité complète

### Vers master
- Tous les tests passants
- SonarCloud Quality Gate OK
- Documentation à jour
- Tag de version créé
