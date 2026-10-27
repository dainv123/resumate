# 📋 COMPLETE FILE CONVERSION LIST

Total Files: 45 | Total Hardcodes: 207 strings | Estimated Time: 6-8 hours

---

## 🔴 CRITICAL - Phase 1 (7 Files, 60+ strings) - **2-3 hours**

### 1. `/app/layout.tsx` ⚠️ HIGHEST PRIORITY
**Hardcodes:** 33 strings
**Type:** SEO Metadata, Keywords, Schema.org
**Components:**
- Metadata keywords (CV builder, Resume builder, Portfolio builder, etc.)
- OG tags description
- Schema.org featureList
- Keywords array

**Action:**
- [ ] Extract all keywords to `seo.keywords.*`
- [ ] Extract schema features to `seo.schema.*`
- [ ] Keep brand names (Resumate, Resumate Team) as is
- [ ] Create helper function for language-aware metadata

---

### 2. `/components/portfolio/SectionCustomizer.tsx` ⚠️ HIGH PRIORITY
**Hardcodes:** 18 strings
**Type:** UI Labels + Descriptions (9 sections × 2)
**Component:** Section customization interface

**Action:**
- [ ] Replace `sectionInfo` object to use `t()` calls
- [ ] Create translations:
  - `portfolio.sectionCustomizer.sections.{hero,about,skills,experience,education,projects,certifications,awards,contact}.label`
  - `portfolio.sectionCustomizer.sections.{hero,about,skills,experience,education,projects,certifications,awards,contact}.description`
- [ ] Add "Fixed Template" label translation
- [ ] Add "Customize Sections" title translation

**Example Fix:**
```typescript
const getSectionInfo = () => {
  return {
    hero: {
      label: t("portfolio.sectionCustomizer.sections.hero.label"),
      description: t("portfolio.sectionCustomizer.sections.hero.description"),
      icon: "🎯"
    },
    // ... rest
  }
}
```

---

### 3. `/components/seo/StructuredData.tsx` 
**Hardcodes:** 15 strings
**Type:** Schema.org Structured Data (Mixed VI/EN)
**Issue:** Vietnamese text hardcoded in schema

**Action:**
- [ ] Extract descriptions to use language context
- [ ] Create language-aware schema generation
- [ ] Add translations for:
  - "AI tạo CV chuyên nghiệp từ Job Description..."
  - Feature descriptions
  - Keywords array

---

### 4. `/components/template-gallery/TemplateGallery.tsx`
**Hardcodes:** 16 strings
**Type:** Template Feature Descriptions
**Components:** Professional, Creative, Technical template features

**Action:**
- [ ] Create `templateGallery.templates.*` translations
- [ ] Extract features array:
  - "Clean & Modern", "ATS-friendly", "Corporate style"
  - "Colorful design", "Visual elements", etc.
- [ ] Update component to use t() for features display

---

### 5. `/components/cv/TemplateSelectionModal.tsx`
**Hardcodes:** 11 strings
**Type:** Template Descriptions + Format Names

**Action:**
- [ ] Extract template descriptions
- [ ] Extract format names: "Portable Document", "Microsoft Word", "ATS-Friendly Text"
- [ ] Create `cv.templates.formats.*` keys

---

### 6. `/components/cv/TemplateConfigModal.tsx`
**Hardcodes:** 10 strings
**Type:** Font Names + UI Labels

**Action:**
- [ ] Keep font names in English (standard practice)
- [ ] Extract UI labels to `cv.templateConfig.*`
- [ ] "Select layout", "Select font", "Select font size"

---

### 7. `/contexts/LanguageContext.tsx`
**Hardcodes:** 12 strings
**Type:** Console Messages + System Strings

**Action:**
- [ ] Language names: "English", "Vietnamese" (or keep as is)
- [ ] Console error messages (optional - can be left as debug)
- [ ] Consider: System messages can remain in English

---

## 🟠 HIGH - Phase 2 (6 Files, 50+ strings) - **1-2 hours**

### 8. `/components/portfolio/TemplateSelector.tsx`
**Hardcodes:** 8 strings (section names)
- "Hero", "About", "Skills", "Experience", "Education", "Projects", "Certifications", "Awards", "Contact"

**Action:**
```typescript
const sectionNames = {
  hero: t("portfolio.templateSelector.sectionNames.hero"),
  about: t("portfolio.templateSelector.sectionNames.about"),
  // ... rest
}
```

---

### 9. `/app/dashboard/cv/[id]/page.tsx`
**Hardcodes:** 6 strings
- "Export failed:", "No job description available", "No analysis available"

**Action:**
- [ ] Import useLanguage
- [ ] Replace error messages with t() calls

---

### 10. `/components/cv/CvManager.tsx`
**Hardcodes:** 6 strings
- Error messages: "Delete CV failed:", "Duplicate CV failed:", "Export failed:"

**Action:**
- [ ] Replace with error translation keys

---

### 11. `/components/cv/MatchingAnalysisModal.tsx`
**Hardcodes:** 6 strings
- Score labels: "Excellent Match", "Good Match", "Needs Improvement"

**Action:**
- [ ] Create `cv.matching.scoreLabels.*` translations

---

### 12. `/components/ai-cv-wizard/AiCvWizard.tsx`
**Hardcodes:** 5 strings
- Error messages: "CV generation timeout", "Unknown error"

**Action:**
- [ ] Replace with error translations

---

### 13. `/components/cv/CVDisplay.tsx`
**Hardcodes:** 5 strings
- Status labels: "Tailored", "Original", "Present", "History"

**Action:**
- [ ] Create `cv.statusLabels.*` translations

---

## 🟡 MEDIUM - Phase 3 (15 Files, 70+ strings) - **2-3 hours**

### 14. `/components/cv/CVCard.tsx`
**Hardcodes:** 4
- "Tailored", "Original", "Original CV"

### 15. `/components/cv/VersionHistoryModal.tsx`
**Hardcodes:** 4
- "CV Version History", "Restore"

### 16. `/components/projects/ProjectForm.tsx`
**Hardcodes:** 4
- Validation: "Project name is required", "Role is required"

### 17. `/app/dashboard/cv/page.tsx`
**Hardcodes:** 3
- Error messages

### 18. `/app/dashboard/settings/page.tsx`
**Hardcodes:** 3
- Settings labels

### 19. `/components/cv/CoverLetterModal.tsx`
**Hardcodes:** 3
- Error: "Failed to copy:"

### 20-34. Other Medium Files (9 more files)
- Various UI labels and error messages
- See detailed report for specifics

---

## 🟢 LOW - Phase 4 (2 Files, 27+ strings) - **Optional, 1 hour**

### Files with 1-2 hardcodes each
- Low impact
- Can be done last or skipped

---

## 📝 TRANSLATION KEYS TO ADD

### In `locales/en.json`:

```json
{
  "portfolio": {
    "sectionCustomizer": {
      "title": "Customize Sections",
      "fixedTemplate": "Fixed Template",
      "sections": {
        "hero": { "label": "Hero Section", "description": "Main header with name and bio" },
        "about": { "label": "About Me", "description": "Professional summary/bio" },
        "skills": { "label": "Skills", "description": "Technical and soft skills" },
        "experience": { "label": "Work Experience", "description": "Employment history" },
        "education": { "label": "Education", "description": "Academic background" },
        "projects": { "label": "Projects", "description": "Portfolio projects showcase" },
        "certifications": { "label": "Certifications", "description": "Professional certifications" },
        "awards": { "label": "Awards", "description": "Recognition and achievements" },
        "contact": { "label": "Contact Links", "description": "Social media and contact info" }
      }
    },
    "templateSelector": {
      "sectionNames": {
        "hero": "Hero",
        "about": "About",
        "skills": "Skills",
        "experience": "Experience",
        "education": "Education",
        "projects": "Projects",
        "certifications": "Certifications",
        "awards": "Awards",
        "contact": "Contact"
      }
    }
  },
  "cv": {
    "statusLabels": {
      "tailored": "Tailored",
      "original": "Original",
      "present": "Present",
      "history": "History"
    },
    "errors": {
      "exportFailed": "Export failed:",
      "noJobDescription": "No job description available",
      "noJobTitle": "No job title",
      "noCompany": "No company",
      "noAnalysis": "No analysis available",
      "deleteFailed": "Delete CV failed:",
      "duplicateFailed": "Duplicate CV failed:",
      "failedCopy": "Failed to copy:",
      "cvGenerationTimeout": "CV generation timeout",
      "unknownError": "Unknown error"
    },
    "matching": {
      "scoreLabels": {
        "excellent": "Excellent Match",
        "good": "Good Match",
        "needsImprovement": "Needs Improvement"
      }
    }
  },
  "seo": {
    "keywords": {
      "cvBuilder": "CV builder",
      "resumeBuilder": "Resume builder",
      "portfolioBuilder": "Portfolio builder",
      "freelancerTools": "Freelancer tools",
      "aiCvGenerator": "AI CV generator",
      "cvMakerOnline": "CV maker online",
      "professionalResume": "Professional resume",
      "jobApplication": "Job application",
      "careerTools": "Career tools",
      "cvOptimization": "CV optimization",
      "resumeTemplates": "Resume templates",
      "portfolioWebsite": "Portfolio website",
      "cvOnline": "CV online",
      "aiCv": "AI CV",
      "portfolioOnline": "Portfolio online"
    },
    "schema": {
      "features": [
        "AI-powered CV generation",
        "Automatic CV optimization",
        "Portfolio management",
        "Job description integration"
      ]
    }
  }
}
```

### In `locales/vi.json`:

Same structure with Vietnamese translations

---

## ✅ CONVERSION CHECKLIST

### Pre-Conversion:
- [ ] Review all files to convert
- [ ] Create backup of locale files
- [ ] Document current translation count

### Phase 1: Add Translations (2 hours)
- [ ] Add all keys to `locales/en.json`
- [ ] Add all keys to `locales/vi.json`
- [ ] Verify JSON syntax
- [ ] Test app builds

### Phase 2: Convert Components (4-5 hours)
For EACH file in priority order:
- [ ] Import `useLanguage` hook
- [ ] Identify all hardcoded strings
- [ ] Replace with `t()` calls
- [ ] Test component renders
- [ ] Verify no console errors
- [ ] Test with Vietnamese language

### Phase 3: Final Verification (1-2 hours)
- [ ] Run verification scripts
- [ ] Count remaining hardcodes (target: 0)
- [ ] Full app test with Vietnamese
- [ ] Performance check
- [ ] Commit changes

---

## 🔄 CONVERSION WORKFLOW

**For each file:**

1. Import hook:
```typescript
import { useLanguage } from "@/contexts/LanguageContext";
```

2. Inside component:
```typescript
const { t } = useLanguage();
```

3. Replace strings:
```typescript
// Before
const label = "Export failed";

// After
const label = t("cv.errors.exportFailed");
```

4. Test:
```bash
# Browser console
localStorage.setItem('language', 'vi')
location.reload()
# Verify Vietnamese text appears
```

---

## 📊 METRICS TO TRACK

- [ ] Files converted: __/45
- [ ] Strings converted: __/207
- [ ] Translation keys added: __/207
- [ ] Remaining hardcodes: __/207 (target: 0)
- [ ] Test passes: __/45

---

## 🎯 SUCCESS CRITERIA

✅ All hardcoded strings replaced with `t()` calls
✅ 207 translation keys added to locales
✅ Vietnamese translations complete
✅ 0 remaining hardcoded strings
✅ No console errors
✅ App works fully in Vietnamese
✅ Performance not degraded

---

**Start with file #1 (layout.tsx) and work down the list!**

