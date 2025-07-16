# Kempo - Plateforme de Gestion de Tournois

## 🥋 Description
Plateforme web complète pour la gestion de tournois d'arts martiaux avec système d'authentification, gestion des compétiteurs, et scoreboard en temps réel.

## 🏗️ Architecture
- **Frontend**: React.js avec React Router
- **Backend**: Node.js avec Hono Framework
- **Base de données**: MySQL avec MikroORM
- **Authentification**: JWT avec bcrypt

## 🚀 Fonctionnalités
- ✅ Système d'authentification (Admin, Club Admin, Utilisateur)
- ✅ Gestion des tournois avec filtrage par club
- ✅ Inscription aux tournois
- ✅ Gestion des compétiteurs
- ✅ Scoreboard en temps réel
- ✅ Télécommande pour la gestion des matchs
- ✅ Support intégré avec portail Jira
- ✅ Interface responsive

## 📁 Structure du projet
```
app/
├── backend/          # API Backend (Node.js + Hono)
│   ├── src/
│   │   ├── api/
│   │   ├── entities/
│   │   ├── tournaments/
│   │   ├── users/
│   │   └── main.ts
│   └── package.json
├── front/            # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🛠️ Installation

### Prérequis
- Node.js (v16+)
- MySQL
- npm ou pnpm

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd front
npm install
npm start
```

## 🔧 Configuration
1. Configurez votre base de données MySQL
2. Créez les tables nécessaires avec les scripts de migration
3. Configurez les variables d'environnement
4. Ajustez l'URL du portail Jira dans `Support.js`

## 📱 Utilisation
1. Connectez-vous avec vos identifiants
2. Créez ou rejoignez des tournois
3. Gérez les compétiteurs et matchs
4. Utilisez le support intégré si nécessaire

## 🏷️ Versioning
- **v1.0.0**: Version initiale avec fonctionnalités de base
- **v1.1.0**: Ajout du système de support intégré

## 👥 Contribution
Utilisez la branche `dev` pour toutes les modifications et nouvelles fonctionnalités.

## 📞 Support
Support technique disponible via la page Support intégrée dans l'application.
