#!/bin/bash

echo "🧹 Starting safe cleanup..."

# Check disk usage
echo " Current disk usage:"
df -h

# Safe Docker cleanup
echo "🐳 Safe Docker cleanup..."
docker container prune -f
docker image prune -a -f
docker volume prune -f
docker network prune -f
docker builder prune -a -f

# Clean npm cache
echo " Cleaning npm cache..."
npm cache clean --force

# Clean old logs
echo "📝 Cleaning old logs..."
sudo find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null || true
sudo find /var/log -name "*.gz" -mtime +7 -delete 2>/dev/null || true

# Clean temp files
echo "🗑️ Cleaning temp files..."
sudo rm -rf /tmp/* 2>/dev/null || true
sudo rm -rf /var/tmp/* 2>/dev/null || true

# Check disk usage after cleanup
echo "📊 Disk usage after cleanup:"
df -h

echo "✅ Safe cleanup completed!"
