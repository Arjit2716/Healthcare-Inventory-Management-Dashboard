// User & Auth types
export type UserRole = "ADMIN" | "STAFF";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Supplier
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

// Product
export type StockStatus = "ok" | "low" | "critical" | "out";
export type ExpiryStatus = "ok" | "warning" | "critical" | "expired";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description?: string | null;
  unit: string;
  quantity: number;
  minStockLevel: number;
  expiryDate?: string | null;
  price: number | string;
  supplierId: string;
  supplier: Supplier;
  createdAt: string;
  updatedAt: string;
  stockStatus?: StockStatus;
  daysUntilExpiry?: number | null;
}

// Inventory Log
export type MovementType = "STOCK_IN" | "STOCK_OUT";

export interface InventoryLog {
  id: string;
  productId: string;
  userId: string;
  type: MovementType;
  quantity: number;
  notes?: string | null;
  createdAt: string;
  product: Pick<Product, "id" | "name" | "sku" | "unit">;
  user: Pick<SessionUser, "id" | "name" | "email">;
}

// Alerts
export type AlertType = "LOW_STOCK" | "EXPIRY";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Alert {
  id: string;
  productId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  product: Pick<Product, "id" | "name" | "sku" | "category">;
}

// Analytics
export interface TrendDataPoint {
  date: string;
  stockIn: number;
  stockOut: number;
  net: number;
}

export interface CategoryData {
  category: string;
  count: number;
  totalValue: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sku: string;
  totalMovements: number;
  totalIn: number;
  totalOut: number;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  expiringCount: number;
  totalSuppliers: number;
  totalValue: number;
  recentActivity: InventoryLog[];
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
