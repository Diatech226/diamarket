import { api, endpoints } from "@/lib/api";

export async function fetchCollection<T>(endpoint: string): Promise<T[]> {
  try {
    return await api.get<T[]>(endpoint);
  } catch {
    return [];
  }
}

export const cmsService = {
  getDashboard: () => api.get(endpoints.dashboard),
  getProducts: () => fetchCollection(endpoints.products),
  getCategories: () => fetchCollection(endpoints.categories),
  getSlides: () => fetchCollection(endpoints.slides),
  getOrders: () => fetchCollection(endpoints.orders),
  getVendors: () => fetchCollection(endpoints.vendors),
  getFocalPoints: () => fetchCollection(endpoints.focalPoints),
  getSettings: () => api.get(endpoints.settings),
  getCurrencies: () => fetchCollection(endpoints.currencies),
  getShipping: () => api.get(endpoints.shipping),
};
