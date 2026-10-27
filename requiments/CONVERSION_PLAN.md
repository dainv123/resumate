# 🔧 COMPLETE HARDCODE CONVERSION PLAN

**Scan Date:** 2024
**Total Files Scanned:** 104
**Files with Hardcodes:** 45
**Total Hardcoded Strings:** 207 strings
**Status:** Ready for Conversion

---

## 📊 SUMMARY BY SEVERITY

| Priority | Files | Strings | Status |
|----------|-------|---------|--------|
| 🔴 CRITICAL | 7 | 60+ | Must Fix |
| 🟠 HIGH | 6 | 50+ | Must Fix |
| 🟡 MEDIUM | 15 | 70+ | Should Fix |
| 🟢 LOW | 2 | 27+ | Nice to Have |

**Total:** 45 files | 207 strings | **6-8 hours effort**

---

## 🔴 CRITICAL PRIORITY (7 Files - 60+ Strings)

### 1. `/app/layout.tsx` (33 hardcodes)
**Issue:** Metadata/SEO keywords all hardcoded
**Type:** SEO metadata, schema.org structured data
**Action:** Extract to i18n (SEO-specific keys)

Hardcoded strings:
- CV builder, Resume builder, Portfolio builder, etc. (keywords)
- Resumate Team, Resumate (brand - may keep as is)
- Feature descriptions in JSON-LD schema

**Fix Strategy:**
```json
// Add to locales/en.json
{
  "seo": {
    "keywords": {
      "cvBuilder": "CV builder",
      "resumeBuilder": "Resume builder",
      "portfolioBuilder": "Portfolio builder"
      // ... more
    },
    "schema": {
      "features": [
        "AI-powered CV generation",
        "Automatic CV optimization"
        // ... more
      ]
    }
  }
}
```

### 2. `/components/portfolio/SectionCustomizer.tsx` (18 hardcodes)
**Issue:** Section info object completely hardcoded
**Type:** UI labels and descriptions
**Action:** Use i18n for all labels

Hardcoded:
- "Hero Section", "Main header with name and bio"
- "About Me", "Professional summary/bio"
- "Work Experience", "Employment history"
- ... etc (9 sections × 2 = 18)

**Fix Strategy:**
```typescript
// Before:
const sectionInfo = {
  hero: { label: "Hero Section", description: "Main header with name and bio" }
}

// After:
const { t } = useLanguage();
const sectionInfo = {
  hero: { label: t("portfolio.sections.hero.label"), description: t("portfolio.sections.hero.description") }
}
```

### 3. `/components/seo/StructuredData.tsx` (15 hardcodes)
**Issue:** Vietnamese text + English mixed in schema
**Type:** Schema.org structured data
**Action:** Extract to i18n or create language-aware version

Hardcoded Vietnamese:
- "AI tạo CV chuyên nghiệp từ Job Description chỉ trong 30 giây..."
- "tạo CV nhanh, AI CV, CV 30 giây..."

### 4. `/components/template-gallery/TemplateGallery.tsx` (16 hardcodes)
**Issue:** Template features not translated
**Type:** UI feature descriptions
**Action:** Migrate to i18n

Features:
- "Clean & Modern", "ATS-friendly", "Corporate style"
- "Colorful design", "Visual elements"
- ... etc

### 5. `/components/cv/TemplateSelectionModal.tsx` (11 hardcodes)
**Issue:** Template descriptions hardcoded
**Action:** Translate all template descriptions

### 6. `/components/cv/TemplateConfigModal.tsx` (10 hardcodes)
**Issue:** Font names and UI labels hardcoded
**Action:** Translate labels, keep font names as is

### 7. `/contexts/LanguageContext.tsx` (12 hardcodes)
**Issue:** Console messages and language names
**Action:** Extract to i18n or keep as system messages

---

## 🟠 HIGH PRIORITY (6 Files - 50+ Strings)

### 8. `/components/portfolio/TemplateSelector.tsx` (8 hardcodes)
- Section names in mapping
- Fix: Replace with i18n lookup

### 9. `/app/dashboard/cv/[id]/page.tsx` (6 hardcodes)
- Error messages: "Export failed:", "No job description available"
- Fix: Use t() function

### 10. `/components/cv/CvManager.tsx` (6 hardcodes)
- Debug messages, error messages
- Fix: Replace with t()

### 11. `/components/cv/MatchingAnalysisModal.tsx` (6 hardcodes)
- Placeholder names, score labels
- Fix: Use i18n

### 12. `/components/ai-cv-wizard/AiCvWizard.tsx` (5 hardcodes)
- Error messages
- Fix: Replace with t()

### 13. `/components/cv/CVDisplay.tsx` (5 hardcodes)
- Status labels: "Tailored", "Present"
- Fix: Use t()

---

## 🟡 MEDIUM PRIORITY (15 Files - 70+ Strings)

### 14. `/components/cv/CVCard.tsx` (4 hardcodes)
### 15. `/components/cv/VersionHistoryModal.tsx` (4 hardcodes)
### 16. `/components/projects/ProjectForm.tsx` (4 hardcodes)
### 17. `/app/dashboard/cv/page.tsx` (3 hardcodes)
### 18. `/app/dashboard/settings/page.tsx` (3 hardcodes)
### 19. `/components/cv/CoverLetterModal.tsx` (3 hardcodes)

... and 9 more files

---

## 🟢 LOW PRIORITY (2 Files - 27+ Strings)

### Files with 1-2 hardcodes each
- Minor impact, can be done later

---

## 🛠️ CONVERSION WORKFLOW

### Phase 1: Add Translations (2 hours)

**1. Add to `locales/en.json`:**
```json
{
  "portfolio": {
    "sectionCustomizer": {
      "title": "Customize Sections",
      "fixedTemplate": "Fixed Template",
      "sections": {
        "hero": { "label": "Hero Section", "description": "Main header with name and bio" },
        "about": { "label": "About Me", "description": "Professional summary/bio" },
        // ... all sections
      }
    },
    "templateSelector": {
      "sectionNames": {
        "hero": "Hero",
        "about": "About",
        // ... all names
      }
    }
  },
  "cv": {
    "statusLabels": {
      "tailored": "Tailored",
      "original": "Original",
      "present": "Present"
    },
    "errors": {
      "exportFailed": "Export failed:",
      "noJobDescription": "No job description available"
    }
  }
}
```

**2. Add to `locales/vi.json`:**
Same structure with Vietnamese translations

### Phase 2: Fix Components (4-5 hours)

**Pattern 1: Simple String Replace**
```typescript
// Before
const title = "Export failed";

// After
const { t } = useLanguage();
const title = t("cv.errors.exportFailed");
```

**Pattern 2: Section Info Object**
```typescript
// Before
const sectionInfo = {
  hero: { label: "Hero Section", description: "Main..." }
}

// After
const { t } = useLanguage();
const getSectionInfo = () => ({
  hero: { label: t("portfolio.sectionCustomizer.sections.hero.label"), ... }
})
```

**Pattern 3: Array Mapping**
```typescript
// Before
const names = { hero: "Hero", about: "About" }

// After
const { t } = useLanguage();
const names = {
  hero: t("portfolio.templateSelector.sectionNames.hero"),
  about: t("portfolio.templateSelector.sectionNames.about")
}
```

### Phase 3: Verify & Test (1-2 hours)

1. Run verification script
2. Test with Vietnamese language
3. Check no console errors
4. Verify all t() calls work

---

## 📋 FILES TO CONVERT (Priority Order)

### Do First (Next 2-3 hours):
- [ ] `/components/portfolio/SectionCustomizer.tsx`
- [ ] `/components/seo/StructuredData.tsx`
- [ ] `/components/portfolio/TemplateSelector.tsx`
- [ ] `/components/cv/TemplateSelectionModal.tsx`
- [ ] Add translations to `locales/en.json` & `locales/vi.json`

### Do Next (2-3 hours):
- [ ] `/components/cv/CVDisplay.tsx`
- [ ] `/components/cv/CVCard.tsx`
- [ ] `/components/cv/VersionHistoryModal.tsx`
- [ ] `/components/cv/MatchingAnalysisModal.tsx`
- [ ] `/app/dashboard/cv/[id]/page.tsx`

### Do After (2 hours):
- [ ] `/components/projects/ProjectForm.tsx`
- [ ] `/components/ai-cv-wizard/AiCvWizard.tsx`
- [ ] `/app/dashboard/cv/page.tsx`
- [ ] `/app/dashboard/settings/page.tsx`
- [ ] Rest of files...

---

## ✅ VERIFICATION CHECKLIST

- [ ] All files import `useLanguage` hook
- [ ] All hardcoded strings replaced with `t()` calls
- [ ] Vietnamese translations added for all strings
- [ ] English translations complete
- [ ] No console errors
- [ ] Test with Vietnamese language
- [ ] All components render correctly
- [ ] No missing translation keys
- [ ] Performance not degraded

---

## 🔍 VERIFICATION COMMANDS

```bash
# Count remaining hardcoded strings
grep -r "\"[A-Z][a-zA-Z\s\-\.,:?!()]*\"" \
  frontend/src/components --include="*.tsx" | \
  grep -v 't("' | wc -l

# List files still with hardcodes
grep -r "\"[A-Z][a-zA-Z\s\-\.,:?!()]*\"" \
  frontend/src/components --include="*.tsx" | \
  grep -v 't("' | cut -d: -f1 | sort -u

# Count total t() usages
grep -r 't("' frontend/src/components --include="*.tsx" | wc -l
```

---

## 📈 METRICS

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Files with Hardcodes | 45 | 0 | 0 |
| Hardcoded Strings | 207 | 0 | 0 |
| Translation Coverage | ~50% | 100% | 100% |
| i18n Support | Partial | Full | Full |

---

## 📝 NOTES

- Brand name "Resumate" can remain in English (acceptable)
- Font names should remain unchanged (Roboto, Inter, etc)
- Console debug messages are optional
- Schema.org data should be language-aware
- Estimated total time: **6-8 hours**

