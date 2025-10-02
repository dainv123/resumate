import api from './api';

export interface Project {
  id: string;
  userId: string;
  name: string;
  role: string;
  techStack: string[];
  description: string;
  results?: string;
  cvBullets: string[];
  demoLink?: string;
  githubLink?: string;
  imageUrl?: string;
  isAddedToCv: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  role: string;
  techStack: string[];
  description: string;
  results?: string;
  demoLink?: string;
  githubLink?: string;
  imageUrl?: string;
}

export interface UpdateProjectData {
  name?: string;
  role?: string;
  techStack?: string[];
  description?: string;
  results?: string;
  demoLink?: string;
  githubLink?: string;
  imageUrl?: string;
  isAddedToCv?: boolean;
}

export const projectsApi = {
  createProject: async (data: CreateProjectData): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  getUserProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  updateProject: async (id: string, data: UpdateProjectData): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  addProjectToCv: async (projectId: string, cvId: string): Promise<any> => {
    const response = await api.post(`/projects/${projectId}/add-to-cv`, { cvId });
    return response.data;
  },

  removeProjectFromCv: async (projectId: string, cvId: string): Promise<any> => {
    const response = await api.post(`/projects/${projectId}/remove-from-cv`, { cvId });
    return response.data;
  },

  regenerateProjectBullets: async (projectId: string): Promise<Project> => {
    const response = await api.post(`/projects/${projectId}/regenerate-bullets`);
    return response.data;
  },

  getProjectsForPortfolio: async (): Promise<Project[]> => {
    const response = await api.get('/projects/portfolio');
    return response.data;
  },
};