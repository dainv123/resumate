import api from './api';

export interface AnalyticsStats {
  stats: {
    cvViews: number;
    cvDownloads: number;
    cvUploads: number;
    tailoringCount: number;
    portfolioCreated: number;
    exportsByFormat: {
      pdf: number;
      word: number;
      ats: number;
    };
  };
  totalExports: number;
  totalActivities: number;
  lastActivity: string | null;
}

export interface ExportHistoryItem {
  date: string;
  cvId: string;
  format: string;
  template: string;
  cvName?: string;
}

export interface ActivityLogItem {
  date: string;
  action: string;
  resourceId?: string;
  metadata?: any;
}

export interface TimelineDataPoint {
  date: string;
  activities: number;
}

export const analyticsApi = {
  getStats: async (): Promise<AnalyticsStats> => {
    const response = await api.get('/analytics/stats');
    return response.data;
  },

  getExportHistory: async (limit: number = 50): Promise<ExportHistoryItem[]> => {
    const response = await api.get('/analytics/exports', {
      params: { limit },
    });
    return response.data;
  },

  getActivityLog: async (limit: number = 100): Promise<ActivityLogItem[]> => {
    const response = await api.get('/analytics/activity', {
      params: { limit },
    });
    return response.data;
  },

  getExportsByFormat: async () => {
    const response = await api.get('/analytics/exports-by-format');
    return response.data;
  },

  getActivitiesByType: async (): Promise<Record<string, number>> => {
    const response = await api.get('/analytics/activities-by-type');
    return response.data;
  },

  getTimelineData: async (days: number = 30): Promise<TimelineDataPoint[]> => {
    const response = await api.get('/analytics/timeline', {
      params: { days },
    });
    return response.data;
  },

  trackActivity: async (action: string, resourceId?: string, metadata?: any): Promise<void> => {
    await api.post('/analytics/track', {
      action,
      resourceId,
      metadata,
    });
  },
};

