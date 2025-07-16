// Script pour créer un utilisateur test
const createTestUser = async () => {
  try {
    console.log('=== Création d\'un utilisateur test ===');
    
    const response = await fetch('http://localhost:3000/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test.nancy@gmail.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'Nancy',
        phone: '0123456789',
        club: 'Nancy Kempo',
        grade: 'Ceinture noire 1er dan'
      })
    });
    
    const data = await response.json();
    console.log('Résultat:', response.status);
    console.log('Message:', data.message);
    
    if (response.ok) {
      console.log('Utilisateur créé avec succès');
      console.log('Email:', data.user?.email);
      console.log('Club:', data.user?.club);
    } else {
      console.log('Erreur:', data.errors || data.message);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
};

createTestUser();
