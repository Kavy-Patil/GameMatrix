import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  User,
  Database,
  Info,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { auditService, AuditLogRecord, AuditActionType } from '../../services/auditService';

const ACTION_OPTIONS: AuditActionType[] = [
  'GAME_CREATE',
  'GAME_UPDATE',
  'GAME_DELETE',
  'ENQUIRY_STATUS_CHANGE',
  'ENQUIRY_NOTE_UPDATE',
  'CATALOG_BULK_IMPORT',
  'CATALOG_EXPORT',
  'ARTWORK_UPDATE',
];

const ITEMS_PER_PAGE = 15;

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await auditService.getAuditLogs({
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        action: actionFilter,
        entityType: entityFilter,
        search: searchQuery,
      });
      setLogs(result.logs);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [currentPage, actionFilter, entityFilter, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'GAME_CREATE':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'GAME_UPDATE':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'GAME_DELETE':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'CATALOG_BULK_IMPORT':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'CATALOG_EXPORT':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'ARTWORK_UPDATE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'ENQUIRY_STATUS_CHANGE':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      case 'ENQUIRY_NOTE_UPDATE':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left">
        {/* Top Title & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Administrator Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Cryptographically timestamped and immutable log of administrative catalog mutations and enquiry updates.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Security & Immutability Notice */}
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3 text-xs text-purple-200">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-purple-300 block mb-0.5 font-mono">
              TAMPER-RESISTANT AUDIT RECORD
            </strong>
            Historical audit records are protected by database trigger{' '}
            <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300 font-mono">
              trg_prevent_audit_log_modification
            </code>
            . Audit logs cannot be updated or erased by any user, guaranteeing an authoritative historical trail.
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by entity ID or action..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Actions ({total})</option>
              {ACTION_OPTIONS.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>

            {/* Entity Filter */}
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Entities</option>
              <option value="game">Game</option>
              <option value="enquiry">Enquiry</option>
              <option value="catalog">Catalog</option>
              <option value="artwork">Artwork</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Entity Reference</th>
                  <th className="py-3 px-4">Admin Actor</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                      <span>Loading audit records...</span>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <span>No audit activity found matching current criteria.</span>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 capitalize text-slate-300">
                        {log.entityType}
                      </td>

                      <td className="py-3 px-4 text-cyan-300 font-bold max-w-xs truncate">
                        {log.entityId}
                      </td>

                      <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{log.adminUserId ? log.adminUserId.slice(0, 8) + '...' : 'System'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Inspect full audit record"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {logs.length} of {total} audit records (Page {currentPage} of {totalPages})
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Audit Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="bg-[#0b0e17] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${getActionBadgeColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                  <span className="font-bold text-white text-sm">Audit Record Detail</span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Record ID:</span>
                  <span className="text-slate-200">{selectedLog.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-200">{selectedLog.createdAt}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Entity Type:</span>
                  <span className="text-slate-200 capitalize">{selectedLog.entityType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Entity ID:</span>
                  <span className="text-cyan-300">{selectedLog.entityId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Admin User ID:</span>
                  <span className="text-slate-200">{selectedLog.adminUserId || 'System'}</span>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 block mb-1.5 font-bold uppercase text-[10px]">
                    Mutation Payload & Details:
                  </span>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(selectedLog.details || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
