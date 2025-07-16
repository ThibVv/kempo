import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../../config/api.config';
import styles from './AdminPanel.module.css';

const ClubAdminPanel = ({ userClub }) => {
  const [clubMembers, setClubMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    grade: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchClubMembers();
  }, [userClub]);

  const fetchClubMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/club-members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setClubMembers(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des membres du club');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/create-club-member`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        birthDate: formData.birthDate,
        grade: formData.grade,
        password: formData.password,
        club: userClub,
        role: 'user'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setFormSuccess('Membre du club créé avec succès');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        birthDate: '',
        grade: '',
        password: '',
        confirmPassword: ''
      });
      setShowCreateForm(false);
      fetchClubMembers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/${memberId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchClubMembers();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleApproveMember = async (memberId, memberName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir approuver ${memberName} dans votre club ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.USERS)}/${memberId}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFormSuccess('Membre approuvé avec succès');
      fetchClubMembers();
    } catch (err) {
      setError('Erreur lors de l\'approbation');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const grades = [
    'Ceinture Blanche',
    'Ceinture Blanche-Jaune',
    'Ceinture Jaune',
    'Ceinture Jaune-Orange',
    'Ceinture Orange',
    'Ceinture Orange-Verte',
    'Ceinture Verte',
    'Ceinture Verte-Bleue',
    'Ceinture Bleue',
    'Ceinture Bleue-Marron',
    'Ceinture Marron',
    'Ceinture Noire 1ère dan',
    'Ceinture Noire 2ème dan',
    'Ceinture Noire 3ème dan'
  ];

  if (loading) return <div className={styles.loading}>Chargement...</div>;

  return (
    <div className={styles.adminPanel}>
      <div className={styles.header}>
        <h3>Console Administrateur de Club</h3>
        <p>Gestion des membres de {userClub}</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {formSuccess && <div className={styles.success}>{formSuccess}</div>}

      <div className={styles.actions}>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Annuler' : 'Créer un compte membre'}
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.createForm}>
          <h4>Créer un compte membre</h4>
          {formError && <div className={styles.error}>{formError}</div>}
          
          <form onSubmit={handleCreateMember}>
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
                <label>Date de naissance:</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Grade:</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
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
                Créer le compte membre
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.adminsList}>
        <h4>Membres du club</h4>
        {clubMembers.length === 0 ? (
          <p>Aucun membre trouvé</p>
        ) : (
          <table className={styles.adminsTable}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Grade</th>
                <th>Date de naissance</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clubMembers.map(member => (
                <tr key={member.id}>
                  <td>{member.firstName} {member.lastName}</td>
                  <td>{member.email}</td>
                  <td>{member.grade || 'Non renseigné'}</td>
                  <td>{member.birthDate ? new Date(member.birthDate).toLocaleDateString() : 'Non renseignée'}</td>
                  <td>
                    {member.approved ? (
                      <span className={styles.approvedBadge}>✅ Approuvé</span>
                    ) : (
                      <span className={styles.pendingBadge}>⏳ En attente</span>
                    )}
                  </td>
                  <td>
                    {!member.approved && (
                      <button 
                        className={styles.approveButton}
                        onClick={() => handleApproveMember(member.id, `${member.firstName} ${member.lastName}`)}
                      >
                        Approuver
                      </button>
                    )}
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDeleteMember(member.id)}
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

export default ClubAdminPanel;
