import { apiClient } from '../lib/api/client';
import { DashboardSummary, ProfitAndLossReport } from '../types';

export const reportService = {
  getDashboardSummary: async (): Promise<{ data: DashboardSummary }> => {
    return apiClient.get('/reports/dashboard');
  },

  getProfitAndLoss: async (params?: { from?: string; to?: string }): Promise<{ data: ProfitAndLossReport }> => {
    return apiClient.get('/reports/profit-loss', { params });
  },

  getSalesReport: async (params?: { from?: string; to?: string }): Promise<{ data: any }> => {
    return apiClient.get('/reports/sales', { params });
  },

  getPurchasesReport: async (params?: { from?: string; to?: string }): Promise<{ data: any }> => {
    return apiClient.get('/reports/purchases', { params });
  },

  getInventoryReport: async (): Promise<{ data: any }> => {
    return apiClient.get('/reports/inventory');
  },
};
