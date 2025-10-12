# 🚀 Production Deployment - Complete Guide

## Prerequisites

- ✅ Ubuntu/Debian server (hoặc VPS)
- ✅ Docker và Docker Compose installed
- ✅ Git installed
- ✅ Domain name pointed to server (optional)
- ✅ SSH access to server

---

## 📋 Step-by-Step Deployment

### **STEP 1: Prepare Server**

SSH vào server của bạn:

```bash
# Từ máy local
ssh your-user@your-server-ip

# Hoặc với key
ssh -i ~/.ssh/your-key.pem your-user@your-server-ip
```

Update server:

```bash
sudo apt update
sudo apt upgrade -y
```

---

### **STEP 2: Install Docker & Docker Compose**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version

# Logout and login again for group changes to take effect
exit
# SSH again
ssh your-user@your-server-ip
```

---

### **STEP 3: Clone Project**

```bash
# Navigate to desired directory
cd /home/$USER

# Clone repository (replace with your repo)
git clone https://github.com/your-username/resumate.git
# Hoặc nếu private repo:
git clone https://your-token@github.com/your-username/resumate.git

# Enter project
cd resumate

# Hoặc nếu chưa có git repo, upload files:
# rsync -avz -e ssh /path/to/local/resumate/ user@server:/home/user/resumate/
```

---

### **STEP 4: Setup Environment Variables**

Tạo file `.env` cho backend:

```bash
cd /home/$USER/resumate/backend

# Copy example
cp env.example .env

# Edit environment file
nano .env
```

**Điền các giá trị quan trọng:**

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE  # ⚠️ ĐỔI PASSWORD!
DB_NAME=resumate

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Rate Limiting
RATE_LIMIT_STRATEGY=redis
ENABLE_RATE_LIMITING=true

# JWT Secret
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_HERE  # ⚠️ ĐỔI!
JWT_EXPIRES_IN=7d

# Google AI (for CV parsing)
GOOGLE_AI_API_KEY=your_google_ai_key
GOOGLE_AI_MODEL=gemini-1.5-flash

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback

# URLs
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com

# Email (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Domain
DOMAIN_NAME=your-domain.com

# App
PORT=5001
NODE_ENV=production
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### **STEP 5: Setup Frontend Environment**

```bash
cd /home/$USER/resumate/frontend

# Create .env.production
nano .env.production
```

```bash
NODE_ENV=production
PORT=5000
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_APP_NAME=Resumate
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### **STEP 6: Update docker-compose.yml**

```bash
cd /home/$USER/resumate

# Edit docker-compose
nano docker-compose.yml
```

**Ensure these settings:**

```yaml
version: '3.8'

services:
  postgres:
    # ... existing config
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # From .env
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    # ... existing config
    volumes:
      - redis_data:/data
    restart: unless-stopped

  backend:
    # ... existing config
    restart: unless-stopped
    
  frontend:
    # ... existing config
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  resumate-network:
    driver: bridge
```

---

### **STEP 7: Create Backup Directories**

```bash
# Create backup directories
sudo mkdir -p /backups/postgres
sudo mkdir -p /backups/redis
sudo mkdir -p /var/log/resumate-backups

# Set permissions
sudo chown -R $USER:$USER /backups
sudo chmod -R 755 /backups
sudo chmod -R 755 /var/log/resumate-backups

# Verify
ls -ld /backups
ls -ld /var/log/resumate-backups
```

---

### **STEP 8: Make Scripts Executable**

```bash
cd /home/$USER/resumate/deployment

# Make all scripts executable
chmod +x *.sh

# Verify
ls -l *.sh
# Should show -rwxr-xr-x
```

---

### **STEP 9: Install Backend Dependencies**

```bash
cd /home/$USER/resumate/backend

# Install Node.js (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v20.x
npm --version

# Install dependencies
npm install

# Build
npm run build

# Verify build
ls -la dist/
```

---

### **STEP 10: Deploy Application**

```bash
cd /home/$USER/resumate

# Start services
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 20

# Check status
docker-compose ps

# Expected output:
# resumate-postgres  running
# resumate-redis     running  
# resumate-backend   running
# resumate-frontend  running
```

---

### **STEP 11: Verify Deployment**

```bash
# Check Redis
docker exec resumate-redis redis-cli ping
# Expected: PONG

# Check PostgreSQL
docker exec resumate-postgres pg_isready -U postgres
# Expected: accepting connections

# Check Backend health
curl http://localhost:5001/api/health
# Expected: {"status":"ok",...}

# Check Rate Limit status
curl http://localhost:5001/api/health/rate-limit-status
# Expected: {"strategy":"redis","enabled":true,"health":"healthy"}

# Check Frontend
curl http://localhost:5000
# Expected: HTML response

# View logs
docker-compose logs backend | tail -20
docker-compose logs redis | tail -20
```

---

### **STEP 12: Setup Automated Backups (Cron Jobs)**

**Method 1: Automated Script**

```bash
cd /home/$USER/resumate/deployment

# Run setup script
./setup-cronjobs.sh

# Follow prompts and confirm installation
```

**Method 2: Manual Setup**

```bash
# Edit crontab
crontab -e

# Choose editor (usually nano = 1)
# Add these lines at the bottom:
```

```cron
# Resumate Automated Backups
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
PROJECT_ROOT=/home/YOUR_USER/resumate

# Daily PostgreSQL backup (2 AM)
0 2 * * * $PROJECT_ROOT/deployment/backup-postgres.sh >> /var/log/resumate-backups/postgres.log 2>&1

# Weekly Redis backup (Sunday 3 AM)
0 3 * * 0 $PROJECT_ROOT/deployment/backup-redis.sh >> /var/log/resumate-backups/redis.log 2>&1

# Monthly cleanup (1st day, 4 AM)
0 4 1 * * $PROJECT_ROOT/deployment/cleanup-backups.sh >> /var/log/resumate-backups/cleanup.log 2>&1

# Daily health check (6 AM)
0 6 * * * curl -sf http://localhost:5001/api/health/rate-limit-status >> /var/log/resumate-backups/health.log 2>&1

# Weekly Redis memory check (Monday 1 AM)
0 1 * * 1 docker exec resumate-redis redis-cli INFO memory >> /var/log/resumate-backups/redis-memory.log 2>&1
```

**Save:** `Ctrl+X`, `Y`, `Enter`

**Verify cron jobs:**

```bash
# List cron jobs
crontab -l

# Test backup manually
/home/$USER/resumate/deployment/backup-postgres.sh

# Check if backup was created
ls -lh /backups/postgres/ | tail -5
```

---

### **STEP 13: Test Backups**

```bash
# Test PostgreSQL backup
cd /home/$USER/resumate/deployment
./backup-postgres.sh

# Check output
ls -lh /backups/postgres/ | head -5

# Test Redis backup
./backup-redis.sh

# Check output
ls -lh /backups/redis/ | head -5

# Test cleanup script
./cleanup-backups.sh
```

---

### **STEP 14: Setup Firewall**

```bash
# Install UFW (if not installed)
sudo apt install ufw -y

# Allow SSH (IMPORTANT!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow backend port (optional if using nginx)
sudo ufw allow 5001/tcp

# Allow frontend port (optional if using nginx)
sudo ufw allow 5000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

### **STEP 15: Setup Nginx Reverse Proxy (Recommended)**

```bash
# Install Nginx
sudo apt install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/resumate
```

**Add this configuration:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/resumate /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### **STEP 16: Setup SSL with Let's Encrypt**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificates
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com

# Follow prompts and enter email

# Test auto-renewal
sudo certbot renew --dry-run

# Certbot will auto-renew via cron
```

---

### **STEP 17: Setup Log Rotation**

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/resumate
```

```
/var/log/resumate-backups/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

---

### **STEP 18: Setup Monitoring (Optional)**

**Install basic monitoring:**

```bash
# Install htop for monitoring
sudo apt install htop -y

# Install docker stats
# Already included with docker

# Create monitoring script
cat > /home/$USER/resumate/deployment/monitor.sh << 'EOF'
#!/bin/bash
echo "=== Docker Containers ==="
docker-compose ps

echo ""
echo "=== Redis Memory ==="
docker exec resumate-redis redis-cli INFO memory | grep used_memory_human

echo ""
echo "=== PostgreSQL Connections ==="
docker exec resumate-postgres psql -U postgres -d resumate -c "SELECT count(*) FROM pg_stat_activity;"

echo ""
echo "=== Disk Usage ==="
df -h | grep -E "/$|/backups"

echo ""
echo "=== Recent Backups ==="
ls -lht /backups/postgres/ | head -3
ls -lht /backups/redis/ | head -3
EOF

chmod +x /home/$USER/resumate/deployment/monitor.sh

# Run monitoring
./deployment/monitor.sh
```

---

### **STEP 19: Create Systemd Service (Optional - Auto-restart)**

```bash
# Create service file
sudo nano /etc/systemd/system/resumate.service
```

```ini
[Unit]
Description=Resumate Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/YOUR_USER/resumate
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=YOUR_USER
Group=YOUR_USER

[Install]
WantedBy=multi-user.target
```

**Enable service:**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable resumate

# Start service
sudo systemctl start resumate

# Check status
sudo systemctl status resumate
```

---

### **STEP 20: Final Verification**

```bash
# Check all services
docker-compose ps

# Check logs
docker-compose logs --tail=50

# Check health
curl http://localhost:5001/api/health/rate-limit-status | jq

# Check backups
ls -lh /backups/postgres/
ls -lh /backups/redis/

# Check cron jobs
crontab -l

# Check firewall
sudo ufw status

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check SSL
curl -I https://your-domain.com

# Monitor resources
docker stats --no-stream
```

---

## 📊 Post-Deployment Checklist

- [ ] Services running (`docker-compose ps`)
- [ ] Backend health OK (`curl localhost:5001/api/health`)
- [ ] Redis healthy (`curl localhost:5001/api/health/rate-limit-status`)
- [ ] PostgreSQL backup working (`ls /backups/postgres/`)
- [ ] Cron jobs installed (`crontab -l`)
- [ ] Firewall configured (`sudo ufw status`)
- [ ] Nginx running (`sudo systemctl status nginx`)
- [ ] SSL certificates installed (`curl -I https://your-domain.com`)
- [ ] Domain resolving correctly
- [ ] Can login to application
- [ ] Rate limiting working (make 15 requests, should get 429)
- [ ] Logs being created (`ls /var/log/resumate-backups/`)

---

## 🔧 Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f redis
tail -f /var/log/resumate-backups/*.log

# Restart services
docker-compose restart
docker-compose restart backend

# Stop/Start
docker-compose down
docker-compose up -d

# Update application
cd /home/$USER/resumate
git pull
docker-compose down
docker-compose up -d --build

# Manual backup
./deployment/backup-postgres.sh
./deployment/backup-redis.sh

# Check rate limiting
docker exec resumate-redis redis-cli KEYS "rate:*"
docker exec resumate-redis redis-cli GET "rate:user-id:minute"

# Check PostgreSQL
docker exec resumate-postgres psql -U postgres -d resumate -c "\dt"

# Monitor
./deployment/monitor.sh
docker stats
htop
```

---

## 🆘 Troubleshooting

### Services not starting?

```bash
# Check logs
docker-compose logs

# Check if ports are available
sudo netstat -tulpn | grep -E "5000|5001|5432|6379"

# Restart Docker
sudo systemctl restart docker
docker-compose up -d
```

### Backups not running?

```bash
# Check cron service
sudo systemctl status cron

# Check logs
tail -f /var/log/resumate-backups/*.log

# Test manually
./deployment/backup-postgres.sh
```

### Rate limiting not working?

```bash
# Check Redis
docker exec resumate-redis redis-cli ping

# Check strategy
curl http://localhost:5001/api/health/rate-limit-status

# Check env
docker exec resumate-backend env | grep RATE_LIMIT
```

---

## 🎉 Done!

Your production server is now fully configured with:
- ✅ Docker containers running
- ✅ Redis rate limiting active
- ✅ Automated daily backups
- ✅ Automated cleanup
- ✅ Health monitoring
- ✅ SSL certificates
- ✅ Nginx reverse proxy
- ✅ Firewall configured
- ✅ Auto-restart on reboot

**Next steps:**
1. Test the application thoroughly
2. Monitor logs for first 24-48 hours
3. Verify backups are being created
4. Setup external monitoring (optional)
5. Configure email alerts (optional)

---

**Need help?** Check logs:
- Backend: `docker-compose logs backend`
- Redis: `docker-compose logs redis`
- Backups: `tail -f /var/log/resumate-backups/*.log`

