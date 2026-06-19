export type Role = "admin";

export type EntityStatus = "active" | "inactive" | "suspended" | "draft" | "archived";

export interface CollectionQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  category?: string;
  vendor?: string;
  paymentStatus?: string;
  shipmentStatus?: string;
  tracking?: string;
  sortBy?: string;
  sortDir?: string;
  mimeType?: string;
  tags?: string;
  sort?: string;
  order?: string;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  globalCommissionRate?: number;
}

export interface DashboardMetrics {
  totalOrders: number;
  totalSales: number;
  totalProducts: number;
  totalVendors: number;
}

export interface ApiCollection<T> {
  data: T[];
  meta?: ApiMeta;
}

export interface ApiItem<T> {
  data: T;
}

export type MediaCategory = "product" | "vendor" | "slide" | "category" | "brand" | "marketing" | "document" | "other";

export interface MediaAsset {
  _id: string;
  id?: string;
  name?: string;
  filename?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  url: string;
  path?: string;
  category?: MediaCategory;
  tags?: string[];
  usageCount?: number;
  usedIn?: Array<{ resourceType: string; resourceId: string; field: string }>;
  description?: string;
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

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired' | 'refunded';
export type ShipmentStatus = 'pending' | 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned' | 'cancelled';
export type OrderPaymentStatus = PaymentStatus;

export interface OrderPartyRef { _id: string; name?: string; email?: string; shopName?: string; businessName?: string }
export interface OrderAddress { country?: string; city?: string; phone?: string; line1?: string }
export interface OrderLineItem { product?: ProductItem | string; name: string; quantity: number; unitPrice: number; totalPrice: number }
export interface OrderTimelineEvent { eventId?: string; type?: string; status?: string; message?: string; location?: string; receivedAt?: string; occurredAt?: string; processedAt?: string }
export interface OrderShipment { _id?: string; trackingNumber?: string; providerShipmentId?: string; provider?: string; status?: ShipmentStatus; estimatedDeliveryDate?: string; history?: OrderTimelineEvent[] }

export interface OrderAdminItem {
  _id: string;
  status?: OrderStatus;
  paymentProvider?: 'cash_on_delivery' | 'diapay';
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  shipmentStatus?: ShipmentStatus;
  customer?: OrderPartyRef | string;
  vendor?: OrderPartyRef | string;
  items?: OrderLineItem[];
  address?: OrderAddress;
  shipment?: OrderShipment;
  paymentEvents?: OrderTimelineEvent[];
  diapaySessionId?: string;
  diapayPaymentId?: string;
  checkoutUrl?: string;
  subtotalAmount?: number;
  shippingAmount?: number;
  totalAmount?: number;
  currency?: string;
  paidAt?: string;
  cancelledAt?: string;
  failedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
  currency: "FCFA" | "XOF" | "USD" | "EUR" | "CAD" | "CNY";
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
  currency: "FCFA" | "XOF" | "USD" | "EUR" | "CAD" | "CNY";
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

export interface SlideItem {
  _id?: string;
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageDesktop?: string;
  imageMobile?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaLink?: string;
  cta?: string;
  ctaUrl?: string;
  badge?: string;
  backgroundColor?: string;
  position?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
export type SlidePayload = Omit<SlideItem, "_id" | "id" | "createdAt" | "updatedAt">;


export interface VendorAdminItem {
  _id: string;
  userId?: string;
  shopName?: string;
  phone?: string;
  country?: string;
  city?: string;
  status: "pending" | "active" | "suspended" | "rejected";
  isActive?: boolean;
  commissionRate?: number;
  productCount?: number;
  orderCount?: number;
  revenue?: number;
  pendingOrderCount?: number;
  deliveredOrderCount?: number;
  owner?: { _id: string; name?: string; email?: string; role?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorRequestItem {
  _id: string;
  userId?: string | { _id: string; name?: string; email?: string };
  businessName: string;
  businessEmail?: string;
  phone?: string;
  country?: string;
  city?: string;
  notes?: string;
  adminComment?: string;
  requestedCommissionRate?: number;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string | { _id: string; name?: string; email?: string };
  reviewedAt?: string;
  decisionHistory?: Array<{ action: "approved" | "rejected"; comment?: string; decidedBy?: string; decidedAt?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorDetailResponse {
  vendor: VendorAdminItem;
  products: ProductItem[];
  orders: OrderAdminItem[];
  stats: {
    revenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    deliveredOrders: number;
    activeProducts: number;
    draftProducts: number;
    archivedProducts: number;
    globalCommissionRate: number;
    effectiveCommissionRate: number;
    estimatedCommission: number;
  };
}

export type UserRole = "admin" | "vendor" | "user";
export interface AdminUserItem {
  _id: string;
  email?: string;
  name?: string;
  role: UserRole;
  disabled?: boolean;
  locale?: string;
  preferredCurrency?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface UserDetailResponse {
  user: AdminUserItem;
  orders: OrderAdminItem[];
  vendor?: VendorAdminItem | null;
}


export interface AdminAuditLogItem {
  _id: string;
  actorId?: string | { _id: string; name?: string; email?: string; role?: string };
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: unknown;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMemberItem {
  _id?: string;
  id?: string;
  name: string;
  role?: string;
  bio?: string;
  photo?: string;
  email?: string;
  phone?: string;
  contact?: string;
  whatsapp?: string;
  socialLinks?: Record<string, string>;
  status?: 'draft' | 'active' | 'inactive' | 'archived';
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type TeamMemberPayload = Pick<TeamMemberItem, 'name' | 'role' | 'bio' | 'photo' | 'email' | 'phone' | 'contact' | 'socialLinks' | 'status' | 'whatsapp'>;
