# Shringar (शृंगार) — Production Deployment & File Structure Guide

This document outlines the complete file structure, all recent updates, and step-by-step instructions for updating your local environment and deploying the Shringar platform to a production server.

---

## 📦 1. Available Export Packages

Both pre-packaged ZIP archives are generated in your root folder:

| Archive Name | Size | Purpose |
|---|---|---|
| **`shringar-updated-files.zip`** | ~17 MB | Contains **only the 98 modified and newly added files** with their full relative directory structure preserved. Ideal for extracting over your existing local repository. |
| **`shringar-production-ready.zip`** | ~32 MB | Complete, clean codebase (212 files) with all frontend files, admin portal, backend source code, SQL seeds, and high-resolution assets — ready for fresh deployment. |

---

## 📂 2. Maintained File & Directory Structure

The project maintains a 3-tier modular architecture:

```text
Shringar files/
├── shringar-frontend/                 # Customer-Facing Web Application
│   ├── index.html                     # Homepage with Hero, Collections & Gemini AI Try-On
│   ├── booking.html                   # Mehendi Appointment Booking & Step Flow
│   ├── cart.html                      # Shopping Cart & Checkout Overview
│   ├── login.html                     # Customer Authentication (Email OTP Signup & Login)
│   ├── design-detail.html             # Detailed Design View, Cones & Time Estimator
│   ├── profile.html                   # Customer Profile, Saved Addresses & Info
│   ├── orders.html                    # Booking & Order History
│   ├── order.html                     # Real-time Order Tracking & Status
│   ├── help.html                      # FAQs, Contact & Customer Concerns Form
│   ├── 404.html                       # Aesthetic Custom Error Page
│   ├── favicon.svg                    # Gold Brand Favicon
│   ├── css/
│   │   └── responsive.css             # Mobile & Tablet Responsive Media Queries
│   ├── js/
│   │   └── api.js                     # Centralized Customer REST API Client
│   └── images/                        # High-Resolution Design Portfolio & Brand Logos
│       ├── shringar-logo.png          # High-Res Radiant Gold Brand Emblem
│       ├── mehendi-banner.jpg         # Luxury Hero Showcase Banner
│       ├── rajasthani-bridal.jpg
│       ├── floral-minimal.jpg
│       ├── arabic-sawan.jpg
│       ├── peacock-feet.png
│       └── indo-arabic.png
│
├── shringar-admin/                    # Administrator & Store Management Portal
│   ├── index.html                     # Admin Portal Redirect & Gateway
│   ├── login.html                     # Admin Authentication & Secure Login Gate
│   ├── dashboard.html                 # Analytics, Revenue & Recent Bookings
│   ├── designs.html                   # Mehendi Catalog & Pricing Management
│   ├── orders.html                    # Appointment Tracking & Status Updates
│   ├── artists.html                   # Mehendi Artists Management & Approvals
│   ├── concerns.html                  # Customer Support Inquiries & Resolution
│   ├── feedback.html                  # Customer Reviews & Testimonial Moderation
│   ├── coupons.html                   # Promotional Codes & Discounts
│   ├── locations.html                 # Operating Cities & Service Areas
│   ├── settings.html                  # Store Timings, Booking Rules & Platform Config
│   ├── testimonials.html              # Homepage Testimonial Manager
│   ├── favicon.svg                    # Admin Portal Favicon
│   ├── css/
│   │   └── admin.css                  # Administrative Design System & Components
│   ├── js/
│   │   ├── admin-api.js               # Isolated Admin API Client & Session Manager
│   │   └── admin-api-extra.js         # Concerns, Feedbacks & Artist Applications Client
│   └── images/
│       └── shringar-logo.png          # Admin Header Brand Logo
│
└── shringar-backend/                  # Spring Boot 3.2 (Java 21) REST Backend
    ├── pom.xml                        # Maven Dependencies (Spring Security, JPA, MySQL, Mail)
    └── src/main/
        ├── resources/
        │   ├── application.properties # Server Configuration, SMTP, DB & JWT Settings
        │   └── data.sql               # Seed Data (Designs, Categories, Settings)
        └── java/com/shringar/
            ├── ShringhamApplication.java
            ├── config/
            │   └── SecurityConfig.java         # Stateless JWT Filter & Public Endpoints
            ├── controller/
            │   ├── AuthController.java         # Signup (Email OTP), Login, Password Reset
            │   ├── BookingController.java      # Customer Appointments & Checkout
            │   ├── AiController.java           # Gemini AI Hand Analysis & Recommendations
            │   ├── PublicContentController.java# Public Designs, Artists, Cities & Settings
            │   ├── CustomerConcernController.java # Customer Inquiries & Contact Forms
            │   ├── AdminDashboardController.java
            │   ├── AdminConcernController.java
            │   ├── AdminFeedbackController.java
            │   └── AdminArtistApplicationController.java
            ├── dto/
            │   ├── request/                    # Strongly Typed DTOs (Signup, Login, etc.)
            │   └── response/                   # JSON Response Envelopes
            ├── model/                          # JPA Entities (User, Booking, Design, etc.)
            ├── repository/                     # Spring Data JPA Repositories
            ├── security/                       # JWT Filters & UserDetails Resolver
            └── service/                        # Business Logic, Email & AI Services
```

---

## 🛠️ 3. Summary of Core Updates in this Release

1. **Streamlined Signup (Phone Removed)**:
   - Signup now requires only **First Name**, **Last Name**, **Email**, and **Password**.
   - Phone requirement removed from `SignupRequest.java` and `AuthService.java`.
   - Real 6-digit OTP delivery via **Gmail SMTP** (`shringar.admin@gmail.com`).
   - Removed external Firebase scripts from `login.html` to improve load performance.

2. **Admin Credentials & Promotion**:
   - `shringar.admin@gmail.com` set as role **`ADMIN`** with active and verified flags.
   - Dedicated access via the Admin Portal (`/shringar-admin/login.html`).

3. **Gemini AI Hand Analysis Integration**:
   - Integrated `AiController.java` and `AiService.java` for personalized henna recommendations based on hand analysis.

4. **Brand & UI Refinement**:
   - Radiant Gold circular emblem (`shringar-logo.png`) added across Frontend and Admin headers.
   - Mobile and tablet navigation icons tuned to prevent logo overlap.
   - Added horizontal scroll indicator arrows for design and artist carousels on mobile/tablet viewports.
   - Improved text contrast on lightweight cards.

5. **Customer Concerns & Artist Onboarding**:
   - New customer concern submission in `help.html` and administrative management in `concerns.html`.
   - Artist application system with admin approval flows.

---

## 🚀 4. How to Update Your Local System

### Method A: Using `shringar-updated-files.zip`
1. Copy `shringar-updated-files.zip` to your project folder.
2. Extract the files over your existing directory structure (choose **"Replace / Overwrite all"**).
3. Rebuild the backend:
   ```bash
   cd shringar-backend
   mvn clean package -DskipTests
   ```
4. Start the services:
   ```bash
   # Backend
   java -jar target/shringar-backend-1.0.0.jar

   # Frontend (from shringar-frontend/)
   python -m http.server 5500

   # Admin (from shringar-admin/)
   python -m http.server 5501
   ```

---

## 🌐 5. Production Deployment Guide (Linux VPS / Nginx)

### Step 1: Server Prerequisites
Ensure your server (Ubuntu 22.04 / 24.04 LTS) has the required runtimes:
```bash
sudo apt update && sudo apt install -y openjdk-21-jdk mysql-server nginx certbot python3-certbot-nginx
```

### Step 2: MySQL Production Database Setup
```bash
sudo mysql
```
```sql
CREATE DATABASE IF NOT EXISTS shringar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'shringar_user'@'localhost' IDENTIFIED BY 'StrongProductionPassword#2026';
GRANT ALL PRIVILEGES ON shringar_db.* TO 'shringar_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Configure Environment Variables
In production, avoid hardcoding secrets in `application.properties`. Pass them as environment variables or create a `/opt/shringar/application-prod.properties` file:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/shringar_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
spring.datasource.username=shringar_user
spring.datasource.password=StrongProductionPassword#2026

# Production JWT Secret
jwt.secret=ProductionSuperSecretKeyWith64CharactersMinLengthForSecurity2026!

# SMTP Configuration
spring.mail.username=shringar.admin@gmail.com
spring.mail.password=YOUR_GMAIL_APP_PASSWORD

# Allowed Web Origins
cors.allowed-origins=https://yourdomain.com,https://admin.yourdomain.com
```

### Step 4: Build and Deploy the Backend Service
1. Build the executable JAR on your machine or CI/CD runner:
   ```bash
   mvn clean package -DskipTests
   ```
2. Upload `shringar-backend-1.0.0.jar` to `/opt/shringar/shringar-backend.jar` on the server.
3. Create a Systemd service file:
   ```bash
   sudo nano /etc/systemd/system/shringar.service
   ```
   Paste the following:
   ```ini
   [Unit]
   Description=Shringar Mehendi Platform Backend
   After=network.target mysql.service

   [Service]
   User=www-data
   WorkingDirectory=/opt/shringar
   ExecStart=/usr/bin/java -Djava.net.preferIPv4Stack=true -Dspring.config.additional-location=file:/opt/shringar/application-prod.properties -jar /opt/shringar/shringar-backend.jar
   SuccessExitStatus=143
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```
4. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable shringar
   sudo systemctl start shringar
   sudo systemctl status shringar
   ```

### Step 5: Deploy Frontend & Admin Files
Deploy the static folders to `/var/www/`:
- Customer Site: `/var/www/shringar-frontend/`
- Admin Portal: `/var/www/shringar-admin/`

In `shringar-frontend/js/api.js` and `shringar-admin/js/admin-api.js`, ensure `API_BASE` is set to your production API path:
```javascript
const API_BASE = '/api'; // Relative path proxies directly through Nginx
```

### Step 6: Nginx Reverse Proxy Configuration
Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/shringar.conf
```
Paste the following:
```nginx
# 1. Main Customer Website
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/shringar-frontend;
    index index.html;

    # Static site routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Spring Boot
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Media Caching
    location ~* \.(jpg|jpeg|png|gif|svg|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

# 2. Admin Management Subdomain
server {
    listen 80;
    server_name admin.yourdomain.com;
    root /var/www/shringar-admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/shringar.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Secure with SSL (HTTPS)
Issue free Let's Encrypt certificates for your domains:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com
```

---

## 🔒 6. Production Security Checklist
- [ ] Ensure `spring.jpa.hibernate.ddl-auto=validate` or `none` in production after the initial schema creation.
- [ ] Replace `jwt.secret` with a cryptographically secure 512-bit random string.
- [ ] Restrict MySQL to only bind on `127.0.0.1`.
- [ ] Configure UFW firewall on the VPS:
  ```bash
  sudo ufw allow OpenSSH
  sudo ufw allow 'Nginx Full'
  sudo ufw enable
  ```
- [ ] Keep regular database backups via `mysqldump`:
  ```bash
  mysqldump -u shringar_user -p shringar_db > /backup/shringar_db_$(date +%F).sql
  ```
