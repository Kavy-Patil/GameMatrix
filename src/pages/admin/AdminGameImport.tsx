import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { catalogService } from '../../services/catalogService';
import { parseAndValidateCatalogCsv, CsvParseResult } from '../../utils/csv';
import { PlatformBadge, GenreBadge } from '../../components/common/Badge';

export const AdminGameImport: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState<{
    completed: boolean;
    inserted: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsing(true);
    setParseResult(null);
    setImportReport(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || '';
      try {
        const existing = catalogService.getAllGames();
        const result = parseAndValidateCatalogCsv(text, existing);
        setParseResult(result);
      } catch (err: any) {
        setParseResult({
          success: false,
          fatalError: err.message || 'Failed to parse CSV.',
          totalRows: 0,
          validGames: [],
          errors: [],
        });
      } finally {
        setParsing(false);
      }
    };
    reader.onerror = () => {
      setParseResult({
        success: false,
        fatalError: 'Error reading file.',
        totalRows: 0,
        validGames: [],
        errors: [],
      });
      setParsing(false);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!parseResult || parseResult.validGames.length === 0) return;

    setImporting(true);
    try {
      const res = await catalogService.bulkImportGames(parseResult.validGames);
      setImportReport({
        completed: true,
        inserted: res.inserted,
        errors: res.errors,
      });
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFileName('');
    setParseResult(null);
    setImportReport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/games')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Back to games catalog"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                Bulk Catalog Import (CSV)
              </h1>
              <p className="text-xs text-slate-400">
                Safely validate and batch-import official PC digital titles into the GameVault catalog.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3 text-xs text-cyan-200">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-cyan-300 block mb-0.5 font-mono">
              ZERO-PRICE & ZERO-STOCK ENFORCEMENT
            </strong>
            The import processor strictly rejects CSV files containing columns such as{' '}
            <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-300 font-mono">price</code>,{' '}
            <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-300 font-mono">stock</code>, or{' '}
            <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-300 font-mono">inventory</code>.
            Only canonical catalog metadata (title, platform, genre, developer, artwork) is accepted.
          </div>
        </div>

        {/* Upload Box */}
        {!importReport && (
          <div className="p-8 rounded-2xl bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-cyan-500/60 transition-all text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                {parsing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  {fileName ? fileName : 'Select a CSV file to inspect and import'}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Standard format: title, platform, genre, developer, publisher, description
                </span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 mt-2 cursor-pointer"
              >
                Choose File
              </button>
            </label>
          </div>
        )}

        {/* Fatal Error Notice */}
        {parseResult?.fatalError && (
          <div className="p-5 rounded-2xl bg-rose-950/50 border border-rose-500 flex items-start gap-3.5 text-rose-200">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block mb-1">IMPORT REJECTED</span>
              <p className="text-xs leading-relaxed">{parseResult.fatalError}</p>
              <button
                onClick={handleReset}
                className="mt-3 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-xs font-bold text-white border border-rose-600 transition-colors"
              >
                Select Another File
              </button>
            </div>
          </div>
        )}

        {/* Validation Results & Preview */}
        {parseResult && !parseResult.fatalError && !importReport && (
          <div className="space-y-6">
            {/* Status Metric Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-mono uppercase text-slate-400">Total Rows</span>
                <div className="text-2xl font-extrabold text-white font-display mt-0.5">
                  {parseResult.totalRows}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                <span className="text-[11px] font-mono uppercase text-emerald-400">Valid Records</span>
                <div className="text-2xl font-extrabold text-emerald-300 font-display mt-0.5 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>{parseResult.validGames.length}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40">
                <span className="text-[11px] font-mono uppercase text-rose-400">Invalid / Skipped</span>
                <div className="text-2xl font-extrabold text-rose-300 font-display mt-0.5 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <span>{parseResult.errors.length}</span>
                </div>
              </div>
            </div>

            {/* Error Table if any */}
            {parseResult.errors.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Validation Issues ({parseResult.errors.length})</span>
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
                  {parseResult.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 font-mono text-[11px]"
                    >
                      <div>
                        <span className="text-cyan-400">Row {err.rowNumber}:</span>{' '}
                        <strong className="text-white">{err.title}</strong> —{' '}
                        <span className="text-rose-300">{err.message}</span>
                      </div>
                      {err.field && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                          {err.field}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valid Games Preview */}
            {parseResult.validGames.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                    Ready to Import ({parseResult.validGames.length} Titles)
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReset}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleExecuteImport}
                      disabled={importing}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>
                        {importing
                          ? 'Importing...'
                          : `Confirm & Import ${parseResult.validGames.length} Games`}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                    {parseResult.validGames.map((game, idx) => (
                      <div
                        key={idx}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-slate-850/40"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-slate-500 text-[11px] w-6">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-white block truncate">{game.title}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Slug: {game.slug}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <PlatformBadge platform={game.platform} />
                          <GenreBadge genre={game.genre} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completion Report */}
        {importReport && (
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-emerald-500/40 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white font-display">Bulk Import Finished</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Successfully imported <strong>{importReport.inserted} digital PC game titles</strong> into the active catalog. All records have been recorded in the administrator audit log.
            </p>

            {importReport.errors.length > 0 && (
              <div className="max-w-lg mx-auto text-left p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-rose-300 font-mono max-h-32 overflow-y-auto">
                {importReport.errors.map((e, i) => (
                  <div key={i}>• {e}</div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Import Another File
              </button>
              <Link
                to="/admin/games"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
              >
                View Games Catalog
              </Link>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
