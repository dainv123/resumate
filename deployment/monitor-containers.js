#!/usr/bin/env node

/**
 * Container Monitoring Script
 * Monitors Docker containers and sends email alerts when containers are down
 * 
 * Usage: node monitor-containers.js
 * Recommended: Run via cron every 5 minutes
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

// Try to load nodemailer from backend node_modules first, then global
let nodemailer;
try {
  nodemailer = require(path.join(__dirname, '..', 'backend', 'node_modules', 'nodemailer'));
} catch (e) {
  try {
    nodemailer = require('nodemailer');
  } catch (e2) {
    console.error('❌ nodemailer not found. Please install it: npm install nodemailer');
    process.exit(1);
  }
}

const execAsync = promisify(exec);

// Load environment variables from .env file in project root
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
}

// Configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || '587';
const SMTP_SECURE = process.env.SMTP_SECURE;
const MAIL_FROM = process.env.MAIL_FROM || EMAIL_USER;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'Unknown';

// Containers to monitor
const CONTAINERS = [
  { name: 'resumate-backend', label: 'Backend' },
  { name: 'resumate-frontend', label: 'Frontend' },
  { name: 'resumate-postgres', label: 'PostgreSQL' },
];

// State file to track previous status (avoid duplicate emails)
const STATE_FILE = '/tmp/resumate-container-state.json';

// Initialize state file if not exists
let previousState = { status: 'all_up', timestamp: null };
if (fs.existsSync(STATE_FILE)) {
  try {
    previousState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    console.error('Error reading state file:', e.message);
  }
}

// Email transporter
let transporter = null;
if (EMAIL_USER && EMAIL_PASSWORD) {
  // Use SMTP if SMTP_HOST is configured (recommended for App Password)
  if (SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: SMTP_SECURE === 'true' || SMTP_SECURE === true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
    console.log(`Email service initialized with SMTP: ${SMTP_HOST}:${SMTP_PORT}`);
  } else {
    // Fallback to Gmail service (backward compatibility)
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
    console.log('Email service initialized with Gmail service');
  }
}

/**
 * Check if container is running
 */
async function checkContainer(containerName) {
  try {
    const { stdout } = await execAsync(
      `docker ps --format '{{.Names}}' | grep -q "^${containerName}$" || echo "not_running"`
    );
    return stdout.trim() !== 'not_running';
  } catch (error) {
    return false;
  }
}

/**
 * Send email alert
 */
async function sendEmail(subject, html) {
  if (!transporter || !ADMIN_EMAIL) {
    console.warn('⚠️  Email not configured. Skipping email notification.');
    return;
  }

  try {
    const from = MAIL_FROM_NAME ? `${MAIL_FROM_NAME} <${MAIL_FROM}>` : MAIL_FROM;
    
    await transporter.sendMail({
      from,
      to: ADMIN_EMAIL,
      subject: subject,
      html: html,
    });
    console.log(`✅ Email sent successfully: ${subject}`);
  } catch (error) {
    console.error(`❌ Failed to send email: ${error.message}`);
  }
}

/**
 * Generate alert HTML
 */
function generateAlertHTML(containers, isRecovery = false) {
  const title = isRecovery ? '✅ Container Recovery' : '🚨 Container Alert';
  const color = isRecovery ? '#10b981' : '#ef4444';
  const statusText = isRecovery ? 'All containers are now running and healthy.' : 'The following containers are down:';

  const containerList = containers.map(c => 
    `<li><strong>${c.label}</strong> (${c.name}) - ${c.status === 'down' ? 'Container is not running' : 'Unknown status'}</li>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .detail-row { margin: 10px 0; padding: 15px; background: white; border-radius: 4px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>${statusText}</p>
          <ul>${containerList}</ul>
          <div class="detail-row">
            <strong>Timestamp:</strong> ${new Date().toISOString()}<br>
            <strong>Server:</strong> ${MAIL_FROM_NAME}<br>
            <strong>Hostname:</strong> ${require('os').hostname()}
          </div>
          ${!isRecovery ? '<p><strong>Action Required:</strong> Please check the containers and restart if necessary.</p>' : ''}
        </div>
        <div class="footer">
          <p>This is an automated notification from Resumate</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Save state
 */
function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ ...state, timestamp: new Date().toISOString() }), 'utf8');
  } catch (error) {
    console.error('Error saving state:', error.message);
  }
}

/**
 * Main monitoring function
 */
async function main() {
  console.log(`[${new Date().toISOString()}] 🔍 Starting container monitoring...`);

  const results = [];
  let alertNeeded = false;

  // Check all containers
  for (const container of CONTAINERS) {
    const isRunning = await checkContainer(container.name);
    results.push({
      ...container,
      status: isRunning ? 'up' : 'down',
      isRunning,
    });

    if (!isRunning) {
      alertNeeded = true;
      console.log(`❌ ${container.label} (${container.name}) is DOWN`);
    } else {
      console.log(`✅ ${container.label} (${container.name}) is running`);
    }
  }

  // Handle alerts
  if (alertNeeded) {
    // Only send email if state changed (avoid spam)
    if (previousState.status !== 'down') {
      console.log('📧 Sending alert email...');
      const downContainers = results.filter(r => !r.isRunning);
      await sendEmail(
        '🚨 Resumate Container Alert - Containers Down',
        generateAlertHTML(downContainers, false)
      );
      saveState({ status: 'down' });
    } else {
      console.log('⚠️  Containers still down (email already sent previously)');
    }
  } else {
    // All containers are up
    if (previousState.status !== 'all_up') {
      console.log('✅ All containers recovered! Sending recovery email...');
      await sendEmail(
        '✅ Resumate Container Recovery - All Systems Operational',
        generateAlertHTML([], true)
      );
      saveState({ status: 'all_up' });
    } else {
      console.log('✅ All containers are running and healthy');
    }
  }

  console.log(`[${new Date().toISOString()}] ✅ Monitoring check completed`);
}

// Run monitoring
main().catch(error => {
  console.error('❌ Monitoring script error:', error);
  process.exit(1);
});

