import React from 'react';
import { CheckCircle2, Copy, Check, MessageSquare, Shield, Clock } from 'lucide-react';
import { Game, PlatformId } from '../../types/game';
import { getPlatformName } from '../../data/platforms';
import { contactConfig } from '../../config/contact';

interface EnquirySuccessProps {
  game: Game;
  platform: string;
  referenceNumber: string;
  onDone: () => void;
}

export const EnquirySuccess: React.FC<EnquirySuccessProps> = ({
  game,
  platform,
  referenceNumber,
  onDone,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyReference = () => {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-center space-y-6 py-2">
      {/* Icon Badge */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/40 text-cyan-400 shadow-xl shadow-cyan-950/40 animate-in zoom-in-95 duration-300">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      {/* Main Title */}
      <div>
        <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono uppercase tracking-widest font-bold mb-2">
          Request Submitted
        </div>
        <h3 className="text-2xl font-extrabold text-white font-display">
          ENQUIRY RECEIVED
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          Thank you. We've received your enquiry. We'll contact you to confirm the request and discuss the next steps.
        </p>
      </div>

      {/* Details Box */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">Game</span>
          <span className="text-xs font-bold text-slate-200 text-right truncate max-w-[200px]">
            {game.title}
          </span>
        </div>

        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">Platform</span>
          <span className="text-xs font-semibold text-cyan-400">
            {getPlatformName(platform as PlatformId)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">Reference</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              {referenceNumber}
            </span>
            <button
              type="button"
              onClick={handleCopyReference}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              title="Copy reference code"
              aria-label="Copy reference code"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Process Clarification Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-left space-y-2">
        <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Payment and final confirmation are handled manually.</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          This is an enquiry submission, not an automated charge or completed purchase. Our support desk will reach out via your preferred contact channel during business hours ({contactConfig.businessHours}).
        </p>
      </div>

      {/* Done Action Button */}
      <button
        type="button"
        onClick={onDone}
        className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
      >
        DONE
      </button>
    </div>
  );
};
