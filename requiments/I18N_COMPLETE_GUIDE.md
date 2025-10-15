# I18N Complete Implementation Guide

## ✅ Đã Hoàn Thành

### 1. Analytics Page - 100%
- ✅ Translations: en.json & vi.json  
- ✅ Code updated: `analytics/page.tsx`
- ✅ Tested: No errors

### 2. Settings Page - 100%  
- ✅ Already implemented

### 3. CV Page - 30%
- ✅ Translations added
- ✅ Header & stats updated  
- ⚠️ Cần tiếp tục: modals, search, empty states

---

## 📋 Step-by-Step Implementation Guide

### Bước 1: Copy Translations Vào Files

#### `frontend/src/locales/en.json`

Thêm vào sau section "cv":

```json
"compare": {
  "title": "Version Comparison",
  "comparing": "Comparing Version {{v1}} vs Version {{v2}}",
  "backToCVs": "Back to CVs",
  "personalInfo": "Personal Information",
  "summary": "Summary",
  "experience": "Experience",
  "skills": "Skills",
  "technical": "Technical:",
  "soft": "Soft:",
  "education": "Education",
  "projects": "Projects",
  "subProjects": "SUB-PROJECTS ({{count}})",
  "subProjectDefault": "Sub-Project {{number}}",
  "achievements": "Achievements:",
  "loading": "Loading comparison...",
  "failed": "Failed to load versions for comparison"
},
"jobTailor": {
  "title": "Job Tailor",
  "subtitle": "Tailor your CV for specific jobs using AI",
  "selectCV": "Select CV",
  "jobDescription": "Job Description",
  "jobDescPlaceholder": "Paste the job description here...",
  "analyzeCompatibility": "Analyze Compatibility",
  "generateCoverLetter": "Generate Cover Letter",
  "tailorCV": "Tailor CV",
  "exportTailored": "Export Tailored CV",
  "startOver": "Start Over",
  "compatibility": {
    "title": "Compatibility Analysis",
    "matchScore": "Match Score",
    "matched Skills": "Matched Skills",
    "missingSkills": "Missing Skills",
    "suggestions": "Suggestions",
    "strengths": "Strengths"
  },
  "coverLetter": {
    "title": "Cover Letter",
    "copy": "Copy to Clipboard",
    "download": "Download"
  }
},
"portfolio": {
  "title": "Create Portfolio",
  "subtitle": "Build a professional portfolio to showcase your work",
  "steps": {
    "template": "Template",
    "cv": "CV",
    "customize": "Customize",
    "details": "Details"
  }
}
```

#### `frontend/src/locales/vi.json`

```json
"compare": {
  "title": "So Sánh Phiên Bản",
  "comparing": "Đang so sánh Phiên Bản {{v1}} vs Phiên Bản {{v2}}",
  "backToCVs": "Quay Lại CVs",
  "personalInfo": "Thông Tin Cá Nhân",
  "summary": "Tóm Tắt",
  "experience": "Kinh Nghiệm",
  "skills": "Kỹ Năng",
  "technical": "Kỹ Thuật:",
  "soft": "Mềm:",
  "education": "Học Vấn",
  "projects": "Dự Án",
  "subProjects": "DỰ ÁN CON ({{count}})",
  "subProjectDefault": "Dự Án Con {{number}}",
  "achievements": "Thành Tích:",
  "loading": "Đang tải so sánh...",
  "failed": "Không thể tải các phiên bản để so sánh"
}
```

---

### Bước 2: Update Code Pattern

#### Pattern 1: Simple Text
```typescript
// Before
<h3>My CVs</h3>

// After
<h3>{t("cv.title")}</h3>
```

#### Pattern 2: Text with Variables
```typescript
// Before
<h4>Edit CV: {selectedCv.originalFileName}</h4>

// After
<h4>{t("cv.modals.editTitle", { fileName: selectedCv.originalFileName })}</h4>
```

#### Pattern 3: Conditional Text
```typescript
// Before
{exportHistory.length > 0 ? "No match" : "No exports yet"}

// After
{exportHistory.length > 0 ? t("analytics.table.noExportsMatch") : t("analytics.table.noExportsYet")}
```

---

## 🎯 Complete Remaining Tasks

### Priority 1: Core Pages (Cần làm ngay)

#### CV Page - Remaining Updates:
```typescript
// File: frontend/src/app/dashboard/cv/page.tsx

// Line ~330: View Modal Title
title={selectedCv ? t("cv.modals.viewTitle", { fileName: selectedCv.originalFileName }) : t("cv.modals.viewTitle", { fileName: "" })}

// Line ~350: Modal labels
<label>{t("cv.modals.fileName")}</label>
<label>{t("cv.modals.uploadDate")}</label>
<label>{t("cv.modals.parsedInfo")}</label>

// Line ~425: Experience section
<label>{t("cv.sections.experience")}</label>

// Line ~450: Technologies
<p>{t("cv.sections.technologies")}</p>

// Line ~468: Sub-Projects
<p>{t("cv.sections.subProjects", { count: exp.subProjects.length })}</p>

// Line ~477: Sub-project default name
{subProj.name || t("cv.sections.subProjectDefault", { number: subIdx + 1 })}

// Line ~530: Skills section
<label>{t("cv.sections.skills")}</label>

// Line ~475: Technical Skills
<p>{t("cv.sections.technicalSkills")}</p>

// Line ~492: Soft Skills
<p>{t("cv.sections.softSkills")}</p>

// Line ~511: Languages
<p>{t("cv.sections.languages")}</p>

// Line ~536: Projects
<label>{t("cv.sections.projects")}</label>

// Line ~574: Certifications
<label>{t("cv.sections.certifications")}</label>

// Line ~603: Not parsed message
<p>{t("cv.modals.notParsed")}</p>

// Line ~704: Search placeholder
placeholder={t("cv.search")}

// Line ~714: Filter options
<option value="all">{t("cv.filter.all")}</option>
<option value="parsed">{t("cv.filter.parsed")}</option>
<option value="unparsed">{t("cv.filter.unparsed")}</option>

// Line ~634: Refresh
{t("cv.refresh")}

// Line ~644: Empty state
<h3>{t("cv.empty.noCVs")}</h3>
<p>{t("cv.empty.description")}</p>
{t("cv.empty.uploadFirst")}

// Line ~97: Confirm delete
if (confirm(t("cv.confirm.delete")))

// Line ~678: Exporting
{t("cv.exporting")}
```

---

## 📊 Progress Summary

| Page | Translations | Code | Status |
|------|--------------|------|--------|
| Settings | ✅ | ✅ | 100% |
| Analytics | ✅ | ✅ | 100% |
| CV | ✅ | 🟡 | 30% |
| Dashboard | ⚪ | ⚪ | 0% |
| Job Tailor | ⚪ | ⚪ | 0% |
| Portfolio | ⚪ | ⚪ | 0% |
| Projects | ⚪ | ⚪ | 0% |
| Compare | ⚪ | ⚪ | 0% |
| Auth | ⚪ | ⚪ | 0% |
| Components | ⚪ | ⚪ | 0% |

**Overall Progress: ~15%** (2/13 pages complete)

---

## ⚡ Quick Complete Commands

### Option 1: Continue với AI Assistant
Yêu cầu AI tiếp tục hoàn thành từng page một.

### Option 2: Manual với IDE Find/Replace
1. Open file cần update
2. Use IDE Find/Replace (Cmd+F)
3. Copy patterns từ guide này
4. Replace tất cả instances

### Option 3: Hybrid Approach (Khuyến nghị)
1. AI complete translations trong en.json & vi.json (one-time)
2. Manual update code với IDE find/replace (faster)
3. AI verify và test

---

## ✨ Benefits After Completion

- 🌐 Full bilingual support (EN/VI)
- 🔄 Easy to add more languages
- 🎯 Better UX for Vietnamese users
- 📱 Consistent terminology
- 🚀 Professional product

---

Estimated Time to Complete:
- Translations: ~2 hours
- Code updates: ~4 hours  
- Testing: ~1 hour
**Total: ~7 hours**

