#!/bin/bash

# Resumate Re-deploy Script
# Quick re-deploy for images and restart nginx

set -e

# Auto-detect if running on server
if [ -f "/home/resumate/docker-compose.prod.yml" ] || [ -f "./docker-compose.prod.yml" ] || [ -f "../docker-compose.prod.yml" ]; then
    # Running on server directly
    SERVER_IP="localhost"
    DOMAIN=${1:-"resumate.click"}
    FORCE_REBUILD=${2:-"false"}
    echo "🔍 Detected: Running on server directly"
else
    # Running from remote
    SERVER_IP=${1:-"103.90.234.177"}
    DOMAIN=${2:-"resumate.click"}
    FORCE_REBUILD=${3:-"false"}
    echo "🔍 Detected: Running from remote"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to run command (local or remote)
run_cmd() {
    local cmd="$1"
    
    if [ "$SERVER_IP" = "localhost" ] || [ "$SERVER_IP" = "127.0.0.1" ]; then
        # Running on server directly
        eval "$cmd"
    else
        # Running from remote
        ssh root@$SERVER_IP "$cmd"
    fi
}

# Function to check if server is reachable
check_server() {
    print_status $BLUE "🔍 Checking server connectivity..."
    
    # Check if running on server directly
    if [ "$SERVER_IP" = "localhost" ] || [ "$SERVER_IP" = "127.0.0.1" ]; then
        print_status $GREEN "✅ Running on server directly"
        return 0
    fi
    
    # Check SSH connectivity if running from remote
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@$SERVER_IP exit 2>/dev/null; then
        print_status $RED "❌ Cannot connect to server $SERVER_IP"
        print_status $YELLOW "Please check:"
        echo "   - Server IP is correct"
        echo "   - SSH key is configured"
        echo "   - Server is running"
        exit 1
    fi
    print_status $GREEN "✅ Server is reachable"
}

# Function to check disk space
check_disk_space() {
    print_status $BLUE "💽 Checking disk space..."
    
    if [ "$SERVER_IP" = "localhost" ] || [ "$SERVER_IP" = "127.0.0.1" ]; then
        # Running on server directly
        local disk_usage=$(df -h /home | tail -1 | awk '{print $5}' | sed 's/%//')
    else
        # Running from remote
        local disk_usage=$(ssh root@$SERVER_IP "df -h /home | tail -1 | awk '{print \$5}' | sed 's/%//'")
    fi
    
    if [ "$disk_usage" -gt 85 ]; then
        print_status $YELLOW "⚠️  Disk usage is high: ${disk_usage}%"
        print_status $YELLOW "Consider running cleanup: ./deployment/safe-cleanup.sh"
    else
        print_status $GREEN "✅ Disk space OK: ${disk_usage}%"
    fi
}

# Function to show menu
show_menu() {
    echo ""
    print_status $BLUE "📋 Choose deployment option:"
    echo "1) Quick re-deploy (copy files + restart)"
    echo "2) Full re-deploy (rebuild all images)"
    echo "3) Containers only (restart containers)"
    echo "4) Check status"
    echo "5) View logs"
    echo "6) Exit"
    echo ""
}

# Function to quick redeploy
quick_redeploy() {
    print_status $YELLOW "🚀 Quick re-deploy starting..."
    
    # Copy project files (only if running from remote)
    if [ "$SERVER_IP" != "localhost" ] && [ "$SERVER_IP" != "127.0.0.1" ]; then
        print_status $BLUE "📁 Copying project files..."
        scp -r . root@$SERVER_IP:/home/resumate/
    else
        print_status $BLUE "📁 Files already on server, skipping copy..."
    fi
    
    # Restart containers
    print_status $BLUE "🔄 Restarting containers..."
    run_cmd "cd /home/resumate && docker-compose -f docker-compose.prod.yml restart"
    
    print_status $GREEN "✅ Quick re-deploy completed!"
}

# Function to full redeploy
full_redeploy() {
    print_status $YELLOW "🚀 Full re-deploy starting..."
    
    # Copy project files (only if running from remote)
    if [ "$SERVER_IP" != "localhost" ] && [ "$SERVER_IP" != "127.0.0.1" ]; then
        print_status $BLUE "📁 Copying project files..."
        scp -r . root@$SERVER_IP:/home/resumate/
    else
        print_status $BLUE "📁 Files already on server, skipping copy..."
    fi
    
    # Rebuild and restart containers
    print_status $BLUE "🐳 Rebuilding and restarting containers..."
    run_cmd "cd /home/resumate && docker-compose -f docker-compose.prod.yml down"
    run_cmd "cd /home/resumate && docker-compose -f docker-compose.prod.yml up -d --build"
    
    print_status $GREEN "✅ Full re-deploy completed!"
}

# Function to restart containers only
containers_only() {
    print_status $YELLOW "🔄 Restarting containers only..."
    
    run_cmd "cd /home/resumate && docker-compose -f docker-compose.prod.yml restart"
    
    print_status $GREEN "✅ Containers restarted successfully!"
}

# Function to check status
check_status() {
    print_status $BLUE "📊 Checking application status..."
    
    echo ""
    print_status $YELLOW "🐳 Container Status:"
    run_cmd "cd /home/resumate && docker-compose -f docker-compose.prod.yml ps"
    
    echo ""
    print_status $YELLOW "🔗 Service URLs:"
    echo "   - Frontend: https://$DOMAIN"
    echo "   - Backend: https://api.$DOMAIN"
    
    echo ""
    print_status $YELLOW "🔍 Environment Variables:"
    run_cmd "docker exec -it resumate-frontend env | grep NEXT_PUBLIC"
    run_cmd "docker exec -it resumate-backend env | grep GOOGLE"
}

# Function to view logs
view_logs() {
    print_status $BLUE "📝 Viewing application logs..."
    
    echo ""
    print_status $YELLOW "Choose log type:"
    echo "1) All services"
    echo "2) Frontend only"
    echo "3) Backend only"
    echo ""
    read -p "Enter choice (1-3): " log_choice
    
    case $log_choice in
        1)
            run_cmd "cd /home/resumate && docker-compose -f docker-compose.prod.yml logs -f --tail=50"
            ;;
        2)
            run_cmd "cd /home/resumate && docker-compose -f docker-compose.prod.yml logs -f frontend --tail=50"
            ;;
        3)
            run_cmd "cd /home/resumate && docker-compose -f docker-compose.prod.yml logs -f backend --tail=50"
            ;;
        *)
            print_status $RED "❌ Invalid choice"
            ;;
    esac
}

# Main function
main() {
    echo "🚀 Resumate Re-deploy Script"
    echo "============================"
    echo "Server IP: $SERVER_IP"
    echo "Domain: $DOMAIN"
    
    # Check server connectivity
    check_server
    
    # Check disk space
    check_disk_space
    
    # If force rebuild is specified, skip menu
    if [ "$FORCE_REBUILD" = "true" ]; then
        full_redeploy
        check_status
        exit 0
    fi
    
    # Show menu and handle choice
    while true; do
        show_menu
        read -p "Enter your choice (1-6): " choice
        
        case $choice in
            1)
                quick_redeploy
                check_status
                ;;
            2)
                full_redeploy
                check_status
                ;;
            3)
                containers_only
                ;;
            4)
                check_status
                ;;
            5)
                view_logs
                ;;
            6)
                print_status $GREEN "👋 Goodbye!"
                exit 0
                ;;
            *)
                print_status $RED "❌ Invalid option. Please choose 1-6."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main "$@"