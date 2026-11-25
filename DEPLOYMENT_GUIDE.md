# REALCRED TECHNOLOGY PRIVATE LIMITED
## Production Deployment Runbook & Infrastructure Guide

**Domain:** `https://realcred.in`  
**Brand:** RealCred  
**Tagline:** *Your Loan. One Guided Route.*  
**Registered Office:** D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, UP 201301  

---

### 1. Server Architecture Overview

RealCred is architected as a high-performance MERN application designed for production hosting on Linux VPS (Ubuntu 22.04 or 24.04 LTS), bare metal, or containerized Docker clusters:

- **Frontend Client:** React 18 + Vite 6 Single Page Application (SPA), minified and compiled to static assets served by Nginx or Express in production.
- **Backend API:** Node.js 22 LTS + Express.js API Gateway with Helmet, CORS, Rate Limiting, JWT role-guarding, and PDFKit invoicing engine.
- **Database:** Local MongoDB 7.0+ instance (`mongodb://127.0.0.1:27017/realcred`).
- **Reverse Proxy & SSL:** Nginx with HTTP/2, Let's Encrypt SSL/TLS, Gzip compression, and asset caching.
- **Process Manager:** PM2 Cluster mode for multi-core zero-downtime execution.

---

### 2. Prerequisites & Server Provisioning

```bash
# 1. Update OS packages
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx

# 3. Install MongoDB 7.0 Community Edition
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod

# 4. Install PM2 globally
sudo npm install -g pm2
```

---

### 3. Application Deployment Steps

#### Step 3.1: Clone and Install Dependencies
```bash
cd /var/www
sudo git clone <REPO_URL> realcred
cd realcred
sudo chown -R $USER:$USER /var/www/realcred

# Install backend dependencies
cd backend
npm ci --production
cd ..

# Install frontend dependencies and build production bundle
cd frontend
npm ci
npm run build
cd ..
```

#### Step 3.2: Configure Environment Variables
Copy `.env.production` files:
```bash
# Backend
cp backend/.env.production backend/.env

# Frontend
cp frontend/.env.production frontend/.env
```

#### Step 3.3: Seed Initial Super Admin & CMS Data
```bash
cd backend
node scripts/createAdmin.js
node scripts/seedInitialData.js
cd ..
```

#### Step 3.4: Launch with PM2 Process Manager
```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

---

### 4. Nginx Reverse Proxy & SSL Setup for `realcred.in`

#### Step 4.1: Deploy Nginx Configuration
```bash
sudo cp nginx/realcred.in.conf /etc/nginx/sites-available/realcred.in.conf
sudo ln -s /etc/nginx/sites-available/realcred.in.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 4.2: Obtain Free SSL Certificate via Certbot
```bash
sudo certbot --nginx -d realcred.in -d www.realcred.in --non-interactive --agree-tos --email admin@realcred.in
```

---

### 5. Docker Deployment Alternative

For containerized cloud deployment (AWS ECS, DigitalOcean App Platform, or Docker Swarm):

```bash
# Build and launch with Docker Compose
docker compose up -d --build

# View logs
docker compose logs -f app
```

---

### 6. Automated Backup & Maintenance Schedule

Create daily MongoDB backup cron job:
```bash
sudo crontab -e
# Add line to backup daily at 2:00 AM:
0 2 * * * mongodump --db=realcred --out=/var/backups/mongodb/$(date +\%F)
```
