import { Game, SystemRequirements, SystemSpec } from '../types/game';

export interface SystemRequirementsHealth {
  total: number;
  withRequirements: number;
  partial: number;
  withoutRequirements: number;
  minimumComplete: number;
  recommendedComplete: number;
  coveragePercentage: number;
  fieldCoverage: {
    minCpu: number;
    minGpu: number;
    minRam: number;
    minStorage: number;
    minOs: number;
    recCpu: number;
    recGpu: number;
    recRam: number;
    recStorage: number;
    recOs: number;
  };
}

export type RequirementsStatus = 'COMPLETE' | 'PARTIAL' | 'MISSING';

/**
 * Check if a specific specification object has all essential core fields populated.
 * Core fields: OS, CPU (processor), RAM (memory), GPU (graphics), Storage.
 */
export function isSpecComplete(spec?: SystemSpec): boolean {
  if (!spec) return false;
  return Boolean(
    spec.os && spec.os.trim() !== '' &&
    spec.processor && spec.processor.trim() !== '' &&
    spec.memory && spec.memory.trim() !== '' &&
    spec.graphics && spec.graphics.trim() !== '' &&
    spec.storage && spec.storage.trim() !== ''
  );
}

/**
 * Check if a specification has any field populated.
 */
export function hasAnyField(spec?: SystemSpec): boolean {
  if (!spec) return false;
  return Object.values(spec).some((val) => typeof val === 'string' && val.trim() !== '');
}

/**
 * Determines the requirements status of a game.
 * - COMPLETE: Has complete minimum requirements (and recommended if present)
 * - PARTIAL: Has at least one field populated, but missing core fields
 * - MISSING: No requirements populated whatsoever
 */
export function getGameRequirementsStatus(game: Game): RequirementsStatus {
  const reqs = game.systemRequirements;
  if (!reqs) return 'MISSING';

  const hasMin = hasAnyField(reqs.minimum);
  const hasRec = hasAnyField(reqs.recommended);

  if (!hasMin && !hasRec) return 'MISSING';

  const minComp = isSpecComplete(reqs.minimum);
  const recComp = isSpecComplete(reqs.recommended);

  // If minimum is complete, and if recommended exists it's also complete
  if (minComp && (!hasRec || recComp)) {
    return 'COMPLETE';
  }

  return 'PARTIAL';
}

/**
 * Calculates real-time system requirements health across a given set of games.
 */
export function calculateSystemRequirementsHealth(games: Game[]): SystemRequirementsHealth {
  const total = games.length;
  let withRequirements = 0;
  let partial = 0;
  let withoutRequirements = 0;
  let minimumComplete = 0;
  let recommendedComplete = 0;

  const fieldCoverage = {
    minCpu: 0,
    minGpu: 0,
    minRam: 0,
    minStorage: 0,
    minOs: 0,
    recCpu: 0,
    recGpu: 0,
    recRam: 0,
    recStorage: 0,
    recOs: 0,
  };

  for (const game of games) {
    const status = getGameRequirementsStatus(game);
    const reqs = game.systemRequirements;
    const min = reqs?.minimum;
    const rec = reqs?.recommended;

    if (status === 'MISSING') {
      withoutRequirements++;
    } else {
      withRequirements++;
      if (status === 'PARTIAL') {
        partial++;
      }

      if (isSpecComplete(min)) minimumComplete++;
      if (isSpecComplete(rec)) recommendedComplete++;

      if (min?.processor?.trim()) fieldCoverage.minCpu++;
      if (min?.graphics?.trim()) fieldCoverage.minGpu++;
      if (min?.memory?.trim()) fieldCoverage.minRam++;
      if (min?.storage?.trim()) fieldCoverage.minStorage++;
      if (min?.os?.trim()) fieldCoverage.minOs++;

      if (rec?.processor?.trim()) fieldCoverage.recCpu++;
      if (rec?.graphics?.trim()) fieldCoverage.recGpu++;
      if (rec?.memory?.trim()) fieldCoverage.recRam++;
      if (rec?.storage?.trim()) fieldCoverage.recStorage++;
      if (rec?.os?.trim()) fieldCoverage.recOs++;
    }
  }

  const coveragePercentage = total > 0 ? Math.round((withRequirements / total) * 100) : 0;

  return {
    total,
    withRequirements,
    partial,
    withoutRequirements,
    minimumComplete,
    recommendedComplete,
    coveragePercentage,
    fieldCoverage,
  };
}
