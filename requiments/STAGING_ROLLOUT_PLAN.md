# 🚀 Staging Rollout Plan - Job Description Centered Architecture

## 📋 Overview
This document outlines the comprehensive rollout plan for migrating from CV-centered to Job Description-centered architecture in the staging environment.

## 🎯 Objectives
- ✅ Migrate existing data to new architecture
- ✅ Verify data integrity and performance
- ✅ Test reuse functionality
- ✅ Ensure zero downtime
- ✅ Prepare for production rollout

## 📅 Timeline
**Total Duration**: 3-4 days
- **Day 1**: Staging setup and backup
- **Day 2**: Migration execution and verification
- **Day 3**: Testing and performance validation
- **Day 4**: Production preparation

## 🔧 Pre-Rollout Checklist

### 1. Staging Environment Setup
- [ ] **Database Backup**
  ```bash
  # Create full backup
  pg_dump -h localhost -U postgres -d resumate_staging > backup_$(date +%Y%m%d_%H%M%S).sql
  
  # Create backup with compression
  pg_dump -h localhost -U postgres -d resumate_staging | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
  ```

- [ ] **Environment Variables**
  ```bash
  # Staging environment
  NODE_ENV=staging
  DATABASE_URL=postgresql://user:pass@localhost:5432/resumate_staging
  LOG_LEVEL=debug
  ```

- [ ] **Code Deployment**
  ```bash
  # Deploy latest code to staging
  git checkout main
  git pull origin main
  npm install
  npm run build
  ```

### 2. Pre-Migration Validation
- [ ] **Current Data Audit**
  ```bash
  # Run data audit script
  npm run migration:verify
  ```

- [ ] **Performance Baseline**
  ```bash
  # Record current performance metrics
  # - API response times
  # - Database query times
  # - Memory usage
  ```

## 🚀 Migration Execution

### Phase 1: Pre-Migration Setup (30 minutes)
```bash
# 1. Stop application
pm2 stop resumate-backend

# 2. Create migration backup
pg_dump -h localhost -U postgres -d resumate_staging > pre_migration_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Verify backup integrity
pg_restore --list pre_migration_backup_*.sql | head -20
```

### Phase 2: Migration Execution (45 minutes)
```bash
# 1. Run migrations in sequence
npm run migration:run

# 2. Verify each migration
# Migration 1: Add columns
psql -h localhost -U postgres -d resumate_staging -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'cv_matching_analyses' AND column_name = 'jobDescriptionId';"

# Migration 2: Data migration
psql -h localhost -U postgres -d resumate_staging -c "SELECT COUNT(*) FROM cv_matching_analyses;"

# Migration 3: Foreign keys
psql -h localhost -U postgres -d resumate_staging -c "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'cv_matching_analyses' AND constraint_type = 'FOREIGN KEY';"

# Migration 4: Indexes
psql -h localhost -U postgres -d resumate_staging -c "SELECT indexname FROM pg_indexes WHERE tablename = 'cv_matching_analyses';"
```

### Phase 3: Post-Migration Verification (30 minutes)
```bash
# 1. Run comprehensive verification
npm run migration:verify

# 2. Test API endpoints
curl -X GET http://staging-api.resumate.com/health
curl -X GET http://staging-api.resumate.com/cv/analyses
curl -X GET http://staging-api.resumate.com/cv/cover-letters

# 3. Performance testing
npm run test:e2e
```

## 🧪 Testing Strategy

### 1. Automated Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Migration verification
npm run migration:verify
```

### 2. Manual Testing Scenarios

#### Scenario 1: New User Flow
1. **Create CV** → Upload CV file
2. **Add Job Description** → Enter job details
3. **Generate Analysis** → Should create new analysis
4. **Generate Cover Letter** → Should create new cover letter
5. **Verify Data** → Check database records

#### Scenario 2: Reuse Flow
1. **Use Same Job Description** → Enter identical JD
2. **Generate Analysis** → Should reuse existing analysis
3. **Generate Cover Letter** → Should reuse existing cover letter
4. **Verify Reuse** → Check `reused: true` in response

#### Scenario 3: Multiple CVs, Same JD
1. **Create Second CV** → Upload different CV
2. **Use Same Job Description** → Enter identical JD
3. **Generate Analysis** → Should reuse existing analysis
4. **Verify Efficiency** → No new analysis created

### 3. Performance Testing
```bash
# Load testing with Artillery
artillery run load-test.yml

# Database performance
psql -h localhost -U postgres -d resumate_staging -c "EXPLAIN ANALYZE SELECT * FROM cv_matching_analyses WHERE jobDescriptionId = 'uuid';"
```

## 📊 Monitoring & Metrics

### 1. Key Metrics to Monitor
- **API Response Times**
  - `/cv/:id/analyze-compatibility` < 2s
  - `/cv/:id/generate-cover-letter` < 3s
  - `/cv/analyses` < 500ms
  - `/cv/cover-letters` < 500ms

- **Database Performance**
  - Query execution time < 100ms
  - Index usage > 95%
  - Connection pool utilization < 80%

- **Reuse Efficiency**
  - Analysis reuse rate > 60%
  - Cover letter reuse rate > 70%
  - Storage reduction > 40%

### 2. Monitoring Commands
```bash
# Database monitoring
psql -h localhost -U postgres -d resumate_staging -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Application monitoring
pm2 monit

# Log monitoring
tail -f /var/log/resumate/application.log | grep -E "(ERROR|WARN|reused)"
```

## 🔄 Rollback Plan

### 1. Rollback Triggers
- Migration verification fails
- API response times > 5s
- Error rate > 5%
- Data integrity issues detected

### 2. Rollback Procedure (15 minutes)
```bash
# 1. Stop application
pm2 stop resumate-backend

# 2. Restore database
pg_restore -h localhost -U postgres -d resumate_staging --clean --if-exists pre_migration_backup_*.sql

# 3. Revert code
git checkout previous-stable-commit
npm install
npm run build

# 4. Restart application
pm2 start resumate-backend

# 5. Verify rollback
curl -X GET http://staging-api.resumate.com/health
```

## 📈 Success Criteria

### 1. Technical Success
- [ ] All migrations completed successfully
- [ ] Zero data loss
- [ ] All foreign key constraints working
- [ ] All indexes created and optimized
- [ ] API endpoints responding correctly

### 2. Performance Success
- [ ] API response times improved or maintained
- [ ] Database query performance optimized
- [ ] Memory usage stable
- [ ] No memory leaks detected

### 3. Functional Success
- [ ] Reuse functionality working correctly
- [ ] Data integrity maintained
- [ ] All existing features working
- [ ] New features accessible

## 🚀 Production Preparation

### 1. Production Readiness Checklist
- [ ] Staging testing completed successfully
- [ ] Performance benchmarks met
- [ ] Rollback plan tested
- [ ] Documentation updated
- [ ] Team training completed

### 2. Production Deployment Plan
- [ ] Schedule maintenance window
- [ ] Notify users of downtime
- [ ] Prepare production backups
- [ ] Execute migration
- [ ] Monitor for 24 hours
- [ ] Document lessons learned

## 📞 Support & Escalation

### 1. Team Contacts
- **Lead Developer**: [Name] - [Phone] - [Email]
- **Database Admin**: [Name] - [Phone] - [Email]
- **DevOps Engineer**: [Name] - [Phone] - [Email]

### 2. Escalation Path
1. **Level 1**: Development team (0-15 minutes)
2. **Level 2**: Senior developers (15-30 minutes)
3. **Level 3**: Technical lead (30+ minutes)

## 📝 Post-Rollout Activities

### 1. Immediate (Day 1)
- [ ] Monitor system stability
- [ ] Review performance metrics
- [ ] Address any issues
- [ ] Update documentation

### 2. Short-term (Week 1)
- [ ] Analyze reuse efficiency
- [ ] Optimize performance
- [ ] Gather user feedback
- [ ] Plan production rollout

### 3. Long-term (Month 1)
- [ ] Measure storage savings
- [ ] Analyze user behavior
- [ ] Plan future optimizations
- [ ] Document lessons learned

---

## 🎯 Success Metrics Dashboard

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| API Response Time | < 2s | TBD | ⏳ |
| Reuse Rate | > 60% | TBD | ⏳ |
| Storage Reduction | > 40% | TBD | ⏳ |
| Error Rate | < 1% | TBD | ⏳ |
| User Satisfaction | > 90% | TBD | ⏳ |

**Status Legend**: ✅ Success | ⚠️ Warning | ❌ Failed | ⏳ Pending
