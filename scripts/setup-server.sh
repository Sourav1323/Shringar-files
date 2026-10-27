#!/usr/bin/env bash
# ==============================================================================
# Shringar Production Server Bootstrap & Initialization Script
# For Ubuntu 22.04 / 24.04 LTS (x86_64 or ARM64 Ampere A1)
# ==============================================================================

set -euo pipefail

echo "=================================================="
echo "  👑 Shringar Mehendi Production Server Setup    "
echo "=================================================="

# 0. Setup Swap (Critical for 1 GB RAM Micro instances to prevent OOM)
if ! swapon --show | grep -q '/swapfile'; then
    echo "💾 Creating 3GB swap file for low-RAM stability..."
    sudo fallocate -l 3G /swapfile 2>/dev/null || sudo dd if=/dev/zero of=/swapfile bs=1M count=3072
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "vm.swappiness=20" | sudo tee -a /etc/sysctl.conf
    echo "vm.vfs_cache_pressure=50" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p 2>/dev/null || true
    echo "✅ 3GB swap configured successfully."
else
    echo "✅ Swap file already active."
fi

# 1. Update and upgrade system packages
echo "🔄 Updating system package indexes..."
sudo apt-get update -y
sudo NEEDRESTART_MODE=a DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -o Dpkg::Options::="--force-confold"

# 2. Install essential dependencies
echo "📦 Installing utility packages (curl, git, ufw, fail2ban, htop)..."
sudo NEEDRESTART_MODE=a DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confold" curl git ufw fail2ban htop ca-certificates gnupg lsb-release

# 3. Install Docker official engine
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing official Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm -f get-docker.sh
else
    echo "✅ Docker is already installed."
fi

# Enable Docker service and add user to docker group
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker "$USER"

# 4. Configure Firewall & OCI iptables
echo "🛡️ Configuring host firewall (UFW & OCI iptables)..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
if command -v netfilter-persistent &> /dev/null; then
    sudo netfilter-persistent save 2>/dev/null || true
fi
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP Web Gateway'
sudo ufw allow 443/tcp comment 'HTTPS Web Gateway'
sudo ufw --force enable || true
sudo ufw status verbose || true

# 5. Create or detect application directory
APP_DIR="${APP_DIR:-/opt/shringar}"
echo "📁 Setting up application deployment directory at $APP_DIR..."
sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER":"$USER" "$APP_DIR"

# 6. Check if code already present locally, otherwise clone
if [ -f "$APP_DIR/docker-compose.prod.yml" ]; then
    echo "✅ Application files already present at $APP_DIR."
    cd "$APP_DIR"
elif [ -d "$APP_DIR/.git" ]; then
    echo "🔄 Existing repository found, pulling latest changes..."
    cd "$APP_DIR"
    git fetch origin release/shringar-1.0 || true
    git checkout release/shringar-1.0 || true
    git pull origin release/shringar-1.0 || true
else
    echo "📥 Cloning Shringar codebase..."
    git clone -b release/shringar-1.0 https://github.com/Sourav1323/Shringar-files.git "$APP_DIR" || echo "Note: Git clone skipped if using direct file upload."
    cd "$APP_DIR"
fi

# 7. Initialize .env if missing
if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚙️ Creating production .env file from .env.example..."
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    
    # Generate random strong passwords for DB and JWT
    DB_ROOT_PW=$(openssl rand -hex 16)
    DB_APP_PW=$(openssl rand -hex 16)
    JWT_SECRET_KEY=$(openssl rand -hex 32)
    
    sed -i "s/DB_ROOT_PASSWORD=.*/DB_ROOT_PASSWORD=${DB_ROOT_PW}/" "$APP_DIR/.env"
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_APP_PW}/" "$APP_DIR/.env"
    sed -i "s/MYSQL_ROOT_PASSWORD=.*/MYSQL_ROOT_PASSWORD=${DB_ROOT_PW}/" "$APP_DIR/.env"
    sed -i "s/MYSQL_PASSWORD=.*/MYSQL_PASSWORD=${DB_APP_PW}/" "$APP_DIR/.env"
    sed -i "s/SPRING_DATASOURCE_PASSWORD=.*/SPRING_DATASOURCE_PASSWORD=${DB_APP_PW}/" "$APP_DIR/.env"
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET_KEY}/" "$APP_DIR/.env"
    
    echo "🔑 Strong production credentials generated automatically in $APP_DIR/.env"
fi

# 8. Setup Automated Daily MySQL Backup Cron Job (Runs every night at 2:00 AM)
chmod +x "$APP_DIR/scripts"/*.sh 2>/dev/null || true

CRON_JOB="0 2 * * * $APP_DIR/scripts/backup-db.sh >> /var/log/shringar-backup.log 2>&1"
(crontab -l 2>/dev/null | grep -Fv "$APP_DIR/scripts/backup-db.sh" ; echo "$CRON_JOB") | crontab -
echo "⏰ Automated daily database backup scheduled at 2:00 AM."

# 9. Register Systemd Service for Auto-Start on System Boot
sudo tee /etc/systemd/system/shringar.service > /dev/null <<EOF
[Unit]
Description=Shringar Mehendi Production Docker Stack
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable shringar.service
echo "⚡ Systemd auto-restart service configured and enabled on boot."

echo "=================================================="
echo "🎉 Server bootstrap complete!"
echo "👉 You can now run: cd $APP_DIR && ./scripts/deploy.sh"
echo "=================================================="
