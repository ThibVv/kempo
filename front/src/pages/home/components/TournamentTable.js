import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./TournamentTable.module.css";
import Filter from "./Filters";
import EditTournoiModal from "./EditTournamentModal";
import CreateTournoi from "./CreateTournament";
import UnregisterTournamentModal from "./UnregisterTournamentModal";
// Import de la configuration API centralisée
import API_CONFIG from "../../../config/api.config";

const TournoiTable = () => {
  const navigate = useNavigate();
  const [searchQueryName, setSearchQueryName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tournois, setTournois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournoi, setSelectedTournoi] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [unregisterOpen, setUnregisterOpen] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [infoMessage, setInfoMessage] = useState("");
  const [error, setError] = useState("");
  
  const { user, userRole, isAuthenticated } = useAuth();

  // Fetch tournaments
  const fetchTournaments = useCallback(() => {
    setLoading(true);
    setError("");
    
    // Construire les headers avec le token si disponible
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    fetch(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS), {
      headers: headers
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Tournois récupérés:", data);
        setTournois(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des tournois:", err);
        setError("Impossible de charger les tournois. Veuillez réessayer plus tard.");
        setLoading(false);
      });
  }, []);
  
  // Fetch user registrations
  const fetchUserRegistrations = useCallback(() => {
    // Désactiver temporairement les appels d'API pour les inscriptions jusqu'à ce que la route existe dans le backend
    setUserRegistrations([]);
    return;
    
    /* Cette partie est commentée pour éviter les erreurs 404
    if (!isAuthenticated || !user?.id) return;
    
    fetch(`${API_CONFIG.BASE_URL}/users/${user.id}/registrations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setUserRegistrations(data);
      })
      .catch(err => {
        console.error("Erreur lors du chargement des inscriptions:", err);
      });
    */
  }, [/* isAuthenticated, user */]);

  useEffect(() => {
    fetchTournaments();
    fetchUserRegistrations();
    
    // Afficher le message d'information une seule fois par session
    const hasShownInfo = sessionStorage.getItem('tournamentInfoShown');
    if (!hasShownInfo && isAuthenticated) {
      setInfoMessage("Rappel : Toute désinscription à un tournoi doit se faire au moins 48h avant le début de celui-ci.");
      sessionStorage.setItem('tournamentInfoShown', 'true');
      
      // Cacher le message après 10 secondes
      const timer = setTimeout(() => {
        setInfoMessage("");
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, fetchTournaments, fetchUserRegistrations]);

  const filteredTournois = tournois.filter((tournoi) =>
    tournoi.name?.toLowerCase().includes(searchQueryName.toLowerCase()) &&
    (selectedDate === "" || tournoi.start_date?.startsWith(selectedDate)) &&
    (selectedCategory === "" || tournoi.rank === selectedCategory)
  );

  const handleViewDetails = (id) => {
    navigate(`/tournament/${id}`);
  };

  const handleLaunchTournament = async (id) => {
    if (userRole !== 'admin' && userRole !== 'club_admin') return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS)}/${id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        alert(`Le tournoi a été lancé avec succès! Vous allez être redirigé vers la page des tournois en cours.`);
        // Redirection vers la liste des tournois en cours
        navigate('/ongoing-tournaments');
      } else {
        const errorText = await response.text();
        alert(`Erreur lors du lancement du tournoi: ${errorText}`);
      }
    } catch (error) {
      console.error("Erreur lors du lancement du tournoi:", error);
      alert(`Une erreur est survenue lors du lancement du tournoi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const isUserRegistered = (tournamentId) => {
    return userRegistrations.some(reg => reg.tournamentId === tournamentId);
  };
  
  const handleUnregisterComplete = (tournamentId) => {
    // Mettre à jour la liste des inscriptions de l'utilisateur après désinscription
    setUserRegistrations(prev => prev.filter(reg => reg.tournamentId !== tournamentId));
    // Afficher un message de confirmation
    alert("Vous avez été désinscrit du tournoi avec succès.");
  };

  // Fonction pour gérer l'inscription à un tournoi
  const handleRegisterToTournament = async (tournamentId) => {
    if (!isAuthenticated) {
      alert("Vous devez être connecté pour vous inscrire à un tournoi.");
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.TOURNAMENTS)}/${tournamentId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Inscription réussie !");
        fetchUserRegistrations(); // Rafraîchir les inscriptions
        fetchTournaments(); // Rafraîchir les tournois
      } else {
        if (data.reasons && data.reasons.length > 0) {
          alert(`Inscription refusée :\n${data.reasons.join('\n')}`);
        } else {
          alert(data.message || "Erreur lors de l'inscription");
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      alert("Erreur de connexion. Veuillez réessayer.");
    }
  };

  return (
    <div className={styles.container}>
      {infoMessage && (
        <div className={styles.infoMessage}>
          <span>{infoMessage}</span>
          <button 
            className={styles.closeInfoBtn} 
            onClick={() => setInfoMessage("")}
          >
            ×
          </button>
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          <span>{error}</span>
          <button 
            className={styles.closeErrorBtn} 
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}
    
      <div className={styles.topSection}>
        <h2 className={styles.tableTitle}>Liste des tournois</h2>
        <div className={styles.filterSection}>
          <Filter
            searchQuery={searchQueryName}
            setSearchQuery={setSearchQueryName}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>
      </div>

      {(userRole === 'admin' || userRole === 'club_admin') && (
        <div className={styles.createTournamentSection}>
          <CreateTournoi />
        </div>
      )}
      
      {loading ? (
        <div className={styles.loading}>Chargement des tournois...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.tournamentTable}>
            <thead>
              <tr>
                <th>NOM DU TOURNOI</th>
                <th>DATE</th>
                <th>GENRE</th>
                <th>GRADE</th>
                <th>SYSTÈME</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredTournois.length > 0 ? (
                filteredTournois.map((tournoi, index) => {
                  const isRegistered = isUserRegistered(tournoi.id);
                  const canManage = userRole === 'admin' || (userRole === 'club_admin' && user && user.club === tournoi.club);
                  const isPendingOrStarted = tournoi.status === 'pending' || tournoi.status === 'started';
                  
                  // Debug étendu
                  console.log('Debug tournoi:', {
                    index,
                    tournoi: tournoi.name,
                    userRole,
                    user: user,
                    userClub: user?.club,
                    tournamentClub: tournoi.club,
                    canManage,
                    tournoi_id: tournoi.id
                  });
                  
                  return (
                    <tr key={index}>
                      <td 
                        className={styles.tournamentName}
                        onClick={() => handleViewDetails(tournoi.id)}
                      >
                        {tournoi.name || "Tournoi numéro 1 : Catégorie X"}
                      </td>
                      <td>{tournoi.start_date?.split("T")[0] || "jj/mm/AAAA"}</td>
                      <td>{tournoi.gender || "Homme/Femme"}</td>
                      <td>{tournoi.rank || "Ceinture Blanche"}</td>
                      <td>{tournoi.system || "Poules"}</td>
                      <td className={styles.actionButtons}>
                        <button 
                          className={styles.detailsBtn}
                          onClick={() => handleViewDetails(tournoi.id)}
                        >
                          DÉTAILS
                        </button>
                        
                        {canManage && (
                          <button 
                            className={styles.launchBtn} 
                            onClick={() => handleLaunchTournament(tournoi.id)}
                          >
                            LANCEMENT
                          </button>
                        )}
                        
                        {!isRegistered && !canManage && tournoi.status === 'OPEN' && (
                          <button 
                            className={styles.registerBtn} 
                            onClick={() => handleRegisterToTournament(tournoi.id)}
                          >
                            S'INSCRIRE
                          </button>
                        )}
                        
                        {isRegistered && isPendingOrStarted && (
                          <button 
                            className={styles.unregisterBtn} 
                            onClick={() => {
                              setSelectedTournoi(tournoi);
                              setUnregisterOpen(true);
                            }}
                          >
                            SE DÉSINSCRIRE
                          </button>
                        )}
                        
                        {!isRegistered && isPendingOrStarted && (
                          <button 
                            className={styles.registerBtn} 
                            onClick={() => handleRegisterToTournament(tournoi.id)}
                          >
                            S'INSCRIRE
                          </button>
                        )}
                        
                        {canManage && (
                          <div className={styles.actionIcons}>
                            <button 
                              className={styles.editBtn}
                              onClick={() => {
                                setSelectedTournoi(tournoi);
                                setEditOpen(true);
                              }}
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className={styles.noData}>Aucun tournoi trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <EditTournoiModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        tournament={selectedTournoi}
        onUpdate={fetchTournaments}
      />
      
      <UnregisterTournamentModal 
        isOpen={unregisterOpen}
        onClose={() => setUnregisterOpen(false)}
        tournament={selectedTournoi}
        onUnregister={handleUnregisterComplete}
      />
    </div>
  );
};

export default TournoiTable;
