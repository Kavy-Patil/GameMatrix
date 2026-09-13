import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Layers,
  Star,
  Flame,
  Cpu,
  Monitor,
  Shield,
  HardDrive,
  ArrowRight,
  Info,
} from 'lucide-react';
import { PLATFORMS, PlatformInfo } from '../../data/platforms';

export const PlatformSection: React.FC = () => {
  const navigate = useNavigate();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Gamepad2':
        return <Gamepad2 className="w-6 h-6" />;
      case 'Layers':
        return <Layers className="w-6 h-6" />;
      case 'Star':
        return <Star className="w-6 h-6" />;
      case 'Flame':
        return <Flame className="w-6 h-6" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6" />;
      case 'Monitor':
        return <Monitor className="w-6 h-6" />;
      case 'Shield':
        return <Shield className="w-6 h-6" />;
      default:
        return <HardDrive className="w-6 h-6" />;
    }
  };

  const handlePlatformClick = (platformId: string) => {
    navigate(`/store?platform=${encodeURIComponent(platformId)}`);
  };

  return (
    <section className="py-16 border-t border-white/[0.06] relative bg-[#06080e]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono mb-2">
              <Shield className="w-4 h-4" />
              <span>Multi-Ecosystem Compatibility</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              Browse by Platform
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Filter and explore games designated for your preferred PC launchers and digital DRM clients.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Category identifiers only • No official affiliation</span>
          </div>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformClick(platform.id)}
              className="group flex flex-col items-start p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-850/80 transition-all duration-300 hover:-translate-y-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 transition-all mb-4">
                {getIcon(platform.iconName)}
              </div>

              <div className="flex items-center justify-between w-full mb-1">
                <h3 className="font-bold text-base text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {platform.name}
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1">
                {platform.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/60 w-full flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Filter Catalog</span>
                <span className="text-cyan-400 group-hover:underline">Explore &rarr;</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
