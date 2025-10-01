#!/bin/bash

# Docker Development Script

echo "🚀 Starting Resumate Development Environment (Docker)..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env from env.example..."
    cp .env.example .env || true
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Start containers
echo "▶️  Starting development containers..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10

# Check container status
echo "📊 Container Status:"
docker-compose -f docker-compose.dev.yml ps

# Follow logs
echo ""
echo "📋 Following logs (Ctrl+C to stop):"
docker-compose -f docker-compose.dev.yml logs -f
