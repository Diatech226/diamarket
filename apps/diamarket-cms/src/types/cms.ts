export type Role = "admin" | "super_admin" | "marketplace_point_focal";

export type EntityStatus = "active" | "inactive" | "suspended" | "draft" | "archived";

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
