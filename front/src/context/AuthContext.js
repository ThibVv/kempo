import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api.config';

// Création du contexte
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // État pour suivre si l'utilisateur est connecté
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // État pour stocker les données de l'utilisateur
  const [user, setUser] = useState(null);
  
  // État pour le rôle de l'utilisateur ('user', 'admin', etc.)
  const [userRole, setUserRole] = useState(null);
  
  // État de chargement pour les opérations asynchrones
  const [loading, setLoading] = useState(true);

  // Configure axios pour inclure le token dans les en-têtes
  const setupAxiosInterceptors = (token) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Vérifie le token au chargement initial
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      setupAxiosInterceptors(token);
      
      try {
        // Appel à l'API pour valider le token et obtenir les infos utilisateur
        const response = await axios.get(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/me`);
        
        if (response.data) {
          setUser(response.data);
          setUserRole(response.data.role);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        // Supprime le token invalide
        localStorage.removeItem('token');
        axios.defaults.headers.common['Authorization'] = '';
      } finally {
        setLoading(false);
      }
    };
    
    checkToken();
  }, []);
  // Fonction pour connecter l'utilisateur
  const login = async (email, password) => {
    try {
      const response = await axios.post(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LOGIN), { email, password });
      
      const { token, user, message } = response.data;
      
      // Stocke le token dans le localStorage
      localStorage.setItem('token', token);
      
      // Configure axios avec le token
      setupAxiosInterceptors(token);
      
      // Met à jour l'état
      setUser(user);
      setUserRole(user.role);
      setIsAuthenticated(true);
      
      return { success: true, message };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error.response) {
        // Erreur de l'API
        errorMessage = error.response.data.message || errorMessage;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };
  // Fonction pour inscrire l'utilisateur
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.REGISTER)}`, userData);
      
      const { message } = response.data;
      
      return { success: true, message };
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = "Une erreur s'est produite lors de l'inscription";
      
      if (error.response) {
        // Erreur de l'API
        errorMessage = error.response.data.message || errorMessage;
        
        // Vérifie si l'erreur est due à un email déjà utilisé
        if (error.response.status === 409) {
          errorMessage = 'Cette adresse email est déjà utilisée';
        }
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Fonction pour déconnecter l'utilisateur
  const logout = () => {
    // Supprime le token du localStorage
    localStorage.removeItem('token');
    
    // Réinitialise les en-têtes axios
    axios.defaults.headers.common['Authorization'] = '';
    
    // Réinitialise l'état
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  // Fonction pour mettre à jour le profil de l'utilisateur
  const updateProfile = async (userData) => {
    try {
      const response = await axios.put(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/profile`, userData);
      
      // Met à jour l'état de l'utilisateur
      setUser(response.data);
      
      return { 
        success: true,
        user: response.data 
      };
    } catch (error) {
      console.error('Update profile error:', error);
      
      let errorMessage = 'Erreur lors de la mise à jour du profil';
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Fonction pour changer le mot de passe
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/password`, { 
        currentPassword, 
        newPassword 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      
      let errorMessage = 'Erreur lors du changement de mot de passe';
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };  // Fonction pour demander une réinitialisation de mot de passe
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD), { email });
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la demande de réinitialisation';
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };
  // Fonction pour réinitialiser le mot de passe avec un token
  const resetPassword = async (token, password) => {
    try {
      const response = await axios.post(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.RESET_PASSWORD), { token, password });
      return { 
        success: true, 
        message: response.data.message 
      };
    } catch (error) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la réinitialisation du mot de passe';
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Valeur du contexte à fournir
  const value = {
    isAuthenticated,
    user,
    userRole,
    loading,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;