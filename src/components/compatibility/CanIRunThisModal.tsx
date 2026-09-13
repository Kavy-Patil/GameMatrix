import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Monitor,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Edit3,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Game } from '../../types/game';
import {
  DetectedHardware,
  UserHardwareProfile,
  CompatibilityEvaluation,
  HardwareScanStep,
} from '../../types/compatibility';
import { hardwareDetectionService } from '../../services/hardwareDetectionService';
import { compatibilityService } from '../../services/compatibilityService';
import { sanitizeInput } from '../../utils/security';

interface CanIRunThisModalProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

export const CanIRunThisModal: React.FC<CanIRunThisModalProps> = ({
  game,
  isOpen,
  onClose,
}) => {
  const [scanning, setScanning] = useState(false);
  const [scanSteps, setScanSteps] = useState<HardwareScanStep[]>([]);
  const [profile, setProfile] = useState<UserHardwareProfile>({
    detected: { deviceMemoryApproximated: false },
  });
  const [evaluation, setEvaluation] = useState<CompatibilityEvaluation | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual inputs
  const [manualCpu, setManualCpu] = useState('');
  const [manualGpu, setManualGpu] = useState('');
  const [manualRam, setManualRam] = useState('');
  const [manualStorage, setManualStorage] = useState('');

  // Reset state when opening/closing or changing games
  useEffect(() => {
    if (!isOpen) {
      setScanning(false);
      setScanSteps([]);
      setEvaluation(null);
      setHasScanned(false);
      setShowManualForm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScan = async () => {
    setScanning(true);
    setScanSteps([]);

    try {
      const detected = await hardwareDetectionService.scanHardware((step) => {
        setScanSteps((prev) => {
          const index = prev.findIndex((s) => s.id === step.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = step;
            return updated;
          }
          return [...prev, step];
        });
      });

      const newProfile: UserHardwareProfile = {
        detected,
        manualCpu: manualCpu ? sanitizeInput(manualCpu) : undefined,
        manualGpu: manualGpu ? sanitizeInput(manualGpu) : undefined,
        manualRamGb: manualRam ? parseFloat(manualRam) : undefined,
        manualStorageGb: manualStorage ? parseFloat(manualStorage) : undefined,
      };

      setProfile(newProfile);
      const evalResult = compatibilityService.evaluateCompatibility(
        game.systemRequirements,
        newProfile
      );
      setEvaluation(evalResult);
      setHasScanned(true);
    } finally {
      setScanning(false);
    }
  };

  const handleApplyManualSpecs = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserHardwareProfile = {
      ...profile,
      manualCpu: manualCpu ? sanitizeInput(manualCpu) : undefined,
      manualGpu: manualGpu ? sanitizeInput(manualGpu) : undefined,
      manualRamGb: manualRam && !isNaN(parseFloat(manualRam)) ? parseFloat(manualRam) : undefined,
      manualStorageGb: manualStorage && !isNaN(parseFloat(manualStorage)) ? parseFloat(manualStorage) : undefined,
    };

    setProfile(updatedProfile);
    const evalResult = compatibilityService.evaluateCompatibility(
      game.systemRequirements,
      updatedProfile
    );
    setEvaluation(evalResult);
    setShowManualForm(false);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'meets':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Meets</span>
          </span>
        );
      case 'below_recommended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Below Recommended</span>
          </span>
        );
      case 'below_minimum':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Below Minimum</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Unknown</span>
          </span>
        );
    }
  };

  const renderOutcomeBanner = () => {
    if (!evaluation) return null;

    let bannerStyle = '';
    let icon = null;

    switch (evaluation.overallOutcome) {
      case 'SHOULD_RUN':
        bannerStyle = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200';
        icon = <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />;
        break;
      case 'MAY_REQUIRE_LOWER_SETTINGS':
        bannerStyle = 'bg-amber-950/40 border-amber-500/40 text-amber-200';
        icon = <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />;
        break;
      case 'DOES_NOT_MEET':
        bannerStyle = 'bg-rose-950/40 border-rose-500/40 text-rose-200';
        icon = <XCircle className="w-6 h-6 text-rose-400 shrink-0" />;
        break;
      default:
        bannerStyle = 'bg-slate-900 border-slate-700 text-slate-300';
        icon = <HelpCircle className="w-6 h-6 text-slate-400 shrink-0" />;
        break;
    }

    return (
      <div className={`p-4 sm:p-5 rounded-2xl border ${bannerStyle} space-y-2`}>
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-75 block">
              Compatibility Outcome
            </span>
            <h3 className="text-base sm:text-lg font-black tracking-wide uppercase font-display">
              {evaluation.headline}
            </h3>
          </div>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
          {evaluation.summary}
        </p>
        {evaluation.details.length > 0 && (
          <ul className="pt-2 border-t border-white/[0.08] space-y-1 text-xs text-slate-300/90 list-disc list-inside">
            {evaluation.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0d121f] border border-white/[0.12] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="can-i-run-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 id="can-i-run-title" className="text-lg sm:text-xl font-bold text-white font-display">
                CAN I RUN THIS?
              </h2>
              <p className="text-xs text-slate-400">
                Check your PC against <span className="text-cyan-300 font-semibold">{game.title}</span>&apos;s published system requirements.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-300">
          {/* Action Header / Scan CTA */}
          {!hasScanned ? (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 text-center space-y-4">
              <Monitor className="w-10 h-10 text-cyan-400 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-white font-display">
                  Local Browser Hardware Scan
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We will check genuine browser-supported metrics like logical CPU cores, approximate memory, and graphics API capability.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleScan}
                  disabled={scanning}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {scanning ? 'Scanning PC...' : 'SCAN MY PC'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Hardware Scan Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualForm(!showManualForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{showManualForm ? 'Hide Manual Inputs' : 'Edit / Enter Specs'}</span>
                  {showManualForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleScan}
                  disabled={scanning}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Rescan PC"
                >
                  <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* Real Scan Steps Progress */}
          {scanning && scanSteps.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase text-cyan-400 tracking-wider block font-bold">
                Active Hardware Checks:
              </span>
              {scanSteps.map((step) => (
                <div key={step.id} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : step.status === 'skipped' ? (
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    )}
                    <span>{step.label}</span>
                  </div>
                  {step.detail && <span className="text-slate-400 text-[11px]">{step.detail}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Outcome Banner */}
          {hasScanned && renderOutcomeBanner()}

          {/* Manual Hardware Overrides Panel */}
          {showManualForm && (
            <form
              onSubmit={handleApplyManualSpecs}
              className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Manual Hardware Specification</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Optional</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If the browser could not detect your exact CPU, dedicated GPU, or full physical RAM, you can enter your components below:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
                    CPU Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Intel Core i5-12400F or Ryzen 5 5600"
                    value={manualCpu}
                    onChange={(e) => setManualCpu(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
                    Graphics Card (GPU)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NVIDIA RTX 3060 or AMD RX 6700 XT"
                    value={manualGpu}
                    onChange={(e) => setManualGpu(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
                    Installed RAM (GB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="128"
                    placeholder="e.g. 16 or 32"
                    value={manualRam}
                    onChange={(e) => setManualRam(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
                    Free Storage Space (GB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4000"
                    placeholder="e.g. 100 or 500"
                    value={manualStorage}
                    onChange={(e) => setManualStorage(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 cursor-pointer"
                >
                  Apply & Re-evaluate
                </button>
              </div>
            </form>
          )}

          {/* Detected Hardware Summary Grid */}
          {hasScanned && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Your PC Hardware Profile
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block mb-0.5 font-mono">CPU:</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {profile.manualCpu || (profile.detected.cpuCores ? `${profile.detected.cpuCores} Cores` : '— Not available')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block mb-0.5 font-mono">RAM:</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {profile.manualRamGb
                      ? `${profile.manualRamGb} GB`
                      : profile.detected.deviceMemoryGb
                      ? `Approx. ${profile.detected.deviceMemoryGb} GB`
                      : '— Not available'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block mb-0.5 font-mono">GPU:</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {profile.manualGpu || profile.detected.gpuRenderer || '— Not available'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block mb-0.5 font-mono">GPU VRAM:</span>
                  <span className="font-semibold text-slate-400 truncate block">
                    — Not available
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block mb-0.5 font-mono">CPU Cores:</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {profile.detected.cpuCores ? `${profile.detected.cpuCores} Cores` : '— Not available'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block mb-0.5 font-mono">Graphics API:</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {profile.detected.graphicsApi || 'Standard'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block mb-0.5 font-mono">Operating System:</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {profile.detected.os || 'Desktop OS'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 block mb-0.5 font-mono">Browser:</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {profile.detected.browser || 'Detected'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Requirement-by-Requirement Comparison Table */}
          {hasScanned && evaluation && evaluation.comparisons.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Component Comparison Breakdown
              </h4>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/70 font-mono text-[11px] text-slate-400 uppercase">
                      <th className="py-2.5 px-3.5">Component</th>
                      <th className="py-2.5 px-3.5">Your PC</th>
                      <th className="py-2.5 px-3.5">Minimum</th>
                      <th className="py-2.5 px-3.5">Recommended</th>
                      <th className="py-2.5 px-3.5 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {evaluation.comparisons.map((row) => (
                      <tr key={row.component} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-white font-mono">{row.component}</td>
                        <td className="py-2.5 px-3.5 text-slate-200">{row.userValue}</td>
                        <td className="py-2.5 px-3.5 text-slate-400">{row.minimumValue || '—'}</td>
                        <td className="py-2.5 px-3.5 text-slate-400">{row.recommendedValue || '—'}</td>
                        <td className="py-2.5 px-3.5 text-right">{renderStatusBadge(row.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards */}
              <div className="sm:hidden space-y-2.5">
                {evaluation.comparisons.map((row) => (
                  <div key={row.component} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">{row.component}</span>
                      {renderStatusBadge(row.status)}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <span className="text-slate-500 font-mono">Your PC: </span>
                      {row.userValue}
                    </div>
                    {(row.minimumValue || row.recommendedValue) && (
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <div>
                          <span className="text-slate-500 font-mono block">Min:</span>
                          {row.minimumValue || '—'}
                        </div>
                        <div>
                          <span className="text-slate-500 font-mono block">Rec:</span>
                          {row.recommendedValue || '—'}
                        </div>
                      </div>
                    )}
                    {row.notes && (
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        {row.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy & Browser Limitation Notice */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2 text-[11px] text-slate-400 leading-relaxed">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Privacy & Browser Architecture</span>
            </div>
            <p>
              Browser hardware detection is limited by browser privacy and anti-fingerprinting controls. Exact CPU model, dedicated VRAM, and physical storage capacity cannot be read by any web page without external software. Results are estimates based on available browser metrics and published publisher requirements.
            </p>
            <p className="text-slate-400/80">
              <strong className="text-slate-300">Privacy Guarantee:</strong> All hardware analysis runs locally in your browser. GameVault never transmits or persists your PC hardware specifications to Supabase or third-party servers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Estimates only. GameVault never guarantees FPS or performance.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
