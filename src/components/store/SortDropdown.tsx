import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { SortOption } from '../../types/game';

interface SortDropdownProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="sort-select" className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1.5">
        <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">Sort by:</span>
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        aria-label="Sort games"
        className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700/80 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
      >
        <option value="featured">Featured</option>
        <option value="popular">Most Popular</option>
        <option value="newest">Newest Releases</option>
        <option value="alphabetical">Title (A - Z)</option>
      </select>
    </div>
  );
};
