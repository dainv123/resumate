# I18N Scan Report - Hardcoded Text Inventory

**Ngày scan**: 2025-10-12  
**Scope**: Frontend (React/Next.js)  
**Mục tiêu**: Chuyển tất cả hardcoded text sang i18n system

---

## 📊 Summary

| Page/Component | Hardcoded Texts | Priority | Status |
|----------------|-----------------|----------|--------|
| Analytics Page | 22 texts | High | 🟡 In Progress |
| CV Page | ~30 texts | High | ⚪ Pending |
| Dashboard Page | ~25 texts | High | ⚪ Pending |
| Job Tailor Page | ~40 texts | High | ⚪ Pending |
| Portfolio Page | ~20 texts | Medium | ⚪ Pending |
| Projects Page | ~15 texts | Medium | ⚪ Pending |
| Compare Page | ~15 texts | Low | ⚪ Pending |
| Auth Pages | ~10 texts | Low | ⚪ Pending |
| Components | ~50 texts | High | ⚪ Pending |

**Total**: ~227 hardcoded texts cần chuyển sang i18n

---

## 🔍 Detailed Findings

### 1. Analytics Page (`/dashboard/analytics/page.tsx`)

#### Page Headers
```typescript
- "Analytics Dashboard"
- "Track your CV performance and usage metrics"
```

#### Date Range Selector
```typescript
- "Last 7 days"
- "Last 30 days"
- "Last 90 days"
- "Last year"
```

#### Stat Cards
```typescript
- "Total Exports"
- "CVs Uploaded"
- "CVs Tailored"
```

#### Chart Titles
```typescript
- "All Activities"
- "Exports by Format"
- "Activity Timeline (Last X days)"
- "Export History"
```

#### Loading/Empty States
```typescript
- "Loading chart..."
- "No export data yet"
- "No activity data yet"
- "No exports yet"
```

#### Export History Table
```typescript
- "Search by CV name or template..."
- "Date"
- "Format"
- "Template"
- "CV Name"
- "Showing X to Y of Z entries"
- "Previous"
- "Next"
```

---

### 2. CV Page (`/dashboard/cv/page.tsx`)

#### Headers
```typescript
- "My CVs"
- "Manage and update your CVs with AI-powered features"
- "Upload CV"
```

#### Statistics
```typescript
- "Total CVs"
- "Parsed"
- "Unparsed"
- "Sub-Projects"
- "This Week"
```

#### Modals
```typescript
- "Upload New CV"
- "Edit CV"
- "File Name"
- "Name"
- "Email"
- "Phone"
- "Cancel"
- "Save Changes"
- "Close"
```

#### View Modal
```typescript
- "CV Details"
- "Upload Date"
- "Parsed Information"
- "Experience"
- "Technologies:"
- "Skills"
- "Technical Skills:"
- "Soft Skills:"
- "Languages:"
- "Projects"
- "Certifications"
- "SUB-PROJECTS (X)"
- "Sub-Project X"
```

#### Search/Filter
```typescript
- "Search CVs..."
- "All CVs"
- "Parsed"
- "Unparsed"
- "Refresh"
```

#### Empty States
```typescript
- "No CVs uploaded yet"
- "Upload your first CV to get started with AI-powered features"
- "Upload Your First CV"
- "CV has not been parsed yet"
```

#### Confirmations
```typescript
- "Are you sure you want to delete this CV?"
- "Are you sure you want to duplicate this CV?"
```

---

### 3. Dashboard Page (`/dashboard/page.tsx`)

#### Welcome
```typescript
- "Welcome back, {{name}}! 👋"
- "Manage your CV and portfolio easily with Resumate."
```

#### Quick Stats
```typescript
- "CV Quality Score"
- "Profile Completeness"
- "Success Rate"
```

#### Quick Actions
```typescript
- "Upload CV"
- "Upload your CV and let AI parse it"
- "Upload Now"
- "Tailor CV"
- "Create job-specific versions of your CV"
- "Start Tailoring"
- "Portfolio"
- "Build your professional portfolio"
- "Create Portfolio"
```

#### Recent Sections
```typescript
- "Recent CVs"
- "View all →"
- "Recent Projects"
- "No projects yet"
```

#### Getting Started
```typescript
- "Getting Started with Resumate"
- "Upload your first CV to start creating professional portfolios"
- "Upload CV Now"
```

#### Tips
```typescript
- "Tips & Tricks"
- "Use Job Tailor to create CVs tailored for each position"
- "Add new projects to update your portfolio"
- "Export CVs in multiple formats (PDF, Word, ATS)"
```

---

### 4. Job Tailor Page (`/dashboard/job-tailor/page.tsx`)

#### Headers
```typescript
- "Job Tailor"
- "Tailor your CV for specific jobs using AI"
```

#### Steps
```typescript
- "Step 1: Select CV"
- "Step 2: Job Description"
- "Step 3: Tailor CV"
```

#### Buttons
```typescript
- "Select CV"
- "Analyze Compatibility"
- "Generate Cover Letter"
- "Tailor CV"
- "Export Tailored CV"
- "Start Over"
```

#### Compatibility Analysis
```typescript
- "Compatibility Analysis"
- "Match Score"
- "Matched Skills"
- "Missing Skills"
- "Suggestions"
- "Strengths"
```

#### Cover Letter
```typescript
- "Cover Letter"
- "Copy to Clipboard"
- "Download"
```

---

### 5. Portfolio Page (`/dashboard/portfolio/page.tsx`)

#### Headers
```typescript
- "Create Portfolio"
- "Build a professional portfolio to showcase your work"
```

#### Steps
```typescript
- "Template"
- "CV"
- "Customize"
- "Details"
- "Previous"
- "Next"
- "Complete the form above"
```

#### Template Selection
```typescript
- "Choose a Template"
- "Select a portfolio template that fits your style"
```

#### CV Selection
```typescript
- "Select CV"
- "Choose which CV to use for your portfolio"
```

#### Section Customizer
```typescript
- "Customize Sections"
- "Enable or disable sections"
```

#### Details Form
```typescript
- "Personal Details"
- "Add your bio and social links"
- "Bio / Tagline"
- "Software Engineer | Full-stack Developer | Tech Enthusiast"
- "Avatar URL (Optional)"
- "LinkedIn URL"
- "GitHub URL"
- "Website URL"
- "Custom Domain (Optional)"
```

#### Success
```typescript
- "Preview"
- "Save & Publish"
- "Preview Ready!"
- "Your portfolio is ready to view"
- "Open Preview"
- "Portfolio Published! 🎉"
- "Your portfolio is now live"
```

---

### 6. Projects Page (`/dashboard/projects/page.tsx`)

```typescript
- "Projects"
- "Manage your project portfolio"
- "Add Project"
- "Project Name"
- "Description"
- "Role"
- "Tech Stack"
- "Results"
- "Demo Link"
- "GitHub Link"
- "Start Date"
- "End Date"
- "Save Project"
- "No projects yet"
- "Add your first project"
```

---

### 7. CV Compare Page (`/dashboard/cv/compare/page.tsx`)

```typescript
- "Version Comparison"
- "Comparing Version X vs Version Y"
- "Back to CVs"
- "Personal Information"
- "Summary"
- "Experience"
- "Skills"
- "Technical:"
- "Soft:"
- "Education"
- "Projects"
- "Sub-Projects (X)"
- "Achievements:"
- "Loading comparison..."
- "Failed to load versions"
```

---

### 8. Auth Pages

#### Login
```typescript
- "Sign in to Resumate"
- "Email"
- "Password"
- "Sign In"
- "Or sign in with"
- "Don't have an account?"
- "Sign up"
```

#### Register
```typescript
- "Create Account"
- "Name"
- "Email"
- "Password"
- "Confirm Password"
- "Sign Up"
- "Already have an account?"
- "Sign in"
```

#### Callback
```typescript
- "Processing..."
- "Redirecting..."
```

---

### 9. Components

#### CVPreview Component
```typescript
- "Edit"
- "Delete"
- "Duplicate"
- "Export"
- "Tailor"
- "View"
- "Version"
- "Updated"
- "Tailored"
- "Original"
- "Professional"
- "Modern"
- "Creative"
```

#### CVUpload Component
```typescript
- "Drag and drop your CV here"
- "or click to browse"
- "Supported formats: PDF, DOCX"
- "Max file size: 10MB"
- "Uploading..."
- "Upload failed"
- "Upload successful"
```

#### Modal Component
```typescript
- "Close"
```

#### Toast Messages
```typescript
- "Success!"
- "Error"
- "Warning"
- "Info"
```

---

## 🎯 Implementation Strategy

### Phase 1: High Priority Pages (Week 1)
1. ✅ Settings Page (Already done)
2. 🟡 Analytics Page (In progress)
3. ⚪ CV Page
4. ⚪ Dashboard Page
5. ⚪ Job Tailor Page

### Phase 2: Medium Priority (Week 2)
6. Portfolio Page
7. Projects Page
8. Components (CVPreview, CVUpload, etc.)

### Phase 3: Low Priority (Week 3)
9. Compare Page
10. Auth Pages
11. UI Components
12. Testing & Verification

---

## 📝 Translation Keys Structure

### Proposed Structure
```json
{
  "analytics": {
    "title": "Analytics Dashboard",
    "subtitle": "Track your CV performance",
    "dateRange": {
      "last7": "Last 7 days",
      "last30": "Last 30 days",
      "last90": "Last 90 days",
      "lastYear": "Last year"
    },
    "stats": {
      "totalExports": "Total Exports",
      "cvsUploaded": "CVs Uploaded",
      "cvsTailored": "CVs Tailored"
    },
    "charts": {
      "allActivities": "All Activities",
      "exportsByFormat": "Exports by Format",
      "activityTimeline": "Activity Timeline",
      "exportHistory": "Export History"
    },
    "loading": "Loading chart...",
    "noData": "No data yet",
    "table": {
      "date": "Date",
      "format": "Format",
      "template": "Template",
      "cvName": "CV Name",
      "search": "Search by CV name or template...",
      "showing": "Showing {{from}} to {{to}} of {{total}} entries",
      "previous": "Previous",
      "next": "Next"
    }
  }
}
```

---

## ✅ Action Items

- [ ] Create comprehensive translation keys in `en.json`
- [ ] Create Vietnamese translations in `vi.json`
- [ ] Update each page to use `t()` function
- [ ] Test language switching
- [ ] Update components
- [ ] Document i18n patterns for future development

---

## 🔗 Related Files

- Locales: `frontend/src/locales/en.json`, `frontend/src/locales/vi.json`
- Language Context: `frontend/src/contexts/LanguageContext.tsx`
- TODO List: See TODO items in IDE

---

**Note**: This is a living document. Update as you discover new hardcoded texts during implementation.

