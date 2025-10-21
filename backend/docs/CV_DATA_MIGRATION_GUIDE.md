# CV Data Structure Migration Guide

## 🎯 Overview

This guide documents the migration from legacy CV data structure to the standardized CV data structure across the entire application.

## 📋 Migration Phases

### Phase 1: Backend Entity Update ✅
- Updated `backend/src/modules/cv/entities/cv.entity.ts` to use standard interface
- Removed duplicate interface definitions
- Updated all imports to reference standard interface

### Phase 2: Import Standardization ✅
- Updated all backend files to import from standard interface
- Updated frontend to remove legacy interfaces
- Standardized all CV data references

### Phase 3: Data Migration Script ✅
- Created migration script: `1704000000000-MigrateCVDataToStandard.ts`
- Created utility script: `migrate-cv-data-to-standard.ts`
- Added npm scripts for easy execution

### Phase 4: Cleanup ✅
- Removed legacy interfaces from frontend
- Updated package.json with migration scripts
- Created comprehensive documentation

## 🚀 How to Run Migration

### Option 1: Using Migration Script (Recommended)
```bash
# Run the TypeORM migration
npm run migration:run

# This will automatically migrate all CV data to standard structure
```

### Option 2: Using Utility Script
```bash
# Run the data migration utility
npm run migrate:cv-data
```

### Option 3: Combined Migration
```bash
# Run migration + data transformation
npm run db:migrate-cv
```

## 📊 Data Transformation

### Before (Legacy Structure)
```typescript
{
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  summary: "Experienced developer...",
  experience: [
    {
      title: "Senior Developer",
      company: "Tech Corp",
      duration: "2020 - Present",
      teamSize: "5"
    }
  ],
  education: [
    {
      degree: "Computer Science",
      school: "University",
      year: "2018 - 2020"
    }
  ]
}
```

### After (Standard Structure)
```typescript
{
  contact: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890"
  },
  summary: "Experienced developer...",
  experience: [
    {
      id: "exp_0",
      title: "Senior Developer",
      company: "Tech Corp",
      startDate: "2020",
      endDate: "",
      current: true,
      teamSize: 5
    }
  ],
  education: [
    {
      id: "edu_0",
      institution: "University",
      degree: "Computer Science",
      startDate: "2018",
      endDate: "2020"
    }
  ],
  template: {
    layout: "single-column",
    sections: { /* ... */ },
    styling: { /* ... */ }
  }
}
```

## 🔧 Key Changes

### 1. Contact Information Grouping
- **Before**: `name`, `email`, `phone` as top-level fields
- **After**: All contact info grouped under `contact` object

### 2. Date Structure Normalization
- **Before**: `duration: "2020 - Present"`, `year: "2018 - 2020"`
- **After**: `startDate: "2020"`, `endDate: ""`, `current: true`

### 3. Field Name Standardization
- **Before**: `school` → **After**: `institution`
- **Before**: `techStack` → **After**: `technologies`
- **Before**: `name` (awards) → **After**: `title`

### 4. Type Improvements
- **Before**: `teamSize: "5"` (string)
- **After**: `teamSize: 5` (number)

### 5. Template Configuration
- **Before**: No template config
- **After**: Default template configuration included

## 🛡️ Safety Features

### Rollback Support
The migration includes a `down()` method for rollback:
```bash
npm run migration:revert
```

### Data Validation
- Checks if data is already in new format before migration
- Preserves all existing data
- Adds default values for missing fields

### Error Handling
- Continues migration even if individual CVs fail
- Logs detailed error information
- Provides summary of successful/failed migrations

## 📈 Migration Statistics

After running migration, you'll see:
```
🎉 Migration completed!
✅ Migrated: 150 CVs
⏭️  Skipped: 25 CVs (already in standard format)
❌ Errors: 0 CVs
📊 Total: 175 CVs
```

## 🔍 Verification

### Check Migration Status
```bash
# Check if CVs are in standard format
npm run migration:show
```

### Verify Data Structure
```sql
-- Check if contact field exists (indicates standard format)
SELECT id, "parsedData"->>'contact' as has_contact 
FROM cvs 
WHERE "parsedData" IS NOT NULL;
```

## 🚨 Important Notes

1. **Backup Database**: Always backup before running migration
2. **Test Environment**: Run migration in test environment first
3. **Monitor Logs**: Watch for any errors during migration
4. **Verify Results**: Check a few CVs manually after migration

## 🆘 Troubleshooting

### Common Issues

#### 1. Migration Fails
```bash
# Check database connection
npm run migration:show

# Check for syntax errors in migration file
npm run lint
```

#### 2. Data Not Migrating
```bash
# Check if CVs have parsedData
SELECT COUNT(*) FROM cvs WHERE "parsedData" IS NOT NULL;

# Run migration script manually
npm run migrate:cv-data
```

#### 3. Rollback Issues
```bash
# Check migration history
npm run migration:show

# Manual rollback if needed
npm run migration:revert
```

## 📞 Support

If you encounter issues:
1. Check the logs for detailed error messages
2. Verify database connection and permissions
3. Ensure all dependencies are installed
4. Contact the development team with specific error details

## 🎉 Post-Migration

After successful migration:
1. All CV data will be in standard format
2. New features will work with consistent data structure
3. AI services will have better data to work with
4. Template system will function properly
5. Export services will be more reliable

---

**Migration completed successfully! 🚀**
