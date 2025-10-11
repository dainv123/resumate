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
    // Note: Requires EMAIL_USER and EMAIL_PASSWORD in .env
    const emailUser = this.configService.get('EMAIL_USER');
    const emailPassword = this.configService.get('EMAIL_PASSWORD');

    if (emailUser && emailPassword) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });
      this.logger.log('Email service initialized');
    } else {
      this.logger.warn('Email service not configured. Notifications will be logged only.');
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Email not sent (service not configured): ${subject} to ${to}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_USER'),
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
      this.logger.error(`Failed to send CV parsed notification: ${error.message}`);
    }
  }

  async notifyExportReady(user: User, filename: string, format: string): Promise<void> {
    const subject = `Your CV export is ready (${format.toUpperCase()})`;
    const html = this.getExportReadyTemplate(user.name, filename, format);
    
    try {
      await this.sendEmail(user.email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send export ready notification: ${error.message}`);
    }
  }

  async notifyTailorComplete(user: User, jobTitle: string): Promise<void> {
    const subject = 'Your tailored CV is ready!';
    const html = this.getTailorCompleteTemplate(user.name, jobTitle);
    
    try {
      await this.sendEmail(user.email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send tailor complete notification: ${error.message}`);
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

  private getExportReadyTemplate(userName: string, filename: string, format: string): string {
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

  private getTailorCompleteTemplate(userName: string, jobTitle: string): string {
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
}

