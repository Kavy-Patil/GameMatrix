import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Gamepad2,
  Image,
  Layers,
  Sparkles,
  ShieldAlert,
  Monitor,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { catalogService } from '../../services/catalogService';
import { PLATFORMS, getPlatformName } from '../../data/platforms';
import { GENRES, getGenreName } from '../../data/genres';
import { Game, PlatformId, GenreId, PromoBadge } from '../../types/game';
import { validateGameInput } from '../../utils/security';
import { generateSlug } from '../../utils/csv';

const AVAILABLE_BADGES: PromoBadge[] = ['LIMITED OFFER', 'POPULAR', 'BESTSELLER', 'NEW', 'FEATURED'];

interface AdminGameFormProps {
  isNew?: boolean;
}

export const AdminGameForm: React.FC<AdminGameFormProps> = ({ isNew = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !isNew && Boolean(id);

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
  const [tagsText, setTagsText] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<PromoBadge[]>([]);
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);

  // PC System Requirements State (all optional)
  const [minOs, setMinOs] = useState('');
  const [minProcessor, setMinProcessor] = useState('');
  const [minMemory, setMinMemory] = useState('');
  const [minGraphics, setMinGraphics] = useState('');
  const [minDirectX, setMinDirectX] = useState('');
  const [minStorage, setMinStorage] = useState('');
  const [minNotes, setMinNotes] = useState('');

  const [recOs, setRecOs] = useState('');
  const [recProcessor, setRecProcessor] = useState('');
  const [recMemory, setRecMemory] = useState('');
  const [recGraphics, setRecGraphics] = useState('');
  const [recDirectX, setRecDirectX] = useState('');
  const [recStorage, setRecStorage] = useState('');
  const [recNotes, setRecNotes] = useState('');

  const [sysReqOpen, setSysReqOpen] = useState(false);
  const [sysReqTab, setSysReqTab] = useState<'minimum' | 'recommended'>('minimum');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const existing = catalogService.getGameByIdOrSlug(id);
      if (existing) {
        setTitle(existing.title);
        setSlug(existing.slug);
        setSelectedPlatforms(existing.platforms && existing.platforms.length > 0 ? existing.platforms : [existing.platform]);
        setSelectedGenres(existing.genres && existing.genres.length > 0 ? existing.genres : [existing.genre]);
        setDeveloper(existing.developer || '');
        setPublisher(existing.publisher || '');
        setReleaseDate(existing.releaseDate || '');
        setShortDescription(existing.shortDescription || existing.tagline || '');
        setDescription(existing.detailedDescription || existing.description || '');
        setCoverImage(existing.coverImage || '');
        setHeroImage(existing.heroImage || '');
        setTagsText(existing.searchableTags?.join(', ') || '');
        setSelectedBadges(existing.badges || (existing.badge ? [existing.badge] : []));
        setFeatured(Boolean(existing.featured));
        setPopular(Boolean(existing.popular));

        if (existing.systemRequirements?.minimum) {
          const m = existing.systemRequirements.minimum;
          setMinOs(m.os || '');
          setMinProcessor(m.processor || '');
          setMinMemory(m.memory || '');
          setMinGraphics(m.graphics || '');
          setMinDirectX(m.directX || '');
          setMinStorage(m.storage || '');
          setMinNotes(m.additionalNotes || '');
        }
        if (existing.systemRequirements?.recommended) {
          const r = existing.systemRequirements.recommended;
          setRecOs(r.os || '');
          setRecProcessor(r.processor || '');
          setRecMemory(r.memory || '');
          setRecGraphics(r.graphics || '');
          setRecDirectX(r.directX || '');
          setRecStorage(r.storage || '');
          setRecNotes(r.additionalNotes || '');
        }
        if (
          (existing.systemRequirements?.minimum && Object.values(existing.systemRequirements.minimum).some((v) => v && v.trim() !== '')) ||
          (existing.systemRequirements?.recommended && Object.values(existing.systemRequirements.recommended).some((v) => v && v.trim() !== ''))
        ) {
          setSysReqOpen(true);
        }
      } else {
        setNotFound(true);
      }
    }
  }, [id, isEditing]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === generateSlug(title))) {
      setSlug(generateSlug(val));
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
    setSuccess(null);
    setSaving(true);

    try {
      const primaryPlatform = selectedPlatforms[0];
      const primaryGenre = selectedGenres[0];

      const searchableTags = tagsText
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const candidate = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        platform: primaryPlatform,
        platforms: selectedPlatforms,
        genre: primaryGenre,
        genres: selectedGenres,
        developer: developer.trim(),
        publisher: publisher.trim(),
        releaseDate: releaseDate.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        coverImage: coverImage.trim(),
        heroImage: heroImage.trim() || coverImage.trim(),
        searchableTags,
        badges: selectedBadges,
        badge: selectedBadges[0] || undefined,
        featured,
        popular,
        systemRequirements: (() => {
          const buildSpec = (os: string, proc: string, mem: string, gpu: string, dx: string, storage: string, notes: string) => {
            const spec: {
              os?: string;
              processor?: string;
              memory?: string;
              graphics?: string;
              directX?: string;
              storage?: string;
              additionalNotes?: string;
            } = {};
            if (os.trim()) spec.os = os.trim();
            if (proc.trim()) spec.processor = proc.trim();
            if (mem.trim()) spec.memory = mem.trim();
            if (gpu.trim()) spec.graphics = gpu.trim();
            if (dx.trim()) spec.directX = dx.trim();
            if (storage.trim()) spec.storage = storage.trim();
            if (notes.trim()) spec.additionalNotes = notes.trim();
            return Object.keys(spec).length > 0 ? spec : undefined;
          };

          const minSpec = buildSpec(minOs, minProcessor, minMemory, minGraphics, minDirectX, minStorage, minNotes);
          const recSpec = buildSpec(recOs, recProcessor, recMemory, recGraphics, recDirectX, recStorage, recNotes);

          if (!minSpec && !recSpec) return undefined;
          return {
            minimum: minSpec,
            recommended: recSpec,
          };
        })(),
      };

      // 1. Client-side security and schema validation
      const validation = validateGameInput(candidate);
      if (!validation.valid) {
        setError(validation.error || 'Invalid form input.');
        setSaving(false);
        return;
      }

      if (isEditing && id) {
        const res = await catalogService.updateGame(id, candidate);
        if (!res.success) {
          setError(res.error || 'Failed to update game record.');
          setSaving(false);
          return;
        }
        setSuccess(`"${candidate.title}" successfully updated in catalog.`);
      } else {
        const res = await catalogService.addGame(candidate);
        if (!res.success) {
          setError(res.error || 'Failed to create game record.');
          setSaving(false);
          return;
        }
        setSuccess(`"${candidate.title}" successfully registered in catalog.`);
        setTimeout(() => {
          navigate('/admin/games');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (notFound) {
    return (
      <AdminLayout>
        <div className="p-8 text-center max-w-md mx-auto">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Game Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            The game identifier &quot;{id}&quot; does not match any record in the catalog.
          </p>
          <Link
            to="/admin/games"
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Back to Games
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6 text-left">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/games')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Back to games catalog"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                {isEditing ? `Edit: ${title || 'Catalog Game'}` : 'Register New Catalog Title'}
              </h1>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? 'Update legitimate digital PC catalog metadata with audit tracking.'
                  : 'Add a verified digital PC title to the GameVault canonical index.'}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-3 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{success}</div>
          </div>
        )}

        {/* Catalog Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Identification */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <span>Title & Identity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Game Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk 2077"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cyberpunk-2077-steam"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Canonical URL: /game/{slug || '[slug]'}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Developer</label>
                <input
                  type="text"
                  placeholder="e.g. CD PROJEKT RED"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Publisher</label>
                <input
                  type="text"
                  placeholder="e.g. CD PROJEKT RED"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Release Date</label>
                <input
                  type="text"
                  placeholder="e.g. Dec 10, 2020"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Taxonomy: Platforms & Genres */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Platform & Genre Taxonomy</span>
            </h2>

            <div>
              <label className="block text-slate-300 mb-2 font-semibold text-xs">
                Compatible PC Platforms * (First is Primary)
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        active
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-semibold text-xs">
                Genre Classifications * (First is Primary)
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => {
                  const active = selectedGenres.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGenre(g.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        active
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Descriptions & Artwork */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Image className="w-4 h-4 text-teal-400" />
              <span>Descriptions & Artwork</span>
            </h2>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Short Description / Tagline</label>
              <input
                type="text"
                placeholder="Brief 1-line overview of the title..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Full Description</label>
              <textarea
                rows={4}
                placeholder="Detailed game description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Cover Artwork URL (HTTPS)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Hero Banner URL (HTTPS)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Searchable Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="open-world, sci-fi, cyberpunk, story-rich"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* PC System Requirements (Collapsible & Optional) */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
                  PC System Requirements
                </h2>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSysReqOpen(!sysReqOpen)}
                className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
              >
                <span>{sysReqOpen ? 'Hide Specifications' : 'Configure Specifications'}</span>
                {sysReqOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Configure minimum and recommended PC hardware requirements. All fields are completely optional.
              If official specifications are unavailable, leave empty to omit without displaying fake or placeholder data.
            </p>

            {sysReqOpen && (
              <div className="space-y-4 pt-2">
                {/* Tab Switcher */}
                <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 w-fit">
                  <button
                    type="button"
                    onClick={() => setSysReqTab('minimum')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      sysReqTab === 'minimum'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Minimum Specs
                  </button>
                  <button
                    type="button"
                    onClick={() => setSysReqTab('recommended')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      sysReqTab === 'recommended'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Recommended Specs
                  </button>
                </div>

                {/* Minimum Form Fields */}
                {sysReqTab === 'minimum' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Operating System (OS)</label>
                      <input
                        type="text"
                        placeholder="e.g. Windows 10 64-bit"
                        value={minOs}
                        onChange={(e) => setMinOs(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Processor (CPU)</label>
                      <input
                        type="text"
                        placeholder="e.g. Intel Core i5-6600K or AMD Ryzen 5 1600"
                        value={minProcessor}
                        onChange={(e) => setMinProcessor(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Memory (RAM)</label>
                      <input
                        type="text"
                        placeholder="e.g. 12 GB RAM"
                        value={minMemory}
                        onChange={(e) => setMinMemory(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Graphics (GPU)</label>
                      <input
                        type="text"
                        placeholder="e.g. NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580"
                        value={minGraphics}
                        onChange={(e) => setMinGraphics(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">DirectX</label>
                      <input
                        type="text"
                        placeholder="e.g. Version 12"
                        value={minDirectX}
                        onChange={(e) => setMinDirectX(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Storage Space</label>
                      <input
                        type="text"
                        placeholder="e.g. 70 GB available space (SSD recommended)"
                        value={minStorage}
                        onChange={(e) => setMinStorage(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-300 mb-1 font-semibold">Additional Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. 1080p Low Settings @ 30 FPS"
                        value={minNotes}
                        onChange={(e) => setMinNotes(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Operating System (OS)</label>
                      <input
                        type="text"
                        placeholder="e.g. Windows 11 64-bit"
                        value={recOs}
                        onChange={(e) => setRecOs(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Processor (CPU)</label>
                      <input
                        type="text"
                        placeholder="e.g. Intel Core i7-12700 or AMD Ryzen 7 7800X3D"
                        value={recProcessor}
                        onChange={(e) => setRecProcessor(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Memory (RAM)</label>
                      <input
                        type="text"
                        placeholder="e.g. 16 GB RAM"
                        value={recMemory}
                        onChange={(e) => setRecMemory(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Graphics (GPU)</label>
                      <input
                        type="text"
                        placeholder="e.g. NVIDIA GeForce RTX 3070 or AMD Radeon RX 6800 XT"
                        value={recGraphics}
                        onChange={(e) => setRecGraphics(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">DirectX</label>
                      <input
                        type="text"
                        placeholder="e.g. Version 12"
                        value={recDirectX}
                        onChange={(e) => setRecDirectX(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">Storage Space</label>
                      <input
                        type="text"
                        placeholder="e.g. 70 GB available space (NVMe SSD)"
                        value={recStorage}
                        onChange={(e) => setRecStorage(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-300 mb-1 font-semibold">Additional Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. 1440p High Settings @ 60 FPS"
                        value={recNotes}
                        onChange={(e) => setRecNotes(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Highlights & Badges */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Promotions & Badges</span>
            </h2>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span>Featured on Storefront Spotlight</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-0"
                />
                <span>Popular Title Ranking</span>
              </label>
            </div>

            <div className="pt-2">
              <span className="block text-slate-400 mb-2 font-medium">Badges:</span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_BADGES.map((b) => {
                  const active = selectedBadges.includes(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBadge(b)}
                      className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all ${
                        active
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/games')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Title'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
