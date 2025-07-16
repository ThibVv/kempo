// Test pour vérifier le filtrage par club et l'inscription
const testClubFiltering = async () => {
  try {
    console.log('=== Test 1: Récupération des tournois sans authentification ===');
    
    // Test sans token
    const response1 = await fetch('http://localhost:3000/tournaments');
    const tournaments1 = await response1.json();
    console.log('Tournois sans token:', tournaments1.length);
    
    console.log('\n=== Test 2: Connexion et récupération des tournois ===');
    
    // Test avec un utilisateur du club Nancy (à adapter selon vos données)
    const loginResponse = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'pierre.dupont@gmail.com', // Remplacez par un email réel
        password: 'password123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      console.log('Connexion réussie pour:', loginData.user?.club);
      
      // Test avec token
      const response2 = await fetch('http://localhost:3000/tournaments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const tournaments2 = await response2.json();
      console.log('Tournois avec token:', tournaments2.length);
      console.log('Clubs des tournois:', tournaments2.map(t => t.club));
      
      // Test d'inscription
      if (tournaments2.length > 0) {
        console.log('\n=== Test 3: Inscription à un tournoi ===');
        
        const tournament = tournaments2[0];
        console.log('Tentative d\'inscription au tournoi:', tournament.name, 'du club:', tournament.club);
        
        const registrationResponse = await fetch(`http://localhost:3000/tournaments/${tournament.id}/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const registrationData = await registrationResponse.json();
        console.log('Résultat inscription:', registrationResponse.status);
        console.log('Message:', registrationData.message);
        
        if (registrationData.reasons) {
          console.log('Raisons:', registrationData.reasons);
        }
      }
    } else {
      console.log('Erreur de connexion:', loginResponse.status);
      console.log('Créez un utilisateur test ou vérifiez les identifiants');
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
};

testClubFiltering();
