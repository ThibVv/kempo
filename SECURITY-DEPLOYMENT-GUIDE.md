# Guide de Déploiement Sécurisé - Kempo App

## 🔐 Checklist de Sécurité

### Variables d'Environnement
- [ ] Générer un JWT_SECRET fort (32+ caractères)
- [ ] Configurer ENCRYPTION_KEY unique
- [ ] Définir ENCRYPTION_SALT personnalisé
- [ ] Sécuriser les credentials de base de données
- [ ] Configurer les clés API Mailjet
- [ ] Définir CORS_ORIGIN avec le domaine de production

### Configuration Serveur
- [ ] Configurer HTTPS avec certificat SSL valide
- [ ] Activer les logs d'audit
- [ ] Configurer la rotation des logs
- [ ] Limiter les permissions des fichiers
- [ ] Configurer le firewall système

### Base de Données
- [ ] Créer un utilisateur dédié avec permissions limitées
- [ ] Activer les logs MySQL
- [ ] Configurer la sauvegarde automatique
- [ ] Chiffrer les communications (SSL/TLS)

## 🚀 Déploiement Production

### 1. Configuration Nginx (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/kempo
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    # Hide Server Info
    server_tokens off;
    
    # File Upload Limits
    client_max_body_size 10M;
    
    # Proxy Configuration
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Security: Block sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~* \.(env|log|conf)$ {
        deny all;
    }
}
```

### 2. Configuration SSL avec Let's Encrypt

```bash
# Installation Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat SSL
sudo certbot --nginx -d your-domain.com

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

### 3. Configuration du Firewall

```bash
# UFW (Ubuntu Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Ou iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### 4. Configuration PM2 pour Node.js

```bash
# Installation PM2
npm install -g pm2

# Configuration PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'kempo-api',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'dist']
  }]
}
EOF

# Démarrer l'application
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 5. Configuration MySQL sécurisée

```sql
-- Créer un utilisateur dédié
CREATE USER 'kempo_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON kempo_db.* TO 'kempo_user'@'localhost';
FLUSH PRIVILEGES;

-- Configuration SSL MySQL
-- Dans /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
ssl-cert=/etc/mysql/ssl/server-cert.pem
ssl-key=/etc/mysql/ssl/server-key.pem
ssl-ca=/etc/mysql/ssl/ca-cert.pem
require_secure_transport=ON
```

### 6. Monitoring et Alertes

```bash
# Installation de fail2ban
sudo apt install fail2ban

# Configuration fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 7. Sauvegarde Automatique

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backup/kempo"
DB_NAME="kempo_db"
DB_USER="kempo_user"
DB_PASS="password"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Sauvegarde des fichiers
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /path/to/app

# Nettoyer les anciennes sauvegardes (garde 7 jours)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Ajouter à crontab
# 0 2 * * * /path/to/backup.sh
```

## 🔍 Monitoring de Sécurité

### 1. Logs à Surveiller

```bash
# Logs d'application
tail -f /var/log/kempo/app.log | grep -E "(ERROR|WARN|SECURITY)"

# Logs WAF
tail -f /var/log/kempo/audit.log | grep -E "(WAF|BLOCKED|HIGH|CRITICAL)"

# Logs Nginx
tail -f /var/log/nginx/access.log | grep -E "(40[0-9]|50[0-9])"
```

### 2. Alertes Automatiques

```bash
# Script d'alerte
#!/bin/bash
# alert.sh
ALERT_EMAIL="admin@your-domain.com"
LOG_FILE="/var/log/kempo/audit.log"

# Vérifier les attaques récentes
ATTACKS=$(grep -c "CRITICAL\|HIGH" $LOG_FILE)

if [ $ATTACKS -gt 10 ]; then
    echo "ALERTE: $ATTACKS attaques détectées dans les logs" | mail -s "Sécurité Kempo" $ALERT_EMAIL
fi
```

## 📋 Tests de Sécurité

### 1. Tests de Pénétration

```bash
# OWASP ZAP
zap-cli quick-scan --self-contained https://your-domain.com

# SQLmap
sqlmap -u "https://your-domain.com/api/users/login" --data="email=test&password=test" --batch

# Nikto
nikto -h https://your-domain.com
```

### 2. Tests SSL

```bash
# SSLLabs
curl -s "https://api.ssllabs.com/api/v3/analyze?host=your-domain.com"

# TestSSL
testssl.sh https://your-domain.com
```

## 🚨 Plan de Réponse aux Incidents

### 1. Détection d'Attaque

1. Analyser les logs WAF
2. Identifier l'origine de l'attaque
3. Bloquer l'IP suspecte
4. Analyser l'impact potentiel

### 2. Réponse Immédiate

```bash
# Bloquer une IP
sudo iptables -A INPUT -s ATTACKER_IP -j DROP

# Activer le mode maintenance
sudo systemctl stop nginx
echo "Maintenance en cours" > /var/www/html/maintenance.html
```

### 3. Récupération

1. Patcher les vulnérabilités
2. Changer les mots de passe
3. Régénérer les clés JWT
4. Restaurer depuis une sauvegarde si nécessaire
5. Documenter l'incident

## 📞 Contacts d'Urgence

- **Équipe Dev**: dev@your-domain.com
- **Admin Système**: admin@your-domain.com
- **Responsable Sécurité**: security@your-domain.com

---

**Note**: Ce guide doit être adapté à votre infrastructure spécifique. Effectuez des tests en environnement de staging avant le déploiement en production.
