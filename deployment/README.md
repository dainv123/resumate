# Deployment Scripts

Collection of deployment, testing, and development utility scripts.

## 📋 Scripts Overview

### Development

#### `start-dev.sh`
Start local development environment
- Starts backend on port 5001
- Starts frontend on port 5000
- Monitors both processes

**Usage:**
```bash
./deployment/start-dev.sh
```

#### `docker-dev.sh`
Start development using Docker containers
- Uses docker-compose
- Hot reload enabled
- Local development mode

**Usage:**
```bash
./deployment/docker-dev.sh
```

---

### Deployment

#### `redeploy.sh`
Full redeployment script for production
- Builds Docker images
- Updates containers
- Handles migrations
- Zero-downtime deployment

**Usage:**
```bash
./deployment/redeploy.sh
```

#### `docker-deploy.sh`
Deploy using Docker
- Production build
- Optimized images
- Container orchestration

**Usage:**
```bash
./deployment/docker-deploy.sh
```

---

### Testing

#### `test-job-tailor-features.sh` 🆕
Integration tests for Job Tailor features
- Tests compatibility analysis API
- Tests cover letter generation API
- Validates responses

**Prerequisites:**
- Backend running on http://localhost:5001
- Frontend running on http://localhost:5000
- At least one CV uploaded

**Usage:**
```bash
# From project root
./deployment/test-job-tailor-features.sh

# From deployment folder
cd deployment && ./test-job-tailor-features.sh
```

**What it tests:**
- ✅ Compatibility Analysis (score, matched/missing skills)
- ✅ Cover Letter Generation (format, content)

---

### Maintenance

#### `safe-cleanup.sh`
Safe cleanup of Docker resources
- Removes stopped containers
- Cleans up unused images
- Preserves production data

**Usage:**
```bash
./deployment/safe-cleanup.sh
```

#### `deploy-pdf-fix.sh`
Specific fix deployment for PDF generation
- Updates PDF service
- Applies patches
- Restarts affected services

**Usage:**
```bash
./deployment/deploy-pdf-fix.sh
```

---

## 🚀 Quick Start

### Local Development

```bash
# Start development servers
./deployment/start-dev.sh
```

### Run Tests

```bash
# Test new features
./deployment/test-job-tailor-features.sh
```

### Deploy to Production

```bash
# Full redeployment
./deployment/redeploy.sh
```

---

## 📁 File Permissions

All scripts should be executable:

```bash
chmod +x deployment/*.sh
```

---

## 🔍 Troubleshooting

### Script Won't Run
```bash
# Make executable
chmod +x deployment/script-name.sh

# Check path
ls -la deployment/script-name.sh
```

### API Tests Fail
```bash
# Check backend is running
curl http://localhost:5001/api/health

# Check frontend is running
curl http://localhost:5000

# Verify CV exists
curl http://localhost:5001/cv \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Docker Issues
```bash
# Clean up
./deployment/safe-cleanup.sh

# Restart
./deployment/docker-dev.sh
```

---

## 📝 Adding New Scripts

When adding new deployment scripts:

1. Place in `deployment/` folder
2. Add shebang: `#!/bin/bash`
3. Add header documentation
4. Make executable: `chmod +x script.sh`
5. Update this README
6. Test from both root and deployment directory

**Template:**
```bash
#!/bin/bash

# ============================================================================
# Script Name
# ============================================================================
# Description of what the script does
# 
# Usage:
#   From project root:  ./deployment/script-name.sh
#   From deployment:    ./script-name.sh
#
# Prerequisites:
#   - List prerequisites here
# ============================================================================

# Your script here
```

---

## 🔐 Security Notes

- Never commit tokens/secrets in scripts
- Use environment variables for sensitive data
- Review scripts before running in production

---

## 📚 Related Documentation

- [Custom Domain Guide](../requiments/CUSTOM_DOMAIN_GUIDE.md)
- Main [README](../README.md)
- [API Documentation](../docs/api.md)

---

Last updated: October 10, 2025


