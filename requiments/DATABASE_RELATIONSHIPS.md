# Database Relationship Diagram - UPDATED

## 🗂️ Entity Relationships (After Implementation)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    USER                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id: uuid (PK)                                                                    │
│ email: string                                                                   │
│ name: string                                                                    │
│ createdAt: timestamp                                                            │
│ updatedAt: timestamp                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 1:N
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 CV (Original)                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id: uuid (PK)                                                                    │
│ userId: uuid (FK) → USER.id                                                      │
│ originalFileName: string                                                         │
│ fileUrl: string                                                                 │
│ parsedData: jsonb                                                                │
│ version: number (default: 1)                                                     │
│ isTailored: boolean (default: false)                                           │
│ originalCvId: null                                                              │
│ jobDescriptionId: null                                                           │
│ createdAt: timestamp                                                            │
│ updatedAt: timestamp                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 1:N (tailoredVersions)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 CV (Tailored)                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id: uuid (PK)                                                                    │
│ userId: uuid (FK) → USER.id                                                      │
│ originalFileName: string (e.g., "resume_tailored.pdf")                          │
│ fileUrl: string (same as original)                                              │
│ parsedData: jsonb (AI-tailored content)                                         │
│ version: number (original.version + 1)                                          │
│ isTailored: boolean (true)                                                      │
│ originalCvId: uuid (FK) → CV.id (original)                                     │
│ jobDescriptionId: uuid (FK) → JOB_DESCRIPTION.id                               │
│ createdAt: timestamp                                                            │
│ updatedAt: timestamp                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ N:1
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              JOB DESCRIPTION                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id: uuid (PK)                                                                    │
│ userId: uuid (FK) → USER.id                                                      │
│ title: string                                                                    │
│ description: text                                                                │
│ company: string (nullable)                                                       │
│ location: string (nullable)                                                     │
│ salary: string (nullable)                                                       │
│ experience: string (nullable)                                                   │
│ requirements: jsonb (nullable)                                                   │
│ keywords: jsonb (nullable)                                                      │
│ createdAt: timestamp                                                            │
│ updatedAt: timestamp                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 1:N
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CV MATCHING ANALYSIS                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id: uuid (PK)                                                                    │
│ jobDescriptionId: uuid (FK) → JOB_DESCRIPTION.id                               │
│ userId: uuid (FK) → USER.id                                                      │
│ jobDescription: jsonb (JD data snapshot)                                         │
│ score: number                                                                    │
│ matchedSkills: jsonb                                                             │
│ missingSkills: jsonb                                                             │
│ suggestions: jsonb                                                               │
│ strengths: jsonb                                                                 │
│ notes: text (nullable)                                                           │
│ createdAt: timestamp                                                            │
│ updatedAt: timestamp                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ 1:1
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             CV COVER LETTER                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ id: uuid (PK)                                                                    │
│ jobDescriptionId: uuid (FK) → JOB_DESCRIPTION.id                               │
│ userId: uuid (FK) → USER.id                                                      │
│ jobDescription: jsonb (JD data snapshot)                                         │
│ content: text                                                                    │
│ personalizedContent: text (nullable)                                             │
│ tone: string (default: 'professional')                                          │
│ format: string (default: 'standard')                                            │
│ wordCount: number (default: 0)                                                  │
│ isCustomized: boolean (default: false)                                          │
│ notes: text (nullable)                                                           │
│ createdAt: timestamp                                                            │
│ updatedAt: timestamp                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 Relationship Details (UPDATED)

### 1. **USER → CV (Original)**
- **Type**: One-to-Many
- **Description**: One user can have multiple original CVs
- **Foreign Key**: `CV.userId → USER.id`

### 2. **CV (Original) → CV (Tailored)**
- **Type**: One-to-Many
- **Description**: One original CV can have multiple tailored versions
- **Foreign Key**: `CV.originalCvId → CV.id` (self-referencing)

### 3. **JOB DESCRIPTION → CV (Tailored)**
- **Type**: One-to-Many
- **Description**: One job description can have multiple tailored CVs
- **Foreign Key**: `CV.jobDescriptionId → JOB_DESCRIPTION.id`

### 4. **JOB DESCRIPTION → CV MATCHING ANALYSIS**
- **Type**: One-to-Many
- **Description**: One job description can have multiple analysis records (for different CVs)
- **Foreign Key**: `CV_MATCHING_ANALYSIS.jobDescriptionId → JOB_DESCRIPTION.id`
- **Benefit**: Reuse analysis for multiple CVs with same JD

### 5. **JOB DESCRIPTION → CV COVER LETTER**
- **Type**: One-to-Many
- **Description**: One job description can have multiple cover letters (for different CVs)
- **Foreign Key**: `CV_COVER_LETTER.jobDescriptionId → JOB_DESCRIPTION.id`
- **Benefit**: Reuse cover letter template for multiple CVs with same JD

## 📊 Data Flow Example (UPDATED)

```
1. User uploads CV
   ↓
   CV (Original) created with isTailored=false

2. User enters Job Description
   ↓
   JOB DESCRIPTION created

3. User clicks "Analyze Compatibility"
   ↓
   CV_MATCHING_ANALYSIS created with jobDescriptionId

4. User clicks "Generate Cover Letter"
   ↓
   CV_COVER_LETTER created with jobDescriptionId

5. User clicks "Tailor CV"
   ↓
   CV (Tailored) created with:
   - originalCvId → Original CV
   - jobDescriptionId → Job Description
   - isTailored=true

6. User uses SAME JD for different CV
   ↓
   Reuse existing analysis & cover letter (no re-analysis needed)
```

## 🎯 Key Relationships Summary

| Entity | Relationship | Target | Type | Description |
|--------|-------------|--------|------|-------------|
| USER | has many | CV (Original) | 1:N | User owns multiple CVs |
| CV (Original) | has many | CV (Tailored) | 1:N | Original CV has tailored versions |
| JOB DESCRIPTION | has many | CV (Tailored) | 1:N | Job description has tailored CVs |
| JOB DESCRIPTION | has many | CV_MATCHING_ANALYSIS | 1:N | JD can have multiple analyses |
| JOB DESCRIPTION | has many | CV_COVER_LETTER | 1:N | JD can have multiple cover letters |
| USER | has many | CV_MATCHING_ANALYSIS | 1:N | User owns multiple analyses |
| USER | has many | CV_COVER_LETTER | 1:N | User owns multiple cover letters |

## 💡 Benefits of This Design (FINAL)

1. **Preserves Original**: Original CV never modified
2. **Version Control**: Each tailored CV is a new version
3. **Reusable Analysis**: Same JD can be used for multiple CVs
4. **Reusable Cover Letters**: Same JD can generate multiple cover letters
5. **Data Integrity**: All related data linked properly
6. **Scalable**: Can handle multiple JDs per CV
7. **Audit Trail**: Full history of tailoring process
8. **Performance**: No need to re-analyze same JD
9. **Storage Efficient**: No duplicate analysis data
10. **User Experience**: Faster analysis for repeated JDs

## 🔄 Reuse Scenarios

### Scenario 1: Same JD, Different CVs
```
JD: "Senior React Developer at Google"
├── Analysis 1: CV-A → Score: 8/10
├── Analysis 2: CV-B → Score: 7/10  
├── Cover Letter 1: CV-A → Professional tone
└── Cover Letter 2: CV-B → Casual tone
```

### Scenario 2: Same CV, Different JDs
```
CV: "John's Resume"
├── JD 1: "React Developer" → Analysis + Cover Letter
├── JD 2: "Vue Developer" → Analysis + Cover Letter
└── JD 3: "Full Stack Developer" → Analysis + Cover Letter
```

## 🚀 Implementation Status

### ✅ Completed:
- **Entities**: CvMatchingAnalysis & CvCoverLetter link to JobDescription
- **Migrations**: 4 migration files ready for database restructuring
- **Backend Services**: CvService updated with reuse logic
- **API Controllers**: New endpoints for analysis/cover letter management
- **Frontend**: Updated lib/cv.ts and Job Tailor UI with reuse detection
- **Translations**: Added reuse messages in English and Vietnamese

### 🔄 In Progress:
- **Data Cleanup**: Scheduled cleanup for stale snapshots
- **Testing**: Migration verification and E2E tests
- **Rollout**: Staging deployment plan

### 📊 Expected Results:
- **Performance**: 60-70% faster analysis for repeated JDs
- **Storage**: Optimized snapshots with essential fields only
- **UX**: Clear feedback when content is reused vs generated
- **Scalability**: Support for multiple CVs per JD
