import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, HelpCircle } from 'lucide-react';
import { Game, PlatformId } from '../../types/game';
import { EnquirySubmissionResult } from '../../types/enquiry';
import { EnquiryForm } from './EnquiryForm';
import { EnquirySuccess } from './EnquirySuccess';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { artworkService } from '../../services/artworkService';
import { getPlatformName } from '../../data/platforms';

interface EnquiryModalProps {
  isOpen: boolean;
  game: Game | null;
  defaultPlatform?: string;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  game,
  defaultPlatform,
  onClose,
  triggerRef,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [submissionResult, setSubmissionResult] = useState<EnquirySubmissionResult | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync default platform when game or defaultPlatform changes
  useEffect(() => {
    if (game) {
      setSelectedPlatform(defaultPlatform || game.platform || (game.platforms && game.platforms[0]) || 'steam');
      setSubmissionResult(null);
    }
  }, [game, defaultPlatform, isOpen]);

  // Focus management & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore focus on close
    const prevActiveElement = (triggerRef?.current || document.activeElement) as HTMLElement;

    // Lock body scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // Focus modal
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Trap focus inside modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
      prevActiveElement?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || !game) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Box */}
      <div
        ref={modalRef}
        className="relative w-full sm:max-w-lg bg-[#0d121f] border border-white/[0.12] sm:rounded-2xl rounded-t-2xl shadow-2xl shadow-black/80 z-10 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/90 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="enquiry-modal-title" className="text-base sm:text-lg font-bold text-white font-display">
                BOOK / ENQUIRE
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Manual Verification & Direct Delivery
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
            aria-label="Close enquiry modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {!submissionResult ? (
            <>
              {/* Selected Game Card Header */}
              <div className="flex gap-3.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <ImageWithFallback
                  src={artworkService.getCoverUrl(game)}
                  alt={game.title}
                  fallbackTitle={game.title}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    Selected Title
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                    {game.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>Platform:</span>
                    <span className="font-semibold text-slate-200">
                      {getPlatformName((selectedPlatform || game.platform) as PlatformId)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enquiry Form */}
              <EnquiryForm
                game={game}
                platform={selectedPlatform}
                onPlatformChange={setSelectedPlatform}
                onSubmitSuccess={(result) => setSubmissionResult(result)}
              />
            </>
          ) : (
            /* Success Screen */
            <EnquirySuccess
              game={game}
              platform={selectedPlatform}
              referenceNumber={submissionResult.referenceNumber || 'GV-UNKNOWN'}
              onDone={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};
