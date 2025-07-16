// Test pour s'inscrire à un tournoi
const testRegistration = async () => {
  try {
    // D'abord, récupérer la liste des tournois
    const tournamentsResponse = await fetch('http://localhost:3000/tournaments');
    const tournaments = await tournamentsResponse.json();
    
    console.log('Tournois disponibles:', tournaments.length);
    
    if (tournaments.length === 0) {
      console.log('Aucun tournoi disponible pour tester l\'inscription');
      return;
    }
    
    const tournament = tournaments[0]; // Prendre le premier tournoi
    console.log('Tournoi sélectionné:', tournament.id, tournament.name);
    
    // Maintenant, tenter de s'inscrire (sans token pour tester l'erreur d'auth)
    const registrationResponse = await fetch(`http://localhost:3000/tournaments/${tournament.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Status inscription (sans token):', registrationResponse.status);
    const registrationData = await registrationResponse.text();
    console.log('Response inscription:', registrationData);
    
  } catch (error) {
    console.error('Erreur:', error);
  }
};

testRegistration();
