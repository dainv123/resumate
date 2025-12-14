import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../users/entities/user.entity';
import { Cv } from '../cv/entities/cv.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialize email transporter
    const emailUser = this.configService.get('EMAIL_USER');
    const emailPassword = this.configService.get('EMAIL_PASSWORD');
    const smtpHost = this.configService.get('SMTP_HOST');

    if (emailUser && emailPassword) {
      // Use SMTP if SMTP_HOST is configured (recommended for App Password)
      if (smtpHost) {
        const smtpPort = this.configService.get('SMTP_PORT') || '587';
        const smtpSecure = this.configService.get('SMTP_SECURE');
        
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort, 10),
          secure: smtpSecure === 'true' || smtpSecure === true,
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });
        this.logger.log(`Email service initialized with SMTP: ${smtpHost}:${smtpPort}`);
      } else {
        // Fallback to Gmail service (backward compatibility)
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });
        this.logger.log('Email service initialized with Gmail service');
      }
    } else {
      this.logger.warn(
        'Email service not configured. Notifications will be logged only.',
      );
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `Email not sent (service not configured): ${subject} to ${to}`,
      );
      return;
    }

    try {
      // Use MAIL_FROM if configured, otherwise use EMAIL_USER
      const fromEmail = this.configService.get('MAIL_FROM') || this.configService.get('EMAIL_USER');
      const fromName = this.configService.get('MAIL_FROM_NAME');
      const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully: ${subject} to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  async notifyCvParsed(user: User, cv: Cv): Promise<void> {
    const subject = 'Your CV has been parsed successfully!';
    const html = this.getCvParsedTemplate(user.name, cv);

    try {
      await this.sendEmail(user.email, subject, html);
    } catch (error) {
      this.logger.error(
        `Failed to send CV parsed notification: ${error.message}`,
      );
    }
  }

  async notifyExportReady(
    user: User,
    filename: string,
    format: string,
  ): Promise<void> {
    const subject = `Your CV export is ready (${format.toUpperCase()})`;
    const html = this.getExportReadyTemplate(user.name, filename, format);

    try {
      await this.sendEmail(user.email, subject, html);
    } catch (error) {
      this.logger.error(
        `Failed to send export ready notification: ${error.message}`,
      );
    }
  }

  async notifyTailorComplete(user: User, jobTitle: string): Promise<void> {
    const subject = 'Your tailored CV is ready!';
    const html = this.getTailorCompleteTemplate(user.name, jobTitle);

    try {
      await this.sendEmail(user.email, subject, html);
    } catch (error) {
      this.logger.error(
        `Failed to send tailor complete notification: ${error.message}`,
      );
    }
  }

  async notifyServerError(errorDetails: {
    method: string;
    url: string;
    error: string;
    message: string;
    stack?: string;
    statusCode: number;
    timestamp: string;
    userAgent?: string;
    ip?: string;
  }): Promise<void> {
    const adminEmail = this.configService.get('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn(
        'ADMIN_EMAIL not configured. Server error notifications will not be sent.',
      );
      return;
    }

    // Get status code description
    const statusMessages: Record<number, string> = {
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
      505: 'HTTP Version Not Supported',
    };

    const statusMessage =
      statusMessages[errorDetails.statusCode] || 'Server Error';
    const subject = `🚨 Server Error Alert [${errorDetails.statusCode}] - ${statusMessage}`;
    const html = this.getServerErrorTemplate(errorDetails);

    try {
      await this.sendEmail(adminEmail, subject, html);
    } catch (error) {
      this.logger.error(
        `Failed to send server error notification: ${error.message}`,
      );
      // Don't throw - we don't want to fail the request if email fails
    }
  }

  // Email Templates

  private getCvParsedTemplate(userName: string, cv: Cv): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ CV Parsed Successfully!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Great news! Your CV <strong>${cv.originalFileName}</strong> has been successfully parsed and analyzed.</p>
            <p><strong>What's next?</strong></p>
            <ul>
              <li>Review your parsed CV data in the dashboard</li>
              <li>Tailor it for specific job descriptions</li>
              <li>Export in multiple formats (PDF, Word, ATS)</li>
              <li>Create a beautiful portfolio</li>
            </ul>
            <a href="${this.configService.get('FRONTEND_URL')}/dashboard/cv" class="button">View My CVs</a>
          </div>
          <div class="footer">
            <p>This is an automated message from Resumate</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getExportReadyTemplate(
    userName: string,
    filename: string,
    format: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📥 Export Ready!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your CV has been exported successfully!</p>
            <p><strong>Export Details:</strong></p>
            <ul>
              <li>Format: ${format.toUpperCase()}</li>
              <li>File: ${filename}</li>
            </ul>
            <p>The file has been downloaded to your device. You can also access it from your dashboard anytime.</p>
            <a href="${this.configService.get('FRONTEND_URL')}/dashboard/cv" class="button">Go to Dashboard</a>
          </div>
          <div class="footer">
            <p>This is an automated message from Resumate</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getTailorCompleteTemplate(
    userName: string,
    jobTitle: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Tailored CV Ready!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your CV has been successfully tailored for the job: <strong>${jobTitle}</strong></p>
            <p><strong>What was optimized:</strong></p>
            <ul>
              <li>Keywords matched to job requirements</li>
              <li>Relevant experience highlighted</li>
              <li>Skills prioritized by importance</li>
              <li>ATS-optimized formatting</li>
            </ul>
            <p>Review your tailored CV and export it when ready!</p>
            <a href="${this.configService.get('FRONTEND_URL')}/dashboard/job-tailor" class="button">View Tailored CV</a>
          </div>
          <div class="footer">
            <p>This is an automated message from Resumate</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getServerErrorTemplate(errorDetails: {
    method: string;
    url: string;
    error: string;
    message: string;
    stack?: string;
    statusCode: number;
    timestamp: string;
    userAgent?: string;
    ip?: string;
  }): string {
    const statusMessages: Record<number, string> = {
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
      505: 'HTTP Version Not Supported',
    };

    const statusMessage =
      statusMessages[errorDetails.statusCode] || 'Server Error';

    // Different colors for different error types
    const errorColors: Record<number, string> = {
      500: '#ef4444', // Red
      502: '#f59e0b', // Orange
      503: '#f97316', // Orange-red
      504: '#dc2626', // Dark red
      505: '#991b1b', // Darker red
    };
    const errorColor = errorColors[errorDetails.statusCode] || '#ef4444';

    // Escape HTML in stack trace
    const escapedStack = errorDetails.stack
      ? errorDetails.stack
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${errorColor} 0%, ${errorColor}dd 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .error-box { background: #fee2e2; border-left: 4px solid ${errorColor}; padding: 15px; margin: 20px 0; }
          .status-badge { display: inline-block; background: ${errorColor}; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
          .detail-row { margin: 10px 0; padding: 15px; background: white; border-radius: 4px; border: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; display: block; margin-bottom: 5px; }
          .detail-value { color: #111827; word-break: break-all; }
          .stack-trace { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; white-space: pre-wrap; overflow-x: auto; margin-top: 10px; line-height: 1.4; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
          .timeout-info { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .timeout-info ul { margin: 10px 0; padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Server Error Alert</h1>
            <span class="status-badge">${errorDetails.statusCode} ${statusMessage}</span>
          </div>
          <div class="content">
            <div class="error-box">
              <strong>${errorDetails.error}</strong><br>
              ${errorDetails.message}
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Status Code:</span>
              <span class="detail-value">${errorDetails.statusCode} - ${statusMessage}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Timestamp:</span>
              <span class="detail-value">${errorDetails.timestamp}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Method:</span>
              <span class="detail-value">${errorDetails.method}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">URL:</span>
              <span class="detail-value">${errorDetails.url}</span>
            </div>
            
            ${errorDetails.ip ? `
            <div class="detail-row">
              <span class="detail-label">IP Address:</span>
              <span class="detail-value">${errorDetails.ip}</span>
            </div>
            ` : ''}
            
            ${errorDetails.userAgent ? `
            <div class="detail-row">
              <span class="detail-label">User Agent:</span>
              <span class="detail-value">${errorDetails.userAgent}</span>
            </div>
            ` : ''}
            
            ${errorDetails.statusCode === 504 ? `
            <div class="timeout-info">
              <span class="detail-label">⚠️ Gateway Timeout:</span>
              <div class="detail-value">This error usually indicates a timeout at the gateway/proxy level. Possible causes:
                <ul>
                  <li>Database query taking too long</li>
                  <li>External API call timeout</li>
                  <li>Heavy computation operation</li>
                  <li>Network connectivity issues</li>
                </ul>
              </div>
            </div>
            ` : ''}
            
            ${escapedStack ? `
            <div class="detail-row">
              <span class="detail-label">Stack Trace:</span>
              <div class="stack-trace">${escapedStack}</div>
            </div>
            ` : ''}
            
            <p style="margin-top: 20px; color: #6b7280;">
              <strong>Action Required:</strong> Please investigate this error as soon as possible.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated error notification from Resumate</p>
            <p>Server: ${this.configService.get('DOMAIN_NAME') || 'Unknown'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
