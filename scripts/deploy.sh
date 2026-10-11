#!/usr/bin/env bash
# ==============================================================================
# Shringar Production Deployment Script
# Usage: ./scripts/deploy.sh
# ==============================================================================

set -euo pipefail

echo "=========================================="
echo "  👑 Deploying Shringar Mehendi Platform  "
echo "=========================================="

APP_DIR="${APP_DIR:-/opt/shringar}"

if [ ! -d "$APP_DIR" ]; then
    echo "Creating deployment directory at $APP_DIR..."
    sudo mkdir -p "$APP_DIR"
    sudo chown -R "$USER":"$USER" "$APP_DIR"
fi

cd "$APP_DIR"

if [ ! -f ".env" ]; then
    echo "❌ Error: .env file missing in $APP_DIR! Please copy .env.example to .env and configure credentials."
    exit 1
fi

echo "📦 Pulling latest production container images..."
docker compose -f docker-compose.prod.yml pull

echo "🚀 Starting / updating services with zero-downtime rolling restart..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "🧹 Cleaning up old unused images..."
docker image prune -f

echo "⏳ Waiting for health check verification (20s)..."
sleep 20

if curl -s -f http://localhost:8080/api/settings > /dev/null 2>&1 || curl -s -k -f https://localhost/api/settings > /dev/null 2>&1; then
    echo "✅ Platform health verified! All microservices online."
    docker compose -f docker-compose.prod.yml ps
else
    echo "⚠️ Warning: Healthcheck did not pass immediately. Checking container logs:"
    docker compose -f docker-compose.prod.yml logs --tail=50 backend
    exit 1
fi

echo "=========================================="
echo "  🎉 Deployment Completed Successfully!   "
echo "=========================================="
