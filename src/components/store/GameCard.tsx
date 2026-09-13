import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquarePlus, Star, ArrowUpRight, Cpu } from 'lucide-react';
import { Game } from '../../types/game';
import { PromoBadgeComponent, PlatformBadge, GenreBadge } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { useWishlist } from '../../context/WishlistContext';
import { useEnquiry } from '../../context/EnquiryContext';
import { artworkService } from '../../services/artworkService';

interface GameCardProps {
  game: Game;
  className?: string;
}

export const GameCard: React.FC<GameCardProps> = ({ game, className = '' }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { openEnquiry } = useEnquiry();

  const wishlisted = isWishlisted(game.id);
  const coverUrl = artworkService.getCoverUrl(game);

  const displayBadge = game.badges && game.badges.length > 0 ? game.badges[0] : game.badge;

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-[#0f1422]/90 border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-950/30 overflow-hidden ${className}`}
    >
      {/* Cover Artwork Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <ImageWithFallback
          src={coverUrl}
          alt={game.title}
          fallbackTitle={game.title}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          containerClassName="w-full h-full"
        />

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1422] via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {displayBadge ? (
            <div className="pointer-events-auto">
              <PromoBadgeComponent type={displayBadge} />
            </div>
          ) : (
            <div />
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(game);
            }}
            className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md border transition-all ${
              wishlisted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-black/50 text-slate-300 border-white/10 hover:text-rose-400 hover:bg-black/80'
            }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Bottom floating platform tag over artwork */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 pointer-events-none">
          <PlatformBadge platform={game.platform} />
          <GenreBadge genre={game.genre} />
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Optional Rating / Release Meta */}
        {(game.rating > 0 || game.releaseDate) && (
          <div className="flex items-center justify-between gap-2 mb-1.5">
            {game.rating > 0 ? (
              <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{game.rating.toFixed(1)}</span>
              </div>
            ) : <div />}
            {game.releaseDate ? (
              <span className="text-[11px] text-slate-400 font-mono">
                {game.releaseDate}
              </span>
            ) : null}
          </div>
        )}

        {/* Slug-based product link */}
        <Link
          to={`/game/${game.slug}`}
          className="group/title focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
        >
          <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover/title:text-cyan-400 transition-colors line-clamp-1">
            {game.title}
          </h3>
        </Link>

        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
          {game.shortDescription || game.tagline || game.description || `Official PC release available on ${game.platform.toUpperCase()} in the ${game.genre.toUpperCase()} catalog.`}
        </p>

        {Boolean(
          (game.systemRequirements?.minimum && Object.values(game.systemRequirements.minimum).some((v) => typeof v === 'string' && v.trim() !== '')) ||
          (game.systemRequirements?.recommended && Object.values(game.systemRequirements.recommended).some((v) => typeof v === 'string' && v.trim() !== ''))
        ) && (
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
            <span className="inline-flex items-center gap-1 text-cyan-400/90 font-medium">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Specs Available</span>
            </span>
            <span className="text-[10px] text-slate-500 group-hover:text-cyan-400/80 transition-colors">
              Can I Run This?
            </span>
          </div>
        )}

        {/* Action Row */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <Link
            to={`/game/${game.slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-cyan-400 transition-colors py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md px-1"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openEnquiry(game);
            }}
            aria-label={`Enquire about ${game.title}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500 hover:to-teal-400 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 hover:border-transparent shadow-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>BOOK / ENQUIRE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
