import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mail,
  Phone,
  Eye,
  Copy,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { enquiryService } from '../../services/enquiryService';
import { Enquiry, EnquiryStatus } from '../../types/enquiry';
import { PlatformId } from '../../types/game';
import { PlatformBadge } from '../../components/common/Badge';
import { EnquiryDetailModal } from '../../components/admin/EnquiryDetailModal';

const STATUS_OPTIONS: EnquiryStatus[] = ['NEW', 'CONTACTED', 'COMPLETED', 'CANCELLED'];
const ITEMS_PER_PAGE = 15;

export const AdminEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Load enquiries from service
  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const items = await enquiryService.getAllEnquiries();
      setEnquiries(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  // Filtered list based on search and status
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesRef = item.referenceNumber.toLowerCase().includes(query);
        const matchesName = item.customerName.toLowerCase().includes(query);
        const matchesGame = item.gameTitle.toLowerCase().includes(query);
        const matchesContact = item.contactValue.toLowerCase().includes(query);
        return matchesRef || matchesName || matchesGame || matchesContact;
      }
      return true;
    });
  }, [enquiries, statusFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE) || 1;
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEnquiries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEnquiries, currentPage]);

  // Status counts for badge counters
  const counts = useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter((e) => e.status === 'NEW').length;
    const contactedCount = enquiries.filter((e) => e.status === 'CONTACTED').length;
    const completedCount = enquiries.filter((e) => e.status === 'COMPLETED').length;
    const cancelledCount = enquiries.filter((e) => e.status === 'CANCELLED').length;
    return { total, newCount, contactedCount, completedCount, cancelledCount };
  }, [enquiries]);

  // Handle status update
  const handleStatusChange = async (id: string, newStatus: EnquiryStatus) => {
    await enquiryService.updateEnquiryStatus(id, newStatus);
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Handle notes update
  const handleNotesChange = async (id: string, notes: string) => {
    await enquiryService.updateEnquiryNotes(id, notes);
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, adminNotes: notes } : e))
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, adminNotes: notes } : null));
    }
  };

  const handleCopy = (refNumber: string) => {
    navigator.clipboard.writeText(refNumber);
    setCopiedRef(refNumber);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Customer Enquiries & Bookings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review and manage manual booking requests submitted through the GameVault storefront.
            </p>
          </div>

          <button
            onClick={loadEnquiries}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Total */}
          <div
            onClick={() => {
              setStatusFilter('ALL');
              setCurrentPage(1);
            }}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono text-slate-400 uppercase">All Requests</div>
            <div className="text-xl sm:text-2xl font-extrabold text-white font-display mt-0.5">
              {counts.total}
            </div>
          </div>

          {/* NEW */}
          <div
            onClick={() => {
              setStatusFilter('NEW');
              setCurrentPage(1);
            }}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'NEW'
                ? 'bg-cyan-500/15 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>NEW</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-cyan-300 font-display mt-0.5">
              {counts.newCount}
            </div>
          </div>

          {/* CONTACTED */}
          <div
            onClick={() => {
              setStatusFilter('CONTACTED');
              setCurrentPage(1);
            }}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'CONTACTED'
                ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>CONTACTED</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-300 font-display mt-0.5">
              {counts.contactedCount}
            </div>
          </div>

          {/* COMPLETED */}
          <div
            onClick={() => {
              setStatusFilter('COMPLETED');
              setCurrentPage(1);
            }}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>COMPLETED</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-300 font-display mt-0.5">
              {counts.completedCount}
            </div>
          </div>

          {/* CANCELLED */}
          <div
            onClick={() => {
              setStatusFilter('CANCELLED');
              setCurrentPage(1);
            }}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'CANCELLED'
                ? 'bg-rose-500/15 border-rose-500/50 shadow-md shadow-rose-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-mono text-rose-400 uppercase font-bold">CANCELLED</div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-300 font-display mt-0.5">
              {counts.cancelledCount}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-[#0e1320] border border-white/[0.08] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ref code (GV-...), customer name, game, or contact..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
            >
              <option value="ALL">All Statuses ({counts.total})</option>
              <option value="NEW">NEW ({counts.newCount})</option>
              <option value="CONTACTED">CONTACTED ({counts.contactedCount})</option>
              <option value="COMPLETED">COMPLETED ({counts.completedCount})</option>
              <option value="CANCELLED">CANCELLED ({counts.cancelledCount})</option>
            </select>
          </div>
        </div>

        {/* Enquiries Table */}
        <div className="rounded-2xl bg-[#0e1320] border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Game & Platform</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="font-semibold text-slate-300">No enquiries found</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {searchQuery || statusFilter !== 'ALL'
                          ? 'Try adjusting your search query or status filter.'
                          : 'Customer booking requests submitted on the storefront will appear here.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedEnquiries.map((item) => {
                    const isCopied = copiedRef === item.referenceNumber;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                        onClick={() => setSelectedEnquiry(item)}
                      >
                        {/* Reference */}
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                              {item.referenceNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.referenceNumber)}
                              className="p-1 text-slate-400 hover:text-white rounded bg-slate-800/80 hover:bg-slate-700"
                              title="Copy reference code"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Game & Platform */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-100">{item.gameTitle}</div>
                          <div className="mt-1">
                            <PlatformBadge platform={item.platform as PlatformId} />
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{item.customerName}</span>
                            {item.adminNotes && (
                              <span
                                className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60"
                                title="Has administrator follow-up notes"
                              >
                                <FileText className="w-2.5 h-2.5" />
                                <span>NOTES</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 capitalize">
                            {item.contactMethod === 'whatsapp' && (
                              <MessageSquare className="w-3 h-3 text-emerald-400 shrink-0" />
                            )}
                            {item.contactMethod === 'email' && (
                              <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                            )}
                            {item.contactMethod === 'phone' && (
                              <Phone className="w-3 h-3 text-purple-400 shrink-0" />
                            )}
                            <span>via {item.contactMethod}</span>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="py-3 px-4 font-mono text-cyan-300">
                          {item.contactValue}
                        </td>

                        {/* Submitted */}
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString()}{' '}
                          <span className="text-slate-500">
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        {/* Status (with quick switcher) */}
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleStatusChange(item.id, e.target.value as EnquiryStatus)
                              }
                              className={`appearance-none text-[10px] font-mono font-bold py-1 pl-2.5 pr-6 rounded-lg border cursor-pointer focus:outline-none transition-colors ${
                                item.status === 'NEW'
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : item.status === 'CONTACTED'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : item.status === 'COMPLETED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              }`}
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                  className="bg-slate-900 text-slate-200"
                                >
                                  {status}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedEnquiry(item)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 ml-auto cursor-pointer"
                            title="Inspect full details"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {paginatedEnquiries.length} of {filteredEnquiries.length} filtered ({enquiries.length} total)
            </span>
            <span className="font-mono text-[11px]">
              Fulfillment: Manual Outside Website
            </span>
          </div>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400 font-mono">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-cyan-400">
                {currentPage}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Inspector */}
        <EnquiryDetailModal
          isOpen={selectedEnquiry !== null}
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onStatusChange={handleStatusChange}
          onNotesChange={handleNotesChange}
        />
      </div>
    </AdminLayout>
  );
};
