import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import { GENRES } from '../../data/genres';

export const GenreSection: React.FC = () => {
  const navigate = useNavigate();

  const handleGenreClick = (genreId: string) => {
    navigate(`/store?genre=${encodeURIComponent(genreId)}`);
  };

  return (
    <section className="py-16 border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider font-mono mb-2">
              <Compass className="w-4 h-4" />
              <span>Immersive Categories</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              Browse by Genre
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              From high-octane FPS arenas to sprawling open-world fantasy RPGs, dive into your favorite styles of play.
            </p>
          </div>
        </div>

        {/* 10 Genres Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreClick(genre.id)}
              className="group relative flex flex-col justify-end aspect-[4/5] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {/* Background Artwork */}
              <img
                src={genre.image}
                alt={genre.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110 filter brightness-75 group-hover:brightness-90"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-[#080a10]/60 to-transparent" />

              {/* Foreground Content */}
              <div className="relative p-4 z-10 w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors font-display">
                    {genre.name}
                  </h3>
                  <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                  {genre.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
