// Test rapide pour vérifier l'inscription avec un utilisateur "ceinture blanche"
const testUserRegistration = async () => {
  try {
    // Simuler une connexion utilisateur (normalement cela se ferait via l'interface)
    const loginResponse = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com', // Remplacez par l'email d'un utilisateur test
        password: 'password123'     // Remplacez par le mot de passe
      })
    });

    if (!loginResponse.ok) {
      console.log('Erreur de connexion. Créons un utilisateur test pour la démo.');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Récupérer les tournois
    const tournamentsResponse = await fetch('http://localhost:3000/tournaments');
    const tournaments = await tournamentsResponse.json();

    if (tournaments.length === 0) {
      console.log('Aucun tournoi disponible');
      return;
    }

    const tournament = tournaments[0];
    console.log('Tentative d\'inscription au tournoi:', tournament.name);

    // Tenter l'inscription
    const registrationResponse = await fetch(`http://localhost:3000/tournaments/${tournament.id}/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const registrationData = await registrationResponse.json();
    console.log('Résultat inscription:', registrationResponse.status, registrationData);

  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Exécuter le test
testUserRegistration();
