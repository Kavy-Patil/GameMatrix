import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Game } from '../../types/game';
import { GameCard } from '../store/GameCard';

interface FeaturedSectionProps {
  games: Game[];
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ games }) => {
  const featuredGames = games.filter((g) => g.featured).slice(0, 6);

  return (
    <section className="py-16 border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Editor's Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              Featured Games
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Hand-picked AAA blockbusters and groundbreaking independent sensations with universal acclaim.
            </p>
          </div>

          <Link
            to="/store?status=featured"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <span>View all featured</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {/* View All Games Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-cyan-400 transition-all duration-300 shadow-lg"
          >
            <span>VIEW ALL GAMES</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
