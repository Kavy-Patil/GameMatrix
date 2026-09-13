import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Tag } from 'lucide-react';
import { Game } from '../../types/game';
import { GameCard } from '../store/GameCard';

interface DealsSectionProps {
  games: Game[];
}

export const DealsSection: React.FC<DealsSectionProps> = ({ games }) => {
  // Select games that carry promo badges: LIMITED OFFER, POPULAR, BESTSELLER, NEW
  const dealGames = games
    .filter((g) => g.badge === 'LIMITED OFFER' || g.badge === 'BESTSELLER' || g.badge === 'POPULAR')
    .slice(0, 4);

  return (
    <section className="py-16 border-t border-white/[0.06] relative bg-gradient-to-b from-[#06080e] via-[#090d16] to-[#080a10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono mb-2">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Special Campaigns</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              Popular Deals & Events
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Highlighting featured campaign runs, publisher spotlights, and trending titles across our PC catalog.
            </p>
          </div>

          <Link
            to="/deals"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors group"
          >
            <span>Explore all deals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  );
};
