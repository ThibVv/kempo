// Test des nouveaux mots de passe
async function testNewPasswords() {
  console.log('=== Test des nouveaux mots de passe ===');
  
  const testAccounts = [
    // Admins avec admin123
    { email: 'admin@kempo.com', password: 'admin123', expectedRole: 'super_admin' },
    { email: 'admin.nancy@kempo.com', password: 'admin123', expectedRole: 'club_admin' },
    { email: 'admin.lyon@kempo.com', password: 'admin123', expectedRole: 'club_admin' },
    { email: 'test@nancy.com', password: 'admin123', expectedRole: 'club_admin' },
    { email: 'test@lyon.com', password: 'admin123', expectedRole: 'club_admin' },
    
    // Users avec users123
    { email: 't.verbelen@gmail.com', password: 'users123', expectedRole: 'user' },
    { email: 'tsuyo.th@gmail.com', password: 'users123', expectedRole: 'user' },
    { email: 'pierre.dupont@gmail.com', password: 'users123', expectedRole: 'user' }
  ];
  
  let successCount = 0;
  let totalCount = testAccounts.length;
  
  for (const account of testAccounts) {
    console.log(`\n--- Test ${account.email} ---`);
    
    try {
      const response = await fetch('http://localhost:3001/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: account.email,
          password: account.password
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login réussi!');
        console.log(`   Rôle: ${data.user.role} (attendu: ${account.expectedRole})`);
        console.log(`   Club: ${data.user.club || 'Non défini'}`);
        
        if (data.user.role === account.expectedRole) {
          successCount++;
        } else {
          console.log('⚠️  Rôle différent de celui attendu');
        }
        
        // Test des tournois pour vérifier l'authentification
        const tournamentsResponse = await fetch('http://localhost:3001/tournaments', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        
        if (tournamentsResponse.ok) {
          const tournaments = await tournamentsResponse.json();
          console.log(`   Tournois accessibles: ${tournaments.length}`);
        }
        
      } else {
        const errorData = await response.json();
        console.log('❌ Login échoué:', errorData.message);
      }
    } catch (error) {
      console.log('❌ Erreur réseau:', error.message);
    }
  }
  
  console.log(`\n🎯 Résultats: ${successCount}/${totalCount} comptes fonctionnels`);
  
  if (successCount === totalCount) {
    console.log('🎉 Tous les comptes fonctionnent parfaitement !');
  } else {
    console.log('⚠️  Certains comptes ont des problèmes');
  }
}

testNewPasswords().catch(console.error);
