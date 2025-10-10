#!/bin/bash

# ============================================================================
# Job Tailor Features Integration Test
# ============================================================================
# Tests the new CV-JD compatibility analysis and cover letter generation
# 
# Usage:
#   From project root:  ./deployment/test-job-tailor-features.sh
#   From deployment:    ./test-job-tailor-features.sh
#
# Prerequisites:
#   - Backend running on http://localhost:5001
#   - Frontend running on http://localhost:5000
#   - At least one CV uploaded to test account
# ============================================================================

echo "🧪 Testing Job Tailor Features"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:5001"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NzU2NzJlMy0wOTJkLTQ1NzItOTI2NS03M2JlY2RhZmZjNWYiLCJlbWFpbCI6ImFkbWluMUBkZWZhdWx0LmNvbSIsInBsYW4iOiJmcmVlIiwiaWF0IjoxNzYwMDg0OTM4LCJleHAiOjE3NjA2ODk3Mzh9.rTV2j9ylqj9TORovjsizXsm5gRCy8W4YiiiZ3nov8_I"

# Test data
JOB_DESCRIPTION="We are looking for a Senior React Developer with 5+ years of experience. Required skills: React, TypeScript, Node.js, AWS, Docker. Must have team leadership experience."

echo "📋 Step 1: Get user's CVs"
echo "-------------------------"
CV_RESPONSE=$(curl -s -X GET "$BASE_URL/cv" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

CV_ID=$(echo $CV_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CV_ID" ]; then
  echo -e "${RED}❌ No CVs found. Please upload a CV first.${NC}"
  echo ""
  echo "To upload a CV:"
  echo "  1. Visit http://localhost:5000/dashboard/cv"
  echo "  2. Click 'Upload CV'"
  echo "  3. Upload a PDF or DOCX file"
  exit 1
fi

echo -e "${GREEN}✅ Found CV: $CV_ID${NC}"
echo ""

echo "📊 Step 2: Test Compatibility Analysis"
echo "---------------------------------------"
ANALYSIS_RESPONSE=$(curl -s -X POST "$BASE_URL/cv/$CV_ID/analyze-compatibility" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"jobDescription\": \"$JOB_DESCRIPTION\"}")

if echo "$ANALYSIS_RESPONSE" | grep -q "score"; then
  SCORE=$(echo $ANALYSIS_RESPONSE | grep -o '"score":[0-9.]*' | cut -d':' -f2)
  echo -e "${GREEN}✅ Compatibility Analysis Success${NC}"
  echo "   Score: $SCORE/10"
  echo ""
  
  # Show matched skills
  MATCHED_SKILLS=$(echo $ANALYSIS_RESPONSE | grep -o '"matchedSkills":\[[^]]*\]')
  if [ ! -z "$MATCHED_SKILLS" ]; then
    echo "   Matched Skills found ✓"
  fi
  
  # Show missing skills  
  MISSING_SKILLS=$(echo $ANALYSIS_RESPONSE | grep -o '"missingSkills":\[[^]]*\]')
  if [ ! -z "$MISSING_SKILLS" ]; then
    echo "   Missing Skills detected ✓"
  fi
else
  echo -e "${RED}❌ Compatibility Analysis Failed${NC}"
  echo "Response: $ANALYSIS_RESPONSE"
fi
echo ""

echo "✉️  Step 3: Test Cover Letter Generation"
echo "----------------------------------------"
COVER_LETTER_RESPONSE=$(curl -s -X POST "$BASE_URL/cv/$CV_ID/generate-cover-letter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"jobDescription\": \"$JOB_DESCRIPTION\"}")

if echo "$COVER_LETTER_RESPONSE" | grep -q "coverLetter"; then
  echo -e "${GREEN}✅ Cover Letter Generation Success${NC}"
  
  # Check for key components
  if echo "$COVER_LETTER_RESPONSE" | grep -q "Dear"; then
    echo "   Has salutation ✓"
  fi
  if echo "$COVER_LETTER_RESPONSE" | grep -q "Sincerely"; then
    echo "   Has closing ✓"
  fi
  
  LETTER_LENGTH=$(echo $COVER_LETTER_RESPONSE | grep -o '"coverLetter":"[^"]*"' | wc -c)
  echo "   Length: ~$LETTER_LENGTH characters ✓"
else
  echo -e "${RED}❌ Cover Letter Generation Failed${NC}"
  echo "Response: $COVER_LETTER_RESPONSE"
fi
echo ""

echo "================================"
echo "🎉 Feature Test Complete!"
echo ""
echo "Frontend URL: http://localhost:5000/dashboard/job-tailor"
echo ""
echo "Next steps:"
echo "  1. Open browser to frontend URL"
echo "  2. Select a CV"
echo "  3. Paste job description"
echo "  4. Try all 3 AI tools"
echo ""

