// Test de l'API de login sans serveur
async function testLoginAPI() {
  console.log('=== Test de l\'API de login ===');
  
  const testUsers = [
    { email: 'test@nancy.com', password: 'password123', club: 'Nancy Kempo' },
    { email: 'admin@kempo.com', password: 'password123', club: 'Kempo Club' },
    { email: 'admin.nancy@kempo.com', password: 'password123', club: 'Kempo Club Nancy' }
  ];
  
  for (const user of testUsers) {
    console.log(`\n--- Test avec ${user.email} ---`);
    
    try {
      const response = await fetch('http://localhost:3001/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });
      
      console.log('Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login réussi!');
        console.log('Token:', data.token ? 'Présent' : 'Absent');
        console.log('Utilisateur:', data.user?.email, data.user?.role);
        
        // Test avec le token
        if (data.token) {
          console.log('\n--- Test des tournois avec token ---');
          const tournamentsResponse = await fetch('http://localhost:3001/tournaments', {
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });
          
          if (tournamentsResponse.ok) {
            const tournaments = await tournamentsResponse.json();
            console.log('✅ Tournois récupérés:', tournaments.length);
            tournaments.forEach(t => console.log(`  - ${t.name} (${t.club})`));
          } else {
            console.log('❌ Erreur tournois:', tournamentsResponse.status);
          }
        }
      } else {
        const errorData = await response.json();
        console.log('❌ Login échoué:', errorData.message);
      }
    } catch (error) {
      console.log('❌ Erreur réseau:', error.message);
    }
  }
}

testLoginAPI().catch(console.error);
