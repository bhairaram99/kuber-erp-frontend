import { apiClient } from '../lib/api/client';
import { PaginatedResponse, Payment } from '../types';

export const paymentService = {
  findPaginated: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    customerId?: string;
    supplierId?: string;
    from?: string;
    to?: string;
  }): Promise<PaginatedResponse<Payment>> => {
    return apiClient.get('/payments', { params });
  },

  findById: async (id: string): Promise<{ data: Payment }> => {
    return apiClient.get(`/payments/${id}`);
  },

  create: async (data: {
    type: 'RECEIVED' | 'SENT';
    referenceType?: string;
    referenceId?: string;
    customerId?: string;
    supplierId?: string;
    amount: number;
    paymentMethod: string;
    paymentDate?: string;
    notes?: string;
  }): Promise<{ data: Payment }> => {
    return apiClient.post('/payments', data);
  },
};
