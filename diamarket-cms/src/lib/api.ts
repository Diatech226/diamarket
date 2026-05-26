const API_BASE_URL = process.env.NEXT_PUBLIC_DIAMARKET_API_URL || "http://localhost:8000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, "GET"),
  post: <T>(path: string, body: unknown) => apiRequest<T>(path, "POST", body),
  put: <T>(path: string, body: unknown) => apiRequest<T>(path, "PUT", body),
  patch: <T>(path: string, body: unknown) => apiRequest<T>(path, "PATCH", body),
  delete: <T>(path: string) => apiRequest<T>(path, "DELETE"),
};

export const endpoints = {
  dashboard: "/admin/dashboard",
  products: "/admin/products",
  categories: "/admin/categories",
  slides: "/admin/slides",
  orders: "/admin/orders",
  vendors: "/admin/vendors",
  focalPoints: "/admin/marketplace-focal-points",
  settings: "/admin/settings",
  currencies: "/admin/currencies",
  shipping: "/admin/shipping",
};
