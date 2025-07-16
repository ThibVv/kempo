import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./CompetitorsTable.module.css";
import Filter from "./Filter";
import AjouterCompetiteurs from "./AddCompetitors";
import API_CONFIG from "../../../config/api.config";

const CompetitorTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Chargement des compétiteurs depuis l'API au chargement du composant
  const fetchCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMPETITORS)}`);
      // Transformation des données reçues pour correspondre à notre format d'affichage
      const formattedCompetitors = response.data.map(comp => ({
        id: comp.id,
        name: comp.lastname,
        firstName: comp.firstname,
        club: comp.club || "",
        pays: comp.country,
        dateNaissance: comp.birthday ? new Date(comp.birthday).toISOString().split('T')[0] : "",
        sexe: comp.gender, // Garder H ou F tel quel
        categorie: comp.rank + (comp.weight ? ` (${comp.weight}kg)` : "")
      }));
      setCompetitors(formattedCompetitors);
    } catch (err) {
      console.error("Erreur lors du chargement des compétiteurs:", err);
      setError("Impossible de charger les compétiteurs. Veuillez réessayer plus tard.");
      // En cas d'erreur, on laisse la liste vide
      setCompetitors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []); // Le tableau vide indique que cet effet ne s'exécute qu'une fois au montage du composant

  const handleAdd = (newCompetitor) => {
    setCompetitors([...competitors, newCompetitor]);
    setIsAddModalOpen(false);
  };

  const filteredCompetitors = competitors.filter((comp) =>
    (comp.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     comp.firstName?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedDate === "" || (comp.dateNaissance && comp.dateNaissance.startsWith(selectedDate))) &&
    (selectedGrade === "" || comp.categorie?.includes(selectedGrade))
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompetitors = filteredCompetitors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCompetitors.length / itemsPerPage);

  // Pagination navigation handlers
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce compétiteur ?")) {
      try {
        // Si le compétiteur a un ID de base de données, on l'efface aussi de l'API
        if (id) {
          await axios.delete(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMPETITORS)}/${id}`);
        }
        setCompetitors(competitors.filter(comp => comp.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression du compétiteur.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <Filter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Chargement des compétiteurs...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NOM</th>
                <th>PRÉNOM</th>
                <th>CLUB</th>
                <th>PAYS</th>
                <th>DATE DE NAISSANCE</th>
                <th>SEXE</th>
                <th>CATÉGORIE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {currentCompetitors.length > 0 ? (
                currentCompetitors.map((comp, index) => (
                  <tr key={comp.id || index}>
                    <td>{comp.name}</td>
                    <td>{comp.firstName}</td>
                    <td>{comp.club}</td>
                    <td>{comp.pays}</td>
                    <td>{comp.dateNaissance}</td>
                    <td>{comp.sexe}</td>
                    <td>{comp.categorie}</td>
                    <td className={styles.actionCell}>
                      <button className={styles.btnEdit} title="Modifier">✏️</button>
                      <button 
                        className={styles.btnDelete} 
                        title="Supprimer"
                        onClick={() => handleDelete(comp.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.noData}>Aucun compétiteur trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button onClick={handlePrevPage} disabled={currentPage === 1}>&lt;</button>
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => handlePageClick(i + 1)} 
              className={currentPage === i + 1 ? styles.activePage : ''}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>&gt;</button>
          <span className={styles.pageInfo}>
            PAGE : {currentPage} / {totalPages}
          </span>
        </div>
      )}

      {/* Modal component */}
      <AjouterCompetiteurs
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
        onRefresh={fetchCompetitors}
      />
    </div>
  );
};

export default CompetitorTable;
