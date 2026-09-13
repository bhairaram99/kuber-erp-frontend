import { apiClient } from '../lib/api/client';
import { Customer, PaginatedResponse } from '../types';

export const customerService = {
  findPaginated: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Customer>> => {
    return apiClient.get('/customers', { params });
  },

  findAll: async (): Promise<{ data: Customer[] }> => {
    return apiClient.get('/customers?all=true');
  },

  findById: async (id: string): Promise<{ data: Customer }> => {
    return apiClient.get(`/customers/${id}`);
  },

  create: async (data: Partial<Customer>): Promise<{ data: Customer }> => {
    return apiClient.post('/customers', data);
  },

  update: async (id: string, data: Partial<Customer>): Promise<{ data: Customer }> => {
    return apiClient.patch(`/customers/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/customers/${id}`);
  },
};
