import api from './api';
import { CVData } from '../types/cv.types';

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
  // New fields for relationships
  tailoredCvs?: CV[];
  matchingAnalysis?: any;
  coverLetter?: string;
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
  reused?: boolean; // Flag to indicate if analysis was reused
}

export interface CvMatchingAnalysis {
  id: string;
  jobDescriptionId: string;
  userId: string;
  jobDescriptionSnapshot: {
    title: string;
    company?: string;
    description: string;
    keyRequirements: string[];
    experience?: string;
    createdAt: string;
  };
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  strengths: string[];
  notes?: string;
  isSnapshot: boolean;
  snapshotReason?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  jobDescription?: JobDescription;
}

export interface CvCoverLetter {
  id: string;
  jobDescriptionId: string;
  userId: string;
  jobDescriptionSnapshot: {
    title: string;
    company?: string;
    description: string;
    keyRequirements: string[];
    experience?: string;
    createdAt: string;
  };
  content: string;
  personalizedContent?: string;
  tone: string;
  format: string;
  wordCount: number;
  isCustomized: boolean;
  notes?: string;
  isSnapshot: boolean;
  snapshotReason?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  jobDescription?: JobDescription;
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

  createCv: async (originalFileName: string, parsedData: CVData, fileUrl?: string): Promise<CV> => {
    const requestBody: any = {
      originalFileName,
      parsedData,
    };
    
    // Only include fileUrl if it's provided
    if (fileUrl) {
      requestBody.fileUrl = fileUrl;
    }
    
    const response = await api.post('/cv', requestBody);
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

  analyzeCompatibility: async (id: string, jobDescription: string, jobTitle?: string, company?: string): Promise<CompatibilityAnalysis> => {
    const response = await api.post(`/cv/${id}/analyze-compatibility`, { 
      jobDescription, 
      jobTitle, 
      company 
    });
    return response.data;
  },

  generateCoverLetter: async (id: string, jobDescription: string, jobTitle?: string, company?: string): Promise<{ coverLetter: string; reused?: boolean }> => {
    const response = await api.post(`/cv/${id}/generate-cover-letter`, { 
      jobDescription, 
      jobTitle, 
      company 
    });
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

  // New APIs for analysis and cover letter management
  getUserAnalyses: async (): Promise<CvMatchingAnalysis[]> => {
    const response = await api.get('/cv/analyses');
    return response.data;
  },

  getAnalysisByJobDescription: async (jobDescriptionId: string): Promise<CvMatchingAnalysis | null> => {
    const response = await api.get(`/cv/analyses/job-description/${jobDescriptionId}`);
    return response.data;
  },

  getUserCoverLetters: async (): Promise<CvCoverLetter[]> => {
    const response = await api.get('/cv/cover-letters');
    return response.data;
  },

  getCoverLetterByJobDescription: async (jobDescriptionId: string): Promise<CvCoverLetter | null> => {
    const response = await api.get(`/cv/cover-letters/job-description/${jobDescriptionId}`);
    return response.data;
  },

  // Helper method to check if analysis exists for a job description
  checkExistingAnalysis: async (_jobDescription: string): Promise<CvMatchingAnalysis | null> => {
    try {
      // This would need to be implemented on backend to search by content
      // For now, we'll return null and let the analyzeCompatibility handle it
      return null;
    } catch (_error) {
      return null;
    }
  },

  // Helper method to check if cover letter exists for a job description
  checkExistingCoverLetter: async (_jobDescription: string): Promise<CvCoverLetter | null> => {
    try {
      // This would need to be implemented on backend to search by content
      // For now, we'll return null and let the generateCoverLetter handle it
      return null;
    } catch (_error) {
      return null;
    }
  },
};

// Export helper functions for easier imports
export const getAllCvs = cvApi.getUserCvs;
export const getCvById = cvApi.getCvById;
export const uploadCv = cvApi.uploadCv;
export const analyzeCompatibility = cvApi.analyzeCompatibility;
export const generateCoverLetter = cvApi.generateCoverLetter;
export const getUserAnalyses = cvApi.getUserAnalyses;
export const getUserCoverLetters = cvApi.getUserCoverLetters;