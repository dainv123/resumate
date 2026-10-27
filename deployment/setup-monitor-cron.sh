#!/bin/bash

# Setup script to install container monitoring cron job
# This script adds a cron job to monitor containers every 5 minutes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MONITOR_SCRIPT="$ROOT_DIR/deployment/monitor-containers.js"

echo "🔧 Setting up container monitoring cron job..."

# Make monitor script executable
chmod +x "$MONITOR_SCRIPT"

# Check if cron job already exists
CRON_CMD="*/5 * * * * cd $ROOT_DIR && node deployment/monitor-containers.js >> /var/log/resumate-monitor.log 2>&1"
CRON_EXISTS=$(crontab -l 2>/dev/null | grep -F "monitor-containers.js" || echo "")

if [ -z "$CRON_EXISTS" ]; then
    # Add cron job
    (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
    echo "✅ Cron job added successfully!"
    echo ""
    echo "The monitoring script will run every 5 minutes."
    echo "Logs will be saved to: /var/log/resumate-monitor.log"
else
    echo "⚠️  Cron job already exists. Skipping..."
fi

echo ""
echo "📋 Current crontab:"
crontab -l | grep "monitor-containers" || echo "No monitoring cron job found"

echo ""
echo "✅ Setup complete!"
echo ""
echo "To manually run monitoring:"
echo "  node $MONITOR_SCRIPT"
echo ""
echo "To remove cron job:"
echo "  crontab -e"
echo "  (then delete the line with monitor-containers.js)"

