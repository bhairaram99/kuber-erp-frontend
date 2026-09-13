import { apiClient } from '../lib/api/client';
import { PaginatedResponse, Supplier } from '../types';

export const supplierService = {
  findPaginated: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Supplier>> => {
    return apiClient.get('/suppliers', { params });
  },

  findAll: async (): Promise<{ data: Supplier[] }> => {
    return apiClient.get('/suppliers?all=true');
  },

  findById: async (id: string): Promise<{ data: Supplier }> => {
    return apiClient.get(`/suppliers/${id}`);
  },

  create: async (data: Partial<Supplier>): Promise<{ data: Supplier }> => {
    return apiClient.post('/suppliers', data);
  },

  update: async (id: string, data: Partial<Supplier>): Promise<{ data: Supplier }> => {
    return apiClient.patch(`/suppliers/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/suppliers/${id}`);
  },
};
