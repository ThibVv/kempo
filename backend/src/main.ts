import { serve } from '@hono/node-server'
import { registerAppRoutes } from './api/register-app-routes.ts'
import { getApp } from './api/get-app.ts'
import { EntityManager } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config.ts';
import { Tournament } from './entities/Tournament.entity.ts';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import * as dotenv from 'dotenv';
import { 
  securityHeaders, 
  rateLimit, 
  requestValidation, 
  auditLog 
} from './middleware/security.middleware.ts';
import { webApplicationFirewall, wafStats } from './middleware/waf.middleware.ts';
import ConfigService from './config/config.service.ts';

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

let orm: MikroORM | null = null;
let em: EntityManager | null = null;

// Initialisation de la base de données (optionnelle en mode test)
const hasDbConfig = process.env.DATABASE_URL || (process.env.DB_PASSWORD && process.env.DB_HOST);

if (hasDbConfig) {
  try {
    orm = await MikroORM.init(config);
    em = orm.em;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.warn('⚠️  Database connection failed, running in test mode:', error instanceof Error ? error.message : 'Unknown error');
  }
} else {
  console.warn('⚠️  No database configuration found, running in test mode without database');
}

const httpApp = getApp();

// Middleware de stockage contextuel
httpApp.use(contextStorage())

// Middleware de sécurité (ordre important)
httpApp.use(securityHeaders);
httpApp.use(rateLimit);
httpApp.use(webApplicationFirewall); // WAF en premier
httpApp.use(requestValidation);
httpApp.use(auditLog);

// Middleware pour EntityManager (optionnel)
httpApp.use(async (c, next) => {
  if (em) {
    c.set('em', em as any);
  }
  await next();
})

// Configuration CORS sécurisée
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
httpApp.use(cors({
  origin: corsOrigin,
  credentials: true
}));

// Route pour les statistiques WAF (admin seulement)
httpApp.get('/admin/waf-stats', wafStats);

// Route de health check simple
httpApp.get('/health', (c) => {
  return c.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: em ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Enregistrement des routes
const app = registerAppRoutes(httpApp);

// Configuration du serveur
const port = parseInt(process.env.PORT || '3001');
const host = process.env.HOST || '0.0.0.0';

console.log(`🚀 Server starting on ${host}:${port}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);

// Affichage des instructions HTTPS pour la production
if (ConfigService.isProduction()) {
  console.log('🔒 Production mode - Configure HTTPS with reverse proxy');
}

console.log('🛡️  Security features enabled:');
console.log('   ✅ Security headers');
console.log('   ✅ Rate limiting');
console.log('   ✅ Web Application Firewall (WAF)');
console.log('   ✅ Request validation');
console.log('   ✅ Audit logging');
console.log('   ✅ CORS protection');
console.log('   ✅ AES-256 encryption available');
console.log('   ✅ bcrypt password hashing');
console.log('   ✅ JWT authentication');
console.log('');
console.log('🔍 WAF Stats available at: /admin/waf-stats');

// Démarrage du serveur
serve({
  fetch: app.fetch,
  port: port,
  hostname: host,
});

console.log(`✅ Server running on http://${host}:${port}`);