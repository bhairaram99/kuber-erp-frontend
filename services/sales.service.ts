import { apiClient } from '../lib/api/client';
import { PaginatedResponse, Sale } from '../types';

export const salesService = {
  findPaginated: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    customerId?: string;
    status?: string;
    paymentStatus?: string;
    from?: string;
    to?: string;
  }): Promise<PaginatedResponse<Sale>> => {
    return apiClient.get('/sales', { params });
  },

  findById: async (id: string): Promise<{ data: Sale }> => {
    return apiClient.get(`/sales/${id}`);
  },

  getRecent: async (limit = 5): Promise<{ data: Sale[] }> => {
    return apiClient.get(`/sales/recent?limit=${limit}`);
  },

  create: async (data: {
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      sellingPrice: number;
      discount?: number;
      taxPercentage?: number;
    }>;
    discount?: number;
    paidAmount?: number;
    paymentMethod?: string;
    saleDate?: string;
    notes?: string;
  }): Promise<{ data: Sale }> => {
    return apiClient.post('/sales', data);
  },

  cancel: async (id: string): Promise<{ data: Sale }> => {
    return apiClient.post(`/sales/${id}/cancel`, {});
  },
};
