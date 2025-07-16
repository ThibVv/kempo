import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../../config/api.config';
import styles from './AdminPanel.module.css';

const SuperAdminPanel = () => {
  const [clubAdmins, setClubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    club: '',
    city: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchClubAdmins();
  }, []);

  const fetchClubAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/club-admins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setClubAdmins(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des administrateurs de clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/create-club-admin`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        club: formData.club,
        city: formData.city,
        password: formData.password,
        role: 'club_admin'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setFormSuccess('Administrateur de club créé avec succès');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        club: '',
        city: '',
        password: '',
        confirmPassword: ''
      });
      setShowCreateForm(false);
      fetchClubAdmins();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/${adminId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchClubAdmins();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className={styles.loading}>Chargement...</div>;

  return (
    <div className={styles.adminPanel}>
      <div className={styles.header}>
        <h3>Console Super Administrateur</h3>
        <p>Gestion des administrateurs de clubs</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {formSuccess && <div className={styles.success}>{formSuccess}</div>}

      <div className={styles.actions}>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Annuler' : 'Créer un administrateur de club'}
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.createForm}>
          <h4>Créer un administrateur de club</h4>
          {formError && <div className={styles.error}>{formError}</div>}
          
          <form onSubmit={handleCreateAdmin}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Prénom:</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Nom:</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ville:</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Club:</label>
              <input
                type="text"
                name="club"
                value={formData.club}
                onChange={handleChange}
                required
                placeholder="Ex: Kempo Club Nancy"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Mot de passe:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirmer le mot de passe:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                Créer l'administrateur
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.adminsList}>
        <h4>Administrateurs de clubs existants</h4>
        {clubAdmins.length === 0 ? (
          <p>Aucun administrateur de club trouvé</p>
        ) : (
          <table className={styles.adminsTable}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Club</th>
                <th>Ville</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clubAdmins.map(admin => (
                <tr key={admin.id}>
                  <td>{admin.firstName} {admin.lastName}</td>
                  <td>{admin.email}</td>
                  <td>{admin.club}</td>
                  <td>{admin.city}</td>
                  <td>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDeleteAdmin(admin.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SuperAdminPanel;
