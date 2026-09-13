import { apiClient } from '../lib/api/client';
import { ApiResponse, User } from '../types';

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<{ accessToken: string; user: User }> => {
    const res: any = await apiClient.post('/auth/login', credentials);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res: any = await apiClient.get('/auth/me');
    return res.data;
  },
};
