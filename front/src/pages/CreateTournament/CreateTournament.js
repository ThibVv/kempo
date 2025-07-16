import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateTournament.module.css';
import API_CONFIG from '../../config/api.config';

function CreateTournament() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '', 
    city: '',
    gender: 'H',
    rank: [],
    system: 'poule',
    ageCategory: '',
    weightCategory: ''
  });

  // États pour les options des select
  const [ranks, setRanks] = useState([]);
  const [ageCategories, setAgeCategories] = useState([]);
  const [weightCategories, setWeightCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // État pour gérer la sélection multiple des grades
  const [selectedRanks, setSelectedRanks] = useState({});

  // Fetch ranks, age categories, and weight categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch ranks using centralized API config
        const ranksResponse = await fetch(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.RANKS));
        if (!ranksResponse.ok) {
          throw new Error('Impossible de récupérer les grades');
        }
        const ranksData = await ranksResponse.json();
        setRanks(ranksData);
        
        // Fetch age categories
        const ageCategoriesResponse = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.AGE_GROUPS)}`);
        if (!ageCategoriesResponse.ok) {
          throw new Error('Impossible de récupérer les catégories d\'âge');
        }
        const ageCategoriesData = await ageCategoriesResponse.json();
        setAgeCategories(ageCategoriesData);
        
        // Fetch weight categories
        const weightCategoriesResponse = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.WEIGHT_CATEGORIES)}`);
        if (!weightCategoriesResponse.ok) {
          throw new Error('Impossible de récupérer les catégories de poids');
        }
        const weightCategoriesData = await weightCategoriesResponse.json();
        setWeightCategories(weightCategoriesData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Une erreur est survenue lors du chargement des données: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Gestionnaire pour la sélection/désélection des grades
  const handleGradeCheckboxChange = (grade) => {
    const newSelectedRanks = { ...selectedRanks };
    newSelectedRanks[grade] = !newSelectedRanks[grade];
    setSelectedRanks(newSelectedRanks);
    
    // Mettre à jour le formData avec les grades sélectionnés
    const selectedGrades = Object.keys(newSelectedRanks).filter(key => newSelectedRanks[key]);
    setFormData(prevState => ({
      ...prevState,
      rank: selectedGrades
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Préparer les données strictement dans le format attendu par l'API backend
      const tournamentData = {
        name: formData.name,
        city: formData.city || undefined,
        start_date: formData.start_date ? new Date(formData.start_date) : undefined,
        end_date: formData.end_date ? new Date(formData.end_date) : undefined
      };
      
      console.log('Envoi des données de tournoi:', tournamentData);
      
      const response = await fetch(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(tournamentData)
      });
      
      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);
      
      if (!response.ok) {
        throw new Error(`Le serveur a répondu avec ${response.status}: ${responseText}`);
      }
      
      setSuccess('Tournoi créé avec succès !');
      setTimeout(() => {
        navigate('/tournois');
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la création du tournoi:', err);
      setError(`Erreur lors de la création du tournoi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !ranks.length && !ageCategories.length && !weightCategories.length) {
    return <div className={styles.loading}>Chargement des données...</div>;
  }

  return (
    <div className={styles.createTournamentContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Création d'un nouveau tournoi</h1>
        <p className={styles.description}>
          Remplissez le formulaire ci-dessous pour créer un nouveau tournoi.
        </p>
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Nom du tournoi</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            required
            placeholder="Exemple: Tournoi international de Paris 2025"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="city" className={styles.label}>Ville</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ville où se déroulera le tournoi"
          />
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="start_date" className={styles.label}>Date de début</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="end_date" className={styles.label}>Date de fin</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="gender" className={styles.label}>Catégorie de genre</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="H">Hommes</option>
            <option value="F">Femmes</option>
            <option value="mixed">Mixte</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Grades autorisés</label>
          <div className={styles.checkboxGrid}>
            {ranks.map((rank, index) => (
              <div key={index} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  id={`rank-${index}`}
                  checked={selectedRanks[rank] || false}
                  onChange={() => handleGradeCheckboxChange(rank)}
                  className={styles.checkbox}
                />
                <label htmlFor={`rank-${index}`} className={styles.checkboxLabel}>{rank}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="system" className={styles.label}>Système de tournoi</label>
          <select
            id="system"
            name="system"
            value={formData.system}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="poule">Poules</option>
            <option value="elimination">Élimination directe</option>
            <option value="mixed">Système mixte (poules + élimination)</option>
          </select>
        </div>
        
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => navigate('/tournois')}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Création en cours...' : 'Créer le tournoi'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTournament;