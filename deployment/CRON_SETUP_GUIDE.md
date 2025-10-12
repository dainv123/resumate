# 📅 Cron Job Setup Guide - Automated Backups

## 🚀 Quick Setup

### Method 1: Automated Script (Recommended)

```bash
cd /Users/dainguyen/Documents/project/resumate/deployment
chmod +x setup-cronjobs.sh
./setup-cronjobs.sh
```

**This will:**
- ✅ Create backup directories
- ✅ Install cron jobs for daily/weekly backups
- ✅ Setup log rotation
- ✅ Configure health checks
- ✅ Backup existing crontab

---

### Method 2: Manual Setup

#### Step 1: Create Directories

```bash
sudo mkdir -p /backups/{postgres,redis}
sudo mkdir -p /var/log/resumate-backups
sudo chmod 755 /backups /var/log/resumate-backups
```

#### Step 2: Make Scripts Executable

```bash
cd /Users/dainguyen/Documents/project/resumate/deployment
chmod +x backup-postgres.sh backup-redis.sh cleanup-backups.sh
```

#### Step 3: Edit Crontab

```bash
crontab -e
```

#### Step 4: Add These Lines

```cron
# Resumate Automated Backups
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin
PROJECT_ROOT=/Users/dainguyen/Documents/project/resumate

# Daily PostgreSQL backup (2 AM)
0 2 * * * $PROJECT_ROOT/deployment/backup-postgres.sh >> /var/log/resumate-backups/postgres.log 2>&1

# Weekly Redis backup (Sunday 3 AM)
0 3 * * 0 $PROJECT_ROOT/deployment/backup-redis.sh >> /var/log/resumate-backups/redis.log 2>&1

# Monthly cleanup (1st, 4 AM)
0 4 1 * * $PROJECT_ROOT/deployment/cleanup-backups.sh >> /var/log/resumate-backups/cleanup.log 2>&1

# Daily health check (6 AM)
0 6 * * * curl -s http://localhost:5001/api/health/rate-limit-status >> /var/log/resumate-backups/health.log 2>&1
```

#### Step 5: Save and Exit

- **vim**: `:wq`
- **nano**: `Ctrl+X`, then `Y`, then `Enter`

---

## 📅 Backup Schedule

| Task | Frequency | Time | Retention |
|------|-----------|------|-----------|
| **PostgreSQL Backup** | Daily | 2:00 AM | 30 days |
| **Redis Backup** | Weekly | Sunday 3:00 AM | 8 weeks |
| **Cleanup Old Backups** | Monthly | 1st, 4:00 AM | - |
| **Health Check** | Daily | 6:00 AM | Logs only |
| **Memory Check** | Weekly | Monday 1:00 AM | Logs only |

---

## 🔧 Customization

### Change Backup Time

```cron
# Change PostgreSQL backup to 3:00 AM
0 3 * * * /path/to/backup-postgres.sh
```

### Change Frequency

```cron
# Backup every 12 hours
0 */12 * * * /path/to/backup-postgres.sh

# Backup twice per week (Sunday and Wednesday)
0 2 * * 0,3 /path/to/backup-postgres.sh
```

### Change Retention

Edit the backup scripts:

```bash
# In backup-postgres.sh
RETENTION_DAYS=60  # Keep 60 days instead of 30

# In backup-redis.sh
RETENTION_WEEKS=12  # Keep 12 weeks instead of 8
```

---

## 📊 Monitoring Cron Jobs

### Check if Cron Jobs are Installed

```bash
crontab -l | grep -i resumate
```

Expected output:
```
# Resumate Automated Backups
0 2 * * * /path/to/backup-postgres.sh...
0 3 * * 0 /path/to/backup-redis.sh...
```

### View Logs

```bash
# PostgreSQL backup logs
tail -f /var/log/resumate-backups/postgres-backup.log

# Redis backup logs
tail -f /var/log/resumate-backups/redis-backup.log

# All logs
tail -f /var/log/resumate-backups/*.log
```

### Check Last Backup

```bash
# PostgreSQL
ls -lht /backups/postgres/ | head -5

# Redis
ls -lht /backups/redis/ | head -5
```

### Check Cron Service Status

```bash
# macOS
sudo launchctl list | grep cron

# Linux
sudo systemctl status cron
# or
sudo systemctl status crond
```

---

## 🧪 Test Cron Jobs

### Test Backup Scripts Manually

```bash
# Test PostgreSQL backup
cd /Users/dainguyen/Documents/project/resumate/deployment
./backup-postgres.sh

# Expected: Creates file in /backups/postgres/
ls -lh /backups/postgres/

# Test Redis backup
./backup-redis.sh

# Expected: Creates file in /backups/redis/
ls -lh /backups/redis/
```

### Run Cron Job Immediately

```bash
# Run specific command from crontab
/Users/dainguyen/Documents/project/resumate/deployment/backup-postgres.sh

# Check if it worked
ls -lh /backups/postgres/ | head -1
```

---

## 📧 Email Notifications (Optional)

### Setup Email on Cron Failures

```cron
MAILTO=your@email.com

0 2 * * * /path/to/backup-postgres.sh || echo "Backup failed!" | mail -s "Backup Alert" your@email.com
```

### Using a Monitoring Service

```bash
# Add to cron job
0 2 * * * /path/to/backup-postgres.sh && curl https://hc-ping.com/your-uuid
```

Services:
- **Healthchecks.io** - Free for up to 20 checks
- **Cronitor** - Cron job monitoring
- **UptimeRobot** - HTTP monitoring

---

## 🚨 Troubleshooting

### Cron Job Not Running

**Check cron is running:**
```bash
# macOS
ps aux | grep cron

# Linux
sudo systemctl status cron
```

**Check logs:**
```bash
# macOS
tail -f /var/log/cron.log

# Linux
sudo tail -f /var/log/syslog | grep CRON
```

### Permission Errors

```bash
# Make scripts executable
chmod +x /Users/dainguyen/Documents/project/resumate/deployment/*.sh

# Check backup directory permissions
ls -ld /backups
sudo chmod 755 /backups
```

### Docker Not Found in Cron

Add full paths:
```cron
PATH=/usr/local/bin:/usr/bin:/bin
0 2 * * * /usr/local/bin/docker exec...
```

### Logs Not Created

```bash
# Create log directory
sudo mkdir -p /var/log/resumate-backups
sudo chmod 755 /var/log/resumate-backups

# Test logging
echo "test" >> /var/log/resumate-backups/test.log
```

---

## 🔄 Backup Verification

### Create Verification Script

```bash
#!/bin/bash
# check-backups.sh

BACKUP_DIR="/backups"
ALERT_EMAIL="your@email.com"

# Check PostgreSQL backup
PG_BACKUP=$(find $BACKUP_DIR/postgres -name "postgres-*.sql.gz" -mtime -1 | wc -l)
if [ $PG_BACKUP -eq 0 ]; then
    echo "❌ No PostgreSQL backup found in last 24 hours" | mail -s "Backup Alert" $ALERT_EMAIL
else
    echo "✅ PostgreSQL backup OK"
fi

# Check Redis backup
REDIS_BACKUP=$(find $BACKUP_DIR/redis -name "redis-*.rdb" -mtime -7 | wc -l)
if [ $REDIS_BACKUP -eq 0 ]; then
    echo "❌ No Redis backup found in last 7 days" | mail -s "Backup Alert" $ALERT_EMAIL
else
    echo "✅ Redis backup OK"
fi
```

Add to crontab:
```cron
# Daily backup verification (8 AM)
0 8 * * * /path/to/check-backups.sh >> /var/log/resumate-backups/verification.log 2>&1
```

---

## 📦 Off-site Backup (Recommended for Production)

### Sync to S3

```bash
#!/bin/bash
# sync-to-s3.sh

aws s3 sync /backups/postgres/ s3://your-bucket/backups/postgres/ --delete
aws s3 sync /backups/redis/ s3://your-bucket/backups/redis/ --delete
```

Add to crontab:
```cron
# Sync to S3 every 6 hours
0 */6 * * * /path/to/sync-to-s3.sh >> /var/log/resumate-backups/s3-sync.log 2>&1
```

### Sync to Another Server

```bash
#!/bin/bash
# rsync-backups.sh

rsync -avz --delete /backups/ user@backup-server:/remote/backups/
```

---

## 🗑️ Remove Cron Jobs

### Remove All Resumate Cron Jobs

```bash
crontab -l | grep -v "Resumate" | grep -v "backup-postgres" | crontab -
```

### Remove Completely

```bash
crontab -r  # ⚠️ This removes ALL cron jobs!
```

---

## 📚 Cron Syntax Reference

```
*  *  *  *  *  command
│  │  │  │  │
│  │  │  │  └── Day of week (0-7, Sunday = 0 or 7)
│  │  │  └───── Month (1-12)
│  │  └──────── Day of month (1-31)
│  └───────────── Hour (0-23)
└──────────────── Minute (0-59)
```

### Examples

```cron
0 2 * * *          # Every day at 2:00 AM
0 */6 * * *        # Every 6 hours
30 3 * * 1         # Every Monday at 3:30 AM
0 0 1 * *          # 1st of every month at midnight
0 2 * * 1-5        # Weekdays at 2:00 AM
0 3 1,15 * *       # 1st and 15th at 3:00 AM
*/15 * * * *       # Every 15 minutes
0 2-4 * * *        # Every day at 2 AM, 3 AM, and 4 AM
```

---

## ✅ Verification Checklist

After setup:

- [ ] Cron service is running
- [ ] Backup scripts are executable
- [ ] Backup directories exist with correct permissions
- [ ] Log directories exist
- [ ] Cron jobs are installed (`crontab -l`)
- [ ] Test backup runs successfully
- [ ] Logs are being created
- [ ] Docker commands work from cron
- [ ] Disk space is sufficient
- [ ] (Optional) Email notifications configured
- [ ] (Optional) Off-site backup configured

---

## 📞 Quick Reference

```bash
# View crontab
crontab -l

# Edit crontab
crontab -e

# Remove crontab
crontab -r

# Run setup script
./deployment/setup-cronjobs.sh

# Test backup
./deployment/backup-postgres.sh

# View logs
tail -f /var/log/resumate-backups/*.log

# Check last backup
ls -lht /backups/postgres/ | head -5
```

---

**✅ Automated backups are now configured!**

Monitor logs regularly to ensure backups are running successfully.

