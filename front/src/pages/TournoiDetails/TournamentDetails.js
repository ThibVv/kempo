import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API_CONFIG from "../../config/api.config";
import AddCategoryModal from "./Components/AddCategoryModal";

const TournamentDetails = () => {
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch tournament details, categories and competitors
  useEffect(() => {
    const fetchTournamentData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch tournament details
        const tournamentResponse = await fetch(
          `${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS)}/${tournamentId}`
        );
        
        if (!tournamentResponse.ok) {
          throw new Error(`Erreur lors du chargement du tournoi: ${tournamentResponse.statusText}`);
        }
        
        const tournamentData = await tournamentResponse.json();
        setTournament(tournamentData);
        
        // Fetch categories
        const categoriesResponse = await fetch(
          `${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS)}/${tournamentId}/categories`
        );
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }
        
        // Fetch competitors
        const competitorsResponse = await fetch(
          `${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS)}/${tournamentId}/competitors`
        );
        
        if (competitorsResponse.ok) {
          const competitorsData = await competitorsResponse.json();
          setCompetitors(competitorsData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur:", err);
        setError(`Une erreur est survenue: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchTournamentData();
  }, [tournamentId]);

  // Add category handler
  const handleAddCategory = () => {
    setIsModalOpen(true);
  };

  const handleCategorySubmit = async (categoryData) => {
    try {
      const payload = {
        name: categoryData.name,
        rank: categoryData.grades,
        gender: categoryData.gender,
        weight_category_id: categoryData.weight_category_id ? parseInt(categoryData.weight_category_id) : null,
        age_group_id: categoryData.age_group_id ? parseInt(categoryData.age_group_id) : null,
        elimination_type: categoryData.elimination_type
      };

      const response = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS)}/${tournamentId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess("✅ Catégorie ajoutée avec succès !");
        setIsModalOpen(false);

        // Refresh the list after adding
        const res = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS)}/${tournamentId}/categories`);
        const data = await res.json();
        setCategories(data);
      } else {
        const errorData = await response.json();
        setError(`Erreur lors de l'ajout de la catégorie: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout :", error);
      setError(`Erreur serveur: ${error.message}`);
    }
  };

  // Import automatic competitors handler
  const handleImportCompetitors = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      // Étape 1: Récupérer les compétiteurs compatibles (par rank, gender, etc.)
      const searchResponse = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMPETITORS)}?rank=${tournament.rank || ""}&gender=${tournament.gender || ""}`);

      if (!searchResponse.ok) {
        throw new Error(`Erreur lors de la recherche de compétiteurs compatibles: ${searchResponse.statusText}`);
      }
      
      const compatibleCompetitors = await searchResponse.json();
      
      if (compatibleCompetitors.length === 0) {
        setError("Aucun compétiteur compatible trouvé.");
        setLoading(false);
        return;
      }
      
      // Étape 2: Ajouter chaque compétiteur au tournoi
      let addedCount = 0;
      for (const competitor of compatibleCompetitors) {
        const addResponse = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS)}/${tournamentId}/competitors/${competitor.id}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (addResponse.ok) {
          addedCount++;
        }
      }
      
      if (addedCount === 0) {
        setError("Aucun compétiteur n'a pu être ajouté au tournoi.");
        setLoading(false);
        return;
      }
      
      // Étape 3: Assigner les compétiteurs aux catégories
      const assignResponse = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS)}/${tournamentId}/assign-competitors`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (assignResponse.ok) {
        setSuccess(`✅ ${addedCount} compétiteurs importés et assignés avec succès !`);
        
        // Rafraîchir la liste des compétiteurs
        const res = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS)}/${tournamentId}/competitors`);
        const data = await res.json();
        setCompetitors(data);
      } else {
        const errorText = await assignResponse.text();
        setError(`Erreur lors de l'assignation des compétiteurs: ${errorText}`);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("❌ Erreur lors de l'import :", error);
      setError(`Erreur serveur: ${error.message}`);
      setLoading(false);
    }
  };

  // Start tournament handler
  const handleStartTournament = async () => {
    try {
      // Vérifier s'il y a des compétiteurs
      if (!competitors || competitors.length === 0) {
        setError("Impossible de démarrer le tournoi : aucun compétiteur n'a été ajouté.");
        return;
      }

      // Vérifier s'il y a des catégories
      if (!categories || categories.length === 0) {
        setError("Impossible de démarrer le tournoi : aucune catégorie n'a été créée.");
        return;
      }

      // Vérifier si tous les compétiteurs ont une catégorie assignée
      const competitorsWithoutCategory = competitors.filter(comp => !comp.category);
      if (competitorsWithoutCategory.length > 0) {
        setError(`Impossible de démarrer le tournoi : ${competitorsWithoutCategory.length} compétiteurs n'ont pas de catégorie assignée.`);
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");
      
      // This endpoint should start the tournament and generate matches
      const response = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS)}/${tournamentId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess("✅ Tournoi démarré avec succès !");
        // Navigate to ongoing tournaments after a short delay
        setTimeout(() => {
          navigate('/ongoing-tournaments');
        }, 2000);
      } else {
        // Tenter de récupérer les détails de l'erreur
        try {
          const errorData = await response.json();
          setError(`Erreur lors du démarrage du tournoi: ${errorData.message || JSON.stringify(errorData)}`);
        } catch (jsonError) {
          const errorText = await response.text();
          setError(`Erreur lors du démarrage du tournoi: ${errorText || response.statusText}`);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("❌ Erreur lors du démarrage :", error);
      setError(`Erreur serveur: ${error.message}`);
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur peut gérer ce tournoi
  const canManageTournament = () => {
    if (!user || !tournament) return false;
    
    // Admin peut tout gérer
    if (userRole === 'admin') return true;
    
    // Club admin peut gérer les tournois de son club
    if (userRole === 'club_admin' && user.club === tournament.club) return true;
    
    return false;
  };

  if (loading) {
    return <div className="loading">Chargement des données du tournoi...</div>;
  }

  return (
    <div className="tournament-details-container">
      <h2 className="tournament-title">📝 Détails du Tournoi</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {tournament && (
        <div className="tournament-info">
          <h3>{tournament.name}</h3>
          <p>Date: {new Date(tournament.start_date).toLocaleDateString()}</p>
          <p>Ville: {tournament.city || 'Non spécifiée'}</p>
          <p>Grade: {tournament.rank || 'Non spécifié'}</p>
          <p>Genre: {tournament.gender === 'H' ? 'Homme' : tournament.gender === 'F' ? 'Femme' : 'Mixte'}</p>
          <p>Système: {tournament.system || 'Poules'}</p>
        </div>
      )}

      <div className="actions-container">
        {canManageTournament() && (
          <>
            <button className="action-button" onClick={handleImportCompetitors}>
              🔄 Importer les Compétiteurs Automatiquement
            </button>
            <button className="action-button" onClick={handleAddCategory}>
              ➕ Ajouter Catégorie
            </button>
            <button className="action-button start-button" onClick={handleStartTournament}>
              🚀 Démarrer le Tournoi
            </button>
          </>
        )}
        {!canManageTournament() && (
          <div className="user-info">
            <p>Vous pouvez consulter les détails de ce tournoi mais seuls les administrateurs du club organisateur peuvent le gérer.</p>
          </div>
        )}
      </div>

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCategorySubmit}
      />

      <div className="data-section">
        <h3>📋 Catégories</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rang</th>
              <th>Genre</th>
              <th>Catégorie de poids</th>
              <th>Groupe d'âge</th>
              <th>Type d'élimination</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">Aucune catégorie trouvée.</td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={index}>
                  <td>{Array.isArray(cat.rank) ? cat.rank.join(", ") : cat.rank}</td>
                  <td>{cat.gender}</td>
                  <td>{cat.weight_category || "N/A"}</td>
                  <td>{cat.age_group || "N/A"}</td>
                  <td>{cat.elimination_type === "poule" ? "Poules" : "Élimination directe"}</td>
                  <td>
                    <button className="details-button" onClick={() => alert(JSON.stringify(cat, null, 2))}>
                      🔍 Détails
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="data-section">
        <h3>👥 Compétiteurs</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Grade</th>
              <th>Genre</th>
              <th>Poids</th>
              <th>Club</th>
              <th>Catégorie</th>
            </tr>
          </thead>
          <tbody>
            {competitors.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">Aucun compétiteur trouvé. Utilisez l'import automatique pour ajouter des compétiteurs.</td>
              </tr>
            ) : (
              competitors.map((comp, index) => (
                <tr key={index}>
                  <td>{comp.lastname}</td>
                  <td>{comp.firstname}</td>
                  <td>{comp.rank}</td>
                  <td>{comp.gender === 'H' ? 'Homme' : comp.gender === 'F' ? 'Femme' : 'Non spécifié'}</td>
                  <td>{comp.weight ? `${comp.weight} kg` : 'N/A'}</td>
                  <td>{comp.club || 'N/A'}</td>
                  <td>{comp.category ? comp.category.name : 'Non assigné'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TournamentDetails;
