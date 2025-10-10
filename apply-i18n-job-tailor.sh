#!/bin/bash

FILE="frontend/src/app/dashboard/job-tailor/page.tsx"

echo "🌐 Applying i18n to Job Tailor Page..."

# Header
sed -i '' 's/"Job Tailor"/{t("jobTailor.title")}/g' "$FILE"
sed -i '' 's/"Optimize your CV for specific job descriptions using AI"/{t("jobTailor.description")}/g' "$FILE"

# Buttons
sed -i '' 's/"Analyze Compatibility"/{t("jobTailor.analyzeCompatibility")}/g' "$FILE"
sed -i '' 's/"Get detailed score \& gap analysis"/{t("jobTailor.scoreAnalysis")}/g' "$FILE"
sed -i '' 's/"Generate Cover Letter"/{t("jobTailor.generateCoverLetter")}/g' "$FILE"
sed -i '' 's/"AI writes personalized letter"/{t("jobTailor.personalizedLetter")}/g' "$FILE"
sed -i '' 's/"Tailor CV with AI"/{t("jobTailor.tailorCV")}/g' "$FILE"
sed -i '' 's/"Create optimized version for this job"/{t("jobTailor.optimizedVersion")}/g' "$FILE"

# Progress
sed -i '' 's/"Analyzing..."/{t("jobTailor.analyzing")}/g' "$FILE"
sed -i '' 's/"Generating..."/{t("jobTailor.generating")}/g' "$FILE"
sed -i '' 's/"AI is tailoring your CV..."/{t("jobTailor.tailoring")}/g' "$FILE"
sed -i '' 's/"Our AI is processing your request..."/{t("jobTailor.processingRequest")}/g' "$FILE"
sed -i '' 's/"Reading job requirements"/{t("jobTailor.readingRequirements")}/g' "$FILE"
sed -i '' 's/"Analyzing your CV"/{t("jobTailor.analyzingCV")}/g' "$FILE"
sed -i '' 's/"Generating results"/{t("jobTailor.generatingResults")}/g' "$FILE"
sed -i '' 's/"This typically takes 30-60 seconds"/{t("jobTailor.timeEstimate")}/g' "$FILE"
sed -i '' 's/"⏱️ This typically takes 30-60 seconds"/{t("jobTailor.timeEstimate")}/g' "$FILE"

# Modal titles
sed -i '' 's/"CV-Job Compatibility Analysis"/{t("jobTailor.compatibilityAnalysis")}/g' "$FILE"
sed -i '' 's/"Compatibility Score"/{t("jobTailor.compatibilityScore")}/g' "$FILE"
sed -i '' 's/"Generated Cover Letter"/{t("jobTailor.coverLetter")}/g' "$FILE"

# Common buttons
sed -i '' 's/"Close"/{t("common.close")}/g' "$FILE"
sed -i '' 's/"Copy to Clipboard"/{t("jobTailor.copyToClipboard")}/g' "$FILE"

echo "✅ Done! Check: $FILE"
