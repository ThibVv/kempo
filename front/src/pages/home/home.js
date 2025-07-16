
import React from 'react';
import styles from './home.module.css'; // Styles spécifiques à la page Home

import RssFeedWidget from './components/RssFeedWidget.js';

function Home() {
  const feedUrlForHomePage = "https://rmcsport.bfmtv.com/rss/sports-de-combat/"; // Remplacer cet URL par un autre flux RSS

  return (
    <div className={styles.homeContainer}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>PAGE D'ACCUEIL</h1>
        <p className={styles.description}>
          Description ou sous-titre de la page d'accueil.
        </p>
      </div>

      <div className={styles.rssFeedWrapper}>
        <RssFeedWidget rssFeedUrl={feedUrlForHomePage} />
      </div>

      {
      <div className={styles.underConstruction}>
        <h2>Site en Construction</h2>
        <p>De nouvelles fonctionnalités arrivent bientôt !</p>
      </div>
      }
    </div>
  );
}

export default Home;
