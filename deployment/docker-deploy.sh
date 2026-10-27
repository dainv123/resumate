#!/bin/bash

# Docker Deployment Script for Production

echo "🚀 Starting Resumate Docker Deployment..."

# Always run from project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR" || exit 1

# Get VPS IP address
VPS_IP=$(hostname -I | awk '{print $1}')
echo "🌐 VPS IP: $VPS_IP"

# Use domain name if available, otherwise use IP
DOMAIN_NAME="${DOMAIN_NAME:-resumate.click}"
if [ -n "$DOMAIN_NAME" ] && [ "$DOMAIN_NAME" != "localhost" ]; then
    echo "🌐 Using domain: $DOMAIN_NAME"
    export NEXT_PUBLIC_API_URL="http://$DOMAIN_NAME:5001"
    export NEXT_PUBLIC_APP_URL="http://$DOMAIN_NAME:5000"
    export FRONTEND_URL="http://$DOMAIN_NAME:5000"
    export DOMAIN_NAME="$DOMAIN_NAME"
else
    echo "🌐 Using IP: $VPS_IP"
    export NEXT_PUBLIC_API_URL="http://$VPS_IP:5001"
    export NEXT_PUBLIC_APP_URL="http://$VPS_IP:5000"
    export FRONTEND_URL="http://$VPS_IP:5000"
    export DOMAIN_NAME=""
fi

# Check if .env file exists
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo "⚠️  Warning: .env file not found at $ROOT_DIR!"
    if [ -f "$ROOT_DIR/.env.example" ]; then
        echo "Creating .env from .env.example..."
        cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env" || true
        echo "Please update .env file with your configuration"
    else
        echo "No .env.example found at $ROOT_DIR"
        echo "Please create $ROOT_DIR/.env with your configuration"
    fi
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images (optional, uncomment if needed)
# echo "🧹 Removing old images..."
# docker-compose down --rmi all

# Build images and fail fast on errors
echo "🔨 Building Docker images..."
if ! docker-compose -f docker-compose.prod.yml build --no-cache; then
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

# Start containers
echo "▶️  Starting containers..."
if ! docker-compose -f docker-compose.prod.yml up -d; then
    echo "❌ Failed to start containers. Aborting."
    exit 1
fi

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check container status
echo "📊 Container Status:"
docker-compose ps

# Show logs
echo ""
echo "📋 Recent logs:"
docker-compose logs --tail=50

echo ""
echo "✅ Deployment complete!"
echo "📱 Frontend: http://localhost:5000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "Commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart: docker-compose restart"
