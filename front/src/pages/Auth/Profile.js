import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_CONFIG from '../../config/api.config';
import SuperAdminPanel from './SuperAdminPanel';
import ClubAdminPanel from './ClubAdminPanel';
import './Auth.css';
import './GradeStyles.css';
import styles from './Profile.module.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    club: '',
    city: '',
    grade: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Fonction utilitaire pour déterminer la classe CSS du badge de grade
  const getGradeBadgeClass = (grade) => {
    if (!grade) return '';
    
    if (grade.includes('Blanche') && grade.includes('Jaune')) {
      return 'grade-white-yellow';
    } else if (grade.includes('Jaune') && grade.includes('Orange')) {
      return 'grade-yellow-orange';
    } else if (grade.includes('Orange') && grade.includes('Verte')) {
      return 'grade-orange-green';
    } else if (grade.includes('Verte') && grade.includes('Bleue')) {
      return 'grade-green-blue';
    } else if (grade.includes('Bleue') && grade.includes('Marron')) {
      return 'grade-blue-brown';
    } else if (grade.includes('Blanche')) {
      return 'grade-white';
    } else if (grade.includes('Jaune')) {
      return 'grade-yellow';
    } else if (grade.includes('Orange')) {
      return 'grade-orange';
    } else if (grade.includes('Verte')) {
      return 'grade-green';
    } else if (grade.includes('Bleue')) {
      return 'grade-blue';
    } else if (grade.includes('Marron')) {
      return 'grade-brown';
    } else if (grade.includes('Noire')) {
      return 'grade-black';
    }
    
    return '';
  };

  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { userRole } = useAuth();
  
  // État pour le formulaire de création d'admin
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    club: '',
    city: '',
    password: '',
    confirmPassword: ''
  });
  const [adminFormError, setAdminFormError] = useState('');
  const [adminFormSuccess, setAdminFormSuccess] = useState('');

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }    // Récupérer les données utilisateur
    const fetchUserData = async () => {
      try {
        console.log('URL API:', API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS) + '/me');
        
        const response = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Status code:', response.status);
        console.log('Headers:', [...response.headers.entries()].map(entry => `${entry[0]}: ${entry[1]}`));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Erreur lors de la récupération du profil (${response.status}): ${errorText}`);
        }
          // Validation de la réponse pour s'assurer qu'elle est du JSON valide
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          const errorText = await response.text();
          console.error('Non-JSON response:', errorText);
          throw new Error('La réponse du serveur n\'est pas au format JSON attendu');
        }
        
        const text = await response.text();
        console.log('Response Text:', text);
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('JSON parse error:', e);
          throw new Error('Impossible de parser la réponse JSON du serveur');
        }
        
        if (!data) {
          throw new Error('Données utilisateur non disponibles');
        }
        
        setUserData(data);
          
        // Pré-remplir le formulaire avec toutes les données disponibles
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '',
          club: data.club || '',
          city: data.city || '',
          grade: data.grade || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err) {
        setError(err.message || 'Erreur de chargement du profil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleAdminFormChange = (e) => {
    setAdminFormData({
      ...adminFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      // Validation du mot de passe si modification demandée
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Les nouveaux mots de passe ne correspondent pas');
          return;
        }
        
        if (!formData.currentPassword) {
          setError('Veuillez saisir votre mot de passe actuel');
          return;
        }
      }
        // Préparer les données à envoyer avec tous les champs
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        birthDate: formData.birthDate || null,
        club: formData.club,
        city: formData.city,
        grade: formData.grade
      };
      
      // Ajouter les mots de passe si nécessaire
      if (formData.newPassword && formData.currentPassword) {
        dataToSend.currentPassword = formData.currentPassword;
        dataToSend.newPassword = formData.newPassword;
      }      // Envoyer les données
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        // Vérification du type de contenu pour éviter les erreurs de parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la mise à jour du profil');
        } else {
          throw new Error(`Erreur serveur (code ${response.status}). Veuillez réessayer.`);
        }
      }
      
      // Vérification du type de contenu avant de parser la réponse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La réponse du serveur n\'est pas au format JSON attendu');
      }
      
      // Mettre à jour les données utilisateur
      const updatedData = await response.json();
      setUserData(updatedData);
      
      // Réinitialiser les champs de mot de passe
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccessMessage('Profil mis à jour avec succès');
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
    }
  };
  
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminFormError('');
    setAdminFormSuccess('');
    
    // Vérifications des champs
    if (adminFormData.password !== adminFormData.confirmPassword) {
      setAdminFormError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (!adminFormData.club) {
      setAdminFormError('Le club est obligatoire');
      return;
    }
    
    try {      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: adminFormData.firstName,
          lastName: adminFormData.lastName,
          email: adminFormData.email,
          birthDate: adminFormData.birthDate,
          club: adminFormData.club,
          city: adminFormData.city,
          password: adminFormData.password,
          role: 'admin'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du compte administrateur');
      }
      
      // Réinitialiser le formulaire
      setAdminFormData({
        firstName: '',
        lastName: '',
        email: '',
        birthDate: '',
        club: '',
        city: '',
        password: '',
        confirmPassword: ''
      });
      
      setAdminFormSuccess('Compte administrateur créé avec succès');
      setTimeout(() => {
        setShowAdminForm(false);
        setAdminFormSuccess('');
      }, 3000);
      
    } catch (err) {
      setAdminFormError(err.message || 'Erreur lors de la création du compte administrateur');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };
  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className={styles['loading-container']}>
            <div className={styles['loading-spinner']}></div>
            <h3>Chargement de votre profil...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card profile-card">
        <h2>Mon Profil</h2>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        {/* Bandeau d'attente d'approbation */}
        {userData && userData.role === 'user' && userData.approved === false && (
          <div className={styles['approval-banner']}>
            <div className={styles['approval-content']}>
              <span className={styles['approval-icon']}>⏳</span>
              <div className={styles['approval-text']}>
                <strong>Compte en attente d'approbation</strong>
                <p>Votre inscription au club "{userData.club}" est en attente de validation par l'administrateur. 
                Vous pourrez vous inscrire aux tournois une fois votre compte approuvé.</p>
              </div>
            </div>
          </div>
        )}
        
          {editMode ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className={styles['profile-form-section']}>
              <h3 className={styles['profile-form-title']}>Informations personnelles</h3>
              <div className={styles['form-grid']}>
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
              
              <div className={styles['form-grid']}>
                <div className="form-group">
                  <label htmlFor="birthDate">Date de naissance</label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className={styles['profile-form-section']}>
              <h3 className={styles['profile-form-title']}>Informations sportives</h3>
              <div className={styles['form-grid']}>
                <div className="form-group">
                  <label htmlFor="grade">Grade</label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un grade</option>
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
                
                <div className="form-group">
                  <label htmlFor="club">Club</label>
                  <input
                    type="text"
                    id="club"
                    name="club"
                    value={formData.club}
                    onChange={handleChange}
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
                  />
                </div>
              </div>
            </div>
            
            <div className={styles['profile-form-section']}>
              <h3 className={styles['profile-form-title']}>Sécurité</h3>
              <p className="form-description">Laissez vide si vous ne souhaitez pas changer de mot de passe</p>
              
              <div className="form-group">
                <label htmlFor="currentPassword">Mot de passe actuel</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </div>
              
              <div className={styles['form-grid']}>
                <div className="form-group">
                  <label htmlFor="newPassword">Nouveau mot de passe</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    minLength={formData.newPassword ? "8" : ""}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className={styles['button-container']}>
              <button type="submit" className="auth-button">
                Enregistrer les modifications
              </button>
              <button type="button" className="auth-button secondary" onClick={() => setEditMode(false)}>
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className={styles['profile-info']}>
            <div className={styles['profile-header']}>
              <h3>Informations personnelles</h3>
            </div>
            
            <div className={styles['info-section']}>
              <div className={styles['info-grid']}>
                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>Prénom</span>
                  <span className={styles['info-value']}>{userData?.firstName}</span>
                </div>
                
                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>Nom</span>
                  <span className={styles['info-value']}>{userData?.lastName}</span>
                </div>
                
                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>Email</span>
                  <span className={styles['info-value']}>{userData?.email}</span>
                </div>
                
                <div className={styles['info-row']}>
                  <span className={styles['info-label']}>Date de naissance</span>
                  <span className={styles['info-value']}>
                    {userData?.birthDate 
                      ? new Date(userData.birthDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : <span className={styles['empty']}>Non renseignée</span>}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={styles['profile-header']}>
              <h3>Informations sportives</h3>
            </div>
            
            <div className={styles['info-section']}>
              <div className={styles['info-grid']}>
                <div className={styles['info-row']}>

                  <span className={styles['info-label']}>Grade</span>
                  <div className={styles['grade-display']}>
                    {userData?.grade ? (
                      <>
                        <span>{userData.grade}</span>
                        <span className={`grade-badge ${getGradeBadgeClass(userData.grade)}`}>
                          {userData.grade.split(' ')[1] || ''}
                        </span>
                      </>
                    ) : (
                      <span className={styles['empty']}>Non renseigné</span>
                    )}
                  </div>
                </div>
                
                <div className={styles['info-row']}>

                  <span className={styles['info-label']}>Club</span>
                  <span className={styles['info-value']}>

                    {userData?.club || <span className={styles['empty']}>Non renseigné</span>}
                  </span>
                </div>
                
                <div className={styles['info-row']}>

                  <span className={styles['info-label']}>Ville</span>
                  <span className={styles['info-value']}>

                    {userData?.city || <span className={styles['empty']}>Non renseignée</span>}
                  </span>
                </div>
                
                <div className={styles['info-row']}>

                  <span className={styles['info-label']}>Rôle</span>
                  <span className={styles['info-value']}>
                    {userData?.role === 'super_admin' ? 'Super Administrateur' : 
                     userData?.role === 'club_admin' ? 'Administrateur de Club' :
                     userData?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={styles['button-container']}>

              <button className="auth-button" onClick={() => setEditMode(true)}>
                Modifier le profil
              </button>
              <button className="auth-button danger" onClick={handleLogout}>
                Se déconnecter
              </button>
            </div>
            
            {(userRole === 'admin' || userRole === 'club_admin') && (
              <div className="admin-section">
                <div className="admin-header">
                  <h3>Administration</h3>
                  <button 
                    className="auth-button admin-button" 
                    onClick={() => setShowAdminForm(!showAdminForm)}
                  >
                    {showAdminForm ? 'Annuler' : 'Créer un compte administrateur'}
                  </button>
                </div>
                
                {showAdminForm && (
                  <div className="admin-form-container">
                    <h3>Création d'un compte administrateur</h3>
                    
                    {adminFormError && <div className="error-message">{adminFormError}</div>}
                    {adminFormSuccess && <div className="success-message">{adminFormSuccess}</div>}
                    
                    <form onSubmit={handleCreateAdmin} className="auth-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="adminFirstName">Prénom</label>
                          <input
                            type="text"
                            id="adminFirstName"
                            name="firstName"
                            value={adminFormData.firstName}
                            onChange={handleAdminFormChange}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="adminLastName">Nom</label>
                          <input
                            type="text"
                            id="adminLastName"
                            name="lastName"
                            value={adminFormData.lastName}
                            onChange={handleAdminFormChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="adminEmail">Email</label>
                        <input
                          type="email"
                          id="adminEmail"
                          name="email"
                          value={adminFormData.email}
                          onChange={handleAdminFormChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="adminBirthDate">Date de naissance</label>
                        <input
                          type="date"
                          id="adminBirthDate"
                          name="birthDate"
                          value={adminFormData.birthDate}
                          onChange={handleAdminFormChange}
                          required
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="adminClub">Club</label>
                          <input
                            type="text"
                            id="adminClub"
                            name="club"
                            value={adminFormData.club}
                            onChange={handleAdminFormChange}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="adminCity">Ville</label>
                          <input
                            type="text"
                            id="adminCity"
                            name="city"
                            value={adminFormData.city}
                            onChange={handleAdminFormChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="adminPassword">Mot de passe</label>
                          <input
                            type="password"
                            id="adminPassword"
                            name="password"
                            value={adminFormData.password}
                            onChange={handleAdminFormChange}
                            required
                            minLength="8"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="adminConfirmPassword">Confirmer le mot de passe</label>
                          <input
                            type="password"
                            id="adminConfirmPassword"
                            name="confirmPassword"
                            value={adminFormData.confirmPassword}
                            onChange={handleAdminFormChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <button type="submit" className="auth-button">
                        Créer le compte administrateur
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Consoles d'administration selon le rôle */}
        {userData && userData.role === 'super_admin' && (
          <SuperAdminPanel />
        )}
        
        {userData && userData.role === 'club_admin' && (
          <ClubAdminPanel userClub={userData.club} />
        )}
      </div>
    </div>
  );
};

export default Profile;