import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Game } from '../types/game';
import { WishlistContextType } from '../types/cart';
import { catalogService } from '../services/catalogService';
import { useToast } from './ToastContext';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'gamevault_wishlist_ids';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['gv-rpg-001', 'gv-act-001'];
    } catch {
      return ['gv-rpg-001', 'gv-act-001'];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore storage errors
    }
  }, [wishlistIds]);

  // Dynamically hydrate full game details through catalogService
  const wishlistGames = useMemo(() => {
    const games: Game[] = [];
    for (const id of wishlistIds) {
      const game = catalogService.getGameById(id);
      if (game) games.push(game);
    }
    return games;
  }, [wishlistIds]);

  const isWishlisted = (gameId: string) => {
    return wishlistIds.includes(gameId);
  };

  const toggleWishlist = (game: Game) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(game.id);
      if (exists) {
        showToast('Removed from Wishlist', `${game.title} was removed.`, 'info');
        return prev.filter((id) => id !== game.id);
      } else {
        showToast('Added to Wishlist', `${game.title} was added to your wishlist.`, 'success');
        return [...prev, game.id];
      }
    });
  };

  const removeFromWishlist = (gameId: string) => {
    const game = catalogService.getGameById(gameId);
    setWishlistIds((prev) => prev.filter((id) => id !== gameId));
    showToast('Removed from Wishlist', `${game?.title || 'Game'} removed from your wishlist.`, 'info');
  };

  const clearWishlist = () => {
    setWishlistIds([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistGames,
        isWishlistOpen,
        setIsWishlistOpen,
        toggleWishlist,
        isWishlisted,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
