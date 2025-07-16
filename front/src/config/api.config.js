// Configuration centralisée de l'API
const API_CONFIG = {
  // URL de base de l'API - utilise la variable d'environnement ou localhost par défaut
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3001",
    // Points d'accès de l'API
  ENDPOINTS: {
    TOURNAMENTS: "/tournaments",
    COMPETITORS: "/competitors",
    RANKS: "/ranks",
    AGE_GROUPS: "/age-groups",
    WEIGHT_CATEGORIES: "/weight-categories",
    MATCHES: "/matches",
    LOGIN: "/users/login",
    REGISTER: "/users/register",
    USERS: "/users",
    FORGOT_PASSWORD: "/users/forgot-password",
    RESET_PASSWORD: "/users/reset-password"
  },
  
  // Fonction utilitaire pour construire des URLs d'API
  buildUrl: function(endpoint) {
    return `${this.BASE_URL}${endpoint}`;
  }
};

export default API_CONFIG;