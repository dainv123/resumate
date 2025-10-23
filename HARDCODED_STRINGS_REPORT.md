# 🔴 Hardcoded Strings Not Using i18n - Scan Report

**Scan Date:** 2024
**Frontend Path:** `frontend/src/`
**Status:** ❌ Found multiple hardcoded strings that need translation

---

## 📋 Summary

| File | Hardcodes Count | Priority | Status |
|------|-----------------|----------|--------|
| VersionHistoryModal.tsx | 16+ | 🔴 CRITICAL | Not Translated |
| SectionCustomizer.tsx | 13+ | 🟠 HIGH | Not Translated |
| TemplateSelector.tsx | 9+ | 🟠 HIGH | Not Translated |
| Sidebar.tsx | 2+ | 🟡 MEDIUM | Not Translated |

**Total Hardcoded Strings Found: ~40+**

---

## 🔴 Priority 1: CRITICAL - VersionHistoryModal.tsx

**File:** `frontend/src/components/cv/VersionHistoryModal.tsx`

### Hardcoded Strings:

```typescript
// Line 41 - Error message
"Failed to load version history"

// Line 70 - Confirmation dialog
"Are you sure you want to restore this version? Your current version will be saved automatically."

// Line 80 - Error message
"Failed to restore version"

// Line 90 - Modal title
title="CV Version History"

// Line 107 - Loading state
"Loading versions..."

// Line 120 - Empty state
"No versions found"

// Line 128 - Tip box (HTML with hardcoded text)
"<strong>Tip:</strong> Select up to 2 versions to compare them side-by-side."

// Line 155 - Version label
"Version {version.version}"

// Line 159 - Badge text
"Tailored"

// Line 164 - Created label
"Created: {formatDate(version.createdAt)}"

// Line 167 - Updated label
"Updated: {formatDate(version.updatedAt)}"

// Line 171 - Job label
"<strong>For:</strong>"

// Line 187 - Button text
"Current"

// Line 188 - Button text
"Restore"

// Line 99 - Button text with count
"Compare Selected ({selectedVersions.length}/2)"

// Line 101 - Button text
"Close"
```

### Impact:
- Users see English text regardless of language setting
- Compare functionality title not translated
- All error states use English

---

## 🟠 Priority 2: HIGH - SectionCustomizer.tsx

**File:** `frontend/src/components/portfolio/SectionCustomizer.tsx`

### Hardcoded Strings in `sectionInfo` Object (Lines 44-96):

```typescript
const sectionInfo = {
  hero: {
    label: "Hero Section",                           // Not translated
    description: "Main header with name and bio",    // Not translated
    icon: "🎯",
  },
  about: {
    label: "About Me",                               // Not translated
    description: "Professional summary/bio",         // Not translated
    icon: "📝",
  },
  skills: {
    label: "Skills",                                 // Not translated
    description: "Technical and soft skills",        // Not translated
    icon: "💡",
  },
  experience: {
    label: "Work Experience",                        // Not translated
    description: "Employment history",               // Not translated
    icon: "💼",
  },
  education: {
    label: "Education",                              // Not translated
    description: "Academic background",              // Not translated
    icon: "🎓",
  },
  projects: {
    label: "Projects",                               // Not translated
    description: "Portfolio projects showcase",      // Not translated
    icon: "🚀",
  },
  certifications: {
    label: "Certifications",                         // Not translated
    description: "Professional certifications",      // Not translated
    icon: "📜",
  },
  awards: {
    label: "Awards",                                 // Not translated
    description: "Recognition and achievements",     // Not translated
    icon: "🏆",
  },
  contact: {
    label: "Contact Links",                          // Not translated
    description: "Social media and contact info",    // Not translated
    icon: "📧",
  },
};
```

### Additional Hardcoded Strings:

```typescript
// Line 104 - Fixed template heading
"Fixed Template"

// Line 119 - Section heading
"Customize Sections"

// Line 121-122 - Instructions (hardcoded)
"Choose which sections to display in your portfolio. Deselected sections will be hidden."

// Line 128 - Tip text (hardcoded)
"Tip: Sections will only appear if you have data for them. For example, if you don't have any certifications, that section won't be shown even if enabled."

// Line 166 - Badge text
"Added"
```

### Impact:
- All portfolio section labels in any language will show English
- Customization UI text is not translated
- Portfolio setup experience is not localized

---

## 🟠 Priority 3: HIGH - TemplateSelector.tsx

**File:** `frontend/src/components/portfolio/TemplateSelector.tsx`

### Hardcoded Strings (Lines 68-78):

```typescript
const sectionNames: { [key in keyof TemplateSection]: string } = {
  hero: "Hero",                     // Not translated
  about: "About",                   // Not translated
  skills: "Skills",                 // Not translated
  experience: "Experience",         // Not translated
  education: "Education",           // Not translated
  projects: "Projects",             // Not translated
  certifications: "Certifications", // Not translated
  awards: "Awards",                 // Not translated
  contact: "Contact",               // Not translated
};
```

### Impact:
- Template selection and description UI uses English
- Portfolio template selection is not localized

---

## 🟡 Priority 4: MEDIUM - Sidebar.tsx

**File:** `frontend/src/components/dashboard/Sidebar.tsx`

### Hardcoded Strings:

```typescript
// Line 96 - Plan badge
user?.plan === "free" ? "Free Plan" : "Pro Plan"

// Note: "Resumate" on line 70 is brand name, acceptable to keep in all languages
```

### Impact:
- User's plan information is displayed in English only

---

## 📊 Language Coverage Impact

Current hardcoded strings affect:
- ✅ English Users: No impact
- ❌ Vietnamese Users: See English text in these components
- ❌ Future Languages: Cannot be added without code changes

---

## 🛠️ Recommended Fixes

### Step 1: Add translations to `locales/en.json` and `locales/vi.json`

```json
{
  "versionHistory": {
    "title": "CV Version History",
    "loading": "Loading versions...",
    "noVersions": "No versions found",
    "compareButton": "Compare Selected ({{count}}/2)",
    "closeButton": "Close",
    "restoreButton": "Restore",
    "currentButton": "Current",
    "tailoredBadge": "Tailored",
    "createdLabel": "Created",
    "updatedLabel": "Updated",
    "forLabel": "For",
    "versionLabel": "Version",
    "compareSelectedTip": "Select up to 2 versions to compare them side-by-side.",
    "restoreConfirm": "Are you sure you want to restore this version? Your current version will be saved automatically.",
    "loadError": "Failed to load version history",
    "restoreError": "Failed to restore version"
  },
  "sectionCustomizer": {
    "title": "Customize Sections",
    "subtitle": "Choose which sections to display in your portfolio. Deselected sections will be hidden.",
    "fixedTemplate": "Fixed Template",
    "fixedTemplateDesc": "The \"{{name}}\" template has a fixed layout and cannot be customized. All sections will be displayed based on your available data.",
    "tip": "Sections will only appear if you have data for them. For example, if you don't have any certifications, that section won't be shown even if enabled.",
    "addedBadge": "Added",
    "sections": {
      "hero": {
        "label": "Hero Section",
        "description": "Main header with name and bio"
      },
      "about": {
        "label": "About Me",
        "description": "Professional summary/bio"
      },
      "skills": {
        "label": "Skills",
        "description": "Technical and soft skills"
      },
      "experience": {
        "label": "Work Experience",
        "description": "Employment history"
      },
      "education": {
        "label": "Education",
        "description": "Academic background"
      },
      "projects": {
        "label": "Projects",
        "description": "Portfolio projects showcase"
      },
      "certifications": {
        "label": "Certifications",
        "description": "Professional certifications"
      },
      "awards": {
        "label": "Awards",
        "description": "Recognition and achievements"
      },
      "contact": {
        "label": "Contact Links",
        "description": "Social media and contact info"
      }
    }
  },
  "sidebar": {
    "freePlan": "Free Plan",
    "proPlan": "Pro Plan"
  }
}
```

### Step 2: Update component imports

Add `useLanguage` hook to each component and replace hardcoded strings with `t()` calls.

### Step 3: Add Vietnamese translations to `locales/vi.json`

---

## 📈 How to Verify

1. Run this command to find remaining hardcoded strings:
```bash
grep -r "\"[A-Z][a-zA-Z]{3,}.*\"" frontend/src/components --include="*.tsx" | \
  grep -v "t(\"" | \
  grep -v "console\|import\|export\|interface\|type"
```

2. Check component rendering with Vietnamese language:
```bash
# Set language to Vietnamese and verify all text is translated
localStorage.setItem('language', 'vi')
```

---

## ✅ Checklist for Fixes

- [ ] Add translations to `locales/en.json`
- [ ] Add translations to `locales/vi.json`
- [ ] Update `VersionHistoryModal.tsx` to use `t()` function
- [ ] Update `SectionCustomizer.tsx` to use `t()` function
- [ ] Update `TemplateSelector.tsx` to use `t()` function
- [ ] Update `Sidebar.tsx` to use `t()` function
- [ ] Test all components with Vietnamese language
- [ ] Verify no console errors
- [ ] Test responsive design with translations

---

## 📝 Notes

- All string translations should use the `useLanguage()` hook and `t()` function
- Component `SectionCustomizer` and `TemplateSelector` are used in portfolio creation flow
- These strings are part of core user-facing functionality
- **Estimated effort:** ~2-3 hours for all fixes

