#!/bin/bash

echo "🔍 Checking Resumate Services Status..."

# Check if containers are running
echo "📦 Docker Containers:"
docker ps --filter "name=resumate" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Service URLs:"
echo "Frontend: http://daidev.click:5000"
echo "Backend API: http://daidev.click:5001"

echo ""
echo "🔗 Testing API endpoints:"

# Test backend health
echo "Testing backend health..."
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Backend health check: OK"
else
    echo "❌ Backend health check: FAILED"
fi

# Test frontend
echo "Testing frontend..."
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FAILED"
fi

echo ""
echo "📊 Container logs (last 10 lines):"
echo "=== Backend Logs ==="
docker logs resumate-backend --tail 10

echo ""
echo "=== Frontend Logs ==="
docker logs resumate-frontend --tail 10