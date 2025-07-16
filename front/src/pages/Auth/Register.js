import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    club: '',
    city: '',
    grade: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  
  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate, isAuthenticated]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
    const [successMessage, setSuccessMessage] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    // Vérifier que les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }
    
    // Vérifier l'âge minimum (13 ans)
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 13 || (age === 13 && monthDiff < 0)) {
      setError("Vous devez avoir au moins 13 ans pour vous inscrire");
      setLoading(false);
      return;
    }
      try {
      // Préparer les données pour l'API
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        birthDate: formData.birthDate,
        club: formData.club, // obligatoire
        city: formData.city,
        grade: formData.grade, // Ajout du grade
        password: formData.password
      };
      
      const result = await register(userData);
        if (result.success) {
        // Afficher le message de succès de l'API
        setSuccessMessage(result.message || 'Inscription réussie ! Vous pouvez maintenant vous connecter.');
        // Attendre 2 secondes pour que l'utilisateur puisse voir le message
        setTimeout(() => {
          // Rediriger vers la page de connexion avec un message de succès
          navigate('/login', { 
            state: { message: result.message || 'Inscription réussie ! Vous pouvez maintenant vous connecter.' }
          });
        }, 2000);
      } else {
        setError(result.error || "Une erreur s'est produite lors de l'inscription");
      }
    } catch (err) {
      setError("Une erreur s'est produite lors de l'inscription");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card register-card">        <h2>Inscription</h2>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="birthDate">Date de naissance</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="club">Club</label>
              <input
                type="text"
                id="club"
                name="club"
                value={formData.club}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">Ville</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="grade">Grade</label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
            >
              <option value="">Sélectionner un grade (optionnel)</option>
              <option value="Ceinture Blanche">Ceinture Blanche</option>
              <option value="Ceinture Blanche-Jaune">Ceinture Blanche-Jaune</option>
              <option value="Ceinture Jaune">Ceinture Jaune</option>
              <option value="Ceinture Jaune-Orange">Ceinture Jaune-Orange</option>
              <option value="Ceinture Orange">Ceinture Orange</option>
              <option value="Ceinture Orange-Verte">Ceinture Orange-Verte</option>
              <option value="Ceinture Verte">Ceinture Verte</option>
              <option value="Ceinture Verte-Bleue">Ceinture Verte-Bleue</option>
              <option value="Ceinture Bleue">Ceinture Bleue</option>
              <option value="Ceinture Bleue-Marron">Ceinture Bleue-Marron</option>
              <option value="Ceinture Marron">Ceinture Marron</option>
              <option value="Ceinture Noire 1ère dan">Ceinture Noire 1ère dan</option>
              <option value="Ceinture Noire 2ème dan">Ceinture Noire 2ème dan</option>
              <option value="Ceinture Noire 3ème dan">Ceinture Noire 3ème dan</option>
              <option value="Ceinture Noire 4ème dan">Ceinture Noire 4ème dan</option>
              <option value="Ceinture Noire 5ème dan">Ceinture Noire 5ème dan</option>
              <option value="Ceinture Noire 6ème dan">Ceinture Noire 6ème dan</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Vous avez déjà un compte ?{' '}
            <span className="auth-link" onClick={() => navigate('/login')}>
              Se connecter
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;