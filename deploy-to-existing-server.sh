#!/bin/bash

# Script để deploy Resumate lên server đã có sẵn nginx và project khác
echo "🚀 Deploying Resumate to existing server..."

# Cài đặt PM2 nếu chưa có
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Cài đặt dependencies
echo "📦 Installing dependencies..."
cd frontend && npm install
cd ../backend && npm install
cd ..

# Build backend
echo "🔨 Building backend..."
cd backend && npm run build
cd ..

# Start với PM2
echo "🚀 Starting services with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo ""
echo "✅ Resumate deployment completed!"
echo "📱 Frontend: http://localhost:5000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "📋 Next steps:"
echo "1. Add nginx config from server-nginx-config.conf to your nginx"
echo "2. Reload nginx: sudo nginx -s reload"
echo "3. Check PM2 status: pm2 status"
echo "4. View logs: pm2 logs"