import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageSquarePlus,
  Star,
  Shield,
  Monitor,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Info,
  Cpu,
  Gamepad2,
} from 'lucide-react';
import { catalogService } from '../services/catalogService';
import { PromoBadgeComponent, PlatformBadge, GenreBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { GameCard } from '../components/store/GameCard';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { useWishlist } from '../context/WishlistContext';
import { useEnquiry } from '../context/EnquiryContext';
import { useToast } from '../context/ToastContext';
import { artworkService } from '../services/artworkService';
import { SEO } from '../components/common/SEO';
import { CanIRunThisModal } from '../components/compatibility/CanIRunThisModal';

export const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { openEnquiry } = useEnquiry();
  const { showToast } = useToast();

  const game = id ? catalogService.getGameByIdOrSlug(id) : undefined;

  // Selected screenshot preview state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCheckerOpen, setIsCheckerOpen] = useState(false);

  if (!game) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <EmptyState
          title="Game Not Found"
          description="The requested digital game title could not be located in the current catalog index."
          actionLabel="Back to Store Catalog"
          onAction={() => navigate('/store')}
        />
      </div>
    );
  }

  const wishlisted = isWishlisted(game.id);
  const heroUrl = artworkService.getHeroUrl(game);
  const coverUrl = artworkService.getCoverUrl(game);
  const activeImage = selectedImage || heroUrl || coverUrl;

  // Related titles using catalogService recommendation engine
  const similarGames = catalogService.getRelatedGames(game, 3);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link Copied', 'Product link copied to clipboard.', 'info');
  };

  return (
    <div className="min-h-screen pb-20">
      <SEO
        title={`${game.title} - Digital PC Edition`}
        description={game.shortDescription || game.tagline || `Browse ${game.title} on GameVault. Official PC digital game title available for booking and enquiry.`}
        image={coverUrl}
        canonicalUrl={`/game/${game.slug}`}
        type="product"
      />
      {/* Back Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md py-1 px-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to catalog</span>
        </button>
      </div>

      {/* Cinematic Hero Backdrop */}
      <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[580px] overflow-hidden bg-slate-950">
        <ImageWithFallback
          src={activeImage}
          alt={game.title}
          fallbackTitle={game.title}
          className="w-full h-full object-cover object-center transition-all duration-700 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-[#080a10]/70 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080a10] via-transparent to-black/50 pointer-events-none" />

        {/* Hero Bottom Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {game.badges && game.badges.map((b) => (
              <PromoBadgeComponent key={b} type={b} />
            ))}
            {game.platforms && game.platforms.map((p) => (
              <PlatformBadge key={p} platform={p} />
            ))}
            {game.genres && game.genres.map((g) => (
              <GenreBadge key={g} genre={g} />
            ))}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display tracking-tight max-w-4xl leading-tight">
            {game.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mt-2 leading-relaxed">
            {game.shortDescription || game.tagline || `Official PC digital edition available on ${game.platform.toUpperCase()} under the ${game.genre.toUpperCase()} catalog.`}
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm text-slate-400">
            {game.rating > 0 && (
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{game.rating.toFixed(1)} / 5.0 Rating</span>
              </div>
            )}
            {game.releaseDate ? <span>Released: {game.releaseDate}</span> : null}
            {game.developer ? <span>Dev: {game.developer}</span> : null}
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Columns: Screenshots, Description, Requirements */}
          <div className="lg:col-span-2 space-y-10">
            {/* Screenshot Carousel / Selector */}
            {game.screenshots && game.screenshots.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
                  Media Gallery & In-Engine Captures
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => setSelectedImage(game.heroImage)}
                    className={`relative aspect-[16/9] rounded-xl overflow-hidden border transition-all ${
                      activeImage === game.heroImage
                        ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                        : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback
                      src={game.heroImage}
                      alt="Hero preview"
                      fallbackTitle="Hero"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  {game.screenshots.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative aspect-[16/9] rounded-xl overflow-hidden border transition-all ${
                        activeImage === img
                          ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                          : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`${game.title} capture ${idx + 1}`}
                        fallbackTitle={`Capture ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* About the Game */}
            {/* About the Game */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-white/[0.08] backdrop-blur-md">
              <h2 className="text-xl font-bold text-white font-display mb-4">
                About {game.title}
              </h2>
              {game.detailedDescription || game.description ? (
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                  {game.detailedDescription || game.description}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  Digital catalog title available for booking and enquiry. Submit an enquiry for redemption instructions and edition information.
                </p>
              )}

              {/* Tags */}
              {game.searchableTags && game.searchableTags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2.5">
                    Searchable Taxonomy & Community Tags
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {game.searchableTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PC System Requirements */}
            {(() => {
              const min = game.systemRequirements?.minimum;
              const rec = game.systemRequirements?.recommended;

              const hasMin = Boolean(min && Object.values(min).some((v) => typeof v === 'string' && v.trim() !== ''));
              const hasRec = Boolean(rec && Object.values(rec).some((v) => typeof v === 'string' && v.trim() !== ''));

              if (!hasMin && !hasRec) {
                return (
                  <section aria-labelledby="pc-requirements-heading" className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80">
                    <div className="flex items-center gap-3 text-slate-400">
                      <Monitor className="w-5 h-5 text-slate-500 shrink-0" />
                      <div>
                        <h2 id="pc-requirements-heading" className="text-sm font-bold text-slate-300 font-display">
                          PC SYSTEM REQUIREMENTS
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          PC system requirements are currently unavailable for this title.
                        </p>
                      </div>
                    </div>
                  </section>
                );
              }

              const renderSpecRows = (spec?: typeof min) => {
                if (!spec) return null;
                const rows = [
                  { label: 'OS', value: spec.os },
                  { label: 'CPU', value: spec.processor },
                  { label: 'RAM', value: spec.memory },
                  { label: 'GPU', value: spec.graphics },
                  { label: 'DirectX', value: spec.directX },
                  { label: 'Storage', value: spec.storage },
                  { label: 'Additional Notes', value: spec.additionalNotes },
                ].filter((r) => r.value && r.value.trim() !== '');

                return (
                  <dl className="space-y-3">
                    {rows.map((r) => (
                      <div key={r.label} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <dt className="text-slate-400 font-mono text-[11px] uppercase tracking-wider mb-0.5">
                          {r.label}
                        </dt>
                        <dd className="text-slate-200 text-xs font-medium leading-relaxed">
                          {r.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                );
              };

              return (
                <section aria-labelledby="pc-requirements-heading" className="p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-white/[0.08] backdrop-blur-md">
                  <div className="flex items-center justify-between gap-2.5 mb-6 pb-4 border-b border-slate-800">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Monitor className="w-5 h-5 text-cyan-400 shrink-0" />
                      <h2 id="pc-requirements-heading" className="text-lg sm:text-xl font-bold text-white font-display">
                        PC SYSTEM REQUIREMENTS
                      </h2>
                      {game.systemRequirements?.requirementsSource && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400 border border-slate-700/60">
                          Source: {game.systemRequirements.requirementsSource}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCheckerOpen(true)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-mono transition-colors cursor-pointer"
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>CAN I RUN THIS?</span>
                    </button>
                  </div>

                  <div className={`grid grid-cols-1 ${hasMin && hasRec ? 'lg:grid-cols-2' : ''} gap-6`}>
                    {hasMin && (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/60">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-cyan-300 font-mono">
                            MINIMUM
                          </h3>
                        </div>
                        {renderSpecRows(min)}
                      </div>
                    )}

                    {hasRec && (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/60">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-300 font-mono">
                            RECOMMENDED
                          </h3>
                        </div>
                        {renderSpecRows(rec)}
                      </div>
                    )}
                  </div>

                  {/* Primary Can I Run This Action Bar */}
                  <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-white font-bold block text-sm font-display">
                        Can your PC run this game?
                      </span>
                      <span className="text-slate-400 text-xs">
                        Check your hardware locally in the browser against these published specifications.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCheckerOpen(true)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span>CAN I RUN THIS?</span>
                    </button>
                  </div>
                </section>
              );
            })()}
          </div>

          {/* Right Column: Purchase / Cart Action Box & Metadata */}
          <div className="space-y-6">
            {/* Action Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#111624] to-[#0d111b] border border-white/[0.12] shadow-2xl relative overflow-hidden">
              {/* Subtle top ambient glow */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Edition
                </span>
                <span className="text-xs font-semibold text-cyan-400 font-mono">
                  Direct Digital Activation
                </span>
              </div>

              {/* Manual Booking Information Banner */}
              <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/30 mb-6">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold mb-1">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Manual Booking & Direct Enquiry</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Submit an enquiry to request this title. Availability, manual payment, and key delivery are arranged directly with our support desk.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<MessageSquarePlus className="w-5 h-5" />}
                  onClick={() => openEnquiry(game)}
                  className="w-full font-bold"
                >
                  BOOK / ENQUIRE
                </Button>

                <Button
                  variant={wishlisted ? 'secondary' : 'outline'}
                  size="md"
                  icon={
                    <Heart
                      className={`w-4 h-4 ${
                        wishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                      }`}
                    />
                  }
                  onClick={() => toggleWishlist(game)}
                  className="w-full"
                >
                  {wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                </Button>

                <button
                  type="button"
                  onClick={() => setIsCheckerOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-500/60 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>CAN I RUN THIS?</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Title Link</span>
                </button>
              </div>

              {/* Feature Badges */}
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct launcher digital activation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Human-verified request confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Zero automated charges or recurring fees</span>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-300 font-mono pb-2 border-b border-slate-800">
                Product Metadata
              </h4>

              <div className="flex justify-between">
                <span className="text-slate-400">Primary Platform</span>
                <span className="font-semibold text-slate-200 capitalize">{game.platform}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Supported Launchers</span>
                <span className="font-semibold text-slate-200 uppercase font-mono">
                  {game.platforms.join(' • ')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Primary Genre</span>
                <span className="font-semibold text-slate-200 capitalize">{game.genre}</span>
              </div>

              {game.developer ? (
                <div className="flex justify-between">
                  <span className="text-slate-400">Developer</span>
                  <span className="font-semibold text-slate-200">{game.developer}</span>
                </div>
              ) : null}

              {game.publisher ? (
                <div className="flex justify-between">
                  <span className="text-slate-400">Publisher</span>
                  <span className="font-semibold text-slate-200">{game.publisher}</span>
                </div>
              ) : null}

              {game.releaseDate ? (
                <div className="flex justify-between">
                  <span className="text-slate-400">Release Date</span>
                  <span className="font-semibold text-slate-200">{game.releaseDate}</span>
                </div>
              ) : null}

              <div className="flex justify-between">
                <span className="text-slate-400">Order Method</span>
                <span className="font-semibold text-cyan-400">Manual Booking / Enquiry</span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Titles Section */}
        {similarGames.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Related Titles You May Like
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Matched based on genre classification and platform compatibility
                </p>
              </div>
              <Link
                to={`/store?genre=${game.genre}`}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 font-mono"
              >
                Explore more {game.genre} &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {similarGames.map((similar) => (
                <GameCard key={similar.id} game={similar} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Can I Run This Modal */}
      <CanIRunThisModal
        game={game}
        isOpen={isCheckerOpen}
        onClose={() => setIsCheckerOpen(false)}
      />
    </div>
  );
};
