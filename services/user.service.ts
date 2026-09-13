import { apiClient } from '../lib/api/client';
import { PaginatedResponse, User } from '../types';

export const userService = {
  findPaginated: async (params: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> => {
    return apiClient.get('/users', { params });
  },

  findById: async (id: string): Promise<{ data: User }> => {
    return apiClient.get(`/users/${id}`);
  },

  create: async (data: any): Promise<{ data: User }> => {
    return apiClient.post('/users', data);
  },

  update: async (id: string, data: any): Promise<{ data: User }> => {
    return apiClient.patch(`/users/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/users/${id}`);
  },
};
