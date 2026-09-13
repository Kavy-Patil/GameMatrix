import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { catalogService } from '../../services/catalogService';
import { artworkService } from '../../services/artworkService';
import { getGameRequirementsStatus } from '../../services/systemRequirementsHealth';
import { Game, PlatformId, GenreId } from '../../types/game';
import { PLATFORMS, getPlatformName } from '../../data/platforms';
import { GENRES, getGenreName } from '../../data/genres';
import { PlatformBadge, GenreBadge } from '../../components/common/Badge';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { GameFormModal } from '../../components/admin/GameFormModal';
import { GameDetailModal } from '../../components/admin/GameDetailModal';

const ITEMS_PER_PAGE = 15;

export const AdminGames: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [genreFilter, setGenreFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [artworkFilter, setArtworkFilter] = useState<string>('ALL');
  const [requirementsFilter, setRequirementsFilter] = useState<string>(searchParams.get('requirements') || 'ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [inspectingGame, setInspectingGame] = useState<Game | null>(null);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Version counter to force re-render when a game is added/edited
  const [version, setVersion] = useState(0);

  // Filtered games list
  const filteredGames = useMemo(() => {
    // Reference version to recompute when catalog mutates
    void version;
    let list = catalogService.searchCatalogAdmin(searchQuery, {
      platform: platformFilter,
      genre: genreFilter,
      status: statusFilter,
    });
    if (artworkFilter !== 'ALL') {
      list = list.filter((g) => artworkService.getArtworkStatus(g) === artworkFilter);
    }
    if (requirementsFilter !== 'ALL') {
      list = list.filter((g) => getGameRequirementsStatus(g) === requirementsFilter);
    }
    return list;
  }, [searchQuery, platformFilter, genreFilter, statusFilter, artworkFilter, requirementsFilter, version]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE) || 1;
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGames.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGames, currentPage]);

  const handleOpenAdd = () => {
    navigate('/admin/games/new');
  };

  const handleOpenEdit = (game: Game) => {
    navigate(`/admin/games/${game.id}/edit`);
  };

  const handleOpenView = (game: Game) => {
    setInspectingGame(game);
  };

  const handleMutationSuccess = () => {
    setVersion((v) => v + 1);
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = await catalogService.exportCatalogCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `gamevault_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export catalog: ' + (err?.message || err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!gameToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const success = await catalogService.removeGame(gameToDelete.id);
      if (!success) {
        throw new Error('Failed to remove game from catalog.');
      }
      setGameToDelete(null);
      handleMutationSuccess();
    } catch (err: any) {
      setDeleteError(err?.message || 'Error removing game.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Game Catalog Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Search, inspect, update, and register titles in the active catalog ({catalogService.getAllGames().length} titles).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export safe catalog CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => navigate('/admin/games/import')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-700/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Import titles via CSV"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ADD GAME</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, developer, publisher..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Platform Dropdown */}
            <select
              value={platformFilter}
              onChange={(e) => {
                setPlatformFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Platforms</option>
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Genre Dropdown */}
            <select
              value={genreFilter}
              onChange={(e) => {
                setGenreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Genres</option>
              {GENRES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {/* Highlight Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Status</option>
              <option value="featured">Featured Only</option>
              <option value="popular">Popular Only</option>
              <option value="new">New Releases</option>
            </select>

            {/* Artwork Status Dropdown */}
            <select
              value={artworkFilter}
              onChange={(e) => {
                setArtworkFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Artwork</option>
              <option value="VERIFIED">Verified Artwork</option>
              <option value="FALLBACK">Fallback Artwork</option>
              <option value="MISSING">Missing Artwork</option>
            </select>

            {/* Requirements Status Dropdown */}
            <select
              value={requirementsFilter}
              onChange={(e) => {
                setRequirementsFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Requirements</option>
              <option value="COMPLETE">Complete Specs</option>
              <option value="PARTIAL">Partial Specs</option>
              <option value="MISSING">Missing Specs</option>
            </select>
          </div>
        </div>

        {/* Count Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <span>
            Showing <strong className="text-cyan-400">{filteredGames.length}</strong> matching titles (Page {currentPage} of {totalPages})
          </span>
        </div>

        {/* Games Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0e1320] shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3.5 px-4">Title & Artwork</th>
                <th className="py-3.5 px-4">Platforms</th>
                <th className="py-3.5 px-4">Genres</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-center">Popular</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedGames.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No games matched the current filters or search query.
                  </td>
                </tr>
              ) : (
                paginatedGames.map((game) => (
                  <tr
                    key={game.id}
                    className="hover:bg-slate-900/60 transition-colors group"
                  >
                    {/* Title & Artwork */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={artworkService.getCoverUrl(game)}
                          alt={game.title}
                          fallbackTitle={game.title}
                          className="w-10 h-12 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-800"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100 block group-hover:text-cyan-400 transition-colors truncate max-w-xs sm:max-w-sm">
                              {game.title}
                            </span>
                            {/* Artwork Status Indicator */}
                            {(() => {
                              const status = artworkService.getArtworkStatus(game);
                              if (status === 'VERIFIED') {
                                return (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                                    VERIFIED
                                  </span>
                                );
                              } else if (status === 'FALLBACK') {
                                return (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                                    FALLBACK
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                                    MISSING
                                  </span>
                                );
                              }
                            })()}

                            {/* Requirements Status Indicator */}
                            {(() => {
                              const reqStatus = getGameRequirementsStatus(game);
                              if (reqStatus === 'COMPLETE') {
                                return (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                                    REQS: COMPLETE
                                  </span>
                                );
                              } else if (reqStatus === 'PARTIAL') {
                                return (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                                    REQS: PARTIAL
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
                                    REQS: MISSING
                                  </span>
                                );
                              }
                            })()}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {(game.developer || game.releaseDate)
                              ? [game.developer, game.releaseDate].filter(Boolean).join(' • ')
                              : `ID: ${game.id}`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Platforms */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {game.platforms.slice(0, 3).map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300"
                          >
                            {getPlatformName(p)}
                          </span>
                        ))}
                        {game.platforms.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-mono self-center">
                            +{game.platforms.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Genres */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {game.genres.slice(0, 2).map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/40 text-purple-300 border border-purple-800/40"
                          >
                            {getGenreName(g)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Featured */}
                    <td className="py-3 px-4 text-center">
                      {game.featured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          <Sparkles className="w-3 h-3" />
                          <span>YES</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">—</span>
                      )}
                    </td>

                    {/* Popular */}
                    <td className="py-3 px-4 text-center">
                      {game.popular ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Flame className="w-3 h-3" />
                          <span>YES</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(game)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="hidden sm:inline">VIEW</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(game)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit Game"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">EDIT</span>
                        </button>

                        <button
                          onClick={() => setGameToDelete(game)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Remove Game"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">REMOVE</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 font-mono">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-cyan-400">
                {currentPage}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Game Modal */}
      <GameFormModal
        isOpen={isFormOpen}
        game={editingGame}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleMutationSuccess}
      />

      {/* Game Detail View Modal */}
      <GameDetailModal
        isOpen={Boolean(inspectingGame)}
        game={inspectingGame}
        onClose={() => setInspectingGame(null)}
        onEdit={(g) => {
          setInspectingGame(null);
          handleOpenEdit(g);
        }}
      />

      {/* Remove Confirmation Modal */}
      {gameToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-[#0e1320] border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <span>Remove Game Record</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">&ldquo;{gameToDelete.title}&rdquo;</strong> (ID: <code className="text-cyan-400 font-mono">{gameToDelete.id}</code>) from the catalog?
            </p>
            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
                {deleteError}
              </div>
            )}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
              This action will remove the title from the catalog and record an entry in the immutable audit trail.
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => {
                  setGameToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isDeleting ? 'Removing...' : 'Confirm Removal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
