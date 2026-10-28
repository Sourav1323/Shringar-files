#!/usr/bin/env bash
set -euo pipefail

echo "=================================================="
echo "  👑 Shringar Platform — Remote OCI Bootstrap    "
echo "=================================================="

CURRENT_USER=$(id -un)
CURRENT_GROUP=$(id -gn)

echo "==> Preparing /opt/shringar directory for user $CURRENT_USER:$CURRENT_GROUP..."
sudo mkdir -p /opt/shringar
sudo chown -R "$CURRENT_USER":"$CURRENT_GROUP" /opt/shringar

echo "==> Extracting production bundle..."
if [ -f /tmp/shringar-oci-production.tar.gz ]; then
    tar -xzf /tmp/shringar-oci-production.tar.gz -C /opt/shringar
    rm -f /tmp/shringar-oci-production.tar.gz
elif [ -f /tmp/shringar-bundle.tar.gz ]; then
    tar -xzf /tmp/shringar-bundle.tar.gz -C /opt/shringar
    rm -f /tmp/shringar-bundle.tar.gz
fi

cd /opt/shringar

echo "==> Making scripts executable..."
chmod +x scripts/*.sh

if ! command -v docker &>/dev/null; then
    echo "==> Initializing server dependencies and firewall..."
    ./scripts/setup-server.sh
else
    echo "==> Docker already verified, skipping OS package re-installation..."
fi

echo "==> Launching production containers..."
./scripts/deploy.sh

echo "=================================================="
echo "  🎉 Remote Bootstrap Finished Successfully!     "
echo "=================================================="
