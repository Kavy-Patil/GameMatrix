import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { catalogService } from '../../services/catalogService';

export const HeroSection: React.FC = () => {
  const stats = useMemo(() => {
    const allGames = catalogService.getAllGames();
    const totalTitles = allGames.length;
    const platforms = new Set<string>();
    const genres = new Set<string>();
    for (const g of allGames) {
      for (const p of g.platforms) platforms.add(p);
      for (const genre of g.genres) genres.add(genre);
    }
    return {
      totalTitles,
      platformsCount: platforms.size,
      genresCount: genres.size,
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:py-28 lg:py-36">
      {/* Background Cinematic Artwork & Gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2000&q=85"
          alt="Cinematic gaming atmosphere"
          className="w-full h-full object-cover object-center opacity-25 scale-105 transform filter contrast-125 brightness-75"
        />
        {/* Radial and Linear Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-[#080a10]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080a10] via-[#080a10]/60 to-transparent" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 -left-40 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl">
          {/* Small Top Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>PREMIUM DIGITAL GAMING</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display text-white leading-[1.1] mb-6">
            Your Games. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
              Your Library.
            </span> <br />
            One Place.
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
            GameVault is a premium PC digital game catalog and manual booking showcase.
            Explore {stats.totalTitles} canonical PC releases across Steam, Rockstar, EA, Ubisoft, and Battle.net with transparent, direct enquiry.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/store">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
              >
                BROWSE CATALOG
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                variant="secondary"
                size="lg"
                icon={<Compass className="w-5 h-5 text-slate-400" />}
              >
                HOW IT WORKS
              </Button>
            </a>
          </div>

          {/* Micro stats banner */}
          <div className="mt-12 pt-8 border-t border-white/[0.08] grid grid-cols-3 gap-6 max-w-lg">
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-white">{stats.totalTitles}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                Canonical Titles
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-cyan-400">{stats.platformsCount}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                Platforms
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-purple-400">{stats.genresCount}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                Game Genres
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
