import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Button } from '../common/Button';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { totalCount, setIsCartOpen } = useCart();
  const { wishlistIds, setIsWishlistOpen } = useWishlist();
  const [showAccountNotice, setShowAccountNotice] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/store?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/store' },
    { name: 'Categories', path: '/categories' },
    { name: 'Deals', path: '/deals' },
    { name: 'Support', path: '/support' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080a10]/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Logo & Wordmark */}
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1"
                aria-label="GameVault Home"
              >
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 shadow-inner group-hover:border-cyan-400 transition-colors">
                  <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm group-hover:bg-cyan-400/20 transition-colors" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    GAME<span className="text-cyan-400">VAULT</span>
                  </span>
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-cyan-500/80 -mt-1 font-mono">
                    PC Digital Catalog
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Middle: Quick Search Input (Desktop) */}
            <div className="hidden lg:flex flex-1 max-w-xs mx-8">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search 805 PC games..."
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-all"
                  aria-label="Quick search games"
                />
              </form>
            </div>

            {/* Right: Actions (Wishlist, Catalog Badge, Mobile toggle) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
                aria-label={`Wishlist (${wishlistIds.length} items)`}
                title="View Wishlist"
              >
                <Heart className="w-5 h-5 text-slate-300 hover:text-rose-400 transition-colors" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-full shadow-sm animate-in zoom-in">
                    {wishlistIds.length}
                  </span>
                )}
              </button>

              {/* Catalog Total Pill */}
              <Link
                to="/store"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 hover:bg-cyan-900/50 hover:border-cyan-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                title="Explore all 805 PC games in catalog"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>805 Games</span>
              </Link>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={onOpenMobileMenu}
                className="md:hidden p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
