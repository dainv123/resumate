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
  name: string;
  description: string;
  sections: TemplateSection;
  allowCustomization: boolean;
  previewImage?: string;
}

export const TEMPLATE_CONFIGS: Record<PortfolioTemplate, TemplateConfig> = {
  [PortfolioTemplate.BASIC]: {
    id: PortfolioTemplate.BASIC,
    name: 'Basic',
    description: 'Simple and professional portfolio with all essential sections',
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
    name: 'Creative',
    description: 'Eye-catching design focused on showcasing projects',
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
    name: 'Modern',
    description: 'Clean and modern professional portfolio',
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
    name: 'Developer Pro',
    description: 'Comprehensive resume-style portfolio with all sections',
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

