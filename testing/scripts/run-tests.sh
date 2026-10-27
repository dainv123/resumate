#!/bin/bash

# Resumate Testing Framework - Test Runner Script
# This script provides a convenient way to run different types of tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="all"
BROWSER="chromium"
HEADLESS="true"
PARALLEL="true"
REPORTER="html"
ENVIRONMENT="local"

# Function to print usage
print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --type TYPE        Test type: smoke, e2e, api, integration, all (default: all)"
    echo "  --browser BROWSER  Browser: chromium, firefox, webkit (default: chromium)"
    echo "  --headed           Run tests in headed mode (visible browser)"
    echo "  --sequential       Run tests sequentially instead of parallel"
    echo "  --reporter TYPE    Reporter: html, json, allure (default: html)"
    echo "  --env ENV          Environment: local, ci, staging (default: local)"
    echo "  --debug            Run in debug mode"
    echo "  --bdd              Run BDD tests with Cucumber"
    echo "  --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --type smoke --headed          # Run smoke tests with visible browser"
    echo "  $0 --bdd                          # Run BDD tests"
    echo "  $0 --type e2e --browser firefox   # Run E2E tests in Firefox"
    echo "  $0 --env ci                       # Run in CI environment"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            TEST_TYPE="$2"
            shift 2
            ;;
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        --headed)
            HEADLESS="false"
            shift
            ;;
        --sequential)
            PARALLEL="false"
            shift
            ;;
        --reporter)
            REPORTER="$2"
            shift 2
            ;;
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --debug)
            DEBUG="true"
            shift
            ;;
        --bdd)
            BDD="true"
            shift
            ;;
        --help)
            print_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            print_usage
            exit 1
            ;;
    esac
done

# Set environment variables based on options
export CI="${CI:-false}"
export HEADLESS="$HEADLESS"
export BROWSER_TYPE="$BROWSER"
export TEST_ENVIRONMENT="$ENVIRONMENT"

if [ "$ENVIRONMENT" = "ci" ]; then
    export CI="true"
    export HEADLESS="true"
fi

# Print test configuration
echo -e "${BLUE}🚀 Starting Resumate Testing Framework${NC}"
echo -e "${BLUE}Configuration:${NC}"
echo "  Test Type: $TEST_TYPE"
echo "  Browser: $BROWSER"
echo "  Headless: $HEADLESS"
echo "  Parallel: $PARALLEL"
echo "  Reporter: $REPORTER"
echo "  Environment: $ENVIRONMENT"
echo ""

# Function to run Playwright tests
run_playwright_tests() {
    local test_files=""

    case $TEST_TYPE in
        smoke)
            test_files="tests/smoke/"
            ;;
        e2e)
            test_files="tests/e2e/"
            ;;
        api)
            test_files="tests/api/"
            ;;
        integration)
            test_files="tests/integration/"
            ;;
        all)
            test_files="tests/"
            ;;
        *)
            echo -e "${RED}Unknown test type: $TEST_TYPE${NC}"
            exit 1
            ;;
    esac

    # Set Playwright options
    local playwright_cmd="npx playwright test"

    if [ "$HEADLESS" = "false" ]; then
        playwright_cmd="$playwright_cmd --headed"
    fi

    if [ "$PARALLEL" = "false" ]; then
        playwright_cmd="$playwright_cmd --workers=1"
    fi

    if [ "$DEBUG" = "true" ]; then
        playwright_cmd="$playwright_cmd --debug"
    fi

    # Add reporter
    case $REPORTER in
        html)
            playwright_cmd="$playwright_cmd --reporter=html"
            ;;
        json)
            playwright_cmd="$playwright_cmd --reporter=json"
            ;;
        allure)
            playwright_cmd="$playwright_cmd --reporter=allure-playwright"
            ;;
        *)
            playwright_cmd="$playwright_cmd --reporter=html"
            ;;
    esac

    # Add browser filter
    if [ "$BROWSER" != "all" ]; then
        playwright_cmd="$playwright_cmd --project=$BROWSER"
    fi

    # Add test files
    playwright_cmd="$playwright_cmd $test_files"

    echo -e "${YELLOW}Running command: $playwright_cmd${NC}"
    echo ""

    # Run the tests
    if eval "$playwright_cmd"; then
        echo -e "${GREEN}✅ Tests completed successfully!${NC}"
        return 0
    else
        echo -e "${RED}❌ Tests failed!${NC}"
        return 1
    fi
}

# Function to run BDD tests
run_bdd_tests() {
    echo -e "${YELLOW}Running BDD tests with Cucumber...${NC}"

    # Set environment variables for Cucumber
    export NODE_ENV="test"

    # Run Cucumber tests
    if npm run cucumber; then
        echo -e "${GREEN}✅ BDD tests completed successfully!${NC}"
        return 0
    else
        echo -e "${RED}❌ BDD tests failed!${NC}"
        return 1
    fi
}

# Function to generate test report
generate_report() {
    echo -e "${BLUE}📊 Generating test report...${NC}"

    # Create reports directory if it doesn't exist
    mkdir -p reports

    # Generate summary report
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    local report_file="reports/test-run-$timestamp.txt"

    {
        echo "Resumate Testing Framework - Test Run Report"
        echo "==========================================="
        echo ""
        echo "Timestamp: $timestamp"
        echo "Test Type: $TEST_TYPE"
        echo "Browser: $BROWSER"
        echo "Environment: $ENVIRONMENT"
        echo "Headless: $HEADLESS"
        echo "Parallel: $PARALLEL"
        echo "Reporter: $REPORTER"
        echo ""

        # Check if Playwright report exists
        if [ -f "playwright-report/index.html" ]; then
            echo "📈 Playwright Report: playwright-report/index.html"
        fi

        # Check for test results
        if [ -d "test-results" ]; then
            local total_tests=$(find test-results -name "*.json" | wc -l)
            echo "📊 Test Results: $total_tests test files generated"
        fi

        # Check for screenshots
        if [ -d "reports/screenshots" ]; then
            local screenshot_count=$(find reports/screenshots -name "*.png" | wc -l)
            echo "📸 Screenshots: $screenshot_count screenshots taken"
        fi

        # Check for videos
        if [ -d "reports/videos" ]; then
            local video_count=$(find reports/videos -name "*.webm" | wc -l)
            echo "🎬 Videos: $video_count videos recorded"
        fi

    } > "$report_file"

    echo -e "${GREEN}📋 Report saved to: $report_file${NC}"
}

# Function to cleanup after tests
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"

    # Clean up old screenshots/videos if not in CI
    if [ "$CI" != "true" ]; then
        # Keep only last 10 screenshot directories
        if [ -d "reports/screenshots" ]; then
            local screenshot_dirs=$(ls -t reports/screenshots/ 2>/dev/null | head -n 10 | wc -l)
            if [ "$screenshot_dirs" -gt 10 ]; then
                ls -t reports/screenshots/ | tail -n +11 | xargs -I {} rm -rf "reports/screenshots/{}"
                echo "🗑️ Cleaned up old screenshots"
            fi
        fi

        # Keep only last 5 video directories
        if [ -d "reports/videos" ]; then
            local video_dirs=$(ls -t reports/videos/ 2>/dev/null | head -n 5 | wc -l)
            if [ "$video_dirs" -gt 5 ]; then
                ls -t reports/videos/ | tail -n +6 | xargs -I {} rm -rf "reports/videos/{}"
                echo "🗑️ Cleaned up old videos"
            fi
        fi
    fi

    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Main execution
main() {
    local start_time=$(date +%s)
    local test_success=true

    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "src" ]; then
        echo -e "${RED}❌ Error: Please run this script from the testing directory${NC}"
        exit 1
    fi

    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
    fi

    # Install Playwright browsers
    echo -e "${YELLOW}🎭 Installing Playwright browsers...${NC}"
    npx playwright install

    # Run tests
    if [ "$BDD" = "true" ]; then
        if ! run_bdd_tests; then
            test_success=false
        fi
    else
        if ! run_playwright_tests; then
            test_success=false
        fi
    fi

    # Generate report
    generate_report

    # Cleanup
    cleanup

    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))

    echo ""
    echo -e "${BLUE}🏁 Test run completed in ${minutes}m ${seconds}s${NC}"

    if [ "$test_success" = true ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Check reports for details.${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
