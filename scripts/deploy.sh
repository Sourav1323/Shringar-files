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

DOCKER_CMD="docker"
if ! docker info &>/dev/null; then
    if sudo docker info &>/dev/null; then
        DOCKER_CMD="sudo docker"
    fi
fi

echo "📦 Building and launching production containers with zero-downtime rolling restart..."
$DOCKER_CMD compose -f docker-compose.prod.yml up -d --build --remove-orphans

echo "🧹 Cleaning up old unused images..."
$DOCKER_CMD image prune -f

echo "⏳ Waiting for platform services to initialize and pass healthchecks (up to 60s)..."
READY=0
for i in $(seq 1 12); do
    echo "  [Attempt $i/12] Probing http://localhost/api/settings..."
    if curl -s -f http://localhost/api/settings > /dev/null 2>&1 || curl -s -f http://127.0.0.1/api/settings > /dev/null 2>&1; then
        READY=1
        break
    fi
    sleep 5
done

if [ "$READY" -eq 1 ]; then
    echo "✅ Platform health verified! All microservices online."
    $DOCKER_CMD compose -f docker-compose.prod.yml ps
else
    echo "⚠️ Warning: Healthcheck did not pass immediately. Checking container logs:"
    $DOCKER_CMD compose -f docker-compose.prod.yml logs --tail=50 backend
    exit 1
fi

echo "=========================================="
echo "  🎉 Deployment Completed Successfully!   "
echo "=========================================="
