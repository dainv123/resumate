#!/bin/bash

# Database Helper Script
# Provides easy commands for database operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_error ".env file not found!"
        print_status "Please create .env file with database configuration"
        exit 1
    fi
}

# Main function
main() {
    case "$1" in
        "setup")
            print_status "Setting up database..."
            check_env
            npm run migration:run
            npm run seed:templates
            print_success "Database setup completed!"
            ;;
        "reset")
            print_warning "Resetting database (this will revert all migrations)..."
            check_env
            npm run db:reset
            print_success "Database reset completed!"
            ;;
        "migrate")
            print_status "Running migrations..."
            check_env
            npm run migration:run
            print_success "Migrations completed!"
            ;;
        "revert")
            print_warning "Reverting last migration..."
            check_env
            npm run migration:revert
            print_success "Migration reverted!"
            ;;
        "seed")
            print_status "Seeding templates..."
            check_env
            npm run seed:templates
            print_success "Seeding completed!"
            ;;
        "status")
            print_status "Checking migration status..."
            check_env
            npm run migration:show
            ;;
        "generate")
            if [ -z "$2" ]; then
                print_error "Migration name required!"
                print_status "Usage: ./scripts/db-helper.sh generate MigrationName"
                exit 1
            fi
            print_status "Generating migration: $2"
            check_env
            npm run migration:generate
            print_success "Migration generated!"
            ;;
        *)
            echo "Database Helper Script"
            echo ""
            echo "Usage: $0 {setup|reset|migrate|revert|seed|status|generate}"
            echo ""
            echo "Commands:"
            echo "  setup     - Run migrations and seed templates"
            echo "  reset     - Reset database (revert + migrate + seed)"
            echo "  migrate   - Run pending migrations"
            echo "  revert    - Revert last migration"
            echo "  seed      - Seed CV templates"
            echo "  status    - Show migration status"
            echo "  generate  - Generate new migration (requires name)"
            echo ""
            echo "Examples:"
            echo "  $0 setup"
            echo "  $0 generate AddUserTable"
            echo "  $0 status"
            ;;
    esac
}

# Run main function with all arguments
main "$@"

