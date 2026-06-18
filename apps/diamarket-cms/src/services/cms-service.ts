import { api, endpoints } from "@/lib/api";
import type { ApiCollection, ApiItem, CategoryItem, CategoryPayload, CollectionQuery, MediaAsset, OrderAdminItem, ProductItem, ProductPayload, Project, ProjectPayload, SlideItem, SlidePayload, VendorAdminItem, VendorDetailResponse, VendorRequestItem } from "@/types/cms";

function toQueryString(query?: CollectionQuery) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") params.set(key, String(value));
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function unwrapCollection<T>(response: T[] | ApiCollection<T> | { success?: boolean; data?: T[] }): T[] {
  if (Array.isArray(response)) return response;
  return Array.isArray(response.data) ? response.data : [];
}

function unwrapPaginatedCollection<T>(response: T[] | ApiCollection<T> | { success?: boolean; data?: T[] }): ApiCollection<T> {
  if (Array.isArray(response)) return { data: response };
  return { data: Array.isArray(response.data) ? response.data : [], meta: "meta" in response ? response.meta : undefined };
}

export async function fetchCollection<T>(endpoint: string, query?: CollectionQuery): Promise<T[]> {
  const response = await api.get<T[] | ApiCollection<T> | { success?: boolean; data?: T[] }>(`${endpoint}${toQueryString(query)}`);
  return unwrapCollection<T>(response);
}

export async function fetchPaginatedCollection<T>(endpoint: string, query?: CollectionQuery): Promise<ApiCollection<T>> {
  const response = await api.get<T[] | ApiCollection<T> | { success?: boolean; data?: T[] }>(`${endpoint}${toQueryString(query)}`);
  return unwrapPaginatedCollection<T>(response);
}

export const cmsService = {
  getDashboard: () => api.get(endpoints.dashboard),
  getProducts: (query?: CollectionQuery) => fetchPaginatedCollection<ProductItem>(endpoints.products, query),
  createProduct: (payload: ProductPayload) => api.post<ApiItem<ProductItem>>("/products", payload),
  updateProduct: (id: string, payload: Partial<ProductPayload>) => api.put<ApiItem<ProductItem>>(`/products/${id}`, payload),
  deleteProduct: (id: string) => api.delete<void>(`/products/${id}`),
  getProjects: () => fetchCollection<Project>(endpoints.projects),
  createProject: (payload: ProjectPayload) => api.post<ApiItem<Project>>(endpoints.projects, payload),
  updateProject: (id: string, payload: ProjectPayload) => api.put<ApiItem<Project>>(`${endpoints.projects}/${id}`, payload),
  deleteProject: (id: string) => api.delete<void>(`${endpoints.projects}/${id}`),
  getMedia: (query?: CollectionQuery) => fetchPaginatedCollection<MediaAsset>(endpoints.media, query),
  createMediaFromUrl: (payload: { url: string; alt?: string; originalName?: string; name?: string; category?: string; tags?: string[] }) => api.post<ApiItem<MediaAsset>>(endpoints.mediaUrl, payload),
  uploadMedia: (payload: { dataUrl: string; fileName: string; alt?: string; category?: string; tags?: string[]; name?: string }) => api.post<ApiItem<MediaAsset>>(endpoints.mediaUpload, payload),
  updateMedia: (id: string, payload: Partial<MediaAsset>) => api.put<ApiItem<MediaAsset>>(`${endpoints.media}/${id}`, payload),
  deleteMedia: (id: string, force = false) => api.delete<void>(`${endpoints.media}/${id}${force ? "?force=true" : ""}`),
  getCategories: (query?: CollectionQuery) => fetchPaginatedCollection<CategoryItem>(endpoints.categories, query),
  getAllCategories: () => fetchCollection<CategoryItem>(endpoints.categories, { limit: 100 }),
  createCategory: (payload: CategoryPayload) => api.post<ApiItem<CategoryItem>>(endpoints.categories, payload),
  updateCategory: (id: string, payload: Partial<CategoryPayload>) => api.put<ApiItem<CategoryItem>>(`${endpoints.categories}/${id}`, payload),
  deleteCategory: (id: string) => api.delete<void>(`${endpoints.categories}/${id}`),
  getSlides: () => fetchCollection<SlideItem>(endpoints.slides),
  createSlide: (payload: SlidePayload) => api.post<ApiItem<SlideItem>>(endpoints.slides, payload),
  updateSlide: (id: string, payload: Partial<SlidePayload>) => api.put<ApiItem<SlideItem>>(`${endpoints.slides}/${id}`, payload),
  deleteSlide: (id: string) => api.delete<void>(`${endpoints.slides}/${id}`),
  getOrders: (query?: CollectionQuery) => fetchPaginatedCollection<OrderAdminItem>(endpoints.orders, query),
  getOrder: (id: string) => api.get<ApiItem<OrderAdminItem>>(`${endpoints.orders}/${id}`),
  updateOrderStatus: (id: string, status: string) => api.put<ApiItem<OrderAdminItem>>(`${endpoints.orders}/${id}/status`, { status }),
  verifyDiapayPayment: (orderId: string) => api.get<ApiItem<OrderAdminItem>>(`${endpoints.orders}/${orderId}/payment-status`),
  getVendors: (query?: CollectionQuery) => fetchPaginatedCollection<VendorAdminItem>(endpoints.vendors, query),
  getVendor: (id: string) => api.get<ApiItem<VendorDetailResponse>>(`${endpoints.vendors}/${id}`),
  updateVendorStatus: (id: string, status: "active" | "suspended") => api.put(`/admin/vendors/${id}/status`, { status }),
  updateVendorCommission: (id: string, commissionRate: number) => api.put(`/admin/vendors/${id}/commission`, { commissionRate }),
  getVendorRequests: (query?: CollectionQuery) => fetchCollection<VendorRequestItem>('/admin/vendor-requests', query),
  getVendorRequest: (id: string) => api.get<ApiItem<VendorRequestItem>>(`/admin/vendor-requests/${id}`),
  reviewVendorRequest: (id: string, action: 'approve' | 'reject', adminComment?: string) => api.put(`/admin/vendor-requests/${id}/${action}`, { adminComment }),
  getFocalPoints: () => fetchCollection(endpoints.focalPoints),
  getSettings: () => api.get(endpoints.settings),
  updateSettings: (payload: unknown) => api.put(endpoints.settings, payload),
  getCurrencies: () => fetchCollection(endpoints.currencies),
  createCurrency: (payload: unknown) => api.post(`${endpoints.currencies}`, payload),
  updateCurrency: (id: string, payload: unknown) => api.put(`${endpoints.currencies}/${id}`, payload),
  deleteCurrency: (id: string) => api.delete(`${endpoints.currencies}/${id}`),
  getCommissions: () => api.get('/admin/commissions'),
  updateDefaultCommission: (commissionRate: number) => api.put('/admin/commissions/default', { commissionRate }),
  updateCategoryCommission: (id: string, commissionRate: number | null) => api.put(`/admin/categories/${id}/commission`, { commissionRate }),
  getShipping: () => fetchCollection<any>('/shipments'),
  createShipment: (orderId: string) => api.post(`${endpoints.orders}/${orderId}/shipment`, {}),
  syncShipment: (orderId: string) => api.post(`${endpoints.orders}/${orderId}/shipment/sync`, {}),
};
