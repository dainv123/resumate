#!/bin/bash

# Script để chạy production trên server với localhost trực tiếp
echo "🚀 Starting Resumate Production Environment..."

# Function để chạy command trong background
run_in_background() {
    local name=$1
    local command=$2
    echo "Starting $name..."
    $command &
    local pid=$!
    echo "$name PID: $pid"
}

# Kill existing processes nếu có
echo "🧹 Cleaning up existing processes..."
pkill -f "next start" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true

# Start Frontend (Development mode - bypass build errors)
echo "📱 Starting Frontend on port 5000..."
run_in_background "Frontend" "cd frontend && PORT=5000 npm run dev"

# Start Backend (Production)
echo "🔧 Starting Backend on port 5001..."
run_in_background "Backend" "cd backend && PORT=5001 npm run start:prod"

# Wait a bit for servers to start
echo "⏳ Waiting for servers to start..."
sleep 10

echo ""
echo "✅ Production services started!"
echo "📱 Frontend: http://localhost:5000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo "🛑 Stopping all services..."; pkill -f "next start"; pkill -f "nest start"; exit' INT

# Keep script running
wait