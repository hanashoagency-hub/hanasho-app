"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItemType = "course" | "book" | "diploma" | "zoom";

export interface CartItem {
  id: string;
  type: CartItemType;
  title: string;
  price: number;
  cover_image?: string | null;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, type: CartItemType) => void;
  clear: () => void;
  isInCart: (id: string, type: CartItemType) => boolean;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "hanhub-cart";

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const isInCart = (id: string, type: CartItemType) =>
    items.some((i) => i.id === id && i.type === type);

  const addItem = (item: CartItem) => {
    setItems((prev) => (prev.some((i) => i.id === item.id && i.type === item.type) ? prev : [...prev, item]));
  };

  const removeItem = (id: string, type: CartItemType) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  };

  const clear = () => setItems([]);

  const count = items.length;
  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, isInCart, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
