import api from './api';

export enum PortfolioTemplate {
  BASIC = 'basic',
  MODERN = 'modern',
  CREATIVE = 'creative',
  MUHAMMAD_ISMAIL = 'muhammad_ismail',
}

export interface CreatePortfolioData {
  template: PortfolioTemplate;
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

export const portfolioApi = {
  checkPortfolio: async (): Promise<{ exists: boolean; portfolio: any }> => {
    const response = await api.get('/portfolio/check');
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