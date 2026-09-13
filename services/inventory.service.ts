import { apiClient } from '../lib/api/client';
import { InventoryTransaction, PaginatedResponse, Product } from '../types';

export const inventoryService = {
  getHistory: async (params: {
    page?: number;
    limit?: number;
    productId?: string;
    type?: string;
    from?: string;
    to?: string;
  }): Promise<PaginatedResponse<InventoryTransaction>> => {
    return apiClient.get('/inventory/history', { params });
  },

  getRecentMovements: async (limit = 10): Promise<{ data: InventoryTransaction[] }> => {
    return apiClient.get(`/inventory/recent?limit=${limit}`);
  },

  adjustStock: async (data: {
    productId: string;
    type: string;
    quantity: number;
    reason: string;
    notes?: string;
  }): Promise<{ data: { product: Product; transaction: InventoryTransaction } }> => {
    return apiClient.post('/inventory/adjust', data);
  },

  resetStock: async (data: {
    productId: string;
    newStock: number;
    reason: string;
    notes?: string;
  }): Promise<{ data: { product: Product; transaction: InventoryTransaction } }> => {
    return apiClient.post('/inventory/reset', data);
  },
};
