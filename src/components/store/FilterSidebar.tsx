import React from 'react';
import { Filter, RotateCcw, Check, Sparkles, Flame, Clock } from 'lucide-react';
import { Platform, Genre } from '../../types/game';
import { PLATFORMS } from '../../data/platforms';
import { GENRES } from '../../data/genres';

interface FilterSidebarProps {
  selectedPlatforms: Platform[];
  onTogglePlatform: (platform: Platform) => void;
  selectedGenres: Genre[];
  onToggleGenre: (genre: Genre) => void;
  statusFilter: 'all' | 'featured' | 'popular' | 'new';
  onStatusFilterChange: (status: 'all' | 'featured' | 'popular' | 'new') => void;
  onResetFilters: () => void;
  className?: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedPlatforms,
  onTogglePlatform,
  selectedGenres,
  onToggleGenre,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  className = '',
}) => {
  const hasActiveFilters =
    selectedPlatforms.length > 0 || selectedGenres.length > 0 || statusFilter !== 'all';

  return (
    <aside className={`flex flex-col gap-6 p-5 rounded-2xl bg-[#0d111b]/80 border border-white/[0.08] backdrop-blur-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Special Highlights Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
          Highlights
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onStatusFilterChange(statusFilter === 'all' ? 'all' : 'all')}
            className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
              statusFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            All Titles
          </button>
          <button
            onClick={() => onStatusFilterChange(statusFilter === 'featured' ? 'all' : 'featured')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
              statusFilter === 'featured'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Featured</span>
          </button>
          <button
            onClick={() => onStatusFilterChange(statusFilter === 'popular' ? 'all' : 'popular')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
              statusFilter === 'popular'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>Popular</span>
          </button>
          <button
            onClick={() => onStatusFilterChange(statusFilter === 'new' ? 'all' : 'new')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
              statusFilter === 'new'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Newest</span>
          </button>
        </div>
      </div>

      {/* Platforms Filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Platform
          </h4>
          {selectedPlatforms.length > 0 && (
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/50">
              {selectedPlatforms.length} active
            </span>
          )}
        </div>
        <div className="space-y-1">
          {PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => onTogglePlatform(platform.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{platform.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {platform.shortCode}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Genres Filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Genre
          </h4>
          {selectedGenres.length > 0 && (
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/50">
              {selectedGenres.length} active
            </span>
          )}
        </div>
        <div className="space-y-1">
          {GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre.id);
            return (
              <button
                key={genre.id}
                onClick={() => onToggleGenre(genre.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{genre.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
