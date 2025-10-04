#!/bin/bash

# Deploy script for PDF fix
# This script rebuilds and deploys the application with PDF generation fixes

set -e

echo "🚀 Starting deployment with PDF fixes..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Please create one based on env.example"
    exit 1
fi

print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

print_status "Removing old images to force rebuild..."
docker-compose -f docker-compose.prod.yml build --no-cache --pull

print_status "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

print_status "Waiting for services to be ready..."
sleep 30

# Check if backend is healthy
print_status "Checking backend health..."
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    print_status "✅ Backend is healthy"
else
    print_warning "⚠️  Backend health check failed, but continuing..."
fi

# Check if frontend is accessible
print_status "Checking frontend..."
if curl -f http://localhost:5000 > /dev/null 2>&1; then
    print_status "✅ Frontend is accessible"
else
    print_warning "⚠️  Frontend check failed, but continuing..."
fi

print_status "Deployment completed!"
print_status "Backend: http://localhost:5001"
print_status "Frontend: http://localhost:5000"

# Show container status
print_status "Container status:"
docker-compose -f docker-compose.prod.yml ps

# Show logs for debugging
print_status "Recent backend logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20 backend

echo ""
print_status "🎉 Deployment with PDF fixes is complete!"
print_status "You can now test PDF generation functionality."
echo ""
print_status "To test PDF generation:"
print_status "1. Upload a CV through the frontend"
print_status "2. Try to export it as PDF"
print_status "3. Check the backend logs if there are any issues:"
print_status "   docker-compose -f docker-compose.prod.yml logs -f backend"