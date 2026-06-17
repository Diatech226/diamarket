const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_DIAMARKET_API_URL || "http://localhost:5000/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function resolveMediaUrl(url?: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
}

function readStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("diamarket_cms_token");
}

export async function apiRequest<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const token = readStoredToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.message || `API error: ${res.status}`);
  }
  if (res.status === 204) return null as T;
  const payload = await res.json().catch(() => null);
  if (payload === null) throw new Error("Réponse API invalide");
  return payload as T;
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
  projects: "/projects",
  media: "/media",
  mediaUrl: "/media/url",
  mediaUpload: "/media/upload",
  categories: "/admin/categories",
  slides: "/admin/slides",
  orders: "/orders",
  vendors: "/admin/vendors",
  focalPoints: "/admin/marketplace-focal-points",
  settings: "/admin/settings",
  currencies: "/admin/currencies",
  shipping: "/admin/shipping",
};
