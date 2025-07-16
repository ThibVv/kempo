import React, { useState } from "react";
import styles from "./AddCategoryModal.module.css";

const gradesList = [
  "Ceinture Blanche", "Ceinture Jaune", "Ceinture Orange", "Ceinture Verte",
  "Ceinture Bleue", "Ceinture Marron",
  "Ceinture Noire 1er Dan", "Ceinture Noire 2ème Dan", "Ceinture Noire 3ème Dan",
  "Ceinture Noire 4ème Dan", "Ceinture Noire 5ème Dan", "Ceinture Noire 6ème Dan"
];

const AddCategoryModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [gender, setGender] = useState("H");
  const [eliminationType, setEliminationType] = useState("Poule");

  const handleGradeChange = (grade) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedGrades.length) {
      alert("Veuillez sélectionner au moins un grade.");
      return;
    }

    if (!categoryName) {
      alert("Veuillez saisir un nom de catégorie.");
      return;
    }

    onSubmit({
      name: categoryName,
      grades: selectedGrades,
      gender: gender,
      weight_category_id: null,
      age_group_id: null,
      elimination_type: eliminationType
    });

    // Réinitialiser le formulaire
    setSelectedGrades([]);
    setCategoryName("");
    setGender("H");
    setEliminationType("Poule");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Ajouter une Catégorie</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="categoryName">Nom de la catégorie *</label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              className={styles.textInput}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="gender">Genre *</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className={styles.selectInput}
            >
              <option value="H">Homme</option>
              <option value="F">Femme</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="eliminationType">Type d'élimination *</label>
            <select
              id="eliminationType"
              value={eliminationType}
              onChange={(e) => setEliminationType(e.target.value)}
              required
              className={styles.selectInput}
            >
              <option value="Poule">Poule</option>
              <option value="Directe">Directe</option>
            </select>
          </div>

          <fieldset>
            <legend>Grade *</legend>
            <div className={styles.gradeCheckboxContainer}>
              {gradesList.map((grade) => (
                <div key={grade} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id={`grade-${grade}`}
                    checked={selectedGrades.includes(grade)}
                    onChange={() => handleGradeChange(grade)}
                  />
                  <label htmlFor={`grade-${grade}`}>{grade}</label>
                </div>
              ))}
            </div>
          </fieldset>

          <div className={styles.actions}>
            <button type="button" onClick={onClose}>Annuler</button>
            <button type="submit">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
