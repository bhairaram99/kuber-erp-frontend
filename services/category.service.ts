import { apiClient } from '../lib/api/client';
import { Category, PaginatedResponse } from '../types';

export const categoryService = {
  findAll: async (): Promise<{ data: Category[] }> => {
    return apiClient.get('/categories?all=true');
  },

  findPaginated: async (params: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Category>> => {
    return apiClient.get('/categories', { params });
  },

  create: async (data: { name: string; description?: string; status?: string }): Promise<{ data: Category }> => {
    return apiClient.post('/categories', data);
  },

  update: async (id: string, data: Partial<Category>): Promise<{ data: Category }> => {
    return apiClient.patch(`/categories/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/categories/${id}`);
  },
};
