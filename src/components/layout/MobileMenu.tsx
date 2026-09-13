import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, Search, Shield, Heart, ShoppingCart, User, ChevronRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { totalCount, setIsCartOpen } = useCart();
  const { wishlistIds, setIsWishlistOpen } = useWishlist();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/store?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      onClose();
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
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-extrabold text-lg text-white font-display">
                GAME<span className="text-cyan-400">VAULT</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar in Mobile */}
          <form onSubmit={handleSearch} className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </form>

          {/* Navigation Links */}
          <nav className="mt-6 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-800/40'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-800 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                setIsWishlistOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Wishlist ({wishlistIds.length})</span>
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/store');
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/25"
            >
              <Shield className="w-4 h-4" />
              <span>Store</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Direct Enquiry Mode</span>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wide px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
