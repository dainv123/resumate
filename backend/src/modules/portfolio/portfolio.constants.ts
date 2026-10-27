import { PortfolioTemplate } from './dto/portfolio.dto';

export interface TemplateSection {
  hero: boolean;
  about: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
  certifications: boolean;
  awards: boolean;
  contact: boolean;
}

export interface TemplateConfig {
  id: PortfolioTemplate;
  nameKey: string; // Translation key for name
  descriptionKey: string; // Translation key for description
  sections: TemplateSection;
  allowCustomization: boolean;
  previewImage?: string;
}

export const TEMPLATE_CONFIGS: Record<PortfolioTemplate, TemplateConfig> = {
  [PortfolioTemplate.BASIC]: {
    id: PortfolioTemplate.BASIC,
    nameKey: 'portfolio.templates.basic.name',
    descriptionKey: 'portfolio.templates.basic.description',
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

  [PortfolioTemplate.CREATIVE]: {
    id: PortfolioTemplate.CREATIVE,
    nameKey: 'portfolio.templates.creative.name',
    descriptionKey: 'portfolio.templates.creative.description',
    sections: {
      hero: true,
      about: false, // Creative template uses bio in hero instead
      skills: true,
      experience: false, // Focus on projects, not traditional experience
      education: false,
      projects: true,
      certifications: false,
      awards: false,
      contact: true,
    },
    allowCustomization: true,
  },

  [PortfolioTemplate.MODERN]: {
    id: PortfolioTemplate.MODERN,
    nameKey: 'portfolio.templates.modern.name',
    descriptionKey: 'portfolio.templates.modern.description',
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

  [PortfolioTemplate.MUHAMMAD_ISMAIL]: {
    id: PortfolioTemplate.MUHAMMAD_ISMAIL,
    nameKey: 'portfolio.templates.muhammad-ismail.name',
    descriptionKey: 'portfolio.templates.muhammad-ismail.description',
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
    allowCustomization: false, // Fixed comprehensive layout
  },
};

/**
 * Get template configuration by template type
 */
export function getTemplateConfig(template: PortfolioTemplate): TemplateConfig {
  return TEMPLATE_CONFIGS[template];
}

/**
 * Get all available templates
 */
export function getAllTemplateConfigs(): TemplateConfig[] {
  return Object.values(TEMPLATE_CONFIGS);
}
