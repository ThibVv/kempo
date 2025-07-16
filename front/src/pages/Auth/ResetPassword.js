import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  useEffect(() => {
    // Récupère le token depuis l'URL
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    
    if (!tokenFromUrl) {
      setTokenError(true);
      setError('Token de réinitialisation manquant ou invalide.');
      return;
    }
    
    setToken(tokenFromUrl);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
      // Vérifie que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    // Vérifie la longueur minimale du mot de passe
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    
    // Vérification supplémentaire pour la force du mot de passe
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && (hasNumbers || hasSpecialChar))) {
      setError('Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre ou caractère spécial.');
      return;
    }
    
    setMessage('');
    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await resetPassword(token, password);
      
      if (result.success) {
        setMessage(result.message || 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.');
        // Redirection vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error || 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si le token est manquant, affiche un message d'erreur
  if (tokenError) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Erreur de réinitialisation</h2>
          <div className="error-message">{error}</div>
          <div className="auth-links">
            <p>
              <span onClick={() => navigate('/forgot-password')} className="auth-link">
                Demander un nouveau lien de réinitialisation
              </span>
            </p>
            <p>
              <span onClick={() => navigate('/login')} className="auth-link">
                Retour à la connexion
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Réinitialisation du mot de passe</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <p className="form-description">
              Le mot de passe doit contenir au moins 6 caractères, incluant une majuscule, une minuscule, et un chiffre ou caractère spécial.
            </p>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Entrez votre nouveau mot de passe"
              disabled={isSubmitting || message}
              minLength={6}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirmez votre nouveau mot de passe"
              disabled={isSubmitting || message}
              minLength={6}
            />
          </div>
          
          <div className="form-action">
            <button 
              type="submit" 
              className="auth-button" 
              disabled={isSubmitting || message}
            >
              {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </div>
          
          <div className="auth-links">
            <p>
              <span onClick={() => navigate('/login')} className="auth-link">
                Retour à la connexion
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
