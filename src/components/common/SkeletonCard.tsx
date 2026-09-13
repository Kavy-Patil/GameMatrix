import React from 'react';

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div
      className={`flex flex-col rounded-2xl bg-[#0f1422]/90 border border-white/[0.06] overflow-hidden animate-pulse ${className}`}
      aria-hidden="true"
    >
      {/* Artwork Banner Skeleton */}
      <div className="relative aspect-[16/10] w-full bg-slate-800/60">
        <div className="absolute top-3 left-3 w-20 h-5 rounded-md bg-slate-700/60" />
        <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-slate-700/60" />
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
          <div className="w-14 h-4 rounded-md bg-slate-700/70" />
          <div className="w-12 h-4 rounded-md bg-slate-700/70" />
        </div>
      </div>

      {/* Content Body Skeleton */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Title Bar */}
        <div className="w-3/4 h-5 rounded-md bg-slate-700/70 mb-2" />
        
        {/* Description Lines */}
        <div className="space-y-1.5 flex-1">
          <div className="w-full h-3.5 rounded bg-slate-800/80" />
          <div className="w-5/6 h-3.5 rounded bg-slate-800/60" />
        </div>

        {/* Action Row */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="w-20 h-4 rounded bg-slate-800/80" />
          <div className="w-28 h-7 rounded-lg bg-slate-800/80" />
        </div>
      </div>
    </div>
  );
};
