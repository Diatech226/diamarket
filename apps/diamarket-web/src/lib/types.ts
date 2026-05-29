export type Currency = 'FCFA' | 'USD';
export type Locale = 'fr' | 'en' | 'zh';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired' | 'refunded';

export interface Slide { id: string; title: string; subtitle: string; imageUrl: string; cta: string; }
export interface Category { id: string; name: string; imageUrl: string; productCount: number; }
export interface Vendor { id: string; name: string; country: string; city: string; }
export interface Product {
  id: string; name: string; description: string; images: string[]; categoryId: string;
  priceFcfa: number; stock: number; vendor: Vendor; weightKg: number; dimensions: string;
  isPromo?: boolean; popularity: number; createdAt: string;
}
export interface CartItem { product: Product; quantity: number; }
export interface ShippingOption { id: string; name: 'economique' | 'standard' | 'express'; priceFcfa: number; etaDays: string; }
export interface Order {
  id: string;
  items: CartItem[];
  totalFcfa: number;
  status: 'pending'|'confirmed'|'paid'|'processing'|'shipped'|'delivered'|'cancelled';
  paymentProvider?: 'cash_on_delivery' | 'diapay';
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  diapaySessionId?: string;
  diapayPaymentId?: string;
  checkoutUrl?: string;
  trackingNumber?: string;
}
