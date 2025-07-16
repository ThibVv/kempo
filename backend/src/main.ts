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
import ServerService from './services/server.service.ts';

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

const orm = await MikroORM.init(config);
const em = orm.em;

const httpApp = getApp();

// Middleware de stockage contextuel
httpApp.use(contextStorage())

// Middleware de sécurité (ordre important)
httpApp.use(securityHeaders);
httpApp.use(rateLimit);
httpApp.use(webApplicationFirewall); // WAF en premier
httpApp.use(requestValidation);
httpApp.use(auditLog);

// Middleware pour EntityManager
httpApp.use(async (c, next) => {
  c.set('em', em)
  await next()
})

// Configuration CORS sécurisée
const corsOptions = ConfigService.getCorsOptions();
httpApp.use(cors(corsOptions));

// Route pour les statistiques WAF (admin seulement)
httpApp.get('/admin/waf-stats', wafStats);

// Enregistrement des routes
const app = registerAppRoutes(httpApp);

// Démarrage du serveur sécurisé
const serverService = new ServerService(app);
await serverService.start();

// Affichage des instructions HTTPS pour la production
if (ConfigService.isProduction()) {
  ServerService.showNginxHttpsInstructions();
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