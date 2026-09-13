import React from 'react';
import { X, Heart, MessageSquarePlus, Trash2, ArrowUpRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useEnquiry } from '../../context/EnquiryContext';
import { Button } from '../common/Button';
import { PlatformBadge, GenreBadge } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { artworkService } from '../../services/artworkService';
import { Link } from 'react-router-dom';

export const WishlistDrawer: React.FC = () => {
  const { wishlistGames, isWishlistOpen, setIsWishlistOpen, removeFromWishlist, clearWishlist } =
    useWishlist();
  const { openEnquiry } = useEnquiry();

  if (!isWishlistOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-heading"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#0b0f19] border-l border-white/[0.08] shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 fill-rose-500/30 text-rose-400" />
            </div>
            <div>
              <h2 id="wishlist-heading" className="text-lg font-bold text-white font-display">
                Your Saved Wishlist
              </h2>
              <p className="text-xs text-slate-400">
                {wishlistGames.length} {wishlistGames.length === 1 ? 'game saved' : 'games saved'} locally
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors focus:outline-none"
            aria-label="Close wishlist drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlistGames.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-1">Your wishlist is empty</h3>
              <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
                Click the heart icon on any game card in the store to save titles to your personal wishlist.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWishlistOpen(false)}
              >
                Explore Games
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Tracked Titles ({wishlistGames.length})
                </span>
                <button
                  onClick={clearWishlist}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {wishlistGames.map((game) => {
                return (
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
                          <div className="flex items-center gap-1">
                            <PlatformBadge platform={game.platform} />
                            <GenreBadge genre={game.genre} />
                          </div>
                          <button
                            onClick={() => removeFromWishlist(game.id)}
                            className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors"
                            aria-label={`Remove ${game.title} from wishlist`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <Link
                          to={`/game/${game.slug || game.id}`}
                          onClick={() => setIsWishlistOpen(false)}
                          className="text-sm font-bold text-slate-100 hover:text-cyan-400 transition-colors line-clamp-1"
                        >
                          {game.title}
                        </Link>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <Link
                          to={`/game/${game.slug || game.id}`}
                          onClick={() => setIsWishlistOpen(false)}
                          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-0.5"
                        >
                          <span>Details</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setIsWishlistOpen(false);
                            openEnquiry(game);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm cursor-pointer"
                        >
                          <MessageSquarePlus className="w-3 h-3" />
                          <span>BOOK / ENQUIRE</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer info */}
        {wishlistGames.length > 0 && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/60">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Wishlist data is saved to your browser&apos;s local storage. Click &ldquo;BOOK / ENQUIRE&rdquo; on any title to submit a manual enquiry request.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
