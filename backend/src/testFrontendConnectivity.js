// Test de connectivité depuis le frontend
async function testFrontendConnectivity() {
  console.log('=== Test de connectivité frontend → backend ===');
  
  const API_BASE_URL = 'http://localhost:3001';
  
  // Test 1: Vérifier que le serveur répond
  console.log('\n1. Test de base du serveur...');
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    if (response.ok) {
      console.log('✅ Serveur accessible');
    } else {
      console.log('❌ Serveur inaccessible:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
  }
  
  // Test 2: Vérifier l'endpoint login
  console.log('\n2. Test de l\'endpoint login...');
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@kempo.com',
        password: 'admin123'
      })
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login API fonctionne !');
      console.log('Utilisateur:', data.user?.email);
      console.log('Token présent:', data.token ? 'Oui' : 'Non');
    } else {
      const errorData = await response.json();
      console.log('❌ Erreur login:', errorData.message);
    }
  } catch (error) {
    console.log('❌ Erreur requête login:', error.message);
  }
  
  // Test 3: Vérifier l'endpoint tournaments
  console.log('\n3. Test de l\'endpoint tournaments...');
  try {
    const response = await fetch(`${API_BASE_URL}/tournaments`);
    console.log('Status tournaments:', response.status);
    
    if (response.ok) {
      const tournaments = await response.json();
      console.log('✅ API tournaments fonctionne !');
      console.log('Nombre de tournois:', tournaments.length);
    } else {
      console.log('❌ Erreur tournaments:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur requête tournaments:', error.message);
  }
  
  // Test 4: Vérifier CORS
  console.log('\n4. Test CORS...');
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      }
    });
    
    console.log('CORS Status:', response.status);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    });
  } catch (error) {
    console.log('❌ Erreur CORS:', error.message);
  }
  
  console.log('\n🎯 Configuration correcte:');
  console.log('Frontend (port 3000) → Backend (port 3001)');
  console.log('URL API: http://localhost:3001');
  console.log('Endpoint login: /users/login');
}

testFrontendConnectivity().catch(console.error);
