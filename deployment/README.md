# Deployment Guide

## Docker Deployment

### Prerequisites
- Docker và Docker Compose đã cài đặt
- File `.env` đã được cấu hình

### Quick Start

#### Development Mode
```bash
# Chạy development environment với hot reload
./deployment/docker-dev.sh

# Hoặc manual
docker-compose -f docker-compose.dev.yml up
```

#### Production Mode
```bash
# Deploy production
./deployment/docker-deploy.sh

# Hoặc manual
docker-compose up -d
```

### Docker Commands

#### Build và Start
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Build và start cùng lúc
docker-compose up -d --build
```

#### Logs và Monitoring
```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend

# Check status
docker-compose ps
```

#### Stop và Cleanup
```bash
# Stop services
docker-compose down

# Stop và xóa volumes (⚠️ mất data!)
docker-compose down -v

# Stop và xóa images
docker-compose down --rmi all
```

#### Database Management
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d resumate

# Backup database
docker-compose exec postgres pg_dump -U postgres resumate > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres resumate < backup.sql
```

#### Restart Services
```bash
# Restart tất cả
docker-compose restart

# Restart service cụ thể
docker-compose restart backend
```

### Environment Variables

Copy `.env.example` thành `.env` và cập nhật các giá trị:

```bash
cp .env.example .env
```

**Required variables:**
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `GOOGLE_AI_API_KEY` - Google AI API Key

### Deploy lên Server

#### 1. Copy files lên server
```bash
# Sử dụng rsync
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ user@your-server:/path/to/resumate/

# Hoặc sử dụng scp
scp -r ./ user@your-server:/path/to/resumate/
```

#### 2. SSH vào server và deploy
```bash
ssh user@your-server
cd /path/to/resumate
./deployment/docker-deploy.sh
```

#### 3. Configure Nginx (Optional)
```nginx
# /etc/nginx/sites-available/resumate
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/resumate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Troubleshooting

#### Containers không start
```bash
# Check logs
docker-compose logs

# Check resources
docker system df
```

#### Database connection issues
```bash
# Check postgres health
docker-compose exec postgres pg_isready

# Recreate database
docker-compose down -v
docker-compose up -d
```

#### Port conflicts
```bash
# Check ports in use
sudo lsof -i :5000
sudo lsof -i :5001
sudo lsof -i :5432

# Change ports in .env file
```

### CI/CD với GitHub Actions

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /path/to/resumate
            git pull origin main
            ./deployment/docker-deploy.sh
```

### Production Checklist

- [ ] Đã cấu hình `.env` với production values
- [ ] Đã đổi `JWT_SECRET` thành random string mạnh
- [ ] Đã đổi `DB_PASSWORD` thành password mạnh
- [ ] Đã cấu hình Google OAuth callback URLs
- [ ] Đã setup SSL certificate (Let's Encrypt)
- [ ] Đã configure firewall rules
- [ ] Đã setup backup cho database
- [ ] Đã configure logging và monitoring
