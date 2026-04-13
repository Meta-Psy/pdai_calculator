#!/bin/bash

# ============================================
# First-time SSL setup for skinlabpro.uz
# Run this ONCE on the VPS from ~/app/pdai-calculator/
# ============================================

set -e

DOMAIN="skinlabpro.uz"
EMAIL="admin@skinlabpro.uz"  # <-- change to your email
STAGING=0  # Set to 1 to test with Let's Encrypt staging (no rate limits)

DATA_PATH="../../certbot"
LOGS_PATH="../../logs"

echo "### Creating required directories..."
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
mkdir -p "$DATA_PATH/www"
mkdir -p "$LOGS_PATH"

echo "### Downloading recommended TLS parameters..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$DATA_PATH/conf/options-ssl-nginx.conf"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$DATA_PATH/conf/ssl-dhparams.pem"

echo "### Creating temporary self-signed certificate..."
openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
  -keyout "$DATA_PATH/conf/live/$DOMAIN/privkey.pem" \
  -out "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" \
  -subj "/CN=localhost"

echo "### Starting nginx with temporary certificate..."
docker compose up -d app

echo "### Waiting for nginx to start..."
sleep 5

echo "### Removing temporary certificate..."
rm -rf "$DATA_PATH/conf/live/$DOMAIN"

echo "### Requesting Let's Encrypt certificate..."

STAGING_ARG=""
if [ $STAGING -eq 1 ]; then
  STAGING_ARG="--staging"
fi

docker compose run --rm --entrypoint "certbot certonly --webroot --webroot-path=/var/www/certbot $STAGING_ARG --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN -d www.$DOMAIN" certbot

echo "### Reloading nginx with real certificate..."
docker compose exec app nginx -s reload

echo ""
echo "=== Done! ==="
echo "SSL certificate obtained for $DOMAIN"
echo "Run: docker compose up -d"
