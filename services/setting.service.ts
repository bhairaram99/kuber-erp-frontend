import { apiClient } from '../lib/api/client';
import { NotificationItem, Setting } from '../types';

export const notificationService = {
  getRecent: async (limit = 20): Promise<{ data: { notifications: NotificationItem[]; unreadCount: number } }> => {
    return apiClient.get(`/notifications?limit=${limit}`);
  },

  markAsRead: async (id: string): Promise<any> => {
    return apiClient.patch(`/notifications/${id}/read`, {});
  },

  markAllAsRead: async (): Promise<any> => {
    return apiClient.post('/notifications/mark-all-read', {});
  },
};

export const settingService = {
  getSettings: async (): Promise<{ data: Setting }> => {
    return apiClient.get('/settings');
  },

  updateSettings: async (data: Partial<Setting>): Promise<{ data: Setting }> => {
    return apiClient.patch('/settings', data);
  },
};

export const auditLogService = {
  findPaginated: async (params: {
    page?: number;
    limit?: number;
    module?: string;
    action?: string;
    from?: string;
    to?: string;
  }): Promise<any> => {
    return apiClient.get('/audit-logs', { params });
  },
};
