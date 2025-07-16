// Créer des tournois de test
async function createTestTournaments() {
  console.log('=== Création de tournois de test ===');
  
  const tournaments = [
    {
      name: 'Championnat Nancy 2025',
      city: 'Nancy',
      start_date: '2025-08-15',
      end_date: '2025-08-16',
      userEmail: 'admin.nancy@kempo.com'
    },
    {
      name: 'Tournoi Lyon Inter-Club',
      city: 'Lyon',
      start_date: '2025-09-10',
      end_date: '2025-09-10',
      userEmail: 'admin.lyon@kempo.com'
    },
    {
      name: 'Coupe Nationale Kempo',
      city: 'Paris',
      start_date: '2025-10-05',
      end_date: '2025-10-07',
      userEmail: 'admin@kempo.com'
    }
  ];
  
  for (const tournament of tournaments) {
    console.log(`\n--- Création "${tournament.name}" ---`);
    
    try {
      // 1. Login de l'utilisateur
      const loginResponse = await fetch('http://localhost:3001/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: tournament.userEmail,
          password: 'admin123'
        })
      });
      
      if (!loginResponse.ok) {
        console.log('❌ Erreur login');
        continue;
      }
      
      const loginData = await loginResponse.json();
      console.log(`✅ Login réussi pour ${tournament.userEmail}`);
      
      // 2. Créer le tournoi
      const createResponse = await fetch('http://localhost:3001/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
          name: tournament.name,
          city: tournament.city,
          start_date: tournament.start_date,
          end_date: tournament.end_date
        })
      });
      
      if (createResponse.ok) {
        console.log(`✅ Tournoi "${tournament.name}" créé avec succès`);
      } else {
        const errorText = await createResponse.text();
        console.log(`❌ Erreur création: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
  }
  
  // Lister tous les tournois
  console.log('\n=== Vérification des tournois créés ===');
  try {
    const response = await fetch('http://localhost:3001/tournaments');
    if (response.ok) {
      const tournaments = await response.json();
      console.log(`Total tournois: ${tournaments.length}`);
      tournaments.forEach((t, i) => {
        console.log(`${i + 1}. ${t.name} (${t.city}) - Club: ${t.club}`);
      });
    }
  } catch (error) {
    console.log('❌ Erreur liste tournois:', error.message);
  }
}

createTestTournaments().catch(console.error);
