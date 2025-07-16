import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Charger les variables d'environnement
dotenv.config();

/**
 * Service de configuration sécurisée
 */
export class ConfigService {
  private static instance: ConfigService;
  private config: Map<string, any> = new Map();

  private constructor() {
    this.loadConfiguration();
    this.validateConfiguration();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfiguration(): void {
    // Configuration de base
    this.config.set('NODE_ENV', process.env.NODE_ENV || 'development');
    this.config.set('PORT', parseInt(process.env.PORT || '3001'));
    this.config.set('HOST', process.env.HOST || '0.0.0.0');
    this.config.set('HOST', process.env.HOST || 'localhost');

    // JWT Configuration
    this.config.set('JWT_SECRET', process.env.JWT_SECRET || this.generateSecureSecret());
    this.config.set('JWT_EXPIRES_IN', process.env.JWT_EXPIRES_IN || '24h');

    // Chiffrement
    this.config.set('ENCRYPTION_KEY', process.env.ENCRYPTION_KEY || this.generateSecureSecret());
    this.config.set('ENCRYPTION_SALT', process.env.ENCRYPTION_SALT || 'default-salt');

    // Base de données
    this.config.set('DB_HOST', process.env.DB_HOST || 'localhost');
    this.config.set('DB_PORT', parseInt(process.env.DB_PORT || '3306'));
    this.config.set('DB_NAME', process.env.DB_NAME || 'kempo_db');
    this.config.set('DB_USERNAME', process.env.DB_USERNAME || 'root');
    this.config.set('DB_PASSWORD', process.env.DB_PASSWORD || '');

    // Mailjet
    this.config.set('MAILJET_API_KEY', process.env.MAILJET_API_KEY || '');
    this.config.set('MAILJET_SECRET_KEY', process.env.MAILJET_SECRET_KEY || '');

    // SSL/TLS
    this.config.set('SSL_CERT_PATH', process.env.SSL_CERT_PATH || '');
    this.config.set('SSL_KEY_PATH', process.env.SSL_KEY_PATH || '');
    this.config.set('SSL_CA_PATH', process.env.SSL_CA_PATH || '');

    // Sécurité
    this.config.set('CORS_ORIGIN', process.env.CORS_ORIGIN || 'http://localhost:3000');
    this.config.set('RATE_LIMIT_WINDOW_MS', parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'));
    this.config.set('RATE_LIMIT_MAX_REQUESTS', parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'));
    this.config.set('MAX_REQUEST_SIZE', parseInt(process.env.MAX_REQUEST_SIZE || '1048576'));

    // Logging
    this.config.set('LOG_LEVEL', process.env.LOG_LEVEL || 'info');
    this.config.set('LOG_FILE', process.env.LOG_FILE || './logs/app.log');
    this.config.set('AUDIT_LOG_FILE', process.env.AUDIT_LOG_FILE || './logs/audit.log');
  }

  private validateConfiguration(): void {
    const requiredInProduction = [
      'JWT_SECRET',
      'ENCRYPTION_KEY'
    ];

    // Variables optionnelles (avec avertissement)
    const optionalInProduction = [
      'DB_PASSWORD',
      'MAILJET_API_KEY',
      'MAILJET_SECRET_KEY'
    ];

    if (this.isProduction()) {
      // Vérifier les variables obligatoires
      for (const key of requiredInProduction) {
        if (!process.env[key]) {
          throw new Error(`Missing required environment variable: ${key}`);
        }
      }

      // Avertir pour les variables optionnelles
      for (const key of optionalInProduction) {
        if (!process.env[key]) {
          console.warn(`⚠️  Optional environment variable missing: ${key}`);
        }
      }

      // Vérifier la force du JWT secret
      const jwtSecret = this.get('JWT_SECRET');
      if (jwtSecret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long in production');
      }
    }
  }

  private generateSecureSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  get<T = any>(key: string): T {
    return this.config.get(key) as T;
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  /**
   * Charge le certificat SSL si disponible
   */
  getSSLOptions(): { cert?: string; key?: string; ca?: string } | null {
    try {
      const certPath = this.get('SSL_CERT_PATH');
      const keyPath = this.get('SSL_KEY_PATH');
      const caPath = this.get('SSL_CA_PATH');

      if (!certPath || !keyPath) {
        return null;
      }

      const options: any = {
        cert: fs.readFileSync(certPath, 'utf8'),
        key: fs.readFileSync(keyPath, 'utf8')
      };

      if (caPath && fs.existsSync(caPath)) {
        options.ca = fs.readFileSync(caPath, 'utf8');
      }

      return options;
    } catch (error) {
      console.error('Error loading SSL certificates:', error);
      return null;
    }
  }

  /**
   * Retourne la configuration CORS
   */
  getCorsOptions(): any {
    return {
      origin: this.get('CORS_ORIGIN').split(','),
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400 // 24 heures
    };
  }

  /**
   * Retourne la configuration de rate limiting
   */
  getRateLimitOptions(): { windowMs: number; maxRequests: number } {
    return {
      windowMs: this.get('RATE_LIMIT_WINDOW_MS'),
      maxRequests: this.get('RATE_LIMIT_MAX_REQUESTS')
    };
  }
}

export default ConfigService.getInstance();
