import React, { useState } from 'react';
import { X, CheckCircle2, Clock, MessageSquare, Mail, Phone, ShieldCheck, Copy, Check } from 'lucide-react';
import { Enquiry, EnquiryStatus } from '../../types/enquiry';
import { getPlatformName } from '../../data/platforms';
import { PlatformId } from '../../types/game';

interface EnquiryDetailModalProps {
  isOpen: boolean;
  enquiry: Enquiry | null;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: EnquiryStatus) => void;
  onNotesChange?: (id: string, notes: string) => void;
}

const STATUS_COLORS: Record<EnquiryStatus, { bg: string; text: string; border: string }> = {
  NEW: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/40' },
  CONTACTED: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
  COMPLETED: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  CANCELLED: { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
};

const ALL_STATUSES: EnquiryStatus[] = ['NEW', 'CONTACTED', 'COMPLETED', 'CANCELLED'];

export const EnquiryDetailModal: React.FC<EnquiryDetailModalProps> = ({
  isOpen,
  enquiry,
  onClose,
  onStatusChange,
  onNotesChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(enquiry?.adminNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  React.useEffect(() => {
    if (enquiry) {
      setNotes(enquiry.adminNotes || '');
      setNotesSaved(false);
    }
  }, [enquiry]);

  if (!isOpen || !enquiry) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      if (onNotesChange) {
        onNotesChange(enquiry.id, notes);
      }
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    } finally {
      setSavingNotes(false);
    }
  };

  const statusStyle = STATUS_COLORS[enquiry.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-detail-modal-title"
    >
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0e1320] border border-white/[0.12] rounded-2xl shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                Customer Enquiry Record
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                {enquiry.status}
              </span>
            </div>
            <h2 id="enquiry-detail-modal-title" className="text-lg font-bold text-white font-display">
              Ref: {enquiry.referenceNumber}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-left text-xs">
          {/* Game & Platform Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-mono">Game Requested</span>
              <span className="font-bold text-white text-sm">{enquiry.gameTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-mono">Platform</span>
              <span className="font-semibold text-cyan-400">
                {getPlatformName(enquiry.platform as PlatformId)}
              </span>
            </div>
          </div>

          {/* Customer & Contact Channel */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-mono">Customer Name</span>
              <span className="font-semibold text-slate-100">{enquiry.customerName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-mono">Preferred Channel</span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-200 capitalize">
                {enquiry.contactMethod === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                {enquiry.contactMethod === 'email' && <Mail className="w-3.5 h-3.5 text-cyan-400" />}
                {enquiry.contactMethod === 'phone' && <Phone className="w-3.5 h-3.5 text-purple-400" />}
                <span>{enquiry.contactMethod}</span>
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-mono">Contact Info</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-cyan-300">{enquiry.contactValue}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(enquiry.contactValue)}
                  className="p-1 text-slate-400 hover:text-white rounded bg-slate-800"
                  title="Copy contact details"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Customer Message */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block">
              Customer Message / Special Instructions
            </span>
            <p className="text-slate-200 leading-relaxed italic">
              {enquiry.message ? `"${enquiry.message}"` : 'No additional message provided.'}
            </p>
          </div>

          {/* Admin Notes Section */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-mono text-[10px] uppercase font-bold">
                Administrator Internal Notes & Follow-up Log
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {notes.length} / 1000
              </span>
            </div>
            <textarea
              rows={3}
              value={notes}
              maxLength={1000}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record manual call dates, follow-up status, customer preferences..."
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-sans"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500 font-mono">
                Internal only • Zero customer or payment secrets
              </span>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {notesSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Save Notes</span>
                )}
              </button>
            </div>
          </div>

          {/* Submission Timestamp */}
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono px-1">
            <span>Date Submitted:</span>
            <span>{new Date(enquiry.createdAt).toLocaleString()}</span>
          </div>

          {/* Status Workflow Controls */}
          <div className="pt-3 border-t border-slate-800">
            <span className="block text-slate-300 font-mono font-bold uppercase text-[10px] mb-2">
              Update Workflow Status
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_STATUSES.map((status) => {
                const isCurrent = enquiry.status === status;
                const style = STATUS_COLORS[status];
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatusChange(enquiry.id, status)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      isCurrent
                        ? `${style.bg} ${style.text} ${style.border} shadow-md`
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zero payment credentials stored</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
