'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Currency, Locale, Product } from '@/lib/types';

type StoreContext = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  totalFcfa: number;
};

const Ctx = createContext<StoreContext | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('FCFA');
  const [locale, setLocale] = useState<Locale>('fr');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { try { setCart(JSON.parse(localStorage.getItem('diamarket-cart') || '[]')); } catch { setCart([]); } setHydrated(true); }, []);
  useEffect(() => { if (hydrated) localStorage.setItem('diamarket-cart', JSON.stringify(cart)); }, [cart, hydrated]);
  const addToCart = (p: Product) => setCart((c) => {
    const ex = c.find((i) => i.product.id === p.id);
    return ex ? c.map((i) => (i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)) : [...c, { product: p, quantity: 1 }];
  });
  const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.product.id !== id));
  const updateQty = (id: string, q: number) => setCart((c) => c.map((i) => (i.product.id === id ? { ...i, quantity: Math.max(1, q) } : i)));
  const totalFcfa = useMemo(() => cart.reduce((s, i) => s + i.product.priceFcfa * i.quantity, 0), [cart]);
  return <Ctx.Provider value={{ currency, setCurrency, locale, setLocale, cart, addToCart, removeFromCart, updateQty, totalFcfa }}>{children}</Ctx.Provider>;
}
export const useStore = () => {
  const value = useContext(Ctx);
  if (!value) throw new Error('useStore must be used within StoreProvider');
  return value;
};
