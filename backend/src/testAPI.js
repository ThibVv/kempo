// Test direct de l'API
const testAPI = async () => {
  try {
    console.log('=== Test de l\'API ===');
    
    // Test 1: Vérifier si le serveur répond
    console.log('1. Test de connexion au serveur...');
    const response = await fetch('http://localhost:3000/');
    console.log('Statut:', response.status);
    
    if (response.ok) {
      const text = await response.text();
      console.log('Réponse:', text);
    } else {
      console.log('Serveur non accessible');
      return;
    }
    
    // Test 2: Obtenir les tournois
    console.log('\n2. Test des tournois...');
    const tournamentsResponse = await fetch('http://localhost:3000/tournaments');
    console.log('Statut tournois:', tournamentsResponse.status);
    
    if (tournamentsResponse.ok) {
      const tournaments = await tournamentsResponse.json();
      console.log('Tournois:', tournaments);
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
    console.log('Le serveur n\'est probablement pas démarré');
  }
};

testAPI();
