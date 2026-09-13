import React from 'react';
import { PromoBadge, PlatformId, GenreId, GameStatus } from '../../types/game';
import { getPlatformName } from '../../data/platforms';
import { getGenreName } from '../../data/genres';

interface PromoBadgeProps {
  type: PromoBadge;
  className?: string;
}

export const PromoBadgeComponent: React.FC<PromoBadgeProps> = ({ type, className = '' }) => {
  const styles: Record<PromoBadge, string> = {
    'LIMITED OFFER': 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10',
    'POPULAR': 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/10',
    'BESTSELLER': 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10',
    'NEW': 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10',
    'FEATURED': 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase border ${styles[type]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {type}
    </span>
  );
};

interface PlatformBadgeProps {
  platform: PlatformId | string;
  className?: string;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform, className = '' }) => {
  const displayName = getPlatformName(platform.toLowerCase() as PlatformId);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700/70 shadow-sm ${className}`}
    >
      {displayName}
    </span>
  );
};

interface GenreBadgeProps {
  genre: GenreId | string;
  className?: string;
}

export const GenreBadge: React.FC<GenreBadgeProps> = ({ genre, className = '' }) => {
  const displayName = getGenreName(genre.toLowerCase() as GenreId);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-950/50 text-cyan-300/90 border border-cyan-800/40 shadow-sm ${className}`}
    >
      {displayName}
    </span>
  );
};

interface StatusBadgeProps {
  status: GameStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const styles: Record<GameStatus, string> = {
    'Available': 'bg-emerald-950/50 text-emerald-300 border-emerald-700/40',
    'Pre-Order': 'bg-blue-950/50 text-blue-300 border-blue-700/40',
    'Early Access': 'bg-amber-950/50 text-amber-300 border-amber-700/40',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]} ${className}`}
    >
      {status}
    </span>
  );
};
