import { apiClient } from '../lib/api/client';
import { CentralTransaction, PaginatedResponse } from '../types';

export const transactionService = {
  findPaginated: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    customerId?: string;
    supplierId?: string;
    search?: string;
    from?: string;
    to?: string;
  }): Promise<PaginatedResponse<CentralTransaction>> => {
    return apiClient.get('/transactions', { params });
  },

  findById: async (id: string): Promise<{ data: CentralTransaction }> => {
    return apiClient.get(`/transactions/${id}`);
  },

  getRecent: async (limit = 8): Promise<{ data: CentralTransaction[] }> => {
    return apiClient.get(`/transactions/recent?limit=${limit}`);
  },
};
