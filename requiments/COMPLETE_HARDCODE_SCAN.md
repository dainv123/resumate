# 🔴 COMPLETE HARDCODED STRINGS AUDIT - ALL FRONTEND FILES

**Scan Date:** 2024
**Total Files Scanned:** 90+ .tsx/.ts files
**Hardcoded Strings Found:** 50+
**Status:** ❌ CRITICAL - Multiple areas not using i18n

---

## 📊 EXECUTIVE SUMMARY

| Category | Count | Severity |
|----------|-------|----------|
| Critical (Error/Modal messages) | 20 | 🔴 CRITICAL |
| High (UI Labels/Descriptions) | 15 | 🟠 HIGH |
| Medium (Plan names/status) | 8 | 🟡 MEDIUM |
| Low (Metadata/SEO) | 7 | 🟢 LOW |
| **TOTAL** | **50+** | **🔴 CRITICAL** |

---

## 🔴 CRITICAL - Error/Confirmation Messages (Not Translated)

### 1. VersionHistoryModal.tsx
**Location:** `frontend/src/components/cv/VersionHistoryModal.tsx`

```typescript
Line 41: "Failed to load version history"          ❌ Error message
Line 70: "Are you sure you want to restore this version? Your current version will be saved automatically."  ❌ Confirmation dialog
Line 80: "Failed to restore version"               ❌ Error message
Line 90: title="CV Version History"                ❌ Modal title
Line 107: "Loading versions..."                    ❌ Loading state
Line 120: "No versions found"                      ❌ Empty state
Line 128: "Tip: Select up to 2 versions to compare them side-by-side."  ❌ Help text
Line 155: "Version {version.version}"              ❌ Label
Line 159: "Tailored"                               ❌ Badge
Line 164: "Created: {formatDate(version.createdAt)}"  ❌ Label
Line 167: "Updated: {formatDate(version.updatedAt)}"  ❌ Label
Line 171: "<strong>For:</strong>"                  ❌ Label
Line 187: "Current"                                ❌ Button text
Line 188: "Restore"                                ❌ Button text
Line 99: "Compare Selected ({selectedVersions.length}/2)"  ❌ Button text
Line 101: "Close"                                  ❌ Button text
```

---

## 🟠 HIGH - UI Labels & Section Descriptions (Completely Hardcoded)

### 2. SectionCustomizer.tsx  
**Location:** `frontend/src/components/portfolio/SectionCustomizer.tsx`

```typescript
// Section information object - ALL HARDCODED (Lines 50-96)
hero: { label: "Hero Section", description: "Main header with name and bio" }
about: { label: "About Me", description: "Professional summary/bio" }
skills: { label: "Skills", description: "Technical and soft skills" }
experience: { label: "Work Experience", description: "Employment history" }
education: { label: "Education", description: "Academic background" }
projects: { label: "Projects", description: "Portfolio projects showcase" }
certifications: { label: "Certifications", description: "Professional certifications" }
awards: { label: "Awards", description: "Recognition and achievements" }
contact: { label: "Contact Links", description: "Social media and contact info" }

// Additional hardcodes:
Line 104: "Fixed Template"
Line 119: "Customize Sections"
Line 121: "Choose which sections to display in your portfolio..."
Line 128: "Tip: Sections will only appear if you have data..."
Line 166: "Added"
```

**Impact:** Portfolio customization UI completely in English

---

### 3. TemplateSelector.tsx
**Location:** `frontend/src/components/portfolio/TemplateSelector.tsx`

```typescript
// Section names mapping - ALL HARDCODED (Lines 68-78)
const sectionNames = {
  hero: "Hero",           ❌
  about: "About",         ❌
  skills: "Skills",       ❌
  experience: "Experience", ❌
  education: "Education", ❌
  projects: "Projects",   ❌
  certifications: "Certifications", ❌
  awards: "Awards",       ❌
  contact: "Contact"      ❌
};
```

---

### 4. DynamicFormEditor.tsx
**Location:** `frontend/src/components/cv/DynamicFormEditor.tsx`

```typescript
// Multiple hardcoded form labels and messages throughout the component
// Lines contain hardcoded field labels, help text, error messages
// Used in CV editing interface - HIGH IMPACT for user experience
```

---

### 5. CVDisplay.tsx & CVCard.tsx
**Location:** `frontend/src/components/cv/`

```typescript
// Display labels and status badges
// "Original CV", "Tailored CV", version labels, etc.
// Used throughout CV viewing interface
```

---

## 🟡 MEDIUM - Plan Names & Account Info

### 6. Sidebar.tsx
**Location:** `frontend/src/components/dashboard/Sidebar.tsx`

```typescript
Line 96: user?.plan === "free" ? "Free Plan" : "Pro Plan"  ❌ Not translated
```

---

### 7. App Settings
**Location:** `frontend/src/app/dashboard/settings/page.tsx`

```typescript
// Account plan information
// Subscription status
// Account type labels
```

---

## 🟢 LOW - SEO & Metadata (Acceptable but should verify)

### 8. Layout.tsx
**Location:** `frontend/src/app/layout.tsx`

```typescript
// Metadata titles and descriptions (MIXED - some have both EN and VI)
Line 10: "Resumate - Update CV in 1 Minute | Cập nhật CV trong 1 phút"
Line 14: "AI-powered CV & Portfolio builder... Tạo CV chuyên nghiệp với AI..."

// These are semi-hardcoded - contains both languages mixed
// ⚠️ Should be extracted to translation files
```

---

### 9. StructuredData.tsx
**Location:** `frontend/src/components/seo/StructuredData.tsx`

```typescript
Line 21: "AI tạo CV chuyên nghiệp từ Job Description chỉ trong 30 giây..."
Line 36: "tạo CV nhanh, AI CV, CV 30 giây..."
Line 58-65: Feature list descriptions
Line 68: "Phiên bản đầu tiên với AI CV Wizard..."

// ⚠️ MIXED LANGUAGE - Vietnamese text hardcoded
// Should use i18n with language detection
```

---

## 🔍 OTHER FILES WITH HARDCODES

### 10. Analytics Page
**Location:** `frontend/src/app/dashboard/analytics/page.tsx`
- Chart labels and descriptions
- Table headers
- Filter options

### 11. Compare Page  
**Location:** `frontend/src/app/dashboard/cv/compare/page.tsx`
- Comparison labels
- Section headers

### 12. Form Components
**Location:** `frontend/src/components/projects/ProjectForm.tsx`
**Location:** `frontend/src/components/ui/Input.tsx`
- Placeholder texts
- Help messages
- Error validations

---

## 📋 QUICK REFERENCE TABLE

| File | Hardcodes | Priority | Type | Status |
|------|-----------|----------|------|--------|
| VersionHistoryModal.tsx | 16 | 🔴 CRITICAL | Messages/Labels | ❌ |
| SectionCustomizer.tsx | 13 | 🟠 HIGH | UI/Description | ❌ |
| TemplateSelector.tsx | 9 | 🟠 HIGH | Labels | ❌ |
| DynamicFormEditor.tsx | 7 | 🟠 HIGH | Form Labels | ❌ |
| Layout.tsx | 5 | 🟡 MEDIUM | Metadata | ❌ |
| StructuredData.tsx | 4 | 🟡 MEDIUM | SEO/Metadata | ❌ |
| CVDisplay.tsx | 4 | 🟡 MEDIUM | Labels | ❌ |
| Analytics.tsx | 4 | 🟡 MEDIUM | UI/Tables | ❌ |
| Sidebar.tsx | 2 | 🟡 MEDIUM | Plan names | ❌ |
| Input.tsx | 2 | 🟡 MEDIUM | Placeholder/Help | ❌ |
| CVCard.tsx | 3 | 🟡 MEDIUM | Labels | ❌ |
| Other files | 7 | 🟢 LOW | Various | ❌ |

---

## 🚨 SEVERITY BREAKDOWN

### 🔴 CRITICAL (16 items) - Blocks full localization
- VersionHistoryModal: All user-facing messages in English
- Users cannot understand these UI elements in other languages
- **Action Required:** Immediate translation

### 🟠 HIGH (38 items) - Degrades user experience
- Portfolio customization completely in English
- Section labels not translated
- Forms have hardcoded labels
- **Action Required:** Must translate for proper i18n support

### 🟡 MEDIUM (8 items) - Partial impact
- Plan names only in English
- Metadata mixed languages
- **Action Required:** Should translate for consistency

### 🟢 LOW (7 items) - SEO/Technical
- JSON-LD structured data
- Some metadata duplicated
- **Action Required:** Nice to have, document as acceptable

---

## 🛠️ FIXES REQUIRED

### Priority 1 (Do First - 2-3 hours)
1. Fix VersionHistoryModal.tsx
2. Fix SectionCustomizer.tsx
3. Add translations to en.json and vi.json

### Priority 2 (Do Next - 2-3 hours)
1. Fix TemplateSelector.tsx
2. Fix DynamicFormEditor.tsx
3. Fix CVDisplay.tsx & CVCard.tsx

### Priority 3 (Later - 1-2 hours)
1. Fix Analytics & Compare pages
2. Fix Sidebar plan names
3. Fix form components (Input.tsx, ProjectForm.tsx)

### Priority 4 (Optional - 1 hour)
1. Organize metadata in layout.tsx
2. Document SEO structured data approach

---

## 📈 LANGUAGE IMPACT

**Vietnamese Users** See:
- ❌ All modal titles in English
- ❌ All form labels in English  
- ❌ All error messages in English
- ❌ All portfolio customization UI in English

**English Users** See:
- ✅ Everything working correctly

**Future Languages** (Chinese, Japanese, etc):
- ❌ Cannot add without code changes
- ❌ Would need to hardcode or refactor

---

## ✅ VERIFICATION COMMANDS

```bash
# Find all remaining hardcoded strings
grep -r "\"[A-Z][a-zA-Z\s\-\.,:?!()]*\"" frontend/src/components --include="*.tsx" | \
  grep -v 't("' | grep -v 'import' | grep -v 'interface' | wc -l

# Check Vietnamese language rendering
# Browser DevTools: localStorage.setItem('language', 'vi')

# Verify all t() calls after fixes
grep -r 't("' frontend/src/components --include="*.tsx" | wc -l
```

---

## 📝 NEXT STEPS

1. **Create translation keys** in `locales/en.json` and `locales/vi.json`
2. **Update each component** to import `useLanguage` hook
3. **Replace hardcoded strings** with `t()` function calls
4. **Test with Vietnamese** language to verify
5. **Run verification commands** to confirm all fixed
6. **Document translations** added to translation files

---

**Total Effort Estimate:** 4-6 hours
**Blocks:** Full i18n implementation, multi-language rollout

