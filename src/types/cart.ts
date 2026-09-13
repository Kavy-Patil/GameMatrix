import { Game } from './game';

export interface CartStorageItem {
  gameId: string;
  quantity: number;
  addedAt: string;
}

export interface CartItem {
  game: Game;
  quantity: number;
  addedAt: string;
}

export interface CartContextType {
  items: CartItem[];
  totalCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (game: Game) => void;
  removeFromCart: (gameId: string) => void;
  updateQuantity: (gameId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (gameId: string) => boolean;
}

export interface WishlistContextType {
  wishlistIds: string[];
  wishlistGames: Game[];
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  toggleWishlist: (game: Game) => void;
  isWishlisted: (gameId: string) => boolean;
  removeFromWishlist: (gameId: string) => void;
  clearWishlist: () => void;
}
