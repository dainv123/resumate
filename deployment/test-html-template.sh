#!/bin/bash

# ============================================================================
# HTML Template Test Script
# ============================================================================
# Tests the new HTML-based two-column PDF template
#
# Usage: ./deployment/test-html-template.sh
# ============================================================================

echo "🧪 Testing HTML Template Export"
echo "================================"

BACKEND_URL="http://localhost:5001"

# 1. Register a test user
echo "1. Creating test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "template-test@example.com",
    "password": "password",
    "name": "Template Test User"
  }')

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ User registration failed"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

echo "✅ User registered successfully"

# 2. Create sample CV data
echo "2. Creating sample CV data..."
CV_DATA='{
  "name": "Nguyen Van Test",
  "email": "test@example.com", 
  "phone": "+84 123 456 789",
  "address": "Ho Chi Minh City, Vietnam",
  "summary": "Experienced software developer with 5+ years in full-stack development. Passionate about creating innovative solutions and leading technical teams.",
  "experience": [
    {
      "title": "Senior Full Stack Developer",
      "company": "Tech Company ABC",
      "duration": "2022 - Present",
      "responsibilities": [
        "Lead development of web applications using React and Node.js",
        "Mentor junior developers and conduct code reviews",
        "Implement CI/CD pipelines and DevOps practices"
      ],
      "achievements": [
        "Improved application performance by 40%",
        "Reduced deployment time from 2 hours to 15 minutes"
      ],
      "technologies": ["React", "Node.js", "TypeScript", "AWS", "Docker"]
    },
    {
      "title": "Full Stack Developer", 
      "company": "Startup XYZ",
      "duration": "2020 - 2022",
      "responsibilities": [
        "Developed responsive web applications",
        "Collaborated with design team on UI/UX implementation"
      ],
      "technologies": ["Vue.js", "Python", "PostgreSQL"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Computer Science",
      "school": "University of Technology",
      "year": "2020",
      "gpa": "3.8/4.0"
    }
  ],
  "skills": {
    "technical": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "Git"],
    "soft": ["Leadership", "Problem Solving", "Communication", "Teamwork"],
    "languages": ["English (Fluent)", "Vietnamese (Native)"]
  },
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Built a full-stack e-commerce platform with payment integration",
      "techStack": ["React", "Node.js", "MongoDB", "Stripe"],
      "link": "https://github.com/test/ecommerce"
    }
  ]
}'

# 3. Upload CV (simulate)
echo "3. Simulating CV upload..."
# For now, we'll create a test endpoint or use existing data

# 4. Test HTML template export
echo "4. Testing HTML template export..."
curl -s -X GET "$BACKEND_URL/cv/test-id/export/pdf?template=two-column" \
  -H "Authorization: Bearer $TOKEN" \
  -o html_template_test.pdf

FILE_SIZE=$(stat -f%z html_template_test.pdf 2>/dev/null || echo "0")

if [ "$FILE_SIZE" -gt 1000 ]; then
  echo "✅ HTML template PDF generated successfully"
  echo "📄 File size: $FILE_SIZE bytes"
  echo "📁 Saved as: html_template_test.pdf"
else
  echo "❌ HTML template PDF generation failed"
  echo "📄 File size: $FILE_SIZE bytes"
  echo "📄 Content:"
  cat html_template_test.pdf
fi

# Cleanup
rm -f html_template_test.pdf

echo ""
echo "🎉 HTML template test completed!"

