#!/bin/bash

echo "🧹 Cleaning up disk space..."

# Clean Docker system
echo "Cleaning Docker system..."
docker system prune -f
docker volume prune -f
docker image prune -f

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Clean apt cache
echo "Cleaning apt cache..."
apt-get clean
apt-get autoclean
apt-get autoremove -y

# Clean logs
echo "Cleaning logs..."
journalctl --vacuum-time=7d
find /var/log -type f -name "*.log" -mtime +7 -delete

# Show disk usage
echo "📊 Disk usage after cleanup:"
df -h

echo "✅ Cleanup completed!"