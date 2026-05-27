export type Role = "admin" | "super_admin" | "marketplace_point_focal";

export type EntityStatus = "active" | "inactive" | "suspended" | "draft";

export interface DashboardMetrics {
  totalOrders: number;
  totalSales: number;
  totalProducts: number;
  totalVendors: number;
}
