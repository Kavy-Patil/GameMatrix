import React, { useState, useEffect, ImgHTMLAttributes } from 'react';
import { Gamepad2 } from 'lucide-react';
import { isValidArtworkUrl } from '../../utils/security';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  fallbackType?: 'cover' | 'hero' | 'screenshot';
  containerClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Game artwork',
  className = '',
  containerClassName = '',
  fallbackTitle,
  fallbackType = 'cover',
  ...props
}) => {
  const isSafeUrl = isValidArtworkUrl(src);
  const [hasError, setHasError] = useState(!src || !isSafeUrl);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    const safe = isValidArtworkUrl(src);
    setHasError(!src || !safe);
    setIsLoaded(false);
  }, [src]);

  // Polished GameVault Branded Fallback (No "Artwork Offline" text)
  if (hasError || !src) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0c101d] via-[#111728] to-[#090d16] border border-white/[0.08] p-4 text-center select-none ${
          containerClassName || className
        }`}
        aria-label={alt}
      >
        {/* Ambient background glows */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Subtle diagonal background mesh lines */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center gap-2 max-w-full">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950/40">
            <Gamepad2 className="w-5 h-5" />
          </div>

          {fallbackTitle ? (
            <span className="text-xs sm:text-sm font-extrabold text-slate-100 line-clamp-2 max-w-[92%] font-display tracking-tight text-center mt-1">
              {fallbackTitle}
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-300 font-display">
              GameVault Showcase
            </span>
          )}

          <span className="text-[9px] text-cyan-400/80 font-mono tracking-widest uppercase border border-cyan-500/20 px-2 py-0.5 rounded-full bg-cyan-950/30">
            Digital Edition
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Loading Shimmer Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
          <Gamepad2 className="w-6 h-6 text-slate-700 animate-pulse" />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
};

