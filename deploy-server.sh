#!/bin/bash

# Script để deploy lên server không cần Docker
echo "🚀 Deploying Resumate to Server..."

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
pm2 startup

echo ""
echo "✅ Deployment completed!"
echo "📱 Frontend: http://localhost:5000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "📋 PM2 Commands:"
echo "  pm2 status          - Check status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart all"
echo "  pm2 stop all        - Stop all"
echo "  pm2 delete all      - Delete all"