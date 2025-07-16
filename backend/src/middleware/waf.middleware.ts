import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../api/get-app.ts';
import ConfigService from '../config/config.service.ts';

/**
 * Interface pour les règles WAF
 */
interface WAFRule {
  id: string;
  name: string;
  pattern: RegExp;
  action: 'block' | 'log' | 'monitor';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

/**
 * Configuration des règles WAF
 */
const WAF_RULES: WAFRule[] = [
  // Injection SQL
  {
    id: 'SQL_001',
    name: 'SQL Injection Detection',
    pattern: /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)|(\binsert\b.*\binto\b)|(\bupdate\b.*\bset\b)|(\bdelete\b.*\bfrom\b)|(\bdrop\b.*\btable\b)|(\bexec\b.*\bxp_)/i,
    action: 'block',
    severity: 'critical',
    description: 'Potential SQL injection attack detected'
  },
  
  // XSS (Cross-Site Scripting)
  {
    id: 'XSS_001',
    name: 'XSS Script Tag Detection',
    pattern: /<script[^>]*>.*?<\/script>/i,
    action: 'block',
    severity: 'high',
    description: 'Potential XSS attack with script tags'
  },
  {
    id: 'XSS_002',
    name: 'XSS Event Handler Detection',
    pattern: /on\w+\s*=\s*["'].*?["']/i,
    action: 'block',
    severity: 'high',
    description: 'Potential XSS attack with event handlers'
  },
  {
    id: 'XSS_003',
    name: 'XSS JavaScript Protocol',
    pattern: /javascript:\s*[^;]*/i,
    action: 'block',
    severity: 'high',
    description: 'Potential XSS attack with javascript protocol'
  },
  
  // Path Traversal
  {
    id: 'PATH_001',
    name: 'Path Traversal Detection',
    pattern: /(\.\.\/)|(\.\.\\)|(%2e%2e%2f)|(%2e%2e\\)|(%252e%252e%252f)/i,
    action: 'block',
    severity: 'high',
    description: 'Potential path traversal attack'
  },
  
  // Command Injection
  {
    id: 'CMD_001',
    name: 'Command Injection Detection',
    pattern: /(\||;|&|`|\$\(|\${|<|>)/,
    action: 'log',
    severity: 'medium',
    description: 'Potential command injection characters'
  },
  
  // LDAP Injection
  {
    id: 'LDAP_001',
    name: 'LDAP Injection Detection',
    pattern: /(\(\|)|(\)\()|(\*\))|(\|\()/,
    action: 'block',
    severity: 'high',
    description: 'Potential LDAP injection attack'
  },
  
  // User-Agent Scanning
  {
    id: 'SCAN_001',
    name: 'Security Scanner Detection',
    pattern: /(sqlmap|nikto|nmap|masscan|dirbuster|gobuster|wfuzz|burp|nessus|openvas|w3af|skipfish|arachni|zap|acunetix|appscan|netsparker|webscarab|paros|httprint|whatweb|dirb|fierce|theharvester|dnsenum|dnsrecon|sublist3r|amass|subfinder|assetfinder|httprobe|waybackurls|gau|getallurls|paramspider|arjun|ffuf|feroxbuster|dirsearch|nuclei|jaeles|dalfox|xssstrike|sqliv|commix|ysoserial|marshalsec|fastjson|jackson|log4j|spring4shell|webshell|cmd|shell|eval|system|exec|passthru|shell_exec|popen|proc_open|file_get_contents|curl|wget|python|perl|ruby|php|java|node|powershell|bash|sh|zsh|fish|csh|tcsh|dash|ash|ksh|mksh|pdksh|yash|rc|es|scsh|xonsh|elvish|ion|nushell|ohmy|zx|deno|bun)/i,
    action: 'block',
    severity: 'high',
    description: 'Security scanner or attack tool detected'
  },
  
  // Excessive dots (potential DoS)
  {
    id: 'DOS_001',
    name: 'Excessive Dots Detection',
    pattern: /\.{10,}/,
    action: 'block',
    severity: 'medium',
    description: 'Excessive dots detected (potential DoS)'
  },
  
  // Sensitive File Access
  {
    id: 'FILE_001',
    name: 'Sensitive File Access',
    pattern: /(\/etc\/passwd)|(\/etc\/shadow)|(\.ssh\/id_rsa)|(\.aws\/credentials)|(\.env)|(config\.php)|(wp-config\.php)|(database\.yml)|(secrets\.yml)/i,
    action: 'block',
    severity: 'critical',
    description: 'Attempt to access sensitive files'
  }
];

/**
 * Classe pour la gestion des logs WAF
 */
class WAFLogger {
  private static threats: Array<{
    timestamp: Date;
    ip: string;
    rule: WAFRule;
    url: string;
    userAgent: string;
    payload: string;
  }> = [];

  static log(ip: string, rule: WAFRule, url: string, userAgent: string, payload: string): void {
    const threat = {
      timestamp: new Date(),
      ip,
      rule,
      url,
      userAgent,
      payload: payload.substring(0, 1000) // Limiter la taille du payload
    };

    this.threats.push(threat);
    
    // Garder seulement les 1000 dernières entrées
    if (this.threats.length > 1000) {
      this.threats = this.threats.slice(-1000);
    }

    // Log selon la gravité
    const logMessage = `[WAF] ${rule.severity.toUpperCase()} - ${rule.name} (${rule.id}) - IP: ${ip} - URL: ${url}`;
    
    switch (rule.severity) {
      case 'critical':
        console.error(`🚨 ${logMessage}`);
        break;
      case 'high':
        console.warn(`⚠️  ${logMessage}`);
        break;
      case 'medium':
        console.warn(`📊 ${logMessage}`);
        break;
      case 'low':
        console.log(`ℹ️  ${logMessage}`);
        break;
    }
  }

  static getThreats(): typeof WAFLogger.threats {
    return this.threats;
  }

  static getStats(): { total: number; bySeverity: Record<string, number>; byRule: Record<string, number> } {
    const bySeverity = this.threats.reduce((acc, threat) => {
      acc[threat.rule.severity] = (acc[threat.rule.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byRule = this.threats.reduce((acc, threat) => {
      acc[threat.rule.id] = (acc[threat.rule.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.threats.length,
      bySeverity,
      byRule
    };
  }
}

/**
 * Middleware WAF principal
 */
export const webApplicationFirewall: MiddlewareHandler<AppEnv> = async (c, next) => {
  const url = c.req.url;
  const method = c.req.method;
  const userAgent = c.req.header('user-agent') || '';
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  
  // Analyser tous les paramètres de la requête
  const searchParams = new URL(url).searchParams;
  const queryString = searchParams.toString();
  
  // Obtenir le body pour les requêtes POST/PUT/PATCH
  let body = '';
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      // Hono ne permet pas de cloner facilement, on essaie de lire le body
      const rawBody = await c.req.raw.text();
      body = rawBody;
    } catch (error) {
      // Ignorer les erreurs de lecture du body
    }
  }

  // Combiner toutes les données à analyser
  const payloadToAnalyze = [url, queryString, body, userAgent].join(' ');

  // Vérifier chaque règle WAF
  for (const rule of WAF_RULES) {
    if (rule.pattern.test(payloadToAnalyze)) {
      // Log la menace
      WAFLogger.log(ip, rule, url, userAgent, payloadToAnalyze);
      
      // Action selon la règle
      switch (rule.action) {
        case 'block':
          return c.json({
            error: 'Request blocked by WAF',
            message: 'Your request has been blocked for security reasons.',
            reference: rule.id,
            timestamp: new Date().toISOString()
          }, 403);
        
        case 'log':
          // Continuer mais logger
          break;
        
        case 'monitor':
          // Juste surveiller
          break;
      }
    }
  }

  await next();
};

/**
 * Endpoint pour consulter les statistiques WAF (admin only)
 */
export const wafStats: MiddlewareHandler<AppEnv> = async (c) => {
  // TODO: Ajouter vérification des permissions admin
  const stats = WAFLogger.getStats();
  const recentThreats = WAFLogger.getThreats().slice(-50); // 50 dernières menaces
  
  return c.json({
    stats,
    recentThreats: recentThreats.map(threat => ({
      timestamp: threat.timestamp,
      ip: threat.ip,
      rule: {
        id: threat.rule.id,
        name: threat.rule.name,
        severity: threat.rule.severity,
        description: threat.rule.description
      },
      url: threat.url,
      userAgent: threat.userAgent
    }))
  });
};

export default webApplicationFirewall;
