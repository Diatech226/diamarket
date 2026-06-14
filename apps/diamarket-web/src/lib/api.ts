import { Category, Order, PaymentStatus, Product, ShippingOption, Slide } from '@/lib/types';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
async function request<T>(path: string, init?: RequestInit): Promise<T> { const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, credentials: 'include', cache: 'no-store' }); if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.message || `API error ${res.status}`); } return res.json() as Promise<T>; }
const record = (v: unknown): v is Record<string, any> => typeof v === 'object' && v !== null;
const id = (v: unknown) => record(v) ? String(v._id ?? v.id ?? '') : String(v ?? '');
const product = (raw: any): Product => ({ id: id(raw), slug: String(raw.slug ?? id(raw)), name: String(raw.name ?? raw.title ?? ''), description: String(raw.description ?? ''), priceFcfa: Number(raw.price ?? raw.priceFcfa ?? 0), currency: raw.currency ?? 'FCFA', images: Array.isArray(raw.images) ? raw.images : [], stock: Number(raw.stock ?? 0), vendor: record(raw.vendor) ? { id: id(raw.vendor), name: String(raw.vendor.businessName ?? raw.vendor.name ?? 'Vendeur'), country: String(raw.vendor.country ?? ''), city: String(raw.vendor.city ?? '') } : undefined, categoryId: id(raw.category), category: record(raw.category) ? { id: id(raw.category), name: String(raw.category.name ?? '') } : undefined, status: raw.status ?? 'active', weightKg: raw.weight, dimensions: raw.length ? `${raw.length}x${raw.width ?? 0}x${raw.height ?? 0} cm` : undefined, popularity: Number(raw.popularity ?? 0), createdAt: String(raw.createdAt ?? '') });
const order = (payload: any): Order => { const raw = payload?.data ?? payload; return { id: id(raw), items: raw.items ?? [], totalFcfa: Number(raw.totalAmount ?? 0), status: raw.status ?? 'pending', paymentProvider: raw.paymentProvider, paymentStatus: raw.paymentStatus, paymentMethod: raw.paymentMethod, diapaySessionId: raw.diapaySessionId, diapayPaymentId: raw.diapayPaymentId, checkoutUrl: raw.checkoutUrl, trackingNumber: raw.trackingNumber }; };
async function demoFallback<T>(operation: Promise<T>, fallback: T): Promise<T> { try { return await operation; } catch (error) { if (DEMO_MODE) return fallback; throw error; } }
export const api = {
  getSlides: () => demoFallback(request<Slide[]>('/slides'), []),
  getCategories: () => demoFallback(request<any>('/categories').then(r => (r.data ?? r).map((x: any) => ({ id: id(x), name: x.name, imageUrl: x.imageUrl ?? '', productCount: x.productCount ?? 0 }))), []),
  getProducts: () => demoFallback(request<any>('/products').then(r => (r.data ?? r).map(product)), []),
  getProduct: (slug: string) => request<any>(`/products/${encodeURIComponent(slug)}`).then(r => product(r.data ?? r)),
  estimateShipping: (payload: { country: string; city: string; itemCount: number }) => demoFallback(request<any>('/shipping/estimate', { method: 'POST', body: JSON.stringify({ origin: 'Diamarket', destination: { country: payload.country, city: payload.city }, weight: Math.max(1, payload.itemCount), items: [] }) }).then(r => [{ id: r.serviceLevel, name: r.serviceLevel, priceFcfa: r.amount, etaDays: `${r.estimatedDeliveryDays} jours` }] as ShippingOption[]), []),
  createOrder: (payload: unknown) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }).then(order),
  createDiapayCheckoutSession: (orderId: string) => request<{ success: true; orderId: string; sessionId: string; checkoutUrl: string }>('/payments/diapay/checkout-session', { method: 'POST', body: JSON.stringify({ orderId }) }),
  getPaymentStatus: (orderId: string) => request(`/orders/${orderId}/payment-status`).then(order),
  getOrders: () => request<any>('/orders').then(r => (r.data ?? r).map(order)),
  getOrder: (orderId: string) => request<any>(`/orders/${orderId}`).then(order),
  getOrderShipment: (orderId: string) => request<any>(`/orders/${orderId}/shipment`).then(r => r.data ?? r),
  submitVendorRequest: (payload: unknown) => request<{ status: string }>('/vendor-requests', { method: 'POST', body: JSON.stringify(payload) }),
};
