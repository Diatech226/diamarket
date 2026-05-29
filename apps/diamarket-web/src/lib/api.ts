import { Category, Order, PaymentStatus, Product, ShippingOption, Slide } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
const WEB_USER_ID = process.env.NEXT_PUBLIC_DIAMARKET_WEB_USER_ID ?? '000000000000000000000001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': WEB_USER_ID,
      'x-user-role': 'client',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

const normalizeId = (value: any) => String(value?._id ?? value?.id ?? value ?? '');
const normalizeOrder = (payload: any): Order => {
  const order = payload?.data ?? payload;
  return {
    id: normalizeId(order),
    items: order?.items ?? [],
    totalFcfa: Number(order?.totalAmount ?? order?.totalFcfa ?? 0),
    status: order?.status ?? 'pending',
    paymentProvider: order?.paymentProvider,
    paymentStatus: order?.paymentStatus ?? 'unpaid',
    paymentMethod: order?.paymentMethod,
    diapaySessionId: order?.diapaySessionId,
    diapayPaymentId: order?.diapayPaymentId,
    checkoutUrl: order?.checkoutUrl,
    trackingNumber: order?.trackingNumber,
  };
};

const mock = {
  slides: [{ id: 's1', title: 'Achetez malin sur Diamarket', subtitle: 'Offres premium B2C/B2B', imageUrl: 'https://picsum.photos/1200/400?1', cta: 'Voir le catalogue' }],
  categories: [{ id: 'c1', name: 'Electronique', imageUrl: 'https://picsum.photos/500/300?2', productCount: 45 }, { id: 'c2', name: 'Maison', imageUrl: 'https://picsum.photos/500/300?3', productCount: 29 }],
} as const;

const mockProducts: Product[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `p${i + 1}`,
  name: `Produit ${i + 1}`,
  description: 'Produit premium avec qualité garantie.',
  images: [`https://picsum.photos/600/600?${i + 10}`],
  categoryId: i % 2 ? 'c1' : 'c2',
  priceFcfa: 15000 + i * 2500,
  stock: i % 3 ? 12 : 0,
  vendor: { id: '000000000000000000000001', name: 'Vendor Elite', country: 'Cameroun', city: 'Douala' },
  weightKg: 1.1 + i / 10,
  dimensions: '20x10x8 cm',
  isPromo: i % 4 === 0,
  popularity: 100 - i,
  createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
}));

export const api = {
  async getSlides(): Promise<Slide[]> { try { return await request('/slides'); } catch { return [...mock.slides] as Slide[]; } },
  async getCategories(): Promise<Category[]> { try { return await request('/categories'); } catch { return [...mock.categories] as Category[]; } },
  async getProducts(): Promise<Product[]> { try { return await request('/products'); } catch { return mockProducts; } },
  async getProduct(id: string): Promise<Product | null> { const products = await this.getProducts(); return products.find((p) => p.id === id) ?? null; },
  async estimateShipping(payload: { country: string; city: string; itemCount: number; }): Promise<ShippingOption[]> {
    try { return await request('/shipping/estimate', { method: 'POST', body: JSON.stringify(payload) }); } catch { return [
      { id: 'e1', name: 'economique', priceFcfa: 2500, etaDays: '6-10j' },
      { id: 's1', name: 'standard', priceFcfa: 4500, etaDays: '3-5j' },
      { id: 'x1', name: 'express', priceFcfa: 9000, etaDays: '24-48h' },
    ]; }
  },
  async createOrder(payload: unknown): Promise<Order> {
    const response = await request('/orders', { method: 'POST', body: JSON.stringify(payload) });
    return normalizeOrder(response);
  },
  async createDiapayCheckoutSession(orderId: string): Promise<{ orderId: string; sessionId: string; checkoutUrl: string; paymentStatus: PaymentStatus }> {
    const response = await request<{ data: { orderId: string; sessionId: string; checkoutUrl: string; paymentStatus: PaymentStatus } }>('/payments/diapay/checkout-session', { method: 'POST', body: JSON.stringify({ orderId }) });
    return response.data;
  },
  async getPaymentStatus(orderId: string): Promise<Order> {
    const response = await request(`/orders/${orderId}/payment-status`);
    return normalizeOrder(response);
  },
  async getOrders(): Promise<Order[]> { return [{ id: 'ord_1', items: [], totalFcfa: 80000, status: 'shipped', paymentProvider: 'diapay', paymentStatus: 'paid', trackingNumber: 'DMK-TRK-2044' }]; },
  async submitVendorRequest(payload: unknown): Promise<{ status: string }> { try { return await request('/vendor-requests', { method: 'POST', body: JSON.stringify(payload) }); } catch { return { status: 'pending' }; } },
};
