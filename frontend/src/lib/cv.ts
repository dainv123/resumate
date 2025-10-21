import api from './api';
import { CVData, TemplateConfig } from '../types/cv.types';
import { CVUtils } from '../utils/cv.utils';

export interface ImprovementNotes {
  parsingImprovements: string[];
  templateEnhancements: string[];
  dataCompleteness: string[];
  lastUpdated: string;
}

export interface ExportHistory {
  date: string;
  format: string;
  template: string;
}

export interface VersionHistory {
  version: number;
  parsedData: CVData;
  updatedAt: string;
  updatedBy?: string;
}

export interface CV {
  id: string;
  userId: string;
  originalFileName: string;
  fileUrl: string;
  parsedData: CVData;
  version: number;
  isTailored: boolean;
  tailoredForJob?: string;
  originalCvId?: string;
  jobDescriptionId?: string;
  improvementNotes?: ImprovementNotes;
  exportHistory?: ExportHistory[];
  versionHistory?: VersionHistory[];
  originalCv?: CV;
  jobDescription?: JobDescription;
  tailoredVersions?: CV[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QuickBuildCvData {
  name: string;
  email: string;
  targetRole: string;
  jobDescription: string;
  template?: string;
}

export interface JobDescription {
  id: string;
  userId: string;
  title: string;
  description: string;
  company?: string;
  location?: string;
  salary?: string;
  experience?: string;
  requirements: {
    skills: string[];
    education: string[];
    experience: string[];
    certifications: string[];
  };
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CompatibilityAnalysis {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedExperience: string[];
  missingRequirements: string[];
  suggestions: string[];
  strengths: string[];
}

export const cvApi = {
  uploadCv: async (file: File): Promise<CV> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUserCvs: async (): Promise<CV[]> => {
    const response = await api.get('/cv');
    return response.data;
  },

  getUserCvsPaginated: async (options: PaginationOptions = {}): Promise<PaginatedResult<CV>> => {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) {
      // Convert lowercase to uppercase for TypeORM compatibility
      const sortOrder = options.sortOrder.toUpperCase();
      params.append('sortOrder', sortOrder);
    }

    const response = await api.get(`/cv/paginated?${params.toString()}`);
    return response.data;
  },

  getCvById: async (id: string): Promise<CV> => {
    const response = await api.get(`/cv/${id}`);
    return response.data;
  },

  getCvWithRelatedData: async (id: string): Promise<CV> => {
    const response = await api.get(`/cv/${id}/full`);
    return response.data;
  },

  getCvVersions: async (id: string): Promise<CV[]> => {
    const response = await api.get(`/cv/${id}/versions`);
    return response.data;
  },

  updateCv: async (id: string, data: Partial<CV>): Promise<CV> => {
    const response = await api.put(`/cv/${id}`, data);
    return response.data;
  },

  tailorCv: async (id: string, jobDescription: string): Promise<CV> => {
    const response = await api.post(`/cv/${id}/tailor`, { jobDescription });
    return response.data;
  },

  analyzeCompatibility: async (id: string, jobDescription: string): Promise<CompatibilityAnalysis> => {
    const response = await api.post(`/cv/${id}/analyze-compatibility`, { jobDescription });
    return response.data;
  },

  generateCoverLetter: async (id: string, jobDescription: string): Promise<{ coverLetter: string }> => {
    const response = await api.post(`/cv/${id}/generate-cover-letter`, { jobDescription });
    return response.data;
  },

  getSuggestions: async (id: string): Promise<string[]> => {
    const response = await api.get(`/cv/${id}/suggestions`);
    return response.data;
  },

  deleteCv: async (id: string): Promise<void> => {
    await api.delete(`/cv/${id}`);
  },

  duplicateCv: async (id: string): Promise<CV> => {
    const response = await api.post(`/cv/${id}/duplicate`);
    return response.data;
  },

  restoreVersion: async (id: string, version: number): Promise<CV> => {
    const response = await api.post(`/cv/${id}/restore/${version}`);
    return response.data;
  },

  exportToPDF: async (id: string, template: string = 'professional'): Promise<Blob> => {
    const response = await api.get(`/cv/${id}/export/pdf?template=${template}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportToPDFWithConfig: async (id: string, templateConfig: any): Promise<Blob> => {
    const response = await api.post(`/cv/${id}/export/pdf/dynamic`, templateConfig, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportToWord: async (id: string): Promise<Blob> => {
    const response = await api.get(`/cv/${id}/export/word`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportToATS: async (id: string): Promise<Blob> => {
    const response = await api.get(`/cv/${id}/export/ats`, {
      responseType: 'blob',
    });
    return response.data;
  },

  quickBuildCv: async (data: QuickBuildCvData): Promise<CV> => {
    const response = await api.post('/cv/quick-build', data);
    return response.data;
  },

  updateCvWithQuickBuild: async (id: string, data: QuickBuildCvData): Promise<CV> => {
    const response = await api.put(`/cv/${id}/quick-build`, data);
    return response.data;
  },
};

// Export helper functions for easier imports
export const getAllCvs = cvApi.getUserCvs;
export const getCvById = cvApi.getCvById;
export const uploadCv = cvApi.uploadCv;