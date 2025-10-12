import api from './api';

export enum PortfolioTemplate {
  BASIC = 'basic',
  MODERN = 'modern',
  CREATIVE = 'creative',
  MUHAMMAD_ISMAIL = 'muhammad-ismail',
}

export interface CreatePortfolioData {
  template: PortfolioTemplate;
  selectedCvId?: string;
  customSections?: any;
  customDomain?: string;
  bio?: string;
  avatar?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
}

export interface PortfolioData {
  user: {
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
  };
  cv: {
    summary?: string;
    skills: string[];
    experience: unknown[];
    education: unknown[];
  };
  projects: unknown[];
  template: PortfolioTemplate;
  customDomain?: string;
}

export interface PortfolioTemplateMetadata {
  id: string;
  name: string;
  displayName: string;
  description: string;
  fileName: string;
  metadata: {
    category: string;
    color: string;
    preview: string;
    features: string[];
    sections: {
      hero: boolean;
      about: boolean;
      skills: boolean;
      experience: boolean;
      education: boolean;
      projects: boolean;
      certifications: boolean;
      awards: boolean;
      contact: boolean;
    };
    allowCustomization: boolean;
  };
  isPremium: boolean;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const portfolioApi = {
  checkPortfolio: async (): Promise<{ exists: boolean; portfolio: any }> => {
    const response = await api.get('/portfolio/check');
    return response.data;
  },

  getTemplates: async (): Promise<PortfolioTemplateMetadata[]> => {
    const response = await api.get('/portfolio/templates');
    return response.data.templates || [];
  },

  seedTemplates: async (): Promise<{ message: string }> => {
    const response = await api.post('/portfolio/templates/seed');
    return response.data;
  },

  savePortfolio: async (data: CreatePortfolioData): Promise<any> => {
    const response = await api.post('/portfolio/save', data);
    return response.data;
  },

  generatePortfolio: async (data: CreatePortfolioData): Promise<PortfolioData> => {
    const response = await api.post('/portfolio/generate', data);
    return response.data;
  },

  generatePortfolioHTML: async (data: CreatePortfolioData): Promise<{ html: string }> => {
    const response = await api.post('/portfolio/html', data);
    return response.data;
  },

  generatePortfolioUrl: async (data: { customDomain?: string }): Promise<{ url: string }> => {
    const response = await api.post('/portfolio/url', data);
    return response.data;
  },

  getPortfolioByUsername: async (username: string): Promise<PortfolioData> => {
    const response = await api.get(`/portfolio/${username}`);
    return response.data;
  },
};