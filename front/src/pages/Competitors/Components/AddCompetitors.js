import React, { useState, useRef } from "react";
import axios from "axios";
import styles from "./AddCompetitors.module.css";
import API_CONFIG from "../../../config/api.config";

const AddCompetitorModal = ({ isOpen, onClose, onAdd, onRefresh }) => {
  const [form, setForm] = useState({
    name: "",
    firstName: "",
    grade: "",
    birthDate: "",
    sex: "",
    weight: "",
    club: "",
    country: "France"
  });
  
  const [csvFile, setCsvFile] = useState(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("manual"); // "manual" ou "csv"

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const resetForm = () => {
    setForm({
      name: "",
      firstName: "",
      grade: "",
      birthDate: "",
      sex: "",
      weight: "",
      club: "",
      country: "France"
    });
    setCsvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        firstname: form.firstName,
        lastname: form.name,
        birthday: form.birthDate,
        club: form.club,
        country: form.country,
        weight: parseFloat(form.weight),
        rank: form.grade,
        gender: form.sex === "Homme" ? "H" : "F"
      };

      console.log("Sending payload:", JSON.stringify(payload));

      // Utilisation de la configuration API centralisée
      await axios.post(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMPETITORS)}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Update the local UI
      onAdd({
        name: form.name,
        firstName: form.firstName,
        club: form.club,
        pays: form.country,
        dateNaissance: form.birthDate,
        sexe: form.sex === "Homme" ? "M" : "F",
        categorie: `${form.grade} (${form.weight}kg)`
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout du compétiteur:", error);
      console.error("Détails de l'erreur:", error.response ? error.response.data : error.message);
      alert(`Échec de l'ajout: ${error.response ? error.response.data : error.message}`);
    }
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    
    if (!csvFile) {
      alert("Veuillez sélectionner un fichier CSV");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await fetch(`${API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.COMPETITORS)}/import/csv`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'import');
      }

      const result = await response.json();
      
      let message = result.message;
      if (result.errors && result.errors.length > 0) {
        message += '\n\nErreurs rencontrées:\n' + result.errors.slice(0, 5).join('\n');
        if (result.errors.length > 5) {
          message += `\n... et ${result.errors.length - 5} autres erreurs`;
        }
      }
      
      alert(message);
      resetForm();
      onClose();
      
      // Recharger la liste des compétiteurs
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error("Erreur lors de l'import CSV :", error);
      alert(`Échec de l'import: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Ajouter un Compétiteur</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === "manual" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            Ajout Manuel
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "csv" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("csv")}
          >
            Import CSV
          </button>
        </div>

        {activeTab === "manual" ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Nom:</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Prénom:</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Club:</label>
                <input
                  type="text"
                  name="club"
                  value={form.club}
                  onChange={handleChange}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Pays:</label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className={styles.formInput}
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Allemagne">Allemagne</option>
                  <option value="Espagne">Espagne</option>
                  <option value="Italie">Italie</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Grade:</label>
                <select
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                >
                  <option value="">Sélectionner</option>
                  <option value="Ceinture Blanche">Ceinture Blanche</option>
                  <option value="Ceinture Jaune">Ceinture Jaune</option>
                  <option value="Ceinture Orange">Ceinture Orange</option>
                  <option value="Ceinture Verte">Ceinture Verte</option>
                  <option value="Ceinture Bleue">Ceinture Bleue</option>
                  <option value="Ceinture Marron">Ceinture Marron</option>
                  <option value="Ceinture Noire 1er Dan">Ceinture Noire 1er Dan</option>
                  <option value="Ceinture Noire 2ème Dan">Ceinture Noire 2ème Dan</option>
                  <option value="Ceinture Noire 3ème Dan">Ceinture Noire 3ème Dan</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Date de Naissance:</label>
                <input
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Sexe:</label>
                <select
                  name="sex"
                  value={form.sex}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                >
                  <option value="">Sélectionner</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Poids (kg):</label>
                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className={styles.confirmButton}>
                Ajouter
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCsvSubmit} className={styles.csvForm}>
            <div className={styles.csvInstructions}>
              <h3>Instructions pour le fichier CSV</h3>
              <p>Le fichier CSV doit contenir les colonnes suivantes dans cet ordre :</p>
              <ol>
                <li><strong>nom</strong> - Nom de famille (obligatoire)</li>
                <li><strong>prenom</strong> - Prénom (obligatoire)</li>
                <li><strong>club</strong> - Nom du club (optionnel)</li>
                <li><strong>pays</strong> - Pays (obligatoire)</li>
                <li><strong>grade</strong> - Grade/ceinture (obligatoire)</li>
                <li><strong>date_naissance</strong> - Format YYYY-MM-DD (obligatoire)</li>
                <li><strong>sexe</strong> - H pour Homme, F pour Femme (obligatoire)</li>
                <li><strong>poids</strong> - Poids en kg (optionnel)</li>
              </ol>
              <p>La première ligne doit contenir les en-têtes de colonne.</p>
              <p>
                <a 
                  href="/example-competitors.csv" 
                  download="example-competitors.csv"
                  className={styles.downloadLink}
                >
                  📥 Télécharger un exemple de fichier CSV
                </a>
              </p>
            </div>
            
            <div className={styles.fileInputContainer}>
              <label htmlFor="csvFileInput" className={styles.fileLabel}>
                Sélectionner un fichier CSV
              </label>
              <input
                type="file"
                id="csvFileInput"
                accept=".csv"
                onChange={handleFileChange}
                className={styles.fileInput}
                ref={fileInputRef}
              />
              {csvFile && (
                <p className={styles.selectedFile}>
                  Fichier sélectionné: {csvFile.name}
                </p>
              )}
            </div>
            
            <div className={styles.actions}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className={styles.confirmButton} disabled={!csvFile}>
                Importer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddCompetitorModal;
