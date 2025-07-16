import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../api/get-app.ts';

/**
 * Middleware de sécurité pour les headers HTTP
 */
export const securityHeaders: MiddlewareHandler<AppEnv> = async (c, next) => {
  await next();
  
  // En-têtes de sécurité recommandés
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  c.header('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));
  
  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
};

/**
 * Rate limiting simple en mémoire
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit: MiddlewareHandler<AppEnv> = async (c, next) => {
  const clientIp = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // 100 requêtes par 15 minutes
  
  const clientData = requestCounts.get(clientIp);
  
  if (!clientData || now > clientData.resetTime) {
    // Nouvelle fenêtre ou premier accès
    requestCounts.set(clientIp, { count: 1, resetTime: now + windowMs });
  } else {
    // Incrémenter le compteur
    clientData.count++;
    
    if (clientData.count > maxRequests) {
      return c.json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      }, 429);
    }
  }
  
  // Nettoyer les anciennes entrées (simple garbage collection)
  if (Math.random() < 0.01) { // 1% de chance de nettoyer
    for (const [ip, data] of requestCounts.entries()) {
      if (now > data.resetTime) {
        requestCounts.delete(ip);
      }
    }
  }
  
  await next();
};

/**
 * Middleware pour la validation des requêtes
 */
export const requestValidation: MiddlewareHandler<AppEnv> = async (c, next) => {
  const method = c.req.method;
  const userAgent = c.req.header('user-agent') || '';
  
  // Bloquer les requêtes suspectes
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /\.{2,}/, // Path traversal
    /<script/i, // XSS basique
    /union.*select/i, // SQL injection
    /insert.*into/i,
    /drop.*table/i,
    /exec.*xp_/i
  ];
  
  const url = c.req.url;
  const hasPattern = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent)
  );
  
  if (hasPattern) {
    console.warn(`Suspicious request blocked: ${method} ${url} from ${userAgent}`);
    return c.json({ error: 'Request blocked for security reasons' }, 403);
  }
  
  // Limiter la taille des requêtes
  const contentLength = c.req.header('content-length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB max
    return c.json({ error: 'Request too large' }, 413);
  }
  
  await next();
};

/**
 * Middleware d'audit des requêtes
 */
export const auditLog: MiddlewareHandler<AppEnv> = async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const userAgent = c.req.header('user-agent') || '';
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  // Log des requêtes sensibles
  if (method !== 'GET' || status >= 400) {
    console.log(`[AUDIT] ${new Date().toISOString()} - ${method} ${url} - ${status} - ${duration}ms - ${ip} - ${userAgent}`);
  }
  
  // Alertes de sécurité
  if (status === 401 || status === 403) {
    console.warn(`[SECURITY] Unauthorized access attempt: ${method} ${url} from ${ip}`);
  }
};
