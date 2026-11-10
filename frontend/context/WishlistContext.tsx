'use client';

import React, { createContext, useContext, useState, useMemo, useSyncExternalStore, ReactNode } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
  items: Product[];
  wishlistCount: number;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  toastMessage: string | null;
  dismissToast: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'yumnest_wishlist_v1';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('yumnest-wishlist-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('yumnest-wishlist-change', callback);
  };
}

function getSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  try {
    return localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]';
  } catch {
    return '[]';
  }
}

function getServerSnapshot(): string {
  return '[]';
}

function saveWishlistToStorage(items: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('yumnest-wishlist-change'));
  } catch (e) {
    console.warn('Failed to save wishlist to localStorage:', e);
  }
}

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const rawWishlist = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const items: Product[] = useMemo(() => {
    try {
      const parsed = JSON.parse(rawWishlist);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => item && item.id && item.name);
      }
    } catch {
      // safe fallback
    }
    return [];
  }, [rawWishlist]);

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);
  const dismissToast = () => setToastMessage(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 2500);
  };

  const isInWishlist = (productId: string) => {
    return items.some((it) => it.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    const exists = items.some((it) => it.id === product.id);
    let updated: Product[];
    if (exists) {
      updated = items.filter((it) => it.id !== product.id);
      showToast(`Removed "${product.name}" from favorites`);
    } else {
      updated = [product, ...items];
      showToast(`Added "${product.name}" to favorites ❤️`);
    }
    saveWishlistToStorage(updated);
  };

  const removeFromWishlist = (productId: string) => {
    const target = items.find((it) => it.id === productId);
    const updated = items.filter((it) => it.id !== productId);
    saveWishlistToStorage(updated);
    if (target) {
      showToast(`Removed "${target.name}" from favorites`);
    }
  };

  const clearWishlist = () => {
    saveWishlistToStorage([]);
    showToast('Favorites cleared');
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount: items.length,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        toastMessage,
        dismissToast,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
