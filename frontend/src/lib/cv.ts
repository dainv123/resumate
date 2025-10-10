import api from './api';

export interface CVData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  linkedin?: string;
  dateOfBirth?: string;
  summary?: string;
  education: Education[];
  experience: Experience[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  projects: Project[];
  certifications: Certification[];
}

export interface Education {
  degree: string;
  school: string;
  year: string;
  location?: string;
  honors?: string;
  gpa?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  location?: string;
  teamSize?: string;
  companyDescription?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
}

export interface Project {
  name: string;
  description: string;
  techStack: string[];
  results?: string;
  link?: string;
  duration?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface ImprovementNotes {
  parsingImprovements: string[];
  templateEnhancements: string[];
  dataCompleteness: string[];
  lastUpdated: string;
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
  originalCv?: CV;
  jobDescription?: JobDescription;
  tailoredVersions?: CV[];
  createdAt: string;
  updatedAt: string;
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

  getCvById: async (id: string): Promise<CV> => {
    const response = await api.get(`/cv/${id}`);
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

  exportToPDF: async (id: string, template: string = 'professional'): Promise<Blob> => {
    const response = await api.get(`/cv/${id}/export/pdf`, {
      responseType: 'blob',
      params: { template },
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
};