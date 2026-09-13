export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errorCode?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: Role | { id?: string; _id?: string; name: string; description?: string; permissions?: string[] };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: Category | { _id: string; name: string };
  description?: string;
  woodType: string;
  grade: string;
  quality: string;
  thickness: number;
  width: number;
  length: number;
  unit: string;
  color?: string;
  finish: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  taxPercentage: number;
  openingStock: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  location: string;
  image?: string;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryTransaction {
  _id: string;
  productId: Product | { _id: string; name: string; sku: string; unit: string; woodType: string };
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: string;
  referenceId?: string;
  reason?: string;
  notes?: string;
  createdBy?: { _id: string; name: string; email: string };
  createdAt: string;
}

export interface Customer {
  _id: string;
  customerCode: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  customerType: string;
  taxNumber: string;
  creditLimit: number;
  totalPurchases: number;
  totalPaid: number;
  totalDue: number;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  _id: string;
  supplierCode: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  taxNumber: string;
  totalPurchases: number;
  totalPaid: number;
  totalDue: number;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleItemSnapshot {
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitSnapshot: string;
  quantity: number;
  purchasePriceSnapshot: number;
  sellingPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
}

export interface Sale {
  _id: string;
  invoiceNumber: string;
  customerId: Customer | { _id: string; name: string; company?: string; phone?: string };
  items: SaleItemSnapshot[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  costOfGoodsSold: number;
  grossProfit: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE';
  paymentMethod: string;
  status: 'CONFIRMED' | 'CANCELLED';
  saleDate: string;
  notes?: string;
  createdBy?: { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseItemSnapshot {
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitSnapshot: string;
  quantity: number;
  purchasePrice: number;
  tax: number;
  discount: number;
  subtotal: number;
  total: number;
}

export interface Purchase {
  _id: string;
  purchaseNumber: string;
  supplierId: Supplier | { _id: string; name: string; company?: string; phone?: string };
  items: PurchaseItemSnapshot[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE';
  paymentMethod: string;
  status: 'CONFIRMED' | 'CANCELLED';
  purchaseDate: string;
  notes?: string;
  createdBy?: { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id: string;
  paymentNumber: string;
  type: 'RECEIVED' | 'SENT';
  referenceType: string;
  referenceId: string;
  customerId?: Customer | { _id: string; name: string; company?: string };
  supplierId?: Supplier | { _id: string; name: string; company?: string };
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  notes?: string;
  createdBy?: { _id: string; name: string };
  createdAt?: string;
}

export interface CentralTransaction {
  _id: string;
  transactionNumber: string;
  type: 'SALE' | 'PURCHASE' | 'SALE_RETURN' | 'PURCHASE_RETURN' | 'PAYMENT_RECEIVED' | 'PAYMENT_SENT' | 'EXPENSE' | 'STOCK_ADJUSTMENT';
  referenceType: string;
  referenceId: string;
  amount: number;
  customerId?: { _id: string; name: string; company?: string };
  supplierId?: { _id: string; name: string; company?: string };
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE';
  status: string;
  description: string;
  createdBy?: { _id: string; name: string };
  createdAt: string;
}

export interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  description?: string;
  receipt?: string;
  createdBy?: { _id: string; name: string };
  createdAt?: string;
}

export interface Setting {
  businessName: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  invoicePrefix: string;
  purchasePrefix: string;
  lowStockThreshold: number;
  allowNegativeStock: boolean;
  requireStockAdjustmentReason: boolean;
  maxDiscountPercentage: number;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  category: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  userId?: { _id: string; name: string; email: string };
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  previousData?: any;
  newData?: any;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DashboardSummary {
  kpi: {
    totalSales: number;
    grossProfit: number;
    netProfit: number;
    totalExpenses: number;
    currentStockValue: number;
    lowStockCount: number;
    totalCustomers: number;
  };
  salesTrend: Array<{ _id: string; sales: number }>;
  recentSales: Sale[];
  recentPurchases: Purchase[];
  lowStockItems: Array<{
    _id: string;
    name: string;
    sku: string;
    currentStock: number;
    minimumStock: number;
    unit: string;
    location: string;
  }>;
}

export interface ProfitAndLossReport {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  profitMargin: string | number;
  monthlyTrend: Array<{
    _id: string;
    revenue: number;
    cogs: number;
    grossProfit: number;
  }>;
}
