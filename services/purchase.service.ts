import { apiClient } from '../lib/api/client';
import { PaginatedResponse, Purchase } from '../types';

export const purchaseService = {
  findPaginated: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    supplierId?: string;
    status?: string;
    paymentStatus?: string;
    from?: string;
    to?: string;
  }): Promise<PaginatedResponse<Purchase>> => {
    return apiClient.get('/purchases', { params });
  },

  findById: async (id: string): Promise<{ data: Purchase }> => {
    return apiClient.get(`/purchases/${id}`);
  },

  getRecent: async (limit = 5): Promise<{ data: Purchase[] }> => {
    return apiClient.get(`/purchases/recent?limit=${limit}`);
  },

  create: async (data: {
    supplierId: string;
    items: Array<{
      productId: string;
      quantity: number;
      purchasePrice: number;
      discount?: number;
      taxPercentage?: number;
    }>;
    discount?: number;
    paidAmount?: number;
    paymentMethod?: string;
    purchaseDate?: string;
    notes?: string;
  }): Promise<{ data: Purchase }> => {
    return apiClient.post('/purchases', data);
  },
};
