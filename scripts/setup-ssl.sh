#!/usr/bin/env bash
# ==============================================================================
# Automated Let's Encrypt SSL/TLS Certificate Setup & Renewal Script
# Usage: ./scripts/setup-ssl.sh yourdomain.com [admin_email]
# ==============================================================================

set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-admin@shringar.com}"

if [ -z "$DOMAIN" ]; then
    echo "Usage: ./scripts/setup-ssl.sh <yourdomain.com> [admin_email]"
    echo "Example: ./scripts/setup-ssl.sh shringar.in admin@shringar.in"
    exit 1
fi

echo "=================================================="
echo "  🔒 Setting up Let's Encrypt SSL for: $DOMAIN    "
echo "=================================================="

# 1. Install Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt-get update -y
    sudo apt-get install -y certbot
fi

# 2. Stop port 80 briefly or use standalone/webroot
echo "⏳ Requesting SSL Certificate from Let's Encrypt..."
docker compose -f docker-compose.prod.yml stop gateway || true

sudo certbot certonly --standalone \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive

# 3. Copy or link certificates into gateway volumes
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
if [ -d "$CERT_DIR" ]; then
    echo "✅ SSL Certificate issued successfully!"
    echo "   Cert: $CERT_DIR/fullchain.pem"
    echo "   Key:  $CERT_DIR/privkey.pem"
else
    echo "❌ Certificate directory not found at $CERT_DIR"
    exit 1
fi

# 4. Generate SSL-enabled Nginx configuration
cat <<EOF | sudo tee nginx/nginx.conf > /dev/null
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    client_max_body_size 25M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript image/svg+xml;

    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=15r/s;

    upstream backend_api {
        server backend:8080;
        keepalive 32;
    }

    upstream frontend_client {
        server frontend:80;
    }

    upstream admin_portal {
        server admin:80;
    }

    # HTTP Server: Redirect all traffic to HTTPS
    server {
        listen 80;
        server_name $DOMAIN localhost _;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://\$host\$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name $DOMAIN localhost _;

        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 1d;

        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        location /api/ {
            limit_req zone=api_limit burst=30 nodelay;
            proxy_pass http://backend_api/api/;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_set_header Connection "";
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        location /uploads/ {
            alias /var/www/uploads/;
            expires 30d;
            add_header Cache-Control "public, no-transform";
            try_files \$uri =404;
        }

        location /admin-portal/ {
            proxy_pass http://admin_portal/;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }

        location / {
            proxy_pass http://frontend_client;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
        }
    }
}
EOF

# 5. Restart Docker Stack with SSL Gateway
echo "🚀 Restarting Gateway with SSL enabled..."
docker compose -f docker-compose.prod.yml up -d gateway

echo "=================================================="
echo "  🎉 SSL Setup Complete!                         "
echo "  🌐 Your site is live at: https://$DOMAIN        "
echo "=================================================="
