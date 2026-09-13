import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#06080d] text-slate-400 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 w-fit">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-xl font-extrabold tracking-tight font-display text-white">
                GAME<span className="text-cyan-400">VAULT</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The premier digital destination for PC gaming enthusiasts. Discover next-generation titles,
              track wishlists, and explore games across premier platform ecosystems in one unified catalog.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 cursor-pointer transition-colors" title="Discord">
                <span className="text-xs font-bold">DC</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 cursor-pointer transition-colors" title="X (Twitter)">
                <span className="text-xs font-bold">𝕏</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 cursor-pointer transition-colors" title="YouTube">
                <span className="text-xs font-bold">YT</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 cursor-pointer transition-colors" title="Twitch">
                <span className="text-xs font-bold">TW</span>
              </div>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-200 uppercase mb-4 font-mono">
              Catalog Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/store" className="hover:text-cyan-400 transition-colors">
                  Store Catalog
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-cyan-400 transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-cyan-400 transition-colors">
                  Campaign Highlights
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-cyan-400 transition-colors">
                  Support & FAQ
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <span>Admin Gateway</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">Secure</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-200 uppercase mb-4 font-mono">
              Policies & Information
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/support" className="hover:text-cyan-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-cyan-400 transition-colors">
                  Manual Booking Guide
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-cyan-400 transition-colors">
                  Platform Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Platform Status */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-200 uppercase mb-4 font-mono">
              Catalog Status
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-200">Catalog Online</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                805 Canonical PC titles indexed. Resilient dual-mode active.
              </p>
              <div className="mt-2 text-[10px] text-cyan-400/90 font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Zero-Price Manual Showcase</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs text-slate-400/80 leading-relaxed text-center md:text-left">
              <strong className="text-slate-300 font-medium">Platform Disclaimer:</strong> GameVault is an independent digital PC game catalog and manual booking showcase. It is not affiliated with, endorsed by, or sponsored by Valve Corporation (Steam), Epic Games, Rockstar Games, Electronic Arts, Ubisoft, CD PROJEKT RED, or any publisher. All game titles, trademarks, and logos are properties of their respective owners. Compatibility labels indicate launcher support only.
            </p>
          </div>
          <div className="text-xs text-slate-400 whitespace-nowrap font-mono">
            &copy; {new Date().getFullYear()} GameVault. Digital PC Game Catalog.
          </div>
        </div>
      </div>
    </footer>
  );
};
