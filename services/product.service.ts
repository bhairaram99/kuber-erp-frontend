import { apiClient } from '../lib/api/client';
import { PaginatedResponse, Product } from '../types';

export const productService = {
  findPaginated: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    woodType?: string;
    stockStatus?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Product>> => {
    return apiClient.get('/products', { params });
  },

  findById: async (id: string): Promise<{ data: Product }> => {
    return apiClient.get(`/products/${id}`);
  },

  create: async (data: Partial<Product>): Promise<{ data: Product }> => {
    return apiClient.post('/products', data);
  },

  update: async (id: string, data: Partial<Product>): Promise<{ data: Product }> => {
    return apiClient.patch(`/products/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/products/${id}`);
  },

  getMetrics: async (): Promise<{ data: { lowStockCount: number; totalStockValue: number; totalUnits: number } }> => {
    return apiClient.get('/products/metrics');
  },
};
