import React, { useState } from 'react';
import { Flame, Info } from 'lucide-react';
import { catalogService } from '../services/catalogService';
import { GameCard } from '../components/store/GameCard';
import { PromoBadge } from '../types/game';
import { SEO } from '../components/common/SEO';

export const Deals: React.FC = () => {
  const [activeBadge, setActiveBadge] = useState<PromoBadge | 'ALL'>('ALL');
  const allGames = catalogService.getAllGames();

  const dealBadges: PromoBadge[] = ['LIMITED OFFER', 'BESTSELLER', 'POPULAR', 'NEW'];

  const filteredDeals = allGames.filter((g) => {
    const hasBadge = g.badges && g.badges.length > 0;
    if (!hasBadge && !g.badge) return false;
    if (activeBadge === 'ALL') return true;
    return (g.badges && g.badges.includes(activeBadge)) || g.badge === activeBadge;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Curated Campaigns & Featured Deals"
        description="Discover highlighted campaigns and featured digital PC releases across the GameVault catalog. Manual booking and personal concierge assistance."
        canonicalUrl="/deals"
      />
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-4 font-mono">
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Special Promotional Campaigns</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display mb-3">
          Popular Deals & Events
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Discover highlight campaigns, limited-run promotions, and bestselling digital releases.
        </p>

        {/* Informative compliance banner */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left flex items-start gap-3 text-xs text-slate-300">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white block">Manual Booking & Campaign Showcase</span>
            All promotional indicators highlight curated catalog campaigns. Final enquiry confirmation, manual payment, and key delivery are arranged directly with our support desk without automated charges.
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setActiveBadge('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeBadge === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Campaigns ({allGames.filter((g) => (g.badges && g.badges.length > 0) || g.badge).length})
          </button>

          {dealBadges.map((badge) => (
            <button
              key={badge}
              onClick={() => setActiveBadge(badge)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeBadge === badge
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {badge}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDeals.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};
