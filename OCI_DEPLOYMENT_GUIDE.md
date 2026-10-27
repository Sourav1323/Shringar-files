# 👑 Shringar Platform — Oracle Cloud (OCI) Production Deployment Guide

> **Status:** All DevOps environments, containers, production builds, database seeds, and deployment scripts are **100% prepared**. As soon as your Oracle Cloud Infrastructure (OCI) server is provisioned, you only need to run a single command or upload the archive.

---

## 📦 What Was Prepared in Your Workspace

| Component | File / Directory | Purpose |
|---|---|---|
| **OCI Production Bundle** | [`shringar-oci-production.tar.gz`](file:///c:/Users/Administrator/OneDrive/Desktop/Shringar%20files/shringar-oci-production.tar.gz) | Complete, self-contained 111.8 MB distribution archive containing all services, pre-built assets, and configs. |
| **1-Click Windows Deployer** | [`scripts/deploy-to-oci.bat`](file:///c:/Users/Administrator/OneDrive/Desktop/Shringar%20files/scripts/deploy-to-oci.bat) / [`.ps1`](file:///c:/Users/Administrator/OneDrive/Desktop/Shringar%20files/scripts/deploy-to-oci.ps1) | Automated script that connects via SSH, uploads the bundle, bootstraps the server, and starts everything with zero manual input. |
| **Server Bootstrap & OCI iptables Fix** | [`scripts/setup-server.sh`](file:///c:/Users/Administrator/OneDrive/Desktop/Shringar%20files/scripts/setup-server.sh) | Installs Docker + Compose, fixes OCI Ubuntu kernel `iptables` drop rules on ports 80/443, enables UFW, registers systemd auto-restart service. |
| **Container Orchestration** | [`docker-compose.prod.yml`](file:///c:/Users/Administrator/OneDrive/Desktop/Shringar%20files/docker-compose.prod.yml) | Multi-container stack (MySQL 8.0, Spring Boot 3, React 19, Admin Portal, Nginx Gateway). |
| **Automated DB Seeding** | [`mysql/init/01-shringar-init.sql`](file:///c:/Users/Administrator/OneDrive/Desktop/Shringar%20files/mysql/init/01-shringar-init.sql) | Pre-seeds all users (`admin@shringar.com` and `8619377860`), designs, cities, artists, and settings upon first container launch. |
| **SSL / HTTPS Automation** | [`scripts/setup-ssl.sh`](file:///c:/Users/Administrator/OneDrive/Desktop/Shringar%20files/scripts/setup-ssl.sh) | 1-step Let's Encrypt SSL generator with automatic HTTP $\rightarrow$ HTTPS redirect and certificate renewal. |
| **Nightly Backups** | [`scripts/backup-db.sh`](file:///c:/Users/Administrator/OneDrive/Desktop/Shringar%20files/scripts/backup-db.sh) | Daily 2:00 AM compressed MySQL dump with automated 7-day rotation. |
| **SSH Private Key** | [`ssh-key-2026-10-24 (1).key`](file:///c:/Users/Administrator/OneDrive/Desktop/Shringar%20files/ssh-key-2026-10-24%20(1).key) | Your verified private SSH key for passwordless server authentication. |

---

## ⚡ 1. The ONLY Step in OCI Console (Allow Ports 80 & 443)

By default, Oracle Cloud VCN firewalls block all incoming web traffic except SSH (port 22). To let patrons visit your website:

1. In the **Oracle Cloud Console**, go to:
   **Networking** $\rightarrow$ **Virtual Cloud Networks (VCN)** $\rightarrow$ Click your VCN.
2. Under **Resources** (left sidebar), click **Security Lists** $\rightarrow$ Click **Default Security List for...**.
3. Click **Add Ingress Rules** and fill in:
   * **Source CIDR:** `0.0.0.0/0`
   * **IP Protocol:** `TCP`
   * **Destination Port Range:** `80, 443`
   * **Description:** `Allow public HTTP and HTTPS traffic`
4. Click **Add Ingress Rules**.

---

## 🚀 2. Deploy to OCI (Choose Option A or Option B)

### Option A: 1-Click Automated Deployment from Windows (Recommended)

Once OCI displays your instance's **Public IP Address** (e.g., `140.238.12.34`):

1. Double-click [`scripts/deploy-to-oci.bat`](file:///c:/Users/Administrator/OneDrive/Desktop/Shringar%20files/scripts/deploy-to-oci.bat)  
   *(or open PowerShell in the project directory and run)*:
   ```powershell
   .\scripts\deploy-to-oci.ps1 -ServerIp <YOUR_OCI_PUBLIC_IP>
   ```
2. The script will automatically:
   * Connect to the OCI server using your SSH key `ssh-key-2026-10-24 (1).key`
   * Upload `shringar-oci-production.tar.gz` to the server
   * Install Docker, Docker Compose, and configure security firewalls
   * Launch all 5 production containers (Database, Backend, Frontend, Admin, Nginx Gateway)
   * Verify all endpoints and output your live website URLs!

---

### Option B: Manual Upload via Command Line

If you prefer uploading and running directly on the server:

1. **Upload the bundle to your OCI VM**:
   ```bash
   scp -i "ssh-key-2026-10-24 (1).key" shringar-oci-production.tar.gz ubuntu@<YOUR_OCI_PUBLIC_IP>:/tmp/
   ```

2. **SSH into your OCI VM**:
   ```bash
   ssh -i "ssh-key-2026-10-24 (1).key" ubuntu@<YOUR_OCI_PUBLIC_IP>
   ```

3. **Extract and launch**:
   ```bash
   sudo mkdir -p /opt/shringar && sudo chown -R $USER:$USER /opt/shringar
   tar -xzf /tmp/shringar-oci-production.tar.gz -C /opt/shringar
   cd /opt/shringar
   chmod +x scripts/*.sh
   ./scripts/setup-server.sh
   ./scripts/deploy.sh
   ```

---

## 🌐 3. Production URLs & Credentials After Deployment

Once deployed, your platform is live immediately:

| Portal | URL | Credentials |
|---|---|---|
| **Customer Web App** | `http://<YOUR_OCI_IP>/` | Phone: `8619377860` / `Sourav@1323` |
| **Designs & Catalog** | `http://<YOUR_OCI_IP>/designs` | Public Access |
| **Community Bridal Lookbook** | `http://<YOUR_OCI_IP>/gallery` | Public Access |
| **Admin Operations Console** | `http://<YOUR_OCI_IP>/admin-portal/login.html` | `admin@shringar.com` / `Admin@123` |
| **Backend REST API Health** | `http://<YOUR_OCI_IP>/api/settings` | Public Health Check |

---

## 🔒 4. Free SSL / HTTPS Setup for Custom Domain

When your domain name (e.g. `shringar.in`) points to your OCI Public IP, run this single command on the server:

```bash
cd /opt/shringar
./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com
```

* Automatically requests a Let's Encrypt certificate.
* Configures Nginx with HTTP $\rightarrow$ HTTPS permanent redirect (301).
* Enables TLS 1.2 / 1.3 encryption and HSTS headers.
* Live immediately at `https://yourdomain.com`.

---

## 🛠️ 5. Routine Maintenance Commands on Server

| Task | Command |
|---|---|
| **Check Container Status** | `docker compose -f /opt/shringar/docker-compose.prod.yml ps` |
| **View Live Backend Logs** | `docker compose -f /opt/shringar/docker-compose.prod.yml logs -f --tail=100 backend` |
| **Trigger Immediate DB Backup** | `/opt/shringar/scripts/backup-db.sh` |
| **Restart Whole Stack** | `sudo systemctl restart shringar` |
| **Server Reboot Auto-Start** | Handled automatically by `/etc/systemd/system/shringar.service`. |
