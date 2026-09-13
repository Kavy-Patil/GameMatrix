import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  Gamepad2,
  Inbox,
  ArrowLeft,
  Menu,
  X,
  Shield,
  Layers,
  Sparkles,
  LogOut,
  History,
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const stats = catalogService.getCatalogStats();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Games Catalog', path: '/admin/games', icon: Gamepad2, count: stats.totalGames },
    { name: 'Customer Enquiries', path: '/admin/enquiries', icon: Inbox },
    { name: 'Audit Trail', path: '/admin/audit', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Authenticated Admin Session Bar */}
      <aside aria-label="Administrator session status" className="bg-cyan-950/40 border-b border-cyan-500/20 px-4 py-2 text-xs text-cyan-200 flex items-center justify-between gap-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="leading-snug">
              <strong className="text-emerald-300">SECURE ADMIN SESSION:</strong> PostgreSQL Row Level Security (RLS) & Role-Based Authorization Active.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-400 hidden sm:inline">
              User: <strong className="text-cyan-300">{user?.email || 'admin@gamevault.com'}</strong>
            </span>
            <button
              onClick={() => signOut()}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Wrapper */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-white/[0.08] bg-[#0b0e17] p-5 shrink-0 justify-between">
          <div>
            {/* Admin Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
              <Link to="/admin" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-tight font-display text-white block">
                    GAME<span className="text-cyan-400">VAULT</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    Admin Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="space-y-1.5" aria-label="Admin Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar: Return to Storefront */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Public Storefront</span>
            </Link>
            <div className="text-[10px] text-slate-400 font-mono px-1">
              Active Catalog: {stats.totalGames} Titles (Canonical Index)
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-[41px] left-0 right-0 z-30 bg-[#0b0e17] border-b border-slate-800 p-4 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="font-extrabold text-sm font-display text-white">
              GAMEVAULT <span className="text-cyan-400 font-mono text-xs">ADMIN</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900"
            aria-label="Toggle admin menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm pt-28 px-6">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-sm font-bold text-slate-200 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-cyan-400" />
                    <span>{item.name}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono">
                      {item.count}
                    </span>
                  )}
                </Link>
              ))}
              <Link
                to="/"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 text-sm font-semibold text-slate-400 border border-slate-800 mt-4"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>Return to Public Store</span>
              </Link>
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-8 md:p-10 pt-20 md:pt-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
