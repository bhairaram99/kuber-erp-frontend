import { apiClient } from '../lib/api/client';
import { Role } from '../types';

export const roleService = {
  findAll: async (): Promise<{ data: Role[] }> => {
    return apiClient.get('/roles');
  },

  findById: async (id: string): Promise<{ data: Role }> => {
    return apiClient.get(`/roles/${id}`);
  },

  create: async (data: {
    name: string;
    description?: string;
    permissions: string[];
    isActive?: boolean;
  }): Promise<{ data: Role }> => {
    return apiClient.post('/roles', data);
  },

  update: async (id: string, data: Partial<Role>): Promise<{ data: Role }> => {
    return apiClient.patch(`/roles/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/roles/${id}`);
  },
};
