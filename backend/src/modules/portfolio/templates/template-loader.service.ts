import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PortfolioTemplate } from '../entities/portfolio-template.entity';

@Injectable()
export class TemplateLoaderService {
  private readonly templatesPath = __dirname;

  constructor(
    @InjectRepository(PortfolioTemplate)
    private templateRepository: Repository<PortfolioTemplate>,
  ) {}

  /**
   * Load template HTML content from file
   */
  async loadTemplateFile(fileName: string): Promise<string> {
    const templateFile = path.join(this.templatesPath, fileName);
    
    try {
      return fs.readFileSync(templateFile, 'utf-8');
    } catch (error) {
      throw new Error(`Template file not found: ${fileName} at ${templateFile}`);
    }
  }

  /**
   * Load template by name (from DB, then get file)
   */
  async loadTemplate(templateName: string): Promise<string> {
    const template = await this.templateRepository.findOne({
      where: { name: templateName, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(`Template not found: ${templateName}`);
    }

    // Increment usage count
    template.usageCount++;
    await this.templateRepository.save(template);

    // Load actual HTML file
    return this.loadTemplateFile(template.fileName);
  }

  /**
   * Get all available template files in directory
   */
  getAvailableTemplateFiles(): string[] {
    try {
      const files = fs.readdirSync(this.templatesPath);
      return files
        .filter(file => file.endsWith('.template.html'))
        .map(file => file.replace('.template.html', ''));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get all templates from DB
   */
  async getTemplates(): Promise<PortfolioTemplate[]> {
    return this.templateRepository.find({
      where: { isActive: true },
      order: { usageCount: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * Get single template metadata
   */
  async getTemplate(id: string): Promise<PortfolioTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  /**
   * Seed portfolio templates from constants
   */
  async seedPortfolioTemplates(): Promise<void> {
    const templates = [
      {
        name: 'basic',
        displayName: 'Basic',
        description: 'Simple and professional portfolio with all essential sections',
        fileName: 'basic.template.html',
        metadata: {
          category: 'basic' as const,
          color: '#2c3e50',
          preview: 'Clean and professional design with all essential sections',
          features: ['All sections', 'Responsive', 'Customizable'],
          sections: {
            hero: true,
            about: true,
            skills: true,
            experience: true,
            education: true,
            projects: true,
            certifications: false,
            awards: false,
            contact: true,
          },
          allowCustomization: true,
        },
        isPremium: false,
      },
      {
        name: 'creative',
        displayName: 'Creative',
        description: 'Eye-catching design focused on showcasing projects',
        fileName: 'creative.template.html',
        metadata: {
          category: 'creative' as const,
          color: '#e74c3c',
          preview: 'Modern design with focus on visual projects and creative work',
          features: ['Project showcase', 'Modern design', 'Customizable'],
          sections: {
            hero: true,
            about: false,
            skills: true,
            experience: false,
            education: false,
            projects: true,
            certifications: false,
            awards: false,
            contact: true,
          },
          allowCustomization: true,
        },
        isPremium: false,
      },
      {
        name: 'modern',
        displayName: 'Modern',
        description: 'Clean and modern professional portfolio',
        fileName: 'modern.template.html',
        metadata: {
          category: 'modern' as const,
          color: '#3498db',
          preview: 'Contemporary design with smooth animations and modern styling',
          features: ['Modern UI', 'Smooth animations', 'Customizable'],
          sections: {
            hero: true,
            about: true,
            skills: true,
            experience: true,
            education: true,
            projects: true,
            certifications: false,
            awards: false,
            contact: true,
          },
          allowCustomization: true,
        },
        isPremium: false,
      },
      {
        name: 'muhammad-ismail',
        displayName: 'Developer Pro',
        description: 'Comprehensive resume-style portfolio with all sections',
        fileName: 'muhammad-ismail.template.html',
        metadata: {
          category: 'developer' as const,
          color: '#9b59b6',
          preview: 'Complete professional portfolio with all sections and details',
          features: ['Complete sections', 'Professional', 'Certifications', 'Awards'],
          sections: {
            hero: true,
            about: true,
            skills: true,
            experience: true,
            education: true,
            projects: true,
            certifications: true,
            awards: true,
            contact: true,
          },
          allowCustomization: false,
        },
        isPremium: false,
      },
    ];

    for (const templateData of templates) {
      const existing = await this.templateRepository.findOne({
        where: { name: templateData.name },
      });

      if (!existing) {
        const template = this.templateRepository.create(templateData);
        await this.templateRepository.save(template);
      }
    }
  }
}