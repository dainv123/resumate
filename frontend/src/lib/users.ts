import api from './api';

export interface UpdateProfileData {
  name?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface UserStats {
  totalCvs: number;
  totalProjects: number;
  totalSubProjects: number;
  tailoredCvs: number;
  plan: string;
  createdAt: string;
}

export const usersApi = {
  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await api.put('/users/password', data);
    return response.data;
  },

  getStats: async (): Promise<UserStats> => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  },

  exportData: async () => {
    const response = await api.get('/users/export');
    return response.data;
  },
};

