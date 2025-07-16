import { serve } from '@hono/node-server';
import type { Hono } from 'hono';
import ConfigService from '../config/config.service.ts';

/**
 * Service de démarrage du serveur sécurisé
 */
export class ServerService {
  private app: Hono;
  private config: typeof ConfigService;

  constructor(app: Hono) {
    this.app = app;
    this.config = ConfigService;
  }

  /**
   * Démarre le serveur
   */
  async start(): Promise<void> {
    const port = this.config.get<number>('PORT');
    const host = this.config.get<string>('HOST');
    const isProduction = this.config.isProduction();

    console.log(`Starting server in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
    
    if (isProduction) {
      console.log('⚠️  For production, consider using a reverse proxy (nginx) for HTTPS termination');
    }

    serve({
      fetch: this.app.fetch,
      port,
      hostname: host
    }, (info) => {
      console.log(`🌐 Server running on http://${host}:${port}`);
      console.log(`📚 API documentation: http://${host}:${port}/docs`);
      
      if (isProduction) {
        console.log('🔒 Remember to configure HTTPS at the reverse proxy level');
      }
    });
  }

  /**
   * Instructions pour configurer HTTPS avec nginx (reverse proxy)
   */
  static showNginxHttpsInstructions(): void {
    console.log(`
    📝 HTTPS Configuration avec nginx (recommandé pour la production):
    
    1. Installer nginx et certbot:
       sudo apt update
       sudo apt install nginx certbot python3-certbot-nginx
    
    2. Configuration nginx (/etc/nginx/sites-available/kempo):
       server {
           listen 80;
           server_name your-domain.com;
           return 301 https://$server_name$request_uri;
       }
       
       server {
           listen 443 ssl http2;
           server_name your-domain.com;
           
           ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
           ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
           
           # Security headers
           add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
           add_header X-Frame-Options "SAMEORIGIN";
           add_header X-Content-Type-Options "nosniff";
           add_header X-XSS-Protection "1; mode=block";
           
           location / {
               proxy_pass http://localhost:3001;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
           }
       }
    
    3. Obtenir un certificat SSL gratuit:
       sudo certbot --nginx -d your-domain.com
    
    4. Activer le site:
       sudo ln -s /etc/nginx/sites-available/kempo /etc/nginx/sites-enabled/
       sudo nginx -t
       sudo systemctl reload nginx
    `);
  }
}

export default ServerService;
