# i18n Text Mapping Guide

## Quick Reference for Applying Translations

### Already Done ✅
1. **Sidebar** - All navigation items translated
2. **Job Tailor Header** - Title & description translated
3. **Translation files** - en.json & vi.json with 100+ keys

### Need to Apply (Examples)

#### Job Tailor Page

**Line 541:** `AI-Powered Tools` → `{t("jobTailor.aiTools")}`

**Line 560:** `Analyze Compatibility` → `{t("jobTailor.analyzeCompatibility")}`

**Line 563:** `Get detailed score & gap analysis` → `{t("jobTailor.scoreAnalysis")}`

**Line 591:** `Generate Cover Letter` → `{t("jobTailor.generateCoverLetter")}`

**Line 594:** `AI writes personalized letter` → `{t("jobTailor.personalizedLetter")}`

**Line 622:** `Tailor CV with AI` → `{t("jobTailor.tailorCV")}`

**Line 625:** `Create optimized version for this job` → `{t("jobTailor.optimizedVersion")}`

### All Available Translation Keys

#### Common (common.*)
```tsx
t("common.loading")      // "Loading..." / "Đang tải..."
t("common.save")          // "Save" / "Lưu"
t("common.cancel")        // "Cancel" / "Hủy"
t("common.close")         // "Close" / "Đóng"
t("common.delete")        // "Delete" / "Xóa"
t("common.edit")          // "Edit" / "Sửa"
t("common.add")           // "Add" / "Thêm"
t("common.search")        // "Search" / "Tìm kiếm"
t("common.upload")        // "Upload" / "Tải lên"
t("common.download")      // "Download" / "Tải xuống"
t("common.copy")          // "Copy" / "Sao chép"
t("common.export")        // "Export" / "Xuất"
```

#### Navigation (nav.*)
```tsx
t("nav.dashboard")        // "Dashboard" / "Tổng quan"
t("nav.myCV")             // "My CV" / "CV của tôi"
t("nav.jobTailor")        // "Job Tailor" / "Tùy chỉnh CV"
t("nav.projects")         // "Projects" / "Dự án"
t("nav.portfolio")        // "Portfolio" / "Portfolio"
t("nav.settings")         // "Settings" / "Cài đặt"
t("nav.logout")           // "Logout" / "Đăng xuất"
```

#### Job Tailor (jobTailor.*)
```tsx
t("jobTailor.title")                    // "Job Tailor" / "Tùy chỉnh CV"
t("jobTailor.description")              // Description text
t("jobTailor.selectCV")                 // "Select CV" / "Chọn CV"
t("jobTailor.enterJobDescription")      // "Enter Job Description"
t("jobTailor.pasteJobHere")             // Placeholder text
t("jobTailor.analyzeCompatibility")     // "Analyze Compatibility"
t("jobTailor.generateCoverLetter")      // "Generate Cover Letter"
t("jobTailor.tailorCV")                 // "Tailor CV with AI"
t("jobTailor.analyzing")                // "Analyzing..."
t("jobTailor.generating")               // "Generating..."
t("jobTailor.tailoring")                // "AI is tailoring your CV..."
t("jobTailor.aiTools")                  // "AI-Powered Tools"
t("jobTailor.scoreAnalysis")            // "Get detailed score..."
t("jobTailor.personalizedLetter")       // "AI writes personalized letter"
t("jobTailor.optimizedVersion")         // "Create optimized version..."
t("jobTailor.processingRequest")        // "Our AI is processing..."
t("jobTailor.readingRequirements")      // "Reading job requirements"
t("jobTailor.analyzingCV")              // "Analyzing your CV"
t("jobTailor.generatingResults")        // "Generating results"
t("jobTailor.timeEstimate")             // "This typically takes 30-60 seconds"
t("jobTailor.compatibilityScore")       // "Compatibility Score"
t("jobTailor.excellentMatch")           // "Excellent match!"
t("jobTailor.goodMatch")                // "Good match!"
t("jobTailor.fairMatch")                // "Fair match"
t("jobTailor.lowMatch")                 // "Low match"
t("jobTailor.strengths")                // "Strengths"
t("jobTailor.matchedSkills")            // "Matched Skills"
t("jobTailor.missingSkills")            // "Missing Skills"
t("jobTailor.relevantExperience")       // "Relevant Experience"
t("jobTailor.missingRequirements")      // "Missing Requirements"
t("jobTailor.suggestions")              // "Suggestions for Improvement"
t("jobTailor.coverLetter")              // "Generated Cover Letter"
t("jobTailor.coverLetterDescription")   // Description text
t("jobTailor.copyToClipboard")          // "Copy to Clipboard"
t("jobTailor.tips")                     // "Tips:"
t("jobTailor.tip1")                     // Tip 1 text
t("jobTailor.tip2")                     // Tip 2 text
t("jobTailor.tip3")                     // Tip 3 text
t("jobTailor.tip4")                     // Tip 4 text
```

#### CV (cv.*)
```tsx
t("cv.title")             // "My CV" / "CV của tôi"
t("cv.upload")            // "Upload CV" / "Tải CV lên"
t("cv.originalCV")        // "Original CV" / "CV gốc"
t("cv.tailoredCV")        // "Tailored CV" / "CV đã tùy chỉnh"
t("cv.exportPDF")         // "Export as PDF" / "Xuất PDF"
t("cv.exportWord")        // "Export as Word" / "Xuất Word"
t("cv.copyID")            // "Copy ID" / "Sao chép ID"
t("cv.idCopied")          // "ID copied!" / "Đã sao chép ID!"
```

#### Projects (projects.*)
```tsx
t("projects.title")       // "Projects" / "Dự án"
t("projects.add")         // "Add Project" / "Thêm dự án"
t("projects.edit")        // "Edit Project" / "Sửa dự án"
t("projects.delete")      // "Delete Project" / "Xóa dự án"
// ... and more
```

#### Portfolio (portfolio.*)
```tsx
t("portfolio.title")      // "Portfolio" / "Portfolio"
t("portfolio.generate")   // "Generate Portfolio"
t("portfolio.preview")    // "Preview Portfolio"
// ... and more
```

### How to Use

1. **Import hook:**
```tsx
import { useLanguage } from "@/contexts/LanguageContext";
```

2. **Get translation function:**
```tsx
const { t } = useLanguage();
```

3. **Replace text:**
```tsx
// Before
<h1>Job Tailor</h1>

// After
<h1>{t("jobTailor.title")}</h1>
```

### Pattern Examples

#### Simple text replacement:
```tsx
"Analyze Compatibility" → {t("jobTailor.analyzeCompatibility")}
```

#### Conditional text:
```tsx
{isTailoring ? "AI is tailoring your CV..." : "Tailor CV with AI"}
// →
{isTailoring ? t("jobTailor.tailoring") : t("jobTailor.tailorCV")}
```

#### Button text:
```tsx
<Button>Close</Button>
// →
<Button>{t("common.close")}</Button>
```

#### Placeholder:
```tsx
placeholder="Paste the job description here..."
// →
placeholder={t("jobTailor.pasteJobHere")}
```

### Priority Order

1. ✅ **Sidebar** - DONE
2. 🚧 **Job Tailor** - In progress
   - ✅ Header
   - ⏳ AI Tools section
   - ⏳ Modals
   - ⏳ Helper messages
3. ⏳ **CV Page**
4. ⏳ **Projects Page**
5. ⏳ **Portfolio Page**
6. ⏳ **Modals**

### Quick Test

After applying translations:
1. Visit: http://localhost:5000/dashboard
2. Click language switcher (🌐)
3. Switch to "Tiếng Việt"
4. All text should change to Vietnamese

### Troubleshooting

**Text not translating?**
- Check if `const { t } = useLanguage()` is imported
- Verify translation key exists in `locales/en.json` and `locales/vi.json`
- Check browser console for errors

**Wrong translation?**
- Verify the key path (e.g., `jobTailor.title` not `job.tailor.title`)
- Check spelling in both en.json and vi.json

---

**Full translations available in:**
- `frontend/src/locales/en.json`
- `frontend/src/locales/vi.json`
- `frontend/I18N_GUIDE.md` (detailed guide)

