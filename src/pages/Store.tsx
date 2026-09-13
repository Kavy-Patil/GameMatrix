import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { PlatformId, GenreId, SortOption } from '../types/game';
import { catalogService } from '../services/catalogService';
import { getPlatformName } from '../data/platforms';
import { getGenreName } from '../data/genres';
import { GameCard } from '../components/store/GameCard';
import { FilterSidebar } from '../components/store/FilterSidebar';
import { SearchBar } from '../components/store/SearchBar';
import { SortDropdown } from '../components/store/SortDropdown';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { SEO } from '../components/common/SEO';

const ITEMS_PER_PAGE = 18;

export const Store: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(() => {
    const p = searchParams.get('platform');
    return p ? [p.toLowerCase() as PlatformId] : [];
  });
  const [selectedGenres, setSelectedGenres] = useState<GenreId[]>(() => {
    const g = searchParams.get('genre');
    return g ? [g.toLowerCase() as GenreId] : [];
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'featured' | 'popular' | 'new'>(() => {
    const s = searchParams.get('status');
    if (s === 'featured' || s === 'popular' || s === 'new') return s;
    return 'all';
  });
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Sync state with URL params
  useEffect(() => {
    const q = searchParams.get('q');
    const p = searchParams.get('platform');
    const g = searchParams.get('genre');
    const s = searchParams.get('status');

    if (q !== null && q !== searchQuery) setSearchQuery(q);
    if (p && !selectedPlatforms.includes(p.toLowerCase() as PlatformId)) {
      setSelectedPlatforms([p.toLowerCase() as PlatformId]);
    }
    if (g && !selectedGenres.includes(g.toLowerCase() as GenreId)) {
      setSelectedGenres([g.toLowerCase() as GenreId]);
    }
    if (s && (s === 'featured' || s === 'popular' || s === 'new')) {
      setStatusFilter(s);
    }
  }, [searchParams]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedPlatforms, selectedGenres, statusFilter, sortBy]);

  // Toggle handlers
  const handleTogglePlatform = (platform: PlatformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleToggleGenre = (genre: GenreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPlatforms([]);
    setSelectedGenres([]);
    setStatusFilter('all');
    setSortBy('featured');
    setSearchParams({});
  };

  // Run filtering against the Catalog Service
  const filteredGames = useMemo(() => {
    return catalogService.filterGames({
      searchQuery,
      platforms: selectedPlatforms,
      genres: selectedGenres,
      status: statusFilter,
      sortBy,
    });
  }, [searchQuery, selectedPlatforms, selectedGenres, statusFilter, sortBy]);

  const totalGamesCount = catalogService.getAllGames().length;
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedPlatforms.length > 0 ||
    selectedGenres.length > 0 ||
    statusFilter !== 'all';

  const paginatedGames = useMemo(() => {
    return filteredGames.slice(0, visibleCount);
  }, [filteredGames, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredGames.length));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Digital PC Game Catalog"
        description="Browse all 805 verified digital PC game titles on GameVault. Filter by launcher, genre, or keyword. Manual booking and direct concierge support."
        canonicalUrl="/store"
      />
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display mb-3">
          Digital Game Catalog
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Browse our comprehensive selection of {totalGamesCount} verified digital PC titles. Filter by launcher compatibility, preferred genre classifications, or campaign highlights.
        </p>
      </div>

      {/* Main Grid Layout: Sidebar + Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-28">
          <FilterSidebar
            selectedPlatforms={selectedPlatforms}
            onTogglePlatform={handleTogglePlatform}
            selectedGenres={selectedGenres}
            onToggleGenre={handleToggleGenre}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Right Area: Search, Sort, Chips, & Game Cards */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/50 border border-white/[0.08] backdrop-blur-md">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search titles, developers, genres, platforms..."
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              {/* Mobile Filter Trigger Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
              >
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Filters {hasActiveFilters && `(${selectedPlatforms.length + selectedGenres.length})`}</span>
              </button>

              {/* Sort Selector */}
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400 font-mono">Active filters:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700">
                  <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 capitalize">
                  <span>Highlight: {statusFilter}</span>
                  <button onClick={() => setStatusFilter('all')} className="hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedPlatforms.map((platform) => (
                <span
                  key={platform}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700"
                >
                  <span>{getPlatformName(platform)}</span>
                  <button
                    onClick={() => handleTogglePlatform(platform)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedGenres.map((genre) => (
                <span
                  key={genre}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-purple-950/60 text-purple-300 border border-purple-800/50"
                >
                  <span>{getGenreName(genre)}</span>
                  <button onClick={() => handleToggleGenre(genre)} className="hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <button
                onClick={handleResetFilters}
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-mono ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Catalog Count Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 pb-1 gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-300 font-mono">
                {filteredGames.length} {filteredGames.length === 1 ? 'Title' : 'Titles'}
              </span>
              <span className="text-slate-400">
                {hasActiveFilters
                  ? `matched (Showing ${paginatedGames.length} of ${filteredGames.length} results • ${totalGamesCount} total in catalog)`
                  : `available for manual booking (Showing ${paginatedGames.length} of ${totalGamesCount})`}
              </span>
            </div>
          </div>

          {/* Games Grid or Empty State */}
          {filteredGames.length === 0 ? (
            <EmptyState
              title="No games matched your criteria"
              description="Try adjusting or clearing your search query, platform, or genre filters to see available titles."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>

              {/* Load More Pagination Button */}
              {visibleCount < filteredGames.length && (
                <div className="flex justify-center pt-8 pb-4">
                  <Button
                    variant="outline"
                    size="lg"
                    icon={<ChevronDown className="w-4 h-4" />}
                    onClick={handleLoadMore}
                  >
                    Load More Games ({filteredGames.length - visibleCount} more)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#0d111b] border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="font-bold text-white text-base">Filter Catalog</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <FilterSidebar
                selectedPlatforms={selectedPlatforms}
                onTogglePlatform={handleTogglePlatform}
                selectedGenres={selectedGenres}
                onToggleGenre={handleToggleGenre}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onResetFilters={handleResetFilters}
                className="p-0 bg-transparent border-0"
              />
            </div>

            <div className="pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm"
              >
                Apply Filters ({filteredGames.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
