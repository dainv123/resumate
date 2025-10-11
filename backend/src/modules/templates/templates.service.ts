import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async create(createTemplateDto: CreateTemplateDto): Promise<Template> {
    // Check if template name already exists
    const existing = await this.templateRepository.findOne({
      where: { name: createTemplateDto.name },
    });

    if (existing) {
      throw new ConflictException('Template with this name already exists');
    }

    const template = this.templateRepository.create(createTemplateDto);
    return this.templateRepository.save(template);
  }

  async findAll(): Promise<Template[]> {
    return this.templateRepository.find({
      where: { isActive: true },
      order: { usageCount: 'DESC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async findByName(name: string): Promise<Template | null> {
    return this.templateRepository.findOne({
      where: { name },
    });
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto): Promise<Template> {
    const template = await this.findOne(id);
    Object.assign(template, updateTemplateDto);
    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }

  async incrementUsage(name: string): Promise<void> {
    const template = await this.findByName(name);
    if (template) {
      template.usageCount++;
      await this.templateRepository.save(template);
    }
  }

  async seedDefaultTemplates(): Promise<void> {
    const templates = [
      {
        name: 'professional',
        displayName: 'Professional',
        description: 'Clean, traditional single-column layout',
        metadata: {
          category: 'professional' as const,
          color: '#2c3e50',
          preview: 'Single column with header, sections, and standard formatting',
          features: ['ATS-friendly', 'Clean layout', 'Traditional design'],
        },
        isPremium: false,
      },
      {
        name: 'two-column',
        displayName: 'Modern Two-Column',
        description: 'Professional two-column design with skills sidebar',
        metadata: {
          category: 'modern' as const,
          color: '#4253D7',
          preview: 'Left column: Contact info & skills, Right column: Experience & education',
          features: ['Modern design', 'Skills sidebar', 'Professional styling'],
        },
        isPremium: false,
      },
    ];

    for (const templateData of templates) {
      const existing = await this.findByName(templateData.name);
      if (!existing) {
        await this.create(templateData);
      }
    }
  }
}

