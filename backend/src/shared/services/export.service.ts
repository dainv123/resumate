import { Injectable, Logger } from '@nestjs/common';
import { CVData, TemplateConfig } from '../interfaces/cv-data.interface';
import { CVDataUtils } from '../utils/cv-data.utils';
import {
  Document as WordDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import React from 'react';
import { HtmlTemplateService } from './html-template.service';
import { DynamicTemplateService } from './dynamic-template.service';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private readonly htmlTemplateService: HtmlTemplateService,
    private readonly dynamicTemplateService: DynamicTemplateService,
  ) {}

  async exportToPDF(
    cvData: CVData,
    template: string = 'professional',
    templateConfig?: TemplateConfig,
  ): Promise<Buffer> {
    try {
      this.logger.log(`Starting PDF generation with template: ${template}...`);

      // Normalize CV data first
      const normalizedCVData = CVDataUtils.normalizeCVData(cvData);

      // Get the appropriate export strategy based on template
      const exportStrategy = this.getExportStrategy(template);

      // Execute the export strategy
      return await exportStrategy(normalizedCVData, template, templateConfig);
    } catch (error) {
      this.logger.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  /**
   * Get export strategy based on template name
   */
  private getExportStrategy(
    template: string,
  ): (
    cvData: CVData,
    template: string,
    templateConfig?: TemplateConfig,
  ) => Promise<Buffer> {
    const dynamicTemplates = [
      'dynamic',
      'professional',
      'two-column',
      'modern',
      'show-all',
    ];

    if (dynamicTemplates.includes(template)) {
      return (
        cvData: CVData,
        template: string,
        templateConfig?: TemplateConfig,
      ) => this.exportDynamicTemplateStrategy(cvData, template, templateConfig);
    }

    if (template === 'legacy-two-column') {
      return (
        cvData: CVData,
        template: string,
        templateConfig?: TemplateConfig,
      ) => this.exportLegacyHtmlStrategy(cvData, template, templateConfig);
    }

    // Default to React PDF strategy
    return (
      cvData: CVData,
      template: string,
      templateConfig?: TemplateConfig,
    ) => this.exportReactPDFStrategy(cvData, template, templateConfig);
  }

  /**
   * Strategy: Dynamic Template Export
   */
  private async exportDynamicTemplateStrategy(
    cvData: CVData,
    template: string,
    templateConfig?: TemplateConfig,
  ): Promise<Buffer> {
    try {
      this.logger.log(
        `Generating dynamic template PDF with template: ${template}`,
      );

      // Get template configuration
      const config = this.getTemplateConfig(template, templateConfig);

      // Generate HTML content
      const htmlContent = this.generateDynamicHtmlContent(
        cvData,
        config,
        template,
      );

      // Convert HTML to PDF
      return this.convertHtmlToPDF(htmlContent);
    } catch (error) {
      this.logger.error('Error generating dynamic template PDF:', error);
      throw new Error(
        `Failed to generate dynamic template PDF: ${error.message}`,
      );
    }
  }

  /**
   * Strategy: Legacy HTML Template Export
   */
  private async exportLegacyHtmlStrategy(
    cvData: CVData,
    template: string,
    templateConfig?: TemplateConfig,
  ): Promise<Buffer> {
    return this.exportHtmlToPDF(cvData);
  }

  /**
   * Strategy: React PDF Export
   */
  private async exportReactPDFStrategy(
    cvData: CVData,
    template: string,
    templateConfig?: TemplateConfig,
  ): Promise<Buffer> {
    const { pdf } = await import('@react-pdf/renderer');

    const ReactPDFDocument = await this.generateReactPDFDocument(
      cvData,
      template,
    );
    const pdfBlob = await pdf(ReactPDFDocument).toBlob();

    // Convert Blob to Buffer
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF is empty');
    }

    this.logger.log(
      `PDF generated successfully, size: ${pdfBuffer.length} bytes`,
    );
    return pdfBuffer;
  }

  /**
   * Export PDF sử dụng dynamic template
   */
  async exportDynamicTemplateToPDF(
    cvData: CVData,
    template: string,
    templateConfig?: TemplateConfig,
  ): Promise<Buffer> {
    try {
      this.logger.log(
        `Generating dynamic template PDF with template: ${template}`,
      );

      // Get template configuration
      const config = this.getTemplateConfig(template, templateConfig);

      // Generate HTML content
      const htmlContent = this.generateDynamicHtmlContent(
        cvData,
        config,
        template,
      );

      // Convert HTML to PDF
      return this.convertHtmlToPDF(htmlContent);
    } catch (error) {
      this.logger.error('Error generating dynamic template PDF:', error);
      throw new Error(
        `Failed to generate dynamic template PDF: ${error.message}`,
      );
    }
  }

  /**
   * Get template configuration based on template name or provided config
   */
  private getTemplateConfig(
    template: string,
    templateConfig?: TemplateConfig,
  ): TemplateConfig {
    if (templateConfig) {
      return templateConfig;
    }

    return this.getDefaultConfigForTemplate(template);
  }

  /**
   * Get default configuration for specific template
   */
  private getDefaultConfigForTemplate(template: string): TemplateConfig {
    const configMap = {
      professional: () => CVDataUtils.getDefaultTemplateConfig(), // professional uses default config
      'two-column': () => this.dynamicTemplateService.getTwoColumnConfig(),
      modern: () => this.dynamicTemplateService.getModernConfig(),
      'show-all': () => this.dynamicTemplateService.getShowAllConfig(),
    };

    const configGetter = configMap[template];
    return configGetter
      ? configGetter()
      : CVDataUtils.getDefaultTemplateConfig();
  }

  /**
   * Generate dynamic HTML content based on template and configuration
   */
  private generateDynamicHtmlContent(
    cvData: CVData,
    config: TemplateConfig,
    template: string,
  ): string {
    const showEmptySections = template === 'show-all';
    return this.dynamicTemplateService.generateDynamicTemplate(
      cvData,
      config,
      showEmptySections,
    );
  }

  /**
   * Convert HTML content to PDF using Puppeteer
   */
  private async convertHtmlToPDF(htmlContent: string): Promise<Buffer> {
    let browser;
    try {
      this.logger.log('=== PDF GENERATION START ===');
      this.logger.log('HTML content length:', htmlContent.length);
      this.logger.log(
        'PUPPETEER_EXECUTABLE_PATH:',
        process.env.PUPPETEER_EXECUTABLE_PATH,
      );
      this.logger.log('Node version:', process.version);
      this.logger.log('Platform:', process.platform);

      // Check if HTML content looks valid
      if (!htmlContent || htmlContent.length < 100) {
        throw new Error('HTML content is too short or empty');
      }

      if (!htmlContent.includes('<html')) {
        throw new Error('HTML content does not contain <html> tag');
      }

      this.logger.log('Launching Puppeteer browser...');
      browser = await this.launchPuppeteerBrowser();
      this.logger.log('✅ Browser launched successfully');

      const page = await this.createPuppeteerPage(browser);
      this.logger.log('Page created successfully');

      // Add error handling for page events
      page.on('pageerror', (error) => {
        this.logger.error('Page error:', error);
      });

      page.on('requestfailed', (request) => {
        this.logger.warn(
          'Request failed:',
          request.url(),
          request.failure()?.errorText,
        );
      });

      this.logger.log('Setting page content...');
      await this.setPageContent(page, htmlContent);
      this.logger.log('✅ Page content set successfully');

      // Wait for content to stabilize
      this.logger.log('Waiting for content to stabilize...');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if page has content
      const contentCheck = await page.evaluate(() => {
        return {
          hasBody: !!document.body,
          bodyLength: document.body ? document.body.innerHTML.length : 0,
          title: document.title,
        };
      });
      this.logger.log('Page content check:', contentCheck);

      this.logger.log('Generating PDF...');
      const pdfBuffer = await this.generatePDFFromPage(page);
      this.logger.log(
        `PDF generated successfully, size: ${pdfBuffer.length} bytes`,
      );

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Error converting HTML to PDF:', error);
      this.logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Log HTML content for debugging (first 500 chars)
      this.logger.error('HTML content preview:', htmlContent.substring(0, 500));

      return this.handlePDFGenerationError(htmlContent);
    } finally {
      if (browser) {
        try {
          await browser.close();
          this.logger.log('Browser closed');
        } catch (closeError) {
          this.logger.error('Error closing browser:', closeError);
        }
      }
    }
  }

  /**
   * Launch Puppeteer browser with optimized settings
   */
  private async launchPuppeteerBrowser(): Promise<any> {
    const puppeteer = await import('puppeteer');

    // Try multiple executable paths
    const possiblePaths = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/usr/bin/google-chrome',
      '/usr/bin/chrome',
      'chromium-browser',
      'chromium',
    ].filter(Boolean);

    let lastError: any = null;

    for (const executablePath of possiblePaths) {
      try {
        this.logger.log(`Trying executable path: ${executablePath}`);

        const browser = await puppeteer.launch({
          headless: true,
          executablePath,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--font-render-hinting=none',
            '--disable-background-networking',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--hide-scrollbars',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-first-run',
            '--safebrowsing-disable-auto-update',
            '--single-process',
            '--disable-component-extensions-with-background-pages',
          ],
          timeout: 10000, // 10 second timeout
        });

        this.logger.log(
          `✅ Successfully launched browser with path: ${executablePath}`,
        );
        return browser;
      } catch (error) {
        this.logger.warn(
          `Failed to launch with path ${executablePath}:`,
          error.message,
        );
        lastError = error;
        continue;
      }
    }

    // If all paths failed, try without executablePath (let Puppeteer find it)
    try {
      this.logger.log('Trying to launch without explicit executable path...');
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });
      this.logger.log('✅ Successfully launched browser without explicit path');
      return browser;
    } catch (error) {
      this.logger.error('All browser launch attempts failed');
      throw lastError || error;
    }
  }

  /**
   * Create and configure Puppeteer page
   */
  private async createPuppeteerPage(browser: any): Promise<any> {
    const page = await browser.newPage();

    // Set viewport for A4 aspect ratio
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      deviceScaleFactor: 1,
    });

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );

    // Disable images and other resources to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (
        resourceType === 'image' ||
        resourceType === 'media' ||
        resourceType === 'font'
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    return page;
  }

  /**
   * Set HTML content on Puppeteer page
   */
  private async setPageContent(page: any, htmlContent: string): Promise<void> {
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for fonts to load
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => resolve(true));
        } else {
          // Fallback for older browsers
          setTimeout(() => resolve(true), 1000);
        }
      });
    });

    // Additional wait for content stabilization
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  /**
   * Generate PDF from Puppeteer page
   */
  private async generatePDFFromPage(page: any): Promise<Uint8Array> {
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
      timeout: 30000,
      displayHeaderFooter: false,
      pageRanges: '1',
    });
  }

  /**
   * Handle PDF generation errors - Try React PDF as fallback
   */
  private async handlePDFGenerationError(htmlContent: string): Promise<Buffer> {
    this.logger.warn(
      'Primary PDF generation failed, trying React PDF fallback...',
    );

    try {
      // Extract basic CV data from HTML (very basic parsing)
      const basicCVData = this.extractBasicCVDataFromHTML(htmlContent);

      // Use React PDF as fallback
      const pdfBuffer = await this.exportReactPDFStrategy(
        basicCVData,
        'professional',
      );

      this.logger.log('✅ React PDF fallback succeeded');
      return pdfBuffer;
    } catch (fallbackError) {
      this.logger.error('React PDF fallback also failed:', fallbackError);
      throw new Error('Failed to generate PDF from HTML content');
    }
  }

  /**
   * Extract basic CV data from HTML content for fallback
   */
  private extractBasicCVDataFromHTML(htmlContent: string): CVData {
    // Very basic HTML parsing - extract name and basic info
    const nameMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const emailMatch = htmlContent.match(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    );

    return {
      id: 'fallback-cv',
      contact: {
        name: nameMatch ? nameMatch[1].trim() : 'CV Export',
        email: emailMatch ? emailMatch[1] : 'email@example.com',
        phone: 'Phone not available',
        address: 'Address not available',
      },
      summary: 'Generated from HTML fallback due to PDF generation issues',
      experience: [],
      education: [],
      skills: { technical: [], soft: [], languages: [], tools: [] },
      projects: [],
      certifications: [],
      awards: [],
      publications: [],
      volunteer: [],
    };
  }

  async exportToWord(cvData: CVData): Promise<Buffer> {
    try {
      const doc = new WordDocument({
        sections: [
          {
            properties: {},
            children: [
              ...this.generateWordHeader(cvData),
              ...this.generateWordSummary(cvData),
              ...this.generateWordExperience(cvData),
              ...this.generateWordSkills(cvData),
              ...this.generateWordEducation(cvData),
              ...this.generateWordProjects(cvData),
              ...this.generateWordCertifications(cvData),
              ...this.generateWordAwards(cvData),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      return buffer;
    } catch (error) {
      this.logger.error('Error generating Word document:', error);
      throw new Error('Failed to generate Word document');
    }
  }

  /**
   * Generate Word document header section
   */
  private generateWordHeader(cvData: CVData): any[] {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: cvData.contact.name,
            bold: true,
            size: 32,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${cvData.contact.email} | ${cvData.contact.phone}`,
            size: 24,
          }),
        ],
      }),
    ];
  }

  /**
   * Generate Word document summary section
   */
  private generateWordSummary(cvData: CVData): any[] {
    if (!cvData.summary) return [];

    return [
      new Paragraph({
        children: [
          new TextRun({
            text: 'SUMMARY',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: cvData.summary,
            size: 24,
          }),
        ],
      }),
    ];
  }

  /**
   * Generate Word document experience section
   */
  private generateWordExperience(cvData: CVData): any[] {
    const experienceElements = [
      new Paragraph({
        children: [
          new TextRun({
            text: 'EXPERIENCE',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    experienceElements.push(
      ...cvData.experience.flatMap((exp) =>
        this.generateWordExperienceItem(exp),
      ),
    );
    return experienceElements;
  }

  /**
   * Generate Word document experience item
   */
  private generateWordExperienceItem(exp: any): any[] {
    const elements = [
      new Paragraph({
        children: [
          new TextRun({
            text: `${exp.title} at ${exp.company}`,
            bold: true,
            size: 26,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: this.formatDateRange(exp.startDate, exp.endDate, exp.current),
            italics: true,
            size: 22,
          }),
        ],
      }),
    ];

    if (exp.teamSize) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `👥 Team Size: ${exp.teamSize}`,
              size: 22,
            }),
          ],
        }),
      );
    }

    if (exp.companyDescription) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.companyDescription,
              size: 22,
            }),
          ],
        }),
      );
    }

    if (exp.responsibilities && exp.responsibilities.length > 0) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Responsibilities:',
              bold: true,
              size: 24,
            }),
          ],
        }),
        ...exp.responsibilities.map(
          (resp) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${resp}`,
                  size: 22,
                }),
              ],
            }),
        ),
      );
    }

    if (exp.achievements && exp.achievements.length > 0) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Achievements:',
              bold: true,
              size: 24,
            }),
          ],
        }),
        ...exp.achievements.map(
          (achievement) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${achievement}`,
                  size: 22,
                }),
              ],
            }),
        ),
      );
    }

    if (exp.technologies && exp.technologies.length > 0) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Technologies: ${exp.technologies.join(', ')}`,
              size: 22,
            }),
          ],
        }),
      );
    }

    return elements;
  }

  /**
   * Generate Word document skills section
   */
  private generateWordSkills(cvData: CVData): any[] {
    const skillsElements = [
      new Paragraph({
        children: [
          new TextRun({
            text: 'SKILLS',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    if (cvData.skills.technical && cvData.skills.technical.length > 0) {
      skillsElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Technical Skills:',
              bold: true,
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cvData.skills.technical.join(', '),
              size: 22,
            }),
          ],
        }),
      );
    }

    if (cvData.skills.soft && cvData.skills.soft.length > 0) {
      skillsElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Soft Skills:',
              bold: true,
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cvData.skills.soft.join(', '),
              size: 22,
            }),
          ],
        }),
      );
    }

    if (cvData.skills.languages && cvData.skills.languages.length > 0) {
      skillsElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Languages:',
              bold: true,
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cvData.skills.languages.join(', '),
              size: 22,
            }),
          ],
        }),
      );
    }

    if (cvData.skills.tools && cvData.skills.tools.length > 0) {
      skillsElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Tools:',
              bold: true,
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cvData.skills.tools.join(', '),
              size: 22,
            }),
          ],
        }),
      );
    }

    return skillsElements;
  }

  /**
   * Generate Word document education section
   */
  private generateWordEducation(cvData: CVData): any[] {
    const educationElements = [
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    educationElements.push(
      ...cvData.education.map(
        (edu) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.degree} - ${edu.institution} (${this.formatDateRange(edu.startDate, edu.endDate)})`,
                size: 24,
              }),
            ],
          }),
      ),
    );

    return educationElements;
  }

  /**
   * Generate Word document projects section
   */
  private generateWordProjects(cvData: CVData): any[] {
    if (!cvData.projects || cvData.projects.length === 0) return [];

    const projectsElements = [
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROJECTS',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    projectsElements.push(
      ...cvData.projects.flatMap((project) =>
        this.generateWordProjectItem(project),
      ),
    );
    return projectsElements;
  }

  /**
   * Generate Word document project item
   */
  private generateWordProjectItem(project: any): any[] {
    const elements = [
      new Paragraph({
        children: [
          new TextRun({
            text: project.name,
            bold: true,
            size: 26,
          }),
        ],
      }),
    ];

    if (project.duration) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.duration,
              italics: true,
              size: 22,
            }),
          ],
        }),
      );
    }

    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: project.description,
            size: 24,
          }),
        ],
      }),
    );

    if (project.technologies && project.technologies.length > 0) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Tech Stack: ${project.technologies.join(', ')}`,
              size: 22,
            }),
          ],
        }),
      );
    }

    if (project.results && project.results.length > 0) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Results: ${project.results.join(', ')}`,
              size: 22,
            }),
          ],
        }),
      );
    }

    if (project.link) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Link: ${project.link}`,
              size: 22,
            }),
          ],
        }),
      );
    }

    return elements;
  }

  /**
   * Generate Word document certifications section
   */
  private generateWordCertifications(cvData: CVData): any[] {
    if (!cvData.certifications || cvData.certifications.length === 0) return [];

    const certificationsElements = [
      new Paragraph({
        children: [
          new TextRun({
            text: 'CERTIFICATIONS',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    certificationsElements.push(
      ...cvData.certifications.map(
        (cert) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${cert.name} - ${cert.issuer} (${cert.date})`,
                size: 24,
              }),
            ],
          }),
      ),
    );

    return certificationsElements;
  }

  /**
   * Generate Word document awards section
   */
  private generateWordAwards(cvData: CVData): any[] {
    if (!cvData.awards || cvData.awards.length === 0) return [];

    const awardsElements = [
      new Paragraph({
        children: [
          new TextRun({
            text: 'AWARDS',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    awardsElements.push(
      ...cvData.awards.map(
        (award) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `${award.title} - ${award.issuer} (${award.date})`,
                size: 24,
              }),
            ],
          }),
      ),
    );

    return awardsElements;
  }

  /**
   * Format date range for display
   */
  private formatDateRange(
    startDate: string,
    endDate?: string,
    current?: boolean,
  ): string {
    if (current || !endDate) {
      return `${startDate} - Present`;
    }
    return `${startDate} - ${endDate}`;
  }

  async exportToATS(cvData: CVData): Promise<Buffer> {
    try {
      // ATS-friendly format (plain text, no fancy formatting)
      const atsContent = this.formatForATS(cvData);
      return Buffer.from(atsContent, 'utf-8');
    } catch (error) {
      this.logger.error('Error generating ATS format:', error);
      throw new Error('Failed to generate ATS format');
    }
  }

  private formatForATS(cvData: CVData): string {
    return `
${cvData.contact.name}
${cvData.contact.email} | ${cvData.contact.phone}
${cvData.contact.address || ''}
${cvData.contact.linkedin ? `LinkedIn: ${cvData.contact.linkedin}` : ''}

${
  cvData.summary
    ? `SUMMARY
${cvData.summary}

`
    : ''
}EXPERIENCE
${cvData.experience
  .map((exp) => {
    let result = `${exp.title} at ${exp.company} (${this.formatDateRange(exp.startDate, exp.endDate, exp.current)})`;
    if (exp.teamSize) result += ` - Team Size: ${exp.teamSize}`;
    if (exp.companyDescription)
      result += `\nCompany: ${exp.companyDescription}`;
    if (exp.responsibilities && exp.responsibilities.length > 0) {
      result += `\nResponsibilities:\n${exp.responsibilities.map((resp) => `- ${resp}`).join('\n')}`;
    }
    if (exp.achievements && exp.achievements.length > 0) {
      result += `\nAchievements:\n${exp.achievements.map((achievement) => `- ${achievement}`).join('\n')}`;
    }
    if (exp.technologies && exp.technologies.length > 0) {
      result += `\nTechnologies: ${exp.technologies.join(', ')}`;
    }
    return result;
  })
  .join('\n\n')}

SKILLS
${cvData.skills.technical && cvData.skills.technical.length > 0 ? `Technical Skills: ${cvData.skills.technical.join(', ')}` : ''}
${cvData.skills.soft && cvData.skills.soft.length > 0 ? `Soft Skills: ${cvData.skills.soft.join(', ')}` : ''}
${cvData.skills.languages && cvData.skills.languages.length > 0 ? `Languages: ${cvData.skills.languages.join(', ')}` : ''}
${cvData.skills.tools && cvData.skills.tools.length > 0 ? `Tools: ${cvData.skills.tools.join(', ')}` : ''}

EDUCATION
${cvData.education
  .map((edu) => {
    let result = `${edu.degree} - ${edu.institution} (${this.formatDateRange(edu.startDate, edu.endDate)})`;
    if (edu.location) result += ` - ${edu.location}`;
    if (edu.gpa) result += ` - GPA: ${edu.gpa}`;
    if (edu.description) result += ` - ${edu.description}`;
    return result;
  })
  .join('\n')}

${
  cvData.projects.length > 0
    ? `PROJECTS
${cvData.projects
  .map((project) => {
    let result = `${project.name}`;
    if (project.duration) result += ` (${project.duration})`;
    result += `\n${project.description}`;
    if (project.technologies && project.technologies.length > 0) {
      result += `\nTech Stack: ${project.technologies.join(', ')}`;
    }
    if (project.results) {
      result += `\nResults: ${project.results}`;
    }
    if (project.link) {
      result += `\nLink: ${project.link}`;
    }
    return result;
  })
  .join('\n\n')}`
    : ''
}

${
  (cvData.certifications || []).length > 0
    ? `CERTIFICATIONS
${(cvData.certifications || [])
  .map((cert) => {
    let result = `${cert.name} - ${cert.issuer} (${cert.date})`;
    if (cert.credentialUrl) result += `\nLink: ${cert.credentialUrl}`;
    return result;
  })
  .join('\n')}`
    : ''
}

${
  (cvData.awards || []).length > 0
    ? `AWARDS
${(cvData.awards || [])
  .map((award) => `${award.title} - ${award.issuer} (${award.date})`)
  .join('\n')}`
    : ''
}

${
  (cvData.publications || []).length > 0
    ? `PUBLICATIONS
${(cvData.publications || [])
  .map(
    (pub) =>
      `${pub.title} - ${pub.journal} (${pub.publicationDate})
Authors: ${pub.authors}`,
  )
  .join('\n\n')}`
    : ''
}

${
  (cvData.volunteer || []).length > 0
    ? `VOLUNTEER EXPERIENCE
${(cvData.volunteer || [])
  .map(
    (vol) =>
      `${vol.role} at ${vol.organization} (${this.formatDateRange(vol.startDate, vol.endDate, vol.current)})
${vol.description}`,
  )
  .join('\n\n')}`
    : ''
}
    `.trim();
  }

  private async generateReactPDFDocument(
    cvData: CVData,
    template: string,
  ): Promise<any> {
    // Dynamic import for ESM module
    const { Document, Page, Text, View, StyleSheet } = await import(
      '@react-pdf/renderer'
    );

    // Choose template
    if (template === 'two-column') {
      return this.generateTwoColumnTemplate(cvData);
    }

    // Default professional template
    const styles = StyleSheet.create({
      page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontSize: 12,
        lineHeight: 1.4,
      },
      header: {
        textAlign: 'center',
        marginBottom: 20,
      },
      name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#2c3e50',
      },
      title: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 10,
      },
      contact: {
        fontSize: 11,
        color: '#495057',
        marginBottom: 15,
      },
      section: {
        marginBottom: 15,
      },
      sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#2c3e50',
        borderBottom: '1px solid #dee2e6',
        paddingBottom: 3,
      },
      experienceItem: {
        marginBottom: 12,
      },
      jobTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2c3e50',
      },
      company: {
        fontSize: 11,
        color: '#6c757d',
        marginBottom: 3,
      },
      duration: {
        fontSize: 10,
        color: '#007bff',
        fontStyle: 'italic',
        marginBottom: 5,
      },
      description: {
        fontSize: 10,
        color: '#495057',
        marginBottom: 3,
      },
      skillsList: {
        fontSize: 10,
        color: '#495057',
        marginBottom: 2,
      },
      educationItem: {
        marginBottom: 8,
      },
      degree: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#2c3e50',
      },
      school: {
        fontSize: 10,
        color: '#6c757d',
      },
      projectItem: {
        marginBottom: 10,
      },
      projectName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#2c3e50',
      },
      projectDescription: {
        fontSize: 10,
        color: '#495057',
        marginBottom: 3,
      },
    });

    return React.createElement(
      Document,
      {},
      React.createElement(
        Page,
        { style: styles.page },
        // Header
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(
            Text,
            { style: styles.name },
            cvData.contact.name.toUpperCase(),
          ),
          cvData.experience.length > 0 &&
            React.createElement(
              Text,
              { style: styles.title },
              cvData.experience[0].title,
            ),
          React.createElement(
            Text,
            { style: styles.contact },
            `${cvData.contact.email} | ${cvData.contact.phone}`,
          ),
          cvData.contact.address &&
            React.createElement(
              Text,
              { style: styles.contact },
              cvData.contact.address,
            ),
          cvData.contact.linkedin &&
            React.createElement(
              Text,
              { style: styles.contact },
              `LinkedIn: ${cvData.contact.linkedin}`,
            ),
        ),

        // Summary
        cvData.summary &&
          React.createElement(
            View,
            { style: styles.section },
            React.createElement(
              Text,
              { style: styles.sectionTitle },
              'PROFILE SUMMARY',
            ),
            React.createElement(
              Text,
              { style: styles.description },
              cvData.summary,
            ),
          ),

        // Experience
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            'WORK EXPERIENCE',
          ),
          ...cvData.experience.map((exp) =>
            React.createElement(
              View,
              {
                style: styles.experienceItem,
                key: `${exp.company}-${exp.title}`,
              },
              React.createElement(
                Text,
                { style: styles.jobTitle },
                `${exp.title} at ${exp.company}`,
              ),
              React.createElement(
                Text,
                { style: styles.duration },
                this.formatDateRange(exp.startDate, exp.endDate, exp.current),
              ),
              exp.teamSize &&
                React.createElement(
                  Text,
                  { style: styles.description },
                  `Team Size: ${exp.teamSize}`,
                ),
              exp.companyDescription &&
                React.createElement(
                  Text,
                  { style: styles.description },
                  exp.companyDescription,
                ),
              exp.responsibilities &&
                exp.responsibilities.length > 0 &&
                React.createElement(
                  Text,
                  { style: styles.description },
                  `Responsibilities: ${exp.responsibilities.join(', ')}`,
                ),
              exp.achievements &&
                exp.achievements.length > 0 &&
                React.createElement(
                  Text,
                  { style: styles.description },
                  `Achievements: ${exp.achievements.join(', ')}`,
                ),
              exp.technologies &&
                exp.technologies.length > 0 &&
                React.createElement(
                  Text,
                  { style: styles.description },
                  `Technologies: ${exp.technologies.join(', ')}`,
                ),
            ),
          ),
        ),

        // Skills
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'SKILLS'),
          cvData.skills.technical &&
            cvData.skills.technical.length > 0 &&
            React.createElement(
              Text,
              { style: styles.skillsList },
              `Technical: ${cvData.skills.technical.join(', ')}`,
            ),
          cvData.skills.soft &&
            cvData.skills.soft.length > 0 &&
            React.createElement(
              Text,
              { style: styles.skillsList },
              `Soft Skills: ${cvData.skills.soft.join(', ')}`,
            ),
          cvData.skills.tools &&
            cvData.skills.tools.length > 0 &&
            React.createElement(
              Text,
              { style: styles.skillsList },
              `Tools: ${cvData.skills.tools.join(', ')}`,
            ),
          cvData.skills.languages &&
            cvData.skills.languages.length > 0 &&
            React.createElement(
              Text,
              { style: styles.skillsList },
              `Languages: ${cvData.skills.languages.join(', ')}`,
            ),
        ),

        // Education
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            'EDUCATION',
          ),
          ...cvData.education.map((edu) =>
            React.createElement(
              View,
              {
                style: styles.educationItem,
                key: `${edu.institution}-${edu.degree}`,
              },
              React.createElement(
                Text,
                { style: styles.degree },
                `${edu.degree} - ${edu.institution}`,
              ),
              React.createElement(
                Text,
                { style: styles.school },
                `Year: ${this.formatDateRange(edu.startDate, edu.endDate)}`,
              ),
              edu.location &&
                React.createElement(
                  Text,
                  { style: styles.school },
                  `Location: ${edu.location}`,
                ),
              edu.gpa &&
                React.createElement(
                  Text,
                  { style: styles.school },
                  `GPA: ${edu.gpa}`,
                ),
              edu.description &&
                React.createElement(
                  Text,
                  { style: styles.school },
                  `Description: ${edu.description}`,
                ),
            ),
          ),
        ),

        // Projects
        cvData.projects &&
          cvData.projects.length > 0 &&
          React.createElement(
            View,
            { style: styles.section },
            React.createElement(
              Text,
              { style: styles.sectionTitle },
              'PROJECTS',
            ),
            ...cvData.projects.map((project) =>
              React.createElement(
                View,
                { style: styles.projectItem, key: project.name },
                React.createElement(
                  Text,
                  { style: styles.projectName },
                  project.name,
                ),
                project.duration &&
                  React.createElement(
                    Text,
                    { style: styles.duration },
                    project.duration,
                  ),
                React.createElement(
                  Text,
                  { style: styles.projectDescription },
                  project.description,
                ),
                project.technologies &&
                  project.technologies.length > 0 &&
                  React.createElement(
                    Text,
                    { style: styles.description },
                    `Tech Stack: ${project.technologies.join(', ')}`,
                  ),
                project.results &&
                  React.createElement(
                    Text,
                    { style: styles.description },
                    `Results: ${project.results}`,
                  ),
                project.link &&
                  React.createElement(
                    Text,
                    { style: styles.description },
                    `Link: ${project.link}`,
                  ),
              ),
            ),
          ),

        // Certifications
        cvData.certifications &&
          cvData.certifications.length > 0 &&
          React.createElement(
            View,
            { style: styles.section },
            React.createElement(
              Text,
              { style: styles.sectionTitle },
              'CERTIFICATIONS',
            ),
            ...cvData.certifications.map((cert) =>
              React.createElement(
                View,
                { style: styles.educationItem, key: cert.name },
                React.createElement(Text, { style: styles.degree }, cert.name),
                React.createElement(
                  Text,
                  { style: styles.school },
                  `${cert.issuer} - ${cert.date}`,
                ),
                cert.credentialUrl &&
                  React.createElement(
                    Text,
                    { style: styles.school },
                    `Link: ${cert.credentialUrl}`,
                  ),
              ),
            ),
          ),

        // Awards
        cvData.awards &&
          cvData.awards.length > 0 &&
          React.createElement(
            View,
            { style: styles.section },
            React.createElement(Text, { style: styles.sectionTitle }, 'AWARDS'),
            ...cvData.awards.map((award) =>
              React.createElement(
                View,
                { style: styles.educationItem, key: award.title },
                React.createElement(
                  Text,
                  { style: styles.degree },
                  award.title,
                ),
                React.createElement(
                  Text,
                  { style: styles.school },
                  `${award.issuer} - ${award.date}`,
                ),
              ),
            ),
          ),
      ),
    );
  }

  private async generateTwoColumnTemplate(cvData: CVData): Promise<any> {
    const { Document, Page, Text, View, StyleSheet } = await import(
      '@react-pdf/renderer'
    );

    const styles = StyleSheet.create({
      page: {
        backgroundColor: '#FFFFFF',
        fontSize: 10,
        lineHeight: 1.4,
        padding: 0,
        margin: 0,
        flexDirection: 'row',
      },
      leftColumn: {
        width: 240,
        backgroundColor: '#2c5f5f',
        padding: 30,
        color: '#FFFFFF',
        minHeight: 792,
      },
      rightColumn: {
        width: 315,
        backgroundColor: '#FFFFFF',
        padding: 30,
        color: '#333333',
        minHeight: 792,
      },
      profileSection: {
        marginBottom: 25,
        textAlign: 'center',
      },
      profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        marginBottom: 15,
        alignSelf: 'center',
      },
      name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#FFFFFF',
        textAlign: 'center',
      },
      title: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
        opacity: 0.9,
      },
      leftSection: {
        marginBottom: 25,
      },
      leftSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#FFFFFF',
      },
      leftSectionText: {
        fontSize: 11,
        color: '#FFFFFF',
        marginBottom: 8,
        lineHeight: 1.4,
      },
      leftSectionLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 3,
      },
      skillItem: {
        marginBottom: 12,
      },
      skillName: {
        fontSize: 11,
        color: '#FFFFFF',
        marginBottom: 3,
      },
      progressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
      },
      progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
      },
      rightSection: {
        marginBottom: 25,
      },
      rightSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333333',
        borderBottom: '2px solid #2c5f5f',
        paddingBottom: 5,
      },
      rightSectionText: {
        fontSize: 11,
        color: '#333333',
        marginBottom: 8,
        lineHeight: 1.5,
      },
      experienceItem: {
        marginBottom: 15,
      },
      jobTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 2,
      },
      company: {
        fontSize: 11,
        color: '#2c5f5f',
        fontWeight: 'bold',
        marginBottom: 2,
      },
      duration: {
        fontSize: 10,
        color: '#666666',
        fontStyle: 'italic',
        marginBottom: 5,
      },
      responsibility: {
        fontSize: 10,
        color: '#333333',
        marginBottom: 2,
        marginLeft: 10,
      },
      educationItem: {
        marginBottom: 10,
      },
      degree: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 2,
      },
      school: {
        fontSize: 11,
        color: '#2c5f5f',
        fontWeight: 'bold',
        marginBottom: 2,
      },
      educationDuration: {
        fontSize: 10,
        color: '#666666',
        fontStyle: 'italic',
      },
    });

    const technicalSkills = cvData.skills?.technical || [];
    const softSkills = cvData.skills?.soft || [];
    const languages = cvData.skills?.languages || [];

    const getSkillLevel = (skill: string): number => {
      const skillLevels: { [key: string]: number } = {
        JavaScript: 0.9,
        TypeScript: 0.85,
        React: 0.9,
        'Node.js': 0.8,
        Python: 0.7,
        Java: 0.6,
        SQL: 0.75,
        AWS: 0.6,
        Docker: 0.5,
        Git: 0.8,
      };
      return skillLevels[skill] || 0.5;
    };

    return React.createElement(
      Document,
      {},
      React.createElement(
        Page,
        { style: styles.page },

        // LEFT COLUMN
        React.createElement(
          View,
          { style: styles.leftColumn },

          // Profile Section
          React.createElement(
            View,
            { style: styles.profileSection },
            React.createElement(View, { style: styles.profileImage }),
            React.createElement(
              Text,
              { style: styles.name },
              cvData.contact.name.toUpperCase(),
            ),
            cvData.experience.length > 0 &&
              React.createElement(
                Text,
                { style: styles.title },
                cvData.experience[0].title,
              ),
          ),

          // Contact Details
          React.createElement(
            View,
            { style: styles.leftSection },
            React.createElement(
              Text,
              { style: styles.leftSectionTitle },
              'DETAILS',
            ),
            React.createElement(
              Text,
              { style: styles.leftSectionLabel },
              'Address',
            ),
            React.createElement(
              Text,
              { style: styles.leftSectionText },
              cvData.contact.address || 'Not provided',
            ),
            React.createElement(
              Text,
              { style: styles.leftSectionLabel },
              'Phone',
            ),
            React.createElement(
              Text,
              { style: styles.leftSectionText },
              cvData.contact.phone,
            ),
            React.createElement(
              Text,
              { style: styles.leftSectionLabel },
              'Email',
            ),
            React.createElement(
              Text,
              { style: styles.leftSectionText },
              cvData.contact.email,
            ),
          ),

          // Links
          cvData.contact.linkedin &&
            React.createElement(
              View,
              { style: styles.leftSection },
              React.createElement(
                Text,
                { style: styles.leftSectionTitle },
                'LINKS',
              ),
              React.createElement(
                Text,
                { style: styles.leftSectionText },
                'LinkedIn',
              ),
            ),

          // Skills
          technicalSkills.length > 0 &&
            React.createElement(
              View,
              { style: styles.leftSection },
              React.createElement(
                Text,
                { style: styles.leftSectionTitle },
                'SKILLS',
              ),
              ...technicalSkills.slice(0, 6).map((skill) =>
                React.createElement(
                  View,
                  { style: styles.skillItem, key: skill },
                  React.createElement(Text, { style: styles.skillName }, skill),
                  React.createElement(
                    View,
                    { style: styles.progressBar },
                    React.createElement(View, {
                      style: {
                        ...styles.progressFill,
                        width: `${getSkillLevel(skill) * 100}%`,
                      },
                    }),
                  ),
                ),
              ),
            ),
        ),

        // RIGHT COLUMN
        React.createElement(
          View,
          { style: styles.rightColumn },

          // Profile Summary
          cvData.summary &&
            React.createElement(
              View,
              { style: styles.rightSection },
              React.createElement(
                Text,
                { style: styles.rightSectionTitle },
                'PROFILE',
              ),
              React.createElement(
                Text,
                { style: styles.rightSectionText },
                cvData.summary,
              ),
            ),

          // Experience
          React.createElement(
            View,
            { style: styles.rightSection },
            React.createElement(
              Text,
              { style: styles.rightSectionTitle },
              'EXPERIENCE',
            ),
            ...cvData.experience.map((exp) =>
              React.createElement(
                View,
                {
                  style: styles.experienceItem,
                  key: `${exp.company}-${exp.title}`,
                },
                React.createElement(
                  Text,
                  { style: styles.jobTitle },
                  exp.title,
                ),
                React.createElement(
                  Text,
                  { style: styles.company },
                  exp.company,
                ),
                React.createElement(
                  Text,
                  { style: styles.duration },
                  this.formatDateRange(exp.startDate, exp.endDate, exp.current),
                ),
                ...(exp.responsibilities && exp.responsibilities.length > 0
                  ? exp.responsibilities.map((resp) =>
                      React.createElement(
                        Text,
                        { style: styles.responsibility, key: resp },
                        `• ${resp}`,
                      ),
                    )
                  : []),
                ...(exp.achievements && exp.achievements.length > 0
                  ? exp.achievements.map((ach) =>
                      React.createElement(
                        Text,
                        { style: styles.responsibility, key: ach },
                        `• ${ach}`,
                      ),
                    )
                  : []),
              ),
            ),
          ),

          // Education
          cvData.education.length > 0 &&
            React.createElement(
              View,
              { style: styles.rightSection },
              React.createElement(
                Text,
                { style: styles.rightSectionTitle },
                'EDUCATION',
              ),
              ...cvData.education.map((edu) =>
                React.createElement(
                  View,
                  {
                    style: styles.educationItem,
                    key: `${edu.institution}-${edu.degree}`,
                  },
                  React.createElement(
                    Text,
                    { style: styles.degree },
                    edu.degree,
                  ),
                  React.createElement(
                    Text,
                    { style: styles.school },
                    edu.institution,
                  ),
                  React.createElement(
                    Text,
                    { style: styles.educationDuration },
                    `${this.formatDateRange(edu.startDate, edu.endDate)}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`,
                  ),
                ),
              ),
            ),

          // Languages
          languages.length > 0 &&
            React.createElement(
              View,
              { style: styles.rightSection },
              React.createElement(
                Text,
                { style: styles.rightSectionTitle },
                'LANGUAGES',
              ),
              ...languages.map((lang) =>
                React.createElement(
                  Text,
                  { style: styles.rightSectionText, key: lang },
                  lang,
                ),
              ),
            ),
        ),
      ),
    );
  }

  private async exportHtmlToPDF(cvData: CVData): Promise<Buffer> {
    try {
      this.logger.log('Generating HTML template for two-column layout...');

      // Generate HTML template
      const htmlContent = await this.htmlTemplateService.generateTwoColumnHtml(
        cvData as any,
      );

      // Write HTML to temporary file
      const tempDir = os.tmpdir();
      const tempHtmlFile = path.join(tempDir, `Resumated-${Date.now()}.html`);
      const tempPdfFile = path.join(tempDir, `Resumated-${Date.now()}.pdf`);

      await fs.promises.writeFile(tempHtmlFile, htmlContent, 'utf8');

      // Convert HTML to PDF using puppeteer
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.goto(`file://${tempHtmlFile}`, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
        },
      });

      await browser.close();

      // Clean up temporary files
      try {
        await fs.promises.unlink(tempHtmlFile);
      } catch (error) {
        this.logger.warn('Failed to delete temporary HTML file:', error);
      }

      // Convert Uint8Array to Buffer
      const buffer = Buffer.from(pdfBuffer);

      this.logger.log(
        `HTML to PDF conversion successful, size: ${buffer.length} bytes`,
      );
      return buffer;
    } catch (error) {
      this.logger.error('Error converting HTML to PDF:', error);
      throw new Error(`Failed to convert HTML to PDF: ${error.message}`);
    }
  }
}
