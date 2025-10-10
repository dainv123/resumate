import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { CvService } from '../cv/cv.service';
import { ProjectsService } from '../projects/projects.service';
import { CreatePortfolioDto, UpdatePortfolioDto, PortfolioData, PortfolioTemplate } from './dto/portfolio.dto';
import { TemplateLoaderService } from './templates/template-loader.service';
import { Portfolio as PortfolioEntity } from './entities/portfolio.entity';

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

  async generatePortfolio(userId: string, createPortfolioDto: CreatePortfolioDto): Promise<PortfolioData> {
    // Get user data
    const user = await this.usersService.findById(userId);
    
    // Get latest CV
    const cvs = await this.cvService.getUserCvs(userId);
    const latestCv = cvs[0];

    // Get projects
    const projects = await this.projectsService.getProjectsForPortfolio(userId);

    return {
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar || createPortfolioDto.avatar,
        bio: createPortfolioDto.bio,
        linkedinUrl: createPortfolioDto.linkedinUrl,
        githubUrl: createPortfolioDto.githubUrl,
        websiteUrl: createPortfolioDto.websiteUrl,
      },
      cv: {
        summary: latestCv?.parsedData.summary,
        skills: latestCv?.parsedData.skills || {
          technical: [],
          soft: [],
          languages: [],
          tools: []
        },
        experience: latestCv?.parsedData.experience || [],
        education: latestCv?.parsedData.education || [],
      },
      projects,
      template: createPortfolioDto.template,
      customDomain: createPortfolioDto.customDomain,
    };
  }

  async savePortfolio(userId: string, createPortfolioDto: CreatePortfolioDto): Promise<PortfolioEntity> {
    const user = await this.usersService.findById(userId);
    const username = user.email.split('@')[0].toLowerCase();
    
    // Check if user already has a portfolio
    let portfolio = await this.portfolioRepository.findOne({
      where: { userId, isActive: true }
    });
    
    // Generate portfolio data
    const portfolioData = await this.generatePortfolio(userId, createPortfolioDto);
    
    // Generate HTML
    const html = await this.generatePortfolioHTML(portfolioData);
    
    // Generate URL
    const url = await this.generatePortfolioUrl(userId, createPortfolioDto.customDomain);
    
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
      where: { userId, isActive: true }
    });
  }

  async getPortfolioByUsername(username: string): Promise<PortfolioData> {
    // Find portfolio by username
    const portfolio = await this.portfolioRepository.findOne({
      where: { username, isActive: true },
      order: { createdAt: 'DESC' }
    });
    
    if (!portfolio) {
    throw new NotFoundException('Portfolio not found');
    }
    
    // Get user data using userId from portfolio
    const user = await this.usersService.findById(portfolio.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Get CV data
    const cvs = await this.cvService.getUserCvs(user.id);
    const cvData = cvs.length > 0 ? cvs[0] : null;
    
    // Get projects data
    const projects = await this.projectsService.getUserProjects(user.id);
    
    // Return the complete portfolio data
    return {
      user: {
        name: user.name || portfolio.bio || 'Portfolio Owner',
        email: user.email || '',
        avatar: portfolio.avatar || user.avatar || '',
        bio: portfolio.bio || '',
        linkedinUrl: portfolio.linkedinUrl || '',
        githubUrl: portfolio.githubUrl || '',
        websiteUrl: portfolio.websiteUrl || '',
      },
      cv: cvData ? {
        summary: cvData.parsedData?.summary || '',
        skills: cvData.parsedData?.skills || { technical: [], soft: [], languages: [], tools: [] },
        experience: cvData.parsedData?.experience || [],
        education: cvData.parsedData?.education || [],
      } : {
        summary: '',
        skills: { technical: [], soft: [], languages: [], tools: [] },
        experience: [],
        education: [],
      },
      projects: projects || [],
      template: portfolio.template,
      customDomain: portfolio.customDomain,
    };
  }

  async getPortfolioByUuid(uuid: string): Promise<PortfolioEntity> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { uuid, isActive: true }
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

  async generatePortfolioUrl(userId: string, customDomain?: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    const username = user.email.split('@')[0].toLowerCase();
    
    // Always return the backend URL as primary portfolio URL
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5001';
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
    
    // Replace user data
    html = html.replace(/\{\{user\.name\}\}/g, data.user.name || '');
    html = html.replace(/\{\{user\.bio\}\}/g, data.user.bio || '');
    html = html.replace(/\{\{user\.email\}\}/g, data.user.email || '');
    html = html.replace(/\{\{user\.avatar\}\}/g, data.user.avatar || '');
    html = html.replace(/\{\{user\.linkedinUrl\}\}/g, data.user.linkedinUrl || '');
    html = html.replace(/\{\{user\.githubUrl\}\}/g, data.user.githubUrl || '');
    html = html.replace(/\{\{user\.websiteUrl\}\}/g, data.user.websiteUrl || '');
    
    // Replace CV data
    html = html.replace(/\{\{cv\.summary\}\}/g, data.cv.summary || '');
    
    // Handle conditional blocks for user data
    html = this.renderConditionalBlocks(html, data);
    
    // Handle skills sections
    html = this.renderSkillsSections(html, data);
    
    // Handle experience section
    html = this.renderExperienceSection(html, data);
    
    // Handle projects section
    html = this.renderProjectsSection(html, data);
    
    // Clean up any remaining Handlebars syntax
    html = this.cleanupRemainingHandlebars(html);
    
    return html;
  }

  private renderConditionalBlocks(html: string, data: PortfolioData): string {
    // Handle {{#if user.avatar}} blocks
    html = html.replace(/\{\{#if user\.avatar\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, content) => {
      return data.user.avatar ? content : '';
    });
    
    // Handle {{#if user.linkedinUrl}} blocks
    html = html.replace(/\{\{#if user\.linkedinUrl\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, content) => {
      return data.user.linkedinUrl ? content : '';
    });
    
    // Handle {{#if user.githubUrl}} blocks
    html = html.replace(/\{\{#if user\.githubUrl\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, content) => {
      return data.user.githubUrl ? content : '';
    });
    
    // Handle {{#if user.websiteUrl}} blocks
    html = html.replace(/\{\{#if user\.websiteUrl\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, content) => {
      return data.user.websiteUrl ? content : '';
    });
    
    // Handle {{#if cv.experience}} blocks
    html = html.replace(/\{\{#if cv\.experience\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, content) => {
      return data.cv.experience && data.cv.experience.length > 0 ? content : '';
    });
    
    // Handle {{#if projects}} blocks
    html = html.replace(/\{\{#if projects\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, content) => {
      return data.projects && data.projects.length > 0 ? content : '';
    });
    
    return html;
  }

  private renderSkillsSections(html: string, data: PortfolioData): string {
    // Handle technical skills
    html = html.replace(/\{\{#if cv\.skills\.technical\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, content) => {
      if (!data.cv.skills.technical || data.cv.skills.technical.length === 0) return '';
      
      const skillsHtml = data.cv.skills.technical.map(skill => 
        `<span class="skill">${skill}</span>`
      ).join('');
      
      return content.replace(/\{\{#each cv\.skills\.technical\}\}[\s\S]*?\{\{\/each\}\}/g, skillsHtml);
    });
    
    // Handle soft skills
    html = html.replace(/\{\{#if cv\.skills\.soft\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, content) => {
      if (!data.cv.skills.soft || data.cv.skills.soft.length === 0) return '';
      
      const skillsHtml = data.cv.skills.soft.map(skill => 
        `<span class="skill">${skill}</span>`
      ).join('');
      
      return content.replace(/\{\{#each cv\.skills\.soft\}\}[\s\S]*?\{\{\/each\}\}/g, skillsHtml);
    });
    
    // Handle languages
    html = html.replace(/\{\{#if cv\.skills\.languages\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, content) => {
      if (!data.cv.skills.languages || data.cv.skills.languages.length === 0) return '';
      
      const skillsHtml = data.cv.skills.languages.map(skill => 
        `<span class="skill">${skill}</span>`
      ).join('');
      
      return content.replace(/\{\{#each cv\.skills\.languages\}\}[\s\S]*?\{\{\/each\}\}/g, skillsHtml);
    });
    
    // Handle tools
    html = html.replace(/\{\{#if cv\.skills\.tools\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, content) => {
      if (!data.cv.skills.tools || data.cv.skills.tools.length === 0) return '';
      
      const skillsHtml = data.cv.skills.tools.map(skill => 
        `<span class="skill">${skill}</span>`
      ).join('');
      
      return content.replace(/\{\{#each cv\.skills\.tools\}\}[\s\S]*?\{\{\/each\}\}/g, skillsHtml);
    });
    
    return html;
  }

  private renderExperienceSection(html: string, data: PortfolioData): string {
    if (!data.cv.experience || data.cv.experience.length === 0) {
      return html.replace(/\{\{#if cv\.experience\}\}([\s\S]*?)\{\{\/if\}\}/g, '');
    }
    
    const experienceHtml = data.cv.experience.map(exp => `
      <div class="experience-item">
        <div class="experience-card">
          <h3>${exp.role || 'Position'}</h3>
          <div class="company">${exp.company || 'Company'}</div>
          <div class="duration">${exp.duration || 'Duration'}</div>
          <p>${exp.description || 'No description available'}</p>
        </div>
      </div>
    `).join('');
    
    html = html.replace(/\{\{#each cv\.experience\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, content) => {
      return experienceHtml;
    });
    
    return html;
  }

  private renderProjectsSection(html: string, data: PortfolioData): string {
    if (!data.projects || data.projects.length === 0) {
      return html.replace(/\{\{#if projects\}\}([\s\S]*?)\{\{\/if\}\}/g, '');
    }
    
    const projectsHtml = data.projects.map(project => `
      <div class="card">
        <h3>${project.name || 'Project Name'}</h3>
        <p>${project.description || 'No description available'}</p>
        <p class="tech-stack">Tech Stack: ${project.techStack ? project.techStack.join(', ') : 'Not specified'}</p>
        ${project.demoLink ? `<p><a href="${project.demoLink}" target="_blank">View Demo</a></p>` : ''}
        ${project.githubLink ? `<p><a href="${project.githubLink}" target="_blank">View Code</a></p>` : ''}
      </div>
    `).join('');
    
    html = html.replace(/\{\{#each projects\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, content) => {
      return projectsHtml;
    });
    
    return html;
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

}