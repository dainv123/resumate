import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { CvService } from '../cv/cv.service';
import { ProjectsService } from '../projects/projects.service';
import {
  CreatePortfolioDto,
  UpdatePortfolioDto,
  PortfolioData,
  PortfolioTemplate,
  PortfolioSections,
} from './dto/portfolio.dto';
import { TemplateLoaderService } from './templates/template-loader.service';
import { Portfolio as PortfolioEntity } from './entities/portfolio.entity';
import { getTemplateConfig } from './portfolio.constants';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private portfolioRepository: Repository<PortfolioEntity>,
    private usersService: UsersService,
    private cvService: CvService,
    private projectsService: ProjectsService,
    private templateLoaderService: TemplateLoaderService,
  ) {}

  async generatePortfolio(
    userId: string,
    createPortfolioDto: CreatePortfolioDto,
  ): Promise<PortfolioData> {
    // Get user data
    const user = await this.usersService.findById(userId);

    // Get CVs and select the appropriate one
    const cvs = await this.cvService.getUserCvs(userId);
    const selectedCv = createPortfolioDto.selectedCvId
      ? cvs.find((cv) => cv.id === createPortfolioDto.selectedCvId)
      : cvs[0]; // Default to latest CV

    // Get projects (module first; fall back to CV-embedded projects)
    const moduleProjects =
      await this.projectsService.getProjectsForPortfolio(userId);
    const contact = selectedCv?.parsedData?.contact;
    const parsed = selectedCv?.parsedData;

    // Get template configuration
    const templateConfig = getTemplateConfig(createPortfolioDto.template);

    // Merge template default sections with user custom sections
    const finalSections: PortfolioSections = {
      ...templateConfig.sections,
      ...(createPortfolioDto.customSections || {}),
    };

    // Build portfolio data based on active sections
    return {
      user: {
        name: user.name || contact?.name || '',
        email: user.email || contact?.email || '',
        avatar: createPortfolioDto.avatar || user.avatar,
        bio: createPortfolioDto.bio || parsed?.summary,
        linkedinUrl: createPortfolioDto.linkedinUrl || contact?.linkedin,
        githubUrl: createPortfolioDto.githubUrl || contact?.github,
        websiteUrl: createPortfolioDto.websiteUrl || contact?.website,
      },
      cv: {
        summary: finalSections.about ? parsed?.summary : undefined,
        skills: finalSections.skills
          ? parsed?.skills || {
              technical: [],
              soft: [],
              languages: [],
              tools: [],
            }
          : undefined,
        experience: finalSections.experience
          ? parsed?.experience || []
          : undefined,
        education: finalSections.education
          ? parsed?.education || []
          : undefined,
        certifications: finalSections.certifications
          ? parsed?.certifications || []
          : undefined,
        awards: finalSections.awards ? parsed?.awards || [] : undefined,
      },
      projects: finalSections.projects
        ? this.resolvePortfolioProjects(moduleProjects, parsed?.projects)
        : undefined,
      template: createPortfolioDto.template,
      customDomain: createPortfolioDto.customDomain,
      sections: finalSections,
      selectedCvId: createPortfolioDto.selectedCvId,
    };
  }

  async savePortfolio(
    userId: string,
    createPortfolioDto: CreatePortfolioDto,
  ): Promise<PortfolioEntity> {
    const user = await this.usersService.findById(userId);
    const username = user.email.split('@')[0].toLowerCase();

    // Check if user already has a portfolio
    let portfolio = await this.portfolioRepository.findOne({
      where: { userId, isActive: true },
    });

    // Generate portfolio data
    const portfolioData = await this.generatePortfolio(
      userId,
      createPortfolioDto,
    );

    // Generate HTML
    const html = await this.generatePortfolioHTML(portfolioData);

    // Generate URL
    const url = await this.generatePortfolioUrl(
      userId,
      createPortfolioDto.customDomain,
    );

    if (portfolio) {
      // Update existing portfolio (override)
      portfolio.template = createPortfolioDto.template;
      portfolio.customDomain = createPortfolioDto.customDomain || '';
      portfolio.bio = createPortfolioDto.bio || '';
      portfolio.avatar = createPortfolioDto.avatar || '';
      portfolio.linkedinUrl = createPortfolioDto.linkedinUrl || '';
      portfolio.githubUrl = createPortfolioDto.githubUrl || '';
      portfolio.websiteUrl = createPortfolioDto.websiteUrl || '';
      portfolio.generatedHtml = html;
      portfolio.generatedUrl = url;
      portfolio.updatedAt = new Date();
    } else {
      // Create new portfolio
      const uuid = randomUUID();
      portfolio = this.portfolioRepository.create({
        username,
        uuid,
        template: createPortfolioDto.template,
        customDomain: createPortfolioDto.customDomain,
        bio: createPortfolioDto.bio,
        avatar: createPortfolioDto.avatar,
        linkedinUrl: createPortfolioDto.linkedinUrl,
        githubUrl: createPortfolioDto.githubUrl,
        websiteUrl: createPortfolioDto.websiteUrl,
        generatedHtml: html,
        generatedUrl: url,
        userId,
      });
    }

    return await this.portfolioRepository.save(portfolio);
  }

  async getUserPortfolio(userId: string): Promise<PortfolioEntity | null> {
    return await this.portfolioRepository.findOne({
      where: { userId, isActive: true },
    });
  }

  async findActiveByUsername(username: string): Promise<PortfolioEntity> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { username, isActive: true },
      order: { createdAt: 'DESC' },
    });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    return portfolio;
  }

  /** Public HTML for username URL — prefer saved snapshot so it matches preview/save. */
  async getPublicHtmlByUsername(username: string): Promise<string> {
    const portfolio = await this.findActiveByUsername(username);
    if (portfolio.generatedHtml) {
      return portfolio.generatedHtml;
    }
    // Legacy rows without snapshot: regenerate once
    const portfolioData = await this.getPortfolioByUsername(username);
    return this.generatePortfolioHTML(portfolioData);
  }

  async getPortfolioByUsername(username: string): Promise<PortfolioData> {
    const portfolio = await this.findActiveByUsername(username);

    // Get user data using userId from portfolio
    const user = await this.usersService.findById(portfolio.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get CV data
    const cvs = await this.cvService.getUserCvs(user.id);
    const cvData = cvs.length > 0 ? cvs[0] : null;
    const parsed = cvData?.parsedData;
    const contact = parsed?.contact;

    // Get projects data
    const moduleProjects = await this.projectsService.getProjectsForPortfolio(
      user.id,
    );

    // Return the complete portfolio data
    return {
      user: {
        name: user.name || contact?.name || portfolio.bio || 'Portfolio Owner',
        email: user.email || contact?.email || '',
        avatar: portfolio.avatar || user.avatar || '',
        bio: portfolio.bio || parsed?.summary || '',
        linkedinUrl: portfolio.linkedinUrl || contact?.linkedin || '',
        githubUrl: portfolio.githubUrl || contact?.github || '',
        websiteUrl: portfolio.websiteUrl || contact?.website || '',
      },
      sections: {
        hero: true,
        about: true,
        experience: true,
        education: true,
        skills: true,
        projects: true,
        contact: true,
        certifications: true,
        awards: true,
      },
      cv: parsed
        ? {
            summary: parsed.summary || '',
            skills: parsed.skills || {
              technical: [],
              soft: [],
              languages: [],
              tools: [],
            },
            experience: parsed.experience || [],
            education: parsed.education || [],
            certifications: parsed.certifications || [],
            awards: parsed.awards || [],
          }
        : {
            summary: '',
            skills: { technical: [], soft: [], languages: [], tools: [] },
            experience: [],
            education: [],
            certifications: [],
            awards: [],
          },
      projects: this.resolvePortfolioProjects(moduleProjects, parsed?.projects),
      template: portfolio.template,
      customDomain: portfolio.customDomain,
    };
  }

  async getPortfolioByUuid(uuid: string): Promise<PortfolioEntity> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { uuid, isActive: true },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return portfolio;
  }

  async generatePortfolioHTML(portfolioData: PortfolioData): Promise<string> {
    const template = await this.getTemplate(portfolioData.template);
    return this.renderTemplate(template, portfolioData);
  }

  async generatePortfolioUrl(
    userId: string,
    customDomain?: string,
  ): Promise<string> {
    const user = await this.usersService.findById(userId);
    const username = user.email.split('@')[0].toLowerCase();

    // Always return the backend URL as primary portfolio URL
    const baseUrl = process.env.BACKEND_URL;
    return `${baseUrl}/portfolio/${username}`;
  }

  /**
   * Validates and formats custom domain
   * @returns formatted custom domain or null if invalid
   */
  validateCustomDomain(customDomain?: string): string | null {
    if (!customDomain || customDomain.trim() === '') {
      return null;
    }

    // Clean up custom domain - remove protocol if present
    const cleanDomain = customDomain.replace(/^https?:\/\//, '').trim();

    // Validate domain format (must contain at least one dot for valid domain)
    if (cleanDomain && cleanDomain.includes('.')) {
      return cleanDomain;
    }

    return null;
  }

  private async getTemplate(template: PortfolioTemplate): Promise<string> {
    const templateMap = {
      [PortfolioTemplate.BASIC]: 'basic',
      [PortfolioTemplate.MODERN]: 'modern',
      [PortfolioTemplate.CREATIVE]: 'creative',
      [PortfolioTemplate.MUHAMMAD_ISMAIL]: 'muhammad-ismail',
    };

    const templateName = templateMap[template];
    return await this.templateLoaderService.loadTemplate(templateName);
  }

  private renderTemplate(template: string, data: PortfolioData): string {
    // Enhanced template rendering for Muhammad Ismail template
    let html = template;

    // Remove sections that are not enabled before rendering data
    html = this.removeSectionsByMarkers(html, data.sections);

    // Replace user data
    html = html.replace(/\{\{user\.name\}\}/g, data.user.name || '');
    html = html.replace(/\{\{user\.bio\}\}/g, data.user.bio || '');
    html = html.replace(/\{\{user\.email\}\}/g, data.user.email || '');
    html = html.replace(/\{\{user\.avatar\}\}/g, data.user.avatar || '');
    html = html.replace(
      /\{\{user\.linkedinUrl\}\}/g,
      data.user.linkedinUrl || '',
    );
    html = html.replace(/\{\{user\.githubUrl\}\}/g, data.user.githubUrl || '');
    html = html.replace(
      /\{\{user\.websiteUrl\}\}/g,
      data.user.websiteUrl || '',
    );

    // Replace CV data
    html = html.replace(/\{\{cv\.summary\}\}/g, data.cv.summary || '');

    // Handle conditional blocks for user data
    html = this.renderConditionalBlocks(html, data);

    // Handle skills sections (if enabled)
    if (data.sections.skills && data.cv.skills) {
      html = this.renderSkillsSections(html, data);
    }

    // Handle experience section (if enabled)
    if (data.sections.experience && data.cv.experience) {
      html = this.renderExperienceSection(html, data);
    }

    // Handle education section (if enabled)
    if (data.sections.education && data.cv.education) {
      html = this.renderEducationSection(html, data);
    }

    // Handle certifications section (if enabled)
    if (data.sections.certifications && data.cv.certifications) {
      html = this.renderCertificationsSection(html, data);
    }

    // Handle awards section (if enabled)
    if (data.sections.awards && data.cv.awards) {
      html = this.renderAwardsSection(html, data);
    }

    // Handle projects section (if enabled)
    if (data.sections.projects && data.projects) {
      html = this.renderProjectsSection(html, data);
    }

    // Clean up any remaining Handlebars syntax
    html = this.cleanupRemainingHandlebars(html);

    return html;
  }

  /**
   * Remove sections based on HTML comment markers
   * Example: <!-- SECTION:EXPERIENCE -->...<!-- /SECTION:EXPERIENCE -->
   */
  private removeSectionsByMarkers(
    html: string,
    sections: PortfolioSections,
  ): string {
    const sectionMarkers = [
      { key: 'hero', marker: 'HERO' },
      { key: 'about', marker: 'ABOUT' },
      { key: 'skills', marker: 'SKILLS' },
      { key: 'experience', marker: 'EXPERIENCE' },
      { key: 'education', marker: 'EDUCATION' },
      { key: 'projects', marker: 'PROJECTS' },
      { key: 'certifications', marker: 'CERTIFICATIONS' },
      { key: 'awards', marker: 'AWARDS' },
      { key: 'contact', marker: 'CONTACT' },
    ];

    for (const { key, marker } of sectionMarkers) {
      if (!sections[key]) {
        // Remove the entire section including markers
        const regex = new RegExp(
          `<!--\\s*SECTION:${marker}\\s*-->[\\s\\S]*?<!--\\s*/SECTION:${marker}\\s*-->`,
          'gi',
        );
        html = html.replace(regex, '');
      } else {
        // Keep section but remove markers for cleaner HTML
        html = html.replace(
          new RegExp(`<!--\\s*SECTION:${marker}\\s*-->`, 'gi'),
          '',
        );
        html = html.replace(
          new RegExp(`<!--\\s*/SECTION:${marker}\\s*-->`, 'gi'),
          '',
        );
      }
    }

    return html;
  }

  private renderConditionalBlocks(html: string, data: PortfolioData): string {
    // Handle {{#if user.avatar}} blocks
    html = html.replace(
      /\{\{#if user\.avatar\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, content) => {
        return data.user.avatar ? content : '';
      },
    );

    // Handle {{#if user.linkedinUrl}} blocks
    html = html.replace(
      /\{\{#if user\.linkedinUrl\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, content) => {
        return data.user.linkedinUrl ? content : '';
      },
    );

    // Handle {{#if user.githubUrl}} blocks
    html = html.replace(
      /\{\{#if user\.githubUrl\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, content) => {
        return data.user.githubUrl ? content : '';
      },
    );

    // Handle {{#if user.websiteUrl}} blocks
    html = html.replace(
      /\{\{#if user\.websiteUrl\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, content) => {
        return data.user.websiteUrl ? content : '';
      },
    );

    // Handle {{#if cv.experience}} blocks
    html = html.replace(
      /\{\{#if cv\.experience\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, content) => {
        return data.cv.experience && data.cv.experience.length > 0
          ? content
          : '';
      },
    );

    // Handle {{#if projects}} blocks
    html = html.replace(
      /\{\{#if projects\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, content) => {
        return data.projects && data.projects.length > 0 ? content : '';
      },
    );

    return html;
  }

  private renderSkillsSections(html: string, data: PortfolioData): string {
    // Handle technical skills
    html = html.replace(
      /\{\{#if cv\.skills\.technical\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, content) => {
        if (
          !data.cv?.skills?.technical ||
          data.cv.skills.technical.length === 0
        )
          return '';

        const skillsHtml = data.cv.skills.technical
          .map((skill) => `<span class="skill">${skill}</span>`)
          .join('');

        return content.replace(
          /\{\{#each cv\.skills\.technical\}\}[\s\S]*?\{\{\/each\}\}/g,
          skillsHtml,
        );
      },
    );

    // Handle soft skills
    html = html.replace(
      /\{\{#if cv\.skills\.soft\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, content) => {
        if (!data.cv?.skills?.soft || data.cv.skills.soft.length === 0)
          return '';

        const skillsHtml = data.cv.skills.soft
          .map((skill) => `<span class="skill">${skill}</span>`)
          .join('');

        return content.replace(
          /\{\{#each cv\.skills\.soft\}\}[\s\S]*?\{\{\/each\}\}/g,
          skillsHtml,
        );
      },
    );

    // Handle languages
    html = html.replace(
      /\{\{#if cv\.skills\.languages\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, content) => {
        if (
          !data.cv?.skills?.languages ||
          data.cv.skills.languages.length === 0
        )
          return '';

        const skillsHtml = data.cv.skills.languages
          .map((skill) => `<span class="skill">${skill}</span>`)
          .join('');

        return content.replace(
          /\{\{#each cv\.skills\.languages\}\}[\s\S]*?\{\{\/each\}\}/g,
          skillsHtml,
        );
      },
    );

    // Handle tools
    html = html.replace(
      /\{\{#if cv\.skills\.tools\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, content) => {
        if (!data.cv?.skills?.tools || data.cv.skills.tools.length === 0)
          return '';

        const skillsHtml = data.cv.skills.tools
          .map((skill) => `<span class="skill">${skill}</span>`)
          .join('');

        return content.replace(
          /\{\{#each cv\.skills\.tools\}\}[\s\S]*?\{\{\/each\}\}/g,
          skillsHtml,
        );
      },
    );

    return html;
  }

  private renderExperienceSection(html: string, data: PortfolioData): string {
    if (!data.cv.experience || data.cv.experience.length === 0) {
      return html.replace(
        /\{\{#if cv\.experience\}\}([\s\S]*?)\{\{\/if\}\}/g,
        '',
      );
    }

    const experienceHtml = data.cv.experience
      .map((exp) => {
        const title = exp.title || exp.role || 'Position';
        const duration = this.formatCvDuration(exp) || 'Duration';
        const body = this.formatExperienceBody(exp);
        const tech =
          Array.isArray(exp.technologies) && exp.technologies.length > 0
            ? `<p class="tech-stack">${exp.technologies.join(', ')}</p>`
            : '';

        return `
      <div class="experience-item">
        <div class="experience-card">
          <h3>${title}</h3>
          <div class="company">${exp.company || 'Company'}</div>
          <div class="duration">${duration}</div>
          ${body}
          ${tech}
        </div>
      </div>
    `;
      })
      .join('');

    html = html.replace(
      /\{\{#each cv\.experience\}\}([\s\S]*?)\{\{\/each\}\}/g,
      () => experienceHtml,
    );

    return html;
  }

  private renderProjectsSection(html: string, data: PortfolioData): string {
    if (!data.projects || data.projects.length === 0) {
      return html.replace(/\{\{#if projects\}\}([\s\S]*?)\{\{\/if\}\}/g, '');
    }

    const projectsHtml = data.projects
      .map((project) => {
        const techStack = project.techStack || project.technologies || [];
        const demoLink = project.demoLink || project.link;
        const githubLink = project.githubLink || project.repository;
        return `
      <div class="card">
        <h3>${project.name || 'Project Name'}</h3>
        <p>${project.description || 'No description available'}</p>
        <p class="tech-stack">Tech Stack: ${
          techStack.length > 0 ? techStack.join(', ') : 'Not specified'
        }</p>
        ${demoLink ? `<p><a href="${demoLink}" target="_blank">View Demo</a></p>` : ''}
        ${githubLink ? `<p><a href="${githubLink}" target="_blank">View Code</a></p>` : ''}
      </div>
    `;
      })
      .join('');

    html = html.replace(
      /\{\{#each projects\}\}([\s\S]*?)\{\{\/each\}\}/g,
      () => projectsHtml,
    );

    return html;
  }

  private renderEducationSection(html: string, data: PortfolioData): string {
    if (!data.cv.education || data.cv.education.length === 0) {
      return html.replace(
        /\{\{#if cv\.education\}\}([\s\S]*?)\{\{\/if\}\}/g,
        '',
      );
    }

    const educationHtml = data.cv.education
      .map((edu) => {
        const school = edu.school || edu.institution || 'School';
        const year = this.formatCvDuration(edu);
        return `
      <div class="education-item">
        <h3>${edu.degree || 'Degree'}</h3>
        <div class="school">${school}</div>
        <div class="year">${year}</div>
        ${edu.gpa ? `<div class="gpa">GPA: ${edu.gpa}</div>` : ''}
        ${edu.honors ? `<div class="honors">${edu.honors}</div>` : ''}
      </div>
    `;
      })
      .join('');

    html = html.replace(
      /\{\{#each cv\.education\}\}([\s\S]*?)\{\{\/each\}\}/g,
      () => educationHtml,
    );

    return html;
  }

  private renderCertificationsSection(
    html: string,
    data: PortfolioData,
  ): string {
    if (!data.cv.certifications || data.cv.certifications.length === 0) {
      return html.replace(
        /\{\{#if cv\.certifications\}\}([\s\S]*?)\{\{\/if\}\}/g,
        '',
      );
    }

    const certificationsHtml = data.cv.certifications
      .map((cert) => {
        const link = cert.link || cert.credentialUrl;
        return `
      <div class="certification-item">
        <h3>${cert.name || 'Certification'}</h3>
        <div class="issuer">${cert.issuer || 'Issuer'}</div>
        <div class="date">${cert.date || ''}</div>
        ${link ? `<a href="${link}" target="_blank">View Certificate</a>` : ''}
      </div>
    `;
      })
      .join('');

    html = html.replace(
      /\{\{#each cv\.certifications\}\}([\s\S]*?)\{\{\/each\}\}/g,
      () => certificationsHtml,
    );

    return html;
  }

  private renderAwardsSection(html: string, data: PortfolioData): string {
    if (!data.cv.awards || data.cv.awards.length === 0) {
      return html.replace(/\{\{#if cv\.awards\}\}([\s\S]*?)\{\{\/if\}\}/g, '');
    }

    const awardsHtml = data.cv.awards
      .map((award) => {
        const name = award.name || award.title || 'Award';
        return `
      <div class="award-item">
        <h3>${name}</h3>
        <div class="issuer">${award.issuer || 'Issuer'}</div>
        <div class="date">${award.date || ''}</div>
      </div>
    `;
      })
      .join('');

    html = html.replace(
      /\{\{#each cv\.awards\}\}([\s\S]*?)\{\{\/each\}\}/g,
      () => awardsHtml,
    );

    return html;
  }

  private resolvePortfolioProjects(
    moduleProjects: any[] | undefined,
    cvProjects: any[] | undefined,
  ): any[] {
    if (moduleProjects?.length) return moduleProjects;
    return (cvProjects || []).map((project) => ({
      name: project.name,
      description: project.description,
      techStack: project.techStack || project.technologies || [],
      demoLink: project.demoLink || project.link,
      githubLink: project.githubLink || project.repository,
    }));
  }

  private formatCvDuration(item: {
    duration?: string;
    year?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
  }): string {
    if (item.duration) return item.duration;
    if (item.year) return item.year;
    if (item.startDate) {
      const end = item.current ? 'Present' : item.endDate || '';
      return end ? `${item.startDate} - ${end}` : item.startDate;
    }
    return '';
  }

  private formatExperienceBody(exp: any): string {
    if (exp.description) {
      return `<p>${exp.description}</p>`;
    }

    const parts: string[] = [];
    if (exp.companyDescription) {
      parts.push(`<p>${exp.companyDescription}</p>`);
    }

    const bullets = [
      ...(Array.isArray(exp.responsibilities) ? exp.responsibilities : []),
      ...(Array.isArray(exp.achievements) ? exp.achievements : []),
    ];
    if (bullets.length > 0) {
      parts.push(
        `<ul>${bullets.map((item: string) => `<li>${item}</li>`).join('')}</ul>`,
      );
    }

    if (Array.isArray(exp.subProjects) && exp.subProjects.length > 0) {
      for (const sub of exp.subProjects) {
        const heading = [sub.name, sub.role].filter(Boolean).join(' — ');
        if (heading) {
          parts.push(`<p><strong>${heading}</strong></p>`);
        }
        const subBullets = Array.isArray(sub.responsibilities)
          ? sub.responsibilities
          : [];
        if (subBullets.length > 0) {
          parts.push(
            `<ul>${subBullets.map((item: string) => `<li>${item}</li>`).join('')}</ul>`,
          );
        }
        const subTech = sub.techStack || sub.technologies;
        if (Array.isArray(subTech) && subTech.length > 0) {
          parts.push(`<p class="tech-stack">${subTech.join(', ')}</p>`);
        }
      }
    }

    return parts.length > 0
      ? parts.join('')
      : '<p>No description available</p>';
  }

  private cleanupRemainingHandlebars(html: string): string {
    // Remove any remaining Handlebars syntax that wasn't processed
    html = html.replace(/\{\{[^}]*\}\}/g, '');

    // Remove empty conditional blocks
    html = html.replace(/\{\{#if[^}]*\}\}[\s\S]*?\{\{\/if\}\}/g, '');

    // Remove empty each blocks
    html = html.replace(/\{\{#each[^}]*\}\}[\s\S]*?\{\{\/each\}\}/g, '');

    // Clean up any remaining empty lines or whitespace
    html = html.replace(/\n\s*\n\s*\n/g, '\n\n');

    return html;
  }

  // ============== Template Management ==============

  /**
   * Get all portfolio templates
   */
  async getTemplates() {
    const templates = await this.templateLoaderService.getTemplates();

    // Transform displayName and description to use translation keys
    return templates.map((template) => ({
      ...template,
      displayName: this.getTemplateTranslationKey(template.name, 'name'),
      description: this.getTemplateTranslationKey(template.name, 'description'),
    }));
  }

  private getTemplateTranslationKey(
    templateName: string,
    type: 'name' | 'description',
  ): string {
    return `portfolio.templates.${templateName}.${type}`;
  }

  /**
   * Get single portfolio template metadata
   */
  async getTemplateMetadata(id: string) {
    const template = await this.templateLoaderService.getTemplate(id);

    // Transform displayName and description to use translation keys
    return {
      ...template,
      displayName: this.getTemplateTranslationKey(template.name, 'name'),
      description: this.getTemplateTranslationKey(template.name, 'description'),
    };
  }

  /**
   * Seed default portfolio templates
   */
  async seedTemplates() {
    return this.templateLoaderService.seedPortfolioTemplates();
  }
}
