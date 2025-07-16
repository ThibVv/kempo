import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setMessage(result.message || 'Si cette adresse email est associée à un compte, un lien de réinitialisation vous sera envoyé.');
      } else {
        setError(result.error || 'Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Mot de passe oublié</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <p className="form-description">
              Entrez l'adresse email associée à votre compte et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Entrez votre email"
            />
          </div>
            <div className="form-action">
            <button 
              type="submit" 
              className="auth-button" 
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
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

export default ForgotPassword;
