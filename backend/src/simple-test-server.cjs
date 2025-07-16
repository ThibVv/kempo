// Serveur simple pour tester le login
const { serve } = require('@hono/node-server');
const { Hono } = require('hono');
const { cors } = require('hono/cors');

const app = new Hono();

// CORS permissif
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Route de test
app.get('/', (c) => c.text('Server is running!'));

// Route de login simulée
app.post('/users/login', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Login attempt:', body);
    
    if (!body.email || !body.password) {
      return c.json({ message: 'Email et mot de passe requis' }, 400);
    }
    
    // Simuler une authentification réussie
    if (body.email === 'test@nancy.com' && body.password === 'password123') {
      return c.json({
        message: 'Connexion réussie !',
        token: 'fake-jwt-token-for-test',
        user: {
          id: 1,
          email: 'test@nancy.com',
          firstName: 'Test',
          lastName: 'Nancy',
          role: 'club_admin',
          club: 'Nancy Kempo'
        }
      });
    }
    
    return c.json({ message: 'Email ou mot de passe incorrect' }, 400);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ message: 'Erreur lors de la connexion' }, 500);
  }
});

// Route des tournois simulée
app.get('/tournaments', (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json([]); // Pas de tournois sans auth
  }
  
  return c.json([
    { id: 1, name: 'Tournoi Nancy Test', club: 'Nancy Kempo' },
    { id: 2, name: 'Tournoi Nancy 2', club: 'Nancy Kempo' }
  ]);
});

const port = 3001;
console.log(`🚀 Serveur de test démarré sur le port ${port}`);

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`✅ Serveur accessible sur http://localhost:${info.port}`);
});
