import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Game } from '../types/game';
import { CartItem, CartStorageItem, CartContextType } from '../types/cart';
import { catalogService } from '../services/catalogService';
import { useToast } from './ToastContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'gamevault_cart_ref_v2';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Store only minimal reference (id, quantity, addedAt) in localStorage
  const [storageItems, setStorageItems] = useState<CartStorageItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);

      // Check legacy cart format migration
      const legacy = localStorage.getItem('gamevault_cart');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            gameId: item.game?.id || item.gameId,
            quantity: item.quantity || 1,
            addedAt: item.addedAt || new Date().toISOString(),
          }));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storageItems));
    } catch {
      // ignore storage errors
    }
  }, [storageItems]);

  // Dynamically hydrate full game details through the catalogService
  const items: CartItem[] = useMemo(() => {
    const hydrated: CartItem[] = [];
    for (const ref of storageItems) {
      const game = catalogService.getGameById(ref.gameId);
      if (game) {
        hydrated.push({
          game,
          quantity: ref.quantity,
          addedAt: ref.addedAt,
        });
      }
    }
    return hydrated;
  }, [storageItems]);

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const addToCart = (game: Game) => {
    setStorageItems((prev) => {
      const existing = prev.find((item) => item.gameId === game.id);
      if (existing) {
        return prev.map((item) =>
          item.gameId === game.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { gameId: game.id, quantity: 1, addedAt: new Date().toISOString() }];
    });
    showToast('Added to Cart', `${game.title} is now in your cart.`, 'success');
  };

  const removeFromCart = (gameId: string) => {
    const itemToRemove = items.find((item) => item.game.id === gameId);
    setStorageItems((prev) => prev.filter((item) => item.gameId !== gameId));
    if (itemToRemove) {
      showToast('Removed from Cart', `${itemToRemove.game.title} was removed.`, 'info');
    }
  };

  const updateQuantity = (gameId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(gameId);
      return;
    }
    setStorageItems((prev) =>
      prev.map((item) =>
        item.gameId === gameId ? { ...item, quantity: Math.min(quantity, 5) } : item
      )
    );
  };

  const clearCart = () => {
    setStorageItems([]);
  };

  const isInCart = (gameId: string) => {
    return storageItems.some((item) => item.gameId === gameId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
