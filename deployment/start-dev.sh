#!/bin/bash

# Script để chạy cả frontend, backend và tunnels
echo "🚀 Starting Resumate Development Environment..."

# Function để chạy command trong background
run_in_background() {
    local name=$1
    local command=$2
    echo "Starting $name..."
    $command &
    local pid=$!
    echo "$name PID: $pid"
    # Remove PID file creation to avoid substitution error
}

# Kill existing processes nếu có
echo "🧹 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true
pkill -f "cloudflared tunnel" 2>/dev/null || true

# Start Frontend
run_in_background "Frontend" "cd ../frontend && npm run dev"

# Start Backend  
run_in_background "Backend" "cd ../backend && npm run start:dev"

# Wait a bit for servers to start
echo "⏳ Waiting for servers to start..."
sleep 5

# Start Frontend Tunnel (Cloudflare Tunnel - stable & free)
echo "🌐 Creating Frontend Tunnel..."
cloudflared tunnel --url http://localhost:5000 &
FRONTEND_TUNNEL_PID=$!
echo "Frontend Tunnel PID: $FRONTEND_TUNNEL_PID"

# Start Backend Tunnel (Cloudflare Tunnel - stable & free)
echo "🌐 Creating Backend Tunnel..."
cloudflared tunnel --url http://localhost:5001 &
BACKEND_TUNNEL_PID=$!
echo "Backend Tunnel PID: $BACKEND_TUNNEL_PID"

echo ""
echo "✅ All services started!"
echo "📱 Frontend: http://localhost:5000"
echo "🔧 Backend: http://localhost:5001"
echo "🌐 Frontend Tunnel: Look for 'https://...trycloudflare.com' above"
echo "🌐 Backend Tunnel: Look for 'https://...trycloudflare.com' above"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo "🛑 Stopping all services..."; pkill -f "next dev"; pkill -f "nest start"; pkill -f "cloudflared tunnel"; exit' INT

# Keep script running
wait