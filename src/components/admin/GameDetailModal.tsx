import React from 'react';
import { X, ExternalLink, Calendar, User, Building, Monitor, Tag, Edit } from 'lucide-react';
import { Game } from '../../types/game';
import { PlatformBadge, GenreBadge, PromoBadgeComponent } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { artworkService } from '../../services/artworkService';
import { Link } from 'react-router-dom';

interface GameDetailModalProps {
  isOpen: boolean;
  game: Game | null;
  onClose: () => void;
  onEdit: (game: Game) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  isOpen,
  game,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !game) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-detail-modal-title"
    >
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0e1320] border border-white/[0.12] rounded-2xl shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
              Catalog Record Inspector
            </span>
            <h2 id="game-detail-modal-title" className="text-lg font-bold text-white font-display">
              {game.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
          {/* Cover & Quick Meta */}
          <div className="flex gap-4 items-start">
            <ImageWithFallback
              src={artworkService.getCoverUrl(game)}
              alt={game.title}
              fallbackTitle={game.title}
              className="w-28 h-36 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-700"
            />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Artwork Status Badge */}
                {(() => {
                  const status = artworkService.getArtworkStatus(game);
                  if (status === 'VERIFIED') {
                    return (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ARTWORK: VERIFIED
                      </span>
                    );
                  } else if (status === 'FALLBACK') {
                    return (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        ARTWORK: FALLBACK
                      </span>
                    );
                  } else {
                    return (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        ARTWORK: MISSING
                      </span>
                    );
                  }
                })()}
                {game.badges && game.badges.map((b) => <PromoBadgeComponent key={b} type={b} />)}
                {game.platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
                {game.genres.map((g) => <GenreBadge key={g} genre={g} />)}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {game.shortDescription}
              </p>

              <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
                <div>ID: <span className="text-slate-300">{game.id}</span></div>
                <div>Slug: <span className="text-cyan-400">{game.slug}</span></div>
                <div>Release: <span className="text-slate-300">{game.releaseDate}</span></div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-slate-200 block uppercase font-mono text-[10px] text-cyan-400">
              Overview Description
            </span>
            <p className="leading-relaxed">
              {game.detailedDescription || game.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-mono uppercase">Developer</span>
              <span className="font-bold text-slate-200">{game.developer}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-mono uppercase">Publisher</span>
              <span className="font-bold text-slate-200">{game.publisher}</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 block mb-2 font-semibold">
              Searchable Tags ({game.searchableTags.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {game.searchableTags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-md text-xs bg-slate-900 border border-slate-800 text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <Link
            to={`/game/${game.slug}`}
            target="_blank"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <span>View on Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              onClose();
              onEdit(game);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};
