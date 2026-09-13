import { apiClient } from '../lib/api/client';
import { Expense, PaginatedResponse } from '../types';

export const expenseService = {
  findPaginated: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    from?: string;
    to?: string;
  }): Promise<PaginatedResponse<Expense>> => {
    return apiClient.get('/expenses', { params });
  },

  getBreakdown: async (params?: { from?: string; to?: string }): Promise<{ data: Array<{ _id: string; total: number; totalAmount?: number; count?: number }> }> => {
    return apiClient.get('/expenses/breakdown', { params });
  },

  getCategoryBreakdown: async (params?: { from?: string; to?: string }): Promise<{ data: Array<{ _id: string; total: number; totalAmount?: number; count?: number }> }> => {
    return apiClient.get('/expenses/breakdown', { params });
  },

  findById: async (id: string): Promise<{ data: Expense }> => {
    return apiClient.get(`/expenses/${id}`);
  },

  create: async (data: {
    title: string;
    category: string;
    amount: number;
    date?: string;
    paymentMethod?: string;
    description?: string;
    receipt?: string;
  }): Promise<{ data: Expense }> => {
    return apiClient.post('/expenses', data);
  },

  update: async (id: string, data: Partial<Expense>): Promise<{ data: Expense }> => {
    return apiClient.patch(`/expenses/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/expenses/${id}`);
  },
};
