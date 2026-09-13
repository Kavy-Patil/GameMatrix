import React, { useState, useEffect } from 'react';
import { X, Save, Plus, AlertCircle, CheckCircle2, Sparkles, Image, Monitor } from 'lucide-react';
import { Game, PlatformId, GenreId, PromoBadge, SystemRequirements } from '../../types/game';
import { PLATFORMS, getPlatformName } from '../../data/platforms';
import { GENRES, getGenreName } from '../../data/genres';
import { catalogService } from '../../services/catalogService';

interface GameFormModalProps {
  isOpen: boolean;
  game: Game | null;
  onClose: () => void;
  onSuccess: (game: Game) => void;
}

const AVAILABLE_BADGES: PromoBadge[] = ['LIMITED OFFER', 'POPULAR', 'BESTSELLER', 'NEW', 'FEATURED'];

export const GameFormModal: React.FC<GameFormModalProps> = ({
  isOpen,
  game,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(game);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(['steam']);
  const [selectedGenres, setSelectedGenres] = useState<GenreId[]>(['action']);
  const [developer, setDeveloper] = useState('');
  const [publisher, setPublisher] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [screenshotsText, setScreenshotsText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<PromoBadge[]>([]);
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);

  // System requirements state
  const [minOS, setMinOS] = useState('Windows 10 64-bit');
  const [minCPU, setMinCPU] = useState('Intel Core i5-6600K / AMD Ryzen 5 1600');
  const [minRAM, setMinRAM] = useState('8 GB RAM');
  const [minGPU, setMinGPU] = useState('NVIDIA GeForce GTX 1060 (6GB)');
  const [minStorage, setMinStorage] = useState('50 GB available space');

  const [recOS, setRecOS] = useState('Windows 11 64-bit');
  const [recCPU, setRecCPU] = useState('Intel Core i7-8700K / AMD Ryzen 7 2700X');
  const [recRAM, setRecRAM] = useState('16 GB RAM');
  const [recGPU, setRecGPU] = useState('NVIDIA GeForce RTX 2070 / AMD Radeon RX 5700 XT');
  const [recStorage, setRecStorage] = useState('50 GB SSD space');

  const [error, setError] = useState<string | null>(null);

  // Sync state when modal opens or game changes
  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setSlug(game.slug);
      setSelectedPlatforms(game.platforms && game.platforms.length > 0 ? game.platforms : [game.platform]);
      setSelectedGenres(game.genres && game.genres.length > 0 ? game.genres : [game.genre]);
      setDeveloper(game.developer);
      setPublisher(game.publisher);
      setReleaseDate(game.releaseDate);
      setShortDescription(game.shortDescription || game.tagline || '');
      setDescription(game.detailedDescription || game.description || '');
      setCoverImage(game.coverImage);
      setHeroImage(game.heroImage || game.coverImage);
      setScreenshotsText(game.screenshots?.join('\n') || game.coverImage);
      setTagsText(game.searchableTags?.join(', ') || '');
      setSelectedBadges(game.badges || (game.badge ? [game.badge] : []));
      setFeatured(Boolean(game.featured));
      setPopular(Boolean(game.popular));

      if (game.systemRequirements) {
        setMinOS(game.systemRequirements.minimum?.os || '');
        setMinCPU(game.systemRequirements.minimum?.processor || '');
        setMinRAM(game.systemRequirements.minimum?.memory || '');
        setMinGPU(game.systemRequirements.minimum?.graphics || '');
        setMinStorage(game.systemRequirements.minimum?.storage || '');

        setRecOS(game.systemRequirements.recommended?.os || '');
        setRecCPU(game.systemRequirements.recommended?.processor || '');
        setRecRAM(game.systemRequirements.recommended?.memory || '');
        setRecGPU(game.systemRequirements.recommended?.graphics || '');
        setRecStorage(game.systemRequirements.recommended?.storage || '');
      }
    } else {
      // Reset to defaults
      setTitle('');
      setSlug('');
      setSelectedPlatforms(['steam']);
      setSelectedGenres(['action']);
      setDeveloper('');
      setPublisher('');
      setReleaseDate('Nov 2026');
      setShortDescription('');
      setDescription('');
      setCoverImage('');
      setHeroImage('');
      setScreenshotsText('');
      setTagsText('');
      setSelectedBadges([]);
      setFeatured(false);
      setPopular(false);
    }
    setError(null);
  }, [game, isOpen]);

  // Automatically derive slug from title if in create mode and user hasn't typed custom slug
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isEditing && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))) {
      const generated = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const togglePlatform = (p: PlatformId) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const toggleGenre = (g: GenreId) => {
    if (selectedGenres.includes(g)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((item) => item !== g));
      }
    } else {
      setSelectedGenres([...selectedGenres, g]);
    }
  };

  const toggleBadge = (b: PromoBadge) => {
    if (selectedBadges.includes(b)) {
      setSelectedBadges(selectedBadges.filter((item) => item !== b));
    } else {
      setSelectedBadges([...selectedBadges, b]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!slug.trim()) {
      setError('URL slug is required.');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug must contain only lowercase letters, numbers, and hyphens.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError('At least one platform must be selected.');
      return;
    }
    if (selectedGenres.length === 0) {
      setError('At least one genre must be selected.');
      return;
    }
    if (!coverImage.trim()) {
      setError('Cover Image URL is required.');
      return;
    }

    const screenshots = screenshotsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const hasMin = Boolean(minOS || minCPU || minRAM || minGPU || minStorage);
    const hasRec = Boolean(recOS || recCPU || recRAM || recGPU || recStorage);

    const systemRequirements: SystemRequirements | undefined = (hasMin || hasRec) ? {
      minimum: hasMin ? {
        os: minOS || undefined,
        processor: minCPU || undefined,
        memory: minRAM || undefined,
        graphics: minGPU || undefined,
        storage: minStorage || undefined,
      } : undefined,
      recommended: hasRec ? {
        os: recOS || undefined,
        processor: recCPU || undefined,
        memory: recRAM || undefined,
        graphics: recGPU || undefined,
        storage: recStorage || undefined,
      } : undefined,
    } : undefined;

    if (isEditing && game) {
      const result = await catalogService.updateGame(game.id, {
        title: title.trim(),
        slug: slug.trim(),
        platforms: selectedPlatforms,
        platform: selectedPlatforms[0],
        genres: selectedGenres,
        genre: selectedGenres[0],
        developer: developer.trim() || 'Independent Studio',
        publisher: publisher.trim() || 'GameVault Showcase',
        releaseDate: releaseDate.trim() || '2026',
        shortDescription: shortDescription.trim() || title.trim(),
        tagline: shortDescription.trim() || title.trim(),
        description: description.trim() || shortDescription.trim() || title.trim(),
        detailedDescription: description.trim() || shortDescription.trim(),
        coverImage: coverImage.trim(),
        heroImage: (heroImage.trim() || coverImage.trim()),
        screenshots: screenshots.length > 0 ? screenshots : [coverImage.trim()],
        systemRequirements,
        searchableTags: tags.length > 0 ? tags : [selectedGenres[0], selectedPlatforms[0]],
        tags: tags.length > 0 ? tags : [selectedGenres[0]],
        badges: selectedBadges,
        badge: selectedBadges[0],
        featured,
        popular,
      });

      if (result.success && result.game) {
        onSuccess(result.game);
        onClose();
      } else {
        setError(result.error || 'Failed to update game.');
      }
    } else {
      // Add new game
      const newId = `gv-custom-${Date.now().toString(36)}`;
      const result = await catalogService.addGame({
        id: newId,
        title: title.trim(),
        slug: slug.trim(),
        platforms: selectedPlatforms,
        platform: selectedPlatforms[0],
        genres: selectedGenres,
        genre: selectedGenres[0],
        developer: developer.trim() || 'Independent Studio',
        publisher: publisher.trim() || 'GameVault Showcase',
        releaseDate: releaseDate.trim() || '2026',
        shortDescription: shortDescription.trim() || title.trim(),
        tagline: shortDescription.trim() || title.trim(),
        description: description.trim() || shortDescription.trim() || title.trim(),
        detailedDescription: description.trim() || shortDescription.trim(),
        coverImage: coverImage.trim(),
        heroImage: (heroImage.trim() || coverImage.trim()),
        screenshots: screenshots.length > 0 ? screenshots : [coverImage.trim()],
        systemRequirements,
        searchableTags: tags.length > 0 ? tags : [selectedGenres[0], selectedPlatforms[0]],
        tags: tags.length > 0 ? tags : [selectedGenres[0]],
        badges: selectedBadges,
        badge: selectedBadges[0],
        featured,
        popular,
      });

      if (result.success && result.game) {
        onSuccess(result.game);
        onClose();
      } else {
        setError(result.error || 'Failed to add game.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-form-modal-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-[#0e1320] border border-white/[0.12] rounded-2xl shadow-2xl z-10 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="game-form-modal-title" className="text-base sm:text-lg font-bold text-white font-display">
                {isEditing ? `Edit Title: ${game?.title}` : 'Add New Game to Catalog'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Standardized GameVault Metadata Schema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Game Title <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Starfield Odyssey"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                URL Slug <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="e.g. starfield-odyssey"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                required
              />
            </div>
          </div>

          {/* Supported Platforms */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Supported Platforms <span className="text-cyan-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const selected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Genres <span className="text-cyan-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const selected = selectedGenres.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGenre(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selected
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Developer, Publisher, Release Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Developer
              </label>
              <input
                type="text"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                placeholder="Studio name"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Publisher
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Publisher name"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Release Date
              </label>
              <input
                type="text"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                placeholder="e.g. Oct 24, 2026"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Short Description / Tagline <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Punchy one-liner summary"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Full Overview & Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed game synopsis, key features, and mechanics..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Cover Image URL <span className="text-cyan-400">*</span>
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Hero Backdrop Image URL
              </label>
              <input
                type="url"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="Falls back to Cover Image if empty"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Screenshots */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Screenshots (One URL per line)
            </label>
            <textarea
              rows={2}
              value={screenshotsText}
              onChange={(e) => setScreenshotsText(e.target.value)}
              placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Search Tags & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Searchable Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="e.g. Open World, Co-op, Sci-Fi, Crafting"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Promotional Badges
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_BADGES.map((b) => {
                  const active = selectedBadges.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBadge(b)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono border transition-all ${
                        active
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Highlights Flags */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span>Feature on Home Spotlight</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
              <input
                type="checkbox"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span>Mark as Popular Deal</span>
            </label>
          </div>

          {/* System Requirements Accordion/Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-300">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>PC System Requirements</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-300 block border-b border-slate-800 pb-1">
                  Minimum Specs
                </span>
                <input
                  type="text"
                  value={minOS}
                  onChange={(e) => setMinOS(e.target.value)}
                  placeholder="OS"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
                <input
                  type="text"
                  value={minCPU}
                  onChange={(e) => setMinCPU(e.target.value)}
                  placeholder="Processor"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
                <input
                  type="text"
                  value={minRAM}
                  onChange={(e) => setMinRAM(e.target.value)}
                  placeholder="Memory"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
                <input
                  type="text"
                  value={minGPU}
                  onChange={(e) => setMinGPU(e.target.value)}
                  placeholder="Graphics"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
                <input
                  type="text"
                  value={minStorage}
                  onChange={(e) => setMinStorage(e.target.value)}
                  placeholder="Storage"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-300 block border-b border-slate-800 pb-1">
                  Recommended Specs
                </span>
                <input
                  type="text"
                  value={recOS}
                  onChange={(e) => setRecOS(e.target.value)}
                  placeholder="OS"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
                <input
                  type="text"
                  value={recCPU}
                  onChange={(e) => setRecCPU(e.target.value)}
                  placeholder="Processor"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
                <input
                  type="text"
                  value={recRAM}
                  onChange={(e) => setRecRAM(e.target.value)}
                  placeholder="Memory"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
                <input
                  type="text"
                  value={recGPU}
                  onChange={(e) => setRecGPU(e.target.value)}
                  placeholder="Graphics"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
                <input
                  type="text"
                  value={recStorage}
                  onChange={(e) => setRecStorage(e.target.value)}
                  placeholder="Storage"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Footer Notice & Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-[11px] text-slate-400">
              Note: Changes update the active development catalog in memory for this session.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Add to Catalog'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
