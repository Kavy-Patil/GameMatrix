import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';
import { PlatformBadge } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { artworkService } from '../../services/artworkService';
import { Link } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { items, totalCount, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-heading">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#0b0f19] border-l border-white/[0.08] shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cart-heading" className="text-lg font-bold text-white font-display">
                Your Vault Cart
              </h2>
              <p className="text-xs text-slate-400">
                {totalCount} {totalCount === 1 ? 'digital game' : 'digital games'} selected
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors focus:outline-none"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-1">Your cart is empty</h3>
              <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
                Explore our catalog of next-gen digital titles and add games to your cart to reserve licenses.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCartOpen(false)}
              >
                Browse Store
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Selected Titles ({items.length})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {items.map(({ game, quantity }) => (
                <div
                  key={game.id}
                  className="flex gap-3.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <ImageWithFallback
                    src={artworkService.getCoverUrl(game)}
                    alt={game.title}
                    fallbackTitle={game.title}
                    className="w-20 h-20 rounded-lg object-cover bg-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <PlatformBadge platform={game.platform} />
                        <button
                          onClick={() => removeFromCart(game.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors"
                          aria-label={`Remove ${game.title} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <Link
                        to={`/game/${game.slug || game.id}`}
                        onClick={() => setIsCartOpen(false)}
                        className="text-sm font-bold text-slate-100 hover:text-cyan-400 transition-colors line-clamp-1"
                      >
                        {game.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Digital License Edition
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-slate-700 rounded-lg bg-slate-950 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(game.id, quantity - 1)}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-mono text-cyan-300">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(game.id, quantity + 1)}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-400 italic">
                        Qty: {quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer info & Checkout state */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-4">
            {/* Manual Enquiry Compliance Notice */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-cyan-200/90">
                <span className="font-semibold block text-cyan-300">
                  Manual Enquiry Storefront
                </span>
                GameVault arranges fulfillment manually. Online automated checkout is disabled. To request titles, use the &ldquo;BOOK / ENQUIRE&rdquo; button directly on each game.
              </div>
            </div>

            {/* Total Item Count Summary */}
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Total Games Selected</span>
              <span className="font-bold text-white font-mono">{totalCount}</span>
            </div>

            {/* Disabled / Informational Button */}
            <div className="flex flex-col gap-2">
              <button
                disabled
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-not-allowed flex items-center justify-center gap-2 select-none"
              >
                <span>Manual Booking Only (Use Direct Enquiry)</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero automated charges — direct human support</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
