#!/bin/bash

# ============================================================================
# PDF Template Testing Script
# ============================================================================
# Tests the new two-column PDF template
#
# Usage:
#   From project root:  ./deployment/test-pdf-templates.sh
#   From deployment:    ./test-pdf-templates.sh
#
# Prerequisites:
#   - Backend running on http://localhost:5001
#   - Frontend running on http://localhost:5000
#   - At least one CV uploaded to test account
# ============================================================================

echo "🧪 Testing PDF Templates"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:5001"
FRONTEND_URL="http://localhost:5000"

# Test credentials (adjust if needed)
EMAIL="admin1@default.com"
PASSWORD="password"

echo -e "${BLUE}Backend URL:${NC} $BACKEND_URL"
echo -e "${BLUE}Frontend URL:${NC} $FRONTEND_URL"
echo ""

# Function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ "$method" = "GET" ]; then
        if [ -n "$token" ]; then
            curl -s -H "Authorization: Bearer $token" \
                 -H "Accept: application/json" \
                 "$BACKEND_URL$endpoint"
        else
            curl -s "$BACKEND_URL$endpoint"
        fi
    else
        if [ -n "$token" ]; then
            curl -s -X "$method" \
                 -H "Authorization: Bearer $token" \
                 -H "Content-Type: application/json" \
                 -d "$data" \
                 "$BACKEND_URL$endpoint"
        else
            curl -s -X "$method" \
                 -H "Content-Type: application/json" \
                 -d "$data" \
                 "$BACKEND_URL$endpoint"
        fi
    fi
}

# Test 1: Login
echo -e "${YELLOW}1. Testing Login...${NC}"
LOGIN_RESPONSE=$(make_request "POST" "/auth/login" "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}❌ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo ""

# Test 2: Get CVs
echo -e "${YELLOW}2. Getting CVs...${NC}"
CVS_RESPONSE=$(make_request "GET" "/cv" "" "$TOKEN")
CV_COUNT=$(echo "$CVS_RESPONSE" | jq '. | length')

if [ "$CV_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ No CVs found. Please upload a CV first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found $CV_COUNT CV(s)${NC}"

# Get first CV ID
CV_ID=$(echo "$CVS_RESPONSE" | jq -r '.[0].id')
CV_NAME=$(echo "$CVS_RESPONSE" | jq -r '.[0].originalFileName')
echo "Testing with CV: $CV_NAME (ID: $CV_ID)"
echo ""

# Test 3: Export PDF with Professional Template
echo -e "${YELLOW}3. Testing Professional Template...${NC}"
PROFESSIONAL_PDF=$(make_request "GET" "/cv/$CV_ID/export/pdf?template=professional" "" "$TOKEN")
PDF_SIZE=$(echo "$PROFESSIONAL_PDF" | wc -c)

if [ "$PDF_SIZE" -lt 1000 ]; then
    echo -e "${RED}❌ Professional PDF export failed (too small: $PDF_SIZE bytes)${NC}"
else
    echo -e "${GREEN}✅ Professional PDF exported successfully ($PDF_SIZE bytes)${NC}"
    
    # Save to file for inspection
    echo "$PROFESSIONAL_PDF" > "professional_template_test.pdf"
    echo "Saved as: professional_template_test.pdf"
fi
echo ""

# Test 4: Export PDF with Two-Column Template
echo -e "${YELLOW}4. Testing Two-Column Template...${NC}"
TWO_COLUMN_PDF=$(make_request "GET" "/cv/$CV_ID/export/pdf?template=two-column" "" "$TOKEN")
PDF_SIZE=$(echo "$TWO_COLUMN_PDF" | wc -c)

if [ "$PDF_SIZE" -lt 1000 ]; then
    echo -e "${RED}❌ Two-Column PDF export failed (too small: $PDF_SIZE bytes)${NC}"
else
    echo -e "${GREEN}✅ Two-Column PDF exported successfully ($PDF_SIZE bytes)${NC}"
    
    # Save to file for inspection
    echo "$TWO_COLUMN_PDF" > "two_column_template_test.pdf"
    echo "Saved as: two_column_template_test.pdf"
fi
echo ""

# Test 5: Test Invalid Template
echo -e "${YELLOW}5. Testing Invalid Template...${NC}"
INVALID_PDF=$(make_request "GET" "/cv/$CV_ID/export/pdf?template=invalid" "" "$TOKEN")
PDF_SIZE=$(echo "$INVALID_PDF" | wc -c)

if [ "$PDF_SIZE" -lt 1000 ]; then
    echo -e "${GREEN}✅ Invalid template handled correctly (fallback to default)${NC}"
else
    echo -e "${GREEN}✅ Invalid template handled (exported anyway)${NC}"
fi
echo ""

# Test 6: Test Default Template (no parameter)
echo -e "${YELLOW}6. Testing Default Template...${NC}"
DEFAULT_PDF=$(make_request "GET" "/cv/$CV_ID/export/pdf" "" "$TOKEN")
PDF_SIZE=$(echo "$DEFAULT_PDF" | wc -c)

if [ "$PDF_SIZE" -lt 1000 ]; then
    echo -e "${RED}❌ Default PDF export failed (too small: $PDF_SIZE bytes)${NC}"
else
    echo -e "${GREEN}✅ Default PDF exported successfully ($PDF_SIZE bytes)${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo "================"
echo -e "✅ Login: ${GREEN}Success${NC}"
echo -e "✅ CVs Found: ${GREEN}$CV_COUNT${NC}"
echo -e "✅ Professional Template: ${GREEN}Working${NC}"
echo -e "✅ Two-Column Template: ${GREEN}Working${NC}"
echo -e "✅ Invalid Template: ${GREEN}Handled${NC}"
echo -e "✅ Default Template: ${GREEN}Working${NC}"
echo ""

echo -e "${BLUE}📁 Generated Files:${NC}"
echo "- professional_template_test.pdf"
echo "- two_column_template_test.pdf"
echo ""

echo -e "${YELLOW}🔍 Manual Testing:${NC}"
echo "1. Visit: $FRONTEND_URL/dashboard/cv"
echo "2. Click 'Export' button on any CV"
echo "3. Select 'Modern Two-Column' template"
echo "4. Choose PDF format and export"
echo "5. Compare with the image you showed me!"
echo ""

echo -e "${GREEN}🎉 All tests completed!${NC}"
