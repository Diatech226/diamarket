import { api, endpoints } from "@/lib/api";
import type { ApiCollection, ApiItem, MediaAsset, OrderAdminItem, Project, ProjectPayload } from "@/types/cms";

export async function fetchCollection<T>(endpoint: string): Promise<T[]> {
  try {
    const response = await api.get<T[] | ApiCollection<T>>(endpoint);
    return Array.isArray(response) ? response : response.data;
  } catch {
    return [];
  }
}

export const cmsService = {
  getDashboard: () => api.get(endpoints.dashboard),
  getProducts: () => fetchCollection(endpoints.products),
  getProjects: () => fetchCollection<Project>(endpoints.projects),
  createProject: (payload: ProjectPayload) => api.post<ApiItem<Project>>(endpoints.projects, payload),
  updateProject: (id: string, payload: ProjectPayload) => api.put<ApiItem<Project>>(`${endpoints.projects}/${id}`, payload),
  deleteProject: (id: string) => api.delete<void>(`${endpoints.projects}/${id}`),
  getMedia: () => fetchCollection<MediaAsset>(endpoints.media),
  createMediaFromUrl: (payload: { url: string; alt?: string; originalName?: string }) => api.post<ApiItem<MediaAsset>>(endpoints.mediaUrl, payload),
  uploadMedia: (payload: { dataUrl: string; fileName: string; alt?: string }) => api.post<ApiItem<MediaAsset>>(endpoints.mediaUpload, payload),
  deleteMedia: (id: string) => api.delete<void>(`${endpoints.media}/${id}`),
  getCategories: () => fetchCollection(endpoints.categories),
  getSlides: () => fetchCollection(endpoints.slides),
  getOrders: () => fetchCollection<OrderAdminItem>(endpoints.orders),
  verifyDiapayPayment: (orderId: string) => api.get(`${endpoints.orders.replace('/admin', '')}/${orderId}/payment-status`),
  getVendors: () => fetchCollection(endpoints.vendors),
  getFocalPoints: () => fetchCollection(endpoints.focalPoints),
  getSettings: () => api.get(endpoints.settings),
  getCurrencies: () => fetchCollection(endpoints.currencies),
  getShipping: () => api.get(endpoints.shipping),
};
