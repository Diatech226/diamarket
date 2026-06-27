export type AdminRole = "super_admin" | "admin" | "catalog_manager" | "vendor_manager" | "marketing_manager" | "support" | "vendor";
export type Status = "active" | "inactive" | "draft" | "archived" | "suspended" | "pending" | "paid" | "failed";
export interface User { _id: string; name?: string; email: string; role: AdminRole; vendorId?: string; disabled?: boolean; createdAt?: string; }
export interface Product { _id: string; name: string; slug: string; price: number; currency: string; status: Status; category?: string | Category; vendor?: string | Vendor; stock?: number; images?: string[]; }
export interface Category { _id: string; name: string; slug: string; description?: string; active?: boolean; productCount?: number; }
export interface Vendor { _id: string; businessName?: string; shopName?: string; email?: string; status: Status; commissionRate?: number; country?: string; city?: string; }
export interface Payout { _id: string; vendor: string; amount: number; currency: string; status: Status; reference?: string; createdAt?: string; paidAt?: string; }
export interface StorefrontConfig { vendorId: string; shopName: string; slogan?: string; logo?: string; favicon?: string; banner?: string; colors: { primary: string; secondary: string; accent?: string; background?: string; text?: string }; fonts: { heading: string; body: string }; buttons?: { radius?: string; style?: "solid" | "soft" | "outline" }; socialLinks?: Record<string, string>; updatedAt?: string; }
export type StorefrontBlockType = "hero" | "carousel" | "featuredProducts" | "video" | "banners" | "collections" | "testimonials" | "faq" | "cta";
export interface StorefrontBlock { id: string; type: StorefrontBlockType; title?: string; enabled: boolean; settings?: Record<string, unknown>; items?: unknown[]; }
export interface StorefrontHomePage { vendorId: string; blocks: StorefrontBlock[]; seo?: { title?: string; description?: string }; updatedAt?: string; }
export interface Promotion { _id: string; name: string; code?: string; status: Status; startsAt?: string; endsAt?: string; discountType?: "percent" | "fixed"; value?: number; }
export interface EmailTemplate { _id: string; key: string; name: string; subject: string; body: string; updatedAt?: string; }
export interface MediaAsset { _id: string; url: string; name?: string; alt?: string; mimeType?: string; size?: number; category?: string; tags?: string[]; }
export interface AuditLog { _id: string; actor?: User | string; action: string; resource?: string; resourceId?: string; message?: string; createdAt?: string; }
export interface PublicStorefront { domain: string; vendor: Vendor; config: StorefrontConfig; homePage: StorefrontHomePage; products: Product[]; categories: Category[]; }
export interface ApiResponse<T> { success: boolean; data: T; message?: string; }
