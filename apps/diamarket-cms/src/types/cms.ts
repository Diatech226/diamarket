export type Role = "admin";

export type EntityStatus = "active" | "inactive" | "suspended" | "draft" | "archived";

export interface CollectionQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  vendor?: string;
}

export interface DashboardMetrics {
  totalOrders: number;
  totalSales: number;
  totalProducts: number;
  totalVendors: number;
}

export interface ApiCollection<T> {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiItem<T> {
  data: T;
}

export interface MediaAsset {
  _id: string;
  filename?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url: string;
  alt?: string;
  source?: "upload" | "url";
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  category?: string;
  status?: "draft" | "active" | "archived";
  coverImageUrl?: string;
  coverMedia?: MediaAsset | string;
  galleryImageUrls?: string[];
  galleryMedia?: Array<MediaAsset | string>;
  media?: Array<MediaAsset | string>;
  links?: string[];
  startDate?: string;
  endDate?: string;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectPayload = Partial<Omit<Project, "_id" | "coverMedia" | "galleryMedia" | "media" | "createdAt" | "updatedAt">> & {
  title: string;
  coverMedia?: string;
  galleryMedia?: string[];
  media?: string[];
};

export type OrderPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired' | 'refunded';

export interface OrderAdminItem {
  _id: string;
  status?: string;
  paymentProvider?: 'cash_on_delivery' | 'diapay';
  paymentStatus?: OrderPaymentStatus;
  paymentMethod?: string;
  diapaySessionId?: string;
  diapayPaymentId?: string;
  checkoutUrl?: string;
  totalAmount?: number;
  currency?: string;
  paidAt?: string;
  cancelledAt?: string;
  failedAt?: string;
  createdAt?: string;
}

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  active?: boolean;
  order?: number;
  image?: string;
  icon?: string;
  productCount?: number;
}

export type CategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  order: number;
  image?: string;
  icon?: string;
};

export interface VendorRef { _id: string; shopName?: string; businessName?: string; status?: string }

export interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: "FCFA" | "USD";
  images?: string[];
  category?: CategoryItem | string;
  vendor?: VendorRef | string;
  stock: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  status?: "draft" | "active" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

export type ProductPayload = {
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: "FCFA" | "USD";
  category: string;
  vendor: string;
  stock: number;
  images?: string[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  status?: "draft" | "active" | "archived";
};

export interface SlideItem { _id?: string; id?: string; title: string; subtitle?: string; imageUrl?: string; cta?: string; ctaUrl?: string; isActive?: boolean }
export type SlidePayload = Omit<SlideItem, "_id" | "id">;
