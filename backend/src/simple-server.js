// Version simple pour tester le serveur
const { serve } = require('@hono/node-server');
const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { logger } = require('hono/logger');

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

// Route simple pour tester
app.get('/', (c) => c.text('Server is running!'));

app.get('/tournaments', (c) => {
  return c.json([
    { id: 1, name: 'Tournoi test Nancy', club: 'Nancy Kempo' },
    { id: 2, name: 'Tournoi test Lyon', club: 'Lyon Kempo' }
  ]);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: port
});
