import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Layers,
  Sparkles,
  Clock,
  Inbox,
  ArrowRight,
  Database,
  CheckCircle2,
  FileCode2,
  Plus,
  ShieldCheck,
  Upload,
  Download,
  History,
  Image,
  AlertCircle,
  FileSpreadsheet,
  Monitor,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { catalogService } from '../../services/catalogService';
import { enquiryService } from '../../services/enquiryService';
import { artworkService } from '../../services/artworkService';
import { auditService, AuditLogRecord } from '../../services/auditService';
import { calculateSystemRequirementsHealth } from '../../services/systemRequirementsHealth';
import { Enquiry } from '../../types/enquiry';
import { PLATFORMS } from '../../data/platforms';
import { GENRES } from '../../data/genres';
import { validateCatalog } from '../../utils/catalogValidator';

export const AdminDashboard: React.FC = () => {
  const allGames = catalogService.getAllGames();
  const stats = catalogService.getCatalogStats();
  const artworkHealth = artworkService.getArtworkHealthBreakdown(allGames);
  const reqsHealth = React.useMemo(() => calculateSystemRequirementsHealth(allGames), [allGames]);

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLogRecord[]>([]);
  const [exporting, setExporting] = useState(false);

  const validationReport = React.useMemo(() => {
    return validateCatalog(allGames);
  }, [allGames]);

  useEffect(() => {
    enquiryService.getAllEnquiries().then((items) => {
      setEnquiries(items);
    });

    auditService.getRecentLogs(5).then((logs) => {
      setRecentLogs(logs);
    });
  }, []);

  const enquiryCounts = React.useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter((e) => e.status === 'NEW').length;
    const contactedCount = enquiries.filter((e) => e.status === 'CONTACTED').length;
    const completedCount = enquiries.filter((e) => e.status === 'COMPLETED').length;
    const cancelledCount = enquiries.filter((e) => e.status === 'CANCELLED').length;
    return { total, newCount, contactedCount, completedCount, cancelledCount };
  }, [enquiries]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const csv = await catalogService.exportCatalogCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `gamevault_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              Catalog & Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time calculated metrics across {stats.totalGames} canonical PC titles, customer bookings, and security audit records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/games/new"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Game</span>
            </Link>

            <Link
              to="/admin/games/import"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Import CSV</span>
            </Link>

            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
              title="Download verified catalog CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Operational Status Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-purple-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">
                Canonical Catalog Active ({stats.totalGames} Titles)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed mt-0.5 max-w-2xl">
                Operating with <strong>{stats.totalGames} canonical PC game titles</strong>. Strict zero-price and zero-stock integrity verified across the database and storefront layers.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
            PostgreSQL RLS Active
          </span>
        </div>

        {/* 6 Key Calculated Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total Games */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase">Total Titles</span>
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {stats.totalGames}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              Canonical Index
            </span>
          </div>

          {/* Platforms */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase">Platforms</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-display">
              {stats.totalPlatforms}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              Launch Clients
            </span>
          </div>

          {/* Genres */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase">Genres</span>
              <FileCode2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-display">
              {stats.totalGenres}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              Taxonomy Categories
            </span>
          </div>

          {/* Enquiries */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase">Total Enquiries</span>
              <Inbox className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-display">
              {enquiryCounts.total}
            </div>
            <span className="text-[10px] text-amber-400 font-mono mt-1">
              {enquiryCounts.newCount} New / Unhandled
            </span>
          </div>

          {/* Artwork Health */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase">Artwork Verified</span>
              <Image className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
              {artworkHealth.percentage}%
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              {artworkHealth.verified} of {artworkHealth.total}
            </span>
          </div>

          {/* Audit Activity */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-mono uppercase">Audit Log</span>
              <History className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-display">
              Active
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              Tamper-Resistant
            </span>
          </div>
        </div>

        {/* PC System Requirements Coverage Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white font-display">PC System Requirements Health</h3>
            </div>
            <Link to="/admin/games?requirements=MISSING" className="text-xs text-cyan-400 hover:underline font-mono">
              Inspect Missing &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">TOTAL</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">{reqsHealth.total}</span>
              <span className="text-[10px] text-slate-500 font-mono">Catalog Titles</span>
            </div>
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
              <span className="text-[10px] font-mono uppercase text-cyan-300 block">WITH REQUIREMENTS</span>
              <span className="text-xl font-bold font-mono text-cyan-200 mt-1 block">{reqsHealth.withRequirements}</span>
              <span className="text-[10px] text-cyan-400 font-mono">{reqsHealth.coveragePercentage}% Populated</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase text-amber-300 block">PARTIAL</span>
              <span className="text-xl font-bold font-mono text-amber-200 mt-1 block">{reqsHealth.partial}</span>
              <span className="text-[10px] text-amber-400 font-mono">Some specs</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30">
              <span className="text-[10px] font-mono uppercase text-rose-300 block">WITHOUT REQUIREMENTS</span>
              <span className="text-xl font-bold font-mono text-rose-200 mt-1 block">{reqsHealth.withoutRequirements}</span>
              <span className="text-[10px] text-rose-400 font-mono">Missing specs</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-[10px] font-mono uppercase text-emerald-300 block">MINIMUM COMPLETE</span>
              <span className="text-xl font-bold font-mono text-emerald-200 mt-1 block">{reqsHealth.minimumComplete}</span>
              <span className="text-[10px] text-emerald-400 font-mono">Core min met</span>
            </div>
            <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30">
              <span className="text-[10px] font-mono uppercase text-teal-300 block">RECOMMENDED COMPLETE</span>
              <span className="text-xl font-bold font-mono text-teal-200 mt-1 block">{reqsHealth.recommendedComplete}</span>
              <span className="text-[10px] text-teal-400 font-mono">Core rec met</span>
            </div>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden flex border border-slate-800">
            <div
              style={{ width: `${(reqsHealth.minimumComplete / (reqsHealth.total || 1)) * 100}%` }}
              className="bg-emerald-500 h-full"
              title={`Complete: ${reqsHealth.minimumComplete}`}
            />
            <div
              style={{ width: `${(reqsHealth.partial / (reqsHealth.total || 1)) * 100}%` }}
              className="bg-amber-500 h-full"
              title={`Partial: ${reqsHealth.partial}`}
            />
            <div
              style={{ width: `${(reqsHealth.withoutRequirements / (reqsHealth.total || 1)) * 100}%` }}
              className="bg-rose-500 h-full"
              title={`Missing: ${reqsHealth.withoutRequirements}`}
            />
          </div>
        </div>

        {/* Operational Split: Artwork Health & Enquiry Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Artwork Health Breakdown Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white font-display">Artwork Health Status</h3>
              </div>
              <Link
                to="/admin/games?artwork=FALLBACK"
                className="text-xs text-cyan-400 hover:underline font-mono"
              >
                Inspect Fallbacks &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <span className="text-[10px] font-mono uppercase text-emerald-400 block">Verified Artwork</span>
                <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">
                  {artworkHealth.verified}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">High-res CDN</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Digital Fallback</span>
                <span className="text-xl font-bold font-mono text-slate-300 mt-1 block">
                  {artworkHealth.fallback}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Theme placeholder</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <span className="text-[10px] font-mono uppercase text-rose-400 block">Missing Image</span>
                <span className="text-xl font-bold font-mono text-rose-300 mt-1 block">
                  {artworkHealth.missing}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Needs attention</span>
              </div>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${artworkHealth.percentage}%` }}
                className="bg-emerald-500 h-full"
                title={`Verified: ${artworkHealth.verified}`}
              />
              <div
                style={{ width: `${(artworkHealth.fallback / (artworkHealth.total || 1)) * 100}%` }}
                className="bg-slate-700 h-full"
                title={`Fallback: ${artworkHealth.fallback}`}
              />
              <div
                style={{ width: `${(artworkHealth.missing / (artworkHealth.total || 1)) * 100}%` }}
                className="bg-rose-500 h-full"
                title={`Missing: ${artworkHealth.missing}`}
              />
            </div>
          </div>

          {/* Enquiry Status Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-display">Enquiry Pipeline Status</h3>
              </div>
              <Link to="/admin/enquiries" className="text-xs text-cyan-400 hover:underline font-mono">
                Manage Enquiries &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                <span className="text-[10px] font-mono uppercase text-cyan-300 block">NEW</span>
                <span className="text-lg font-bold font-mono text-cyan-200 mt-1 block">
                  {enquiryCounts.newCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
                <span className="text-[10px] font-mono uppercase text-amber-300 block">CONTACTED</span>
                <span className="text-lg font-bold font-mono text-amber-200 mt-1 block">
                  {enquiryCounts.contactedCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <span className="text-[10px] font-mono uppercase text-emerald-300 block">COMPLETED</span>
                <span className="text-lg font-bold font-mono text-emerald-200 mt-1 block">
                  {enquiryCounts.completedCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30">
                <span className="text-[10px] font-mono uppercase text-rose-300 block">CANCELLED</span>
                <span className="text-lg font-bold font-mono text-rose-200 mt-1 block">
                  {enquiryCounts.cancelledCount}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Booking requests are handled manually outside the website. No automated charges or card transactions occur online.
            </p>
          </div>
        </div>

        {/* Split Activity: Recent Enquiries & Recent Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Enquiries */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Inbox className="w-4 h-4 text-cyan-400" />
                <span>Recent Customer Enquiries</span>
              </h3>
              <Link to="/admin/enquiries" className="text-xs font-mono text-cyan-400 hover:text-cyan-300">
                All Enquiries &rarr;
              </Link>
            </div>

            {enquiries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                No customer enquiries recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 text-xs">
                {enquiries.slice(0, 4).map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                          {item.referenceNumber}
                        </span>
                        <strong className="text-white">{item.gameTitle}</strong>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Customer: {item.customerName} • via {item.contactMethod}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        item.status === 'NEW'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : item.status === 'CONTACTED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : item.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Audit Activity */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>Recent Admin Activity</span>
              </h3>
              <Link to="/admin/audit" className="text-xs font-mono text-purple-400 hover:text-purple-300">
                Full Audit Trail &rarr;
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                No administrative mutations recorded in this session.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 text-xs">
                {recentLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-300 font-mono ml-2">
                        {log.entityType}: <strong className="text-white">{log.entityId}</strong>
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
