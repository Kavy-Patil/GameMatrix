import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, ArrowRight, Layers } from 'lucide-react';
import { GENRES } from '../data/genres';
import { PLATFORMS } from '../data/platforms';
import { catalogService } from '../services/catalogService';
import { SEO } from '../components/common/SEO';

export const Categories: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'genres' | 'platforms'>('genres');

  // Compute live game counts dynamically through the catalogService
  const getGenreCount = (genreId: any) =>
    catalogService.getGamesByGenre(genreId).length;

  const getPlatformCount = (platformId: any) =>
    catalogService.getGamesByPlatform(platformId).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Game Categories & Launcher Platforms"
        description="Explore 805 PC games by genre classifications and launcher ecosystems on GameVault. Manual booking and personal assistance."
        canonicalUrl="/categories"
      />
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-4 font-mono">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Catalog Taxonomy</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display mb-3">
          Explore All Categories
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Navigate our digital catalog through specialized genre classifications and supported launcher ecosystems across {catalogService.getAllGames().length} available titles.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-slate-900/80 p-1.5 border border-slate-800 mt-6">
          <button
            onClick={() => setActiveTab('genres')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'genres'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Gaming Genres ({GENRES.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'platforms'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Platform Ecosystems ({PLATFORMS.length})</span>
          </button>
        </div>
      </div>

      {/* Genres Grid */}
      {activeTab === 'genres' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {GENRES.map((genre) => {
            const count = getGenreCount(genre.id);
            return (
              <Link
                key={genre.id}
                to={`/store?genre=${encodeURIComponent(genre.id)}`}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-850/60 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
              >
                {/* Background image tint */}
                <div className="absolute inset-0 -z-10 opacity-20 group-hover:opacity-30 transition-opacity">
                  <img
                    src={genre.image}
                    alt={genre.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-[#080a10]/80 to-transparent" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/40">
                      {count} {count === 1 ? 'Title' : 'Titles'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors font-display mb-2">
                    {genre.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {genre.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Browse catalog</span>
                  <span className="text-cyan-400 group-hover:underline">Explore &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Platforms Grid */}
      {activeTab === 'platforms' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {PLATFORMS.map((platform) => {
            const count = getPlatformCount(platform.id);
            return (
              <Link
                key={platform.id}
                to={`/store?platform=${encodeURIComponent(platform.id)}`}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-850/60 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      {count} {count === 1 ? 'Game' : 'Games'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors font-display mb-1.5">
                    {platform.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {platform.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Code format: {platform.shortCode}</span>
                  <span className="text-cyan-400 group-hover:underline">Filter &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
