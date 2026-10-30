'use client';

import React, { createContext, useContext, useState, useMemo, useSyncExternalStore, ReactNode } from 'react';
import { Product, ProductVariant } from '@/types';
import { SITE_SETTINGS } from '@/data/mockData';

export interface CartLineItem {
  id: string; // `${product.id}-${variant.id}`
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartContextType {
  items: CartLineItem[];
  cartCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, variantId?: string, quantity?: number) => void;
  updateQuantity: (lineId: string, delta: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  toastMessage: string | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'yumnest_cart_v1';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('yumnest-cart-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('yumnest-cart-change', callback);
  };
}

function getSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  try {
    return localStorage.getItem(CART_STORAGE_KEY) || '[]';
  } catch {
    return '[]';
  }
}

function getServerSnapshot(): string {
  return '[]';
}

function saveCartToStorage(items: CartLineItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('yumnest-cart-change'));
  } catch (e) {
    console.warn('Failed to save cart to localStorage:', e);
  }
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const rawCart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const items: CartLineItem[] = useMemo(() => {
    try {
      const parsed = JSON.parse(rawCart);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) =>
            item &&
            item.id &&
            item.product &&
            item.product.id &&
            item.variant &&
            item.variant.id &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
        );
      }
    } catch {
      // safe fallback
    }
    return [];
  }, [rawCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const dismissToast = () => setToastMessage(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 3200);
  };

  const addToCart = (product: Product, variantId?: string, quantity: number = 1) => {
    const chosenVariant = variantId
      ? product.variants.find((v) => v.id === variantId) || product.variants[0]
      : product.variants[0];

    if (!chosenVariant) return;

    const lineId = `${product.id}-${chosenVariant.id}`;
    const safeQty = Math.max(1, quantity);

    const existingIndex = items.findIndex((item) => item.id === lineId);
    let updated: CartLineItem[];
    if (existingIndex > -1) {
      updated = items.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + safeQty }
          : item
      );
    } else {
      updated = [
        ...items,
        {
          id: lineId,
          product,
          variant: chosenVariant,
          quantity: safeQty,
        },
      ];
    }

    saveCartToStorage(updated);
    showToast(`Added ${product.name} (${chosenVariant.weight}) to your cart!`);
  };

  const updateQuantity = (lineId: string, delta: number) => {
    const updated = items
      .map((item) => {
        if (item.id === lineId) {
          const newQty = item.quantity + delta;
          return newQty >= 1 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartLineItem[];

    saveCartToStorage(updated);
  };

  const removeItem = (lineId: string) => {
    const updated = items.filter((item) => item.id !== lineId);
    saveCartToStorage(updated);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant.salePrice || item.variant.price;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee =
    subtotal === 0 || subtotal >= SITE_SETTINGS.freeShippingThreshold
      ? 0
      : SITE_SETTINGS.standardShippingFee;

  const total = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        shippingFee,
        total,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        toastMessage,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
