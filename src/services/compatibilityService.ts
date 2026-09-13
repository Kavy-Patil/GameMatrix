import { SystemRequirements, SystemSpec } from '../types/game';
import {
  UserHardwareProfile,
  CompatibilityEvaluation,
  ComponentComparisonResult,
  ComponentStatus,
  CompatibilityOutcome,
} from '../types/compatibility';

/**
 * Curated reference database for GPU capability tiers.
 * Avoids alphabetical sorting and arbitrary guessing.
 * Tier 1: Legacy / Integrated
 * Tier 2: Low-end / Minimum for older titles
 * Tier 3: Mid-range 1080p (e.g. GTX 1060 / RX 580)
 * Tier 4: Modern Mainstream (e.g. RTX 2060 / RTX 3060 / RX 6600)
 * Tier 5: High Performance (e.g. RTX 3070 / RTX 4070 / RX 6800 XT)
 * Tier 6: Enthusiast Flagship (e.g. RTX 4080 / RTX 4090 / RX 7900 XTX)
 */
const GPU_TIER_DATABASE: Array<{ pattern: RegExp; tier: number; name: string }> = [
  // Tier 6: Enthusiast Flagship
  { pattern: /rtx\s*4090/i, tier: 6, name: 'RTX 4090' },
  { pattern: /rtx\s*4080/i, tier: 6, name: 'RTX 4080' },
  { pattern: /rtx\s*3090/i, tier: 6, name: 'RTX 3090' },
  { pattern: /rx\s*7900\s*(?:xtx|xt)/i, tier: 6, name: 'Radeon RX 7900' },

  // Tier 5: High Performance
  { pattern: /rtx\s*4070/i, tier: 5, name: 'RTX 4070' },
  { pattern: /rtx\s*3080/i, tier: 5, name: 'RTX 3080' },
  { pattern: /rtx\s*3070/i, tier: 5, name: 'RTX 3070' },
  { pattern: /rx\s*6800\s*(?:xt)?/i, tier: 5, name: 'Radeon RX 6800 XT' },
  { pattern: /rx\s*7800\s*(?:xt)?/i, tier: 5, name: 'Radeon RX 7800 XT' },

  // Tier 4: Modern Mainstream 1080p/1440p
  { pattern: /rtx\s*4060/i, tier: 4, name: 'RTX 4060' },
  { pattern: /rtx\s*3060\s*(?:ti)?/i, tier: 4, name: 'RTX 3060' },
  { pattern: /rtx\s*2070/i, tier: 4, name: 'RTX 2070' },
  { pattern: /rtx\s*2060/i, tier: 4, name: 'RTX 2060' },
  { pattern: /rx\s*6700\s*(?:xt)?/i, tier: 4, name: 'Radeon RX 6700 XT' },
  { pattern: /rx\s*6600\s*(?:xt)?/i, tier: 4, name: 'Radeon RX 6600' },

  // Tier 3: Mainstream 1080p Baseline
  { pattern: /gtx\s*1060/i, tier: 3, name: 'GTX 1060' },
  { pattern: /gtx\s*1660\s*(?:super|ti)?/i, tier: 3, name: 'GTX 1660' },
  { pattern: /gtx\s*1070/i, tier: 3, name: 'GTX 1070' },
  { pattern: /gtx\s*1080/i, tier: 3, name: 'GTX 1080' },
  { pattern: /rtx\s*3050/i, tier: 3, name: 'RTX 3050' },
  { pattern: /rx\s*580/i, tier: 3, name: 'Radeon RX 580' },
  { pattern: /rx\s*590/i, tier: 3, name: 'Radeon RX 590' },
  { pattern: /rx\s*5500\s*xt/i, tier: 3, name: 'Radeon RX 5500 XT' },

  // Tier 2: Minimum Entry 720p / 1080p Low
  { pattern: /gtx\s*1050\s*(?:ti)?/i, tier: 2, name: 'GTX 1050 Ti' },
  { pattern: /gtx\s*960/i, tier: 2, name: 'GTX 960' },
  { pattern: /gtx\s*970/i, tier: 2, name: 'GTX 970' },
  { pattern: /rx\s*570/i, tier: 2, name: 'Radeon RX 570' },
  { pattern: /rx\s*470/i, tier: 2, name: 'Radeon RX 470' },
  { pattern: /rx\s*460/i, tier: 2, name: 'Radeon RX 460' },
  { pattern: /gtx\s*750\s*(?:ti)?/i, tier: 2, name: 'GTX 750 Ti' },

  // Tier 1: Integrated / Low-profile
  { pattern: /intel.*(?:uhd|iris|hd\s*graphics)/i, tier: 1, name: 'Intel Integrated Graphics' },
  { pattern: /vega\s*(?:3|6|7|8|11)/i, tier: 1, name: 'AMD Radeon Vega Integrated' },
  { pattern: /gt\s*(?:710|730|1030)/i, tier: 1, name: 'GeForce GT Series' },
  { pattern: /rx\s*550/i, tier: 1, name: 'Radeon RX 550' },
];

/**
 * GameVault Compatibility Engine
 */
export const compatibilityService = {
  /**
   * Evaluates user hardware against published game system specifications.
   */
  evaluateCompatibility(
    requirements: SystemRequirements | undefined,
    profile: UserHardwareProfile
  ): CompatibilityEvaluation {
    const comparisons: ComponentComparisonResult[] = [];
    const minSpec = requirements?.minimum;
    const recSpec = requirements?.recommended;

    // 1. Guard: Check if game specifications are published and complete
    const hasMin = Boolean(minSpec && Object.values(minSpec).some((v) => typeof v === 'string' && v.trim() !== ''));
    const hasRec = Boolean(recSpec && Object.values(recSpec).some((v) => typeof v === 'string' && v.trim() !== ''));

    if (!hasMin && !hasRec) {
      return {
        overallOutcome: 'INSUFFICIENT_DATA',
        headline: 'PC Requirements Unavailable',
        summary: 'Compatibility check unavailable because published PC requirements are not available for this title.',
        details: [
          'The publisher has not published verified PC hardware specifications for this title.',
          'Note: This check is unavailable because game requirements are missing from the publisher, NOT because your PC hardware detection failed.',
          'GameVault strictly enforces the Zero-Fabrication rule and will never fabricate or guess hardware specifications.',
        ],
        comparisons: [],
        confidence: 'INSUFFICIENT',
        isComplete: false,
      };
    }

    // --- Component 1: Memory (RAM) ---
    if (minSpec?.memory || recSpec?.memory) {
      const ramComp = this.compareMemory(profile, minSpec?.memory, recSpec?.memory);
      comparisons.push(ramComp);
    }

    // --- Component 2: Operating System (OS) ---
    if (minSpec?.os || recSpec?.os) {
      const osComp = this.compareOS(profile, minSpec?.os, recSpec?.os);
      comparisons.push(osComp);
    }

    // --- Component 3: Processor (CPU) ---
    if (minSpec?.processor || recSpec?.processor) {
      const cpuComp = this.compareCPU(profile, minSpec?.processor, recSpec?.processor);
      comparisons.push(cpuComp);
    }

    // --- Component 4: Graphics (GPU) ---
    if (minSpec?.graphics || recSpec?.graphics) {
      const gpuComp = this.compareGPU(profile, minSpec?.graphics, recSpec?.graphics);
      comparisons.push(gpuComp);
    }

    // --- Component 5: Storage ---
    if (minSpec?.storage || recSpec?.storage) {
      const storageComp = this.compareStorage(profile, minSpec?.storage, recSpec?.storage);
      comparisons.push(storageComp);
    }

    // --- Component 6: DirectX ---
    if (minSpec?.directX || recSpec?.directX) {
      const dxComp = this.compareDirectX(profile, minSpec?.directX, recSpec?.directX);
      comparisons.push(dxComp);
    }

    // --- Synthesize Overall Outcome & Explanations ---
    return this.synthesizeEvaluation(comparisons, profile);
  },

  /**
   * Evaluates RAM requirements.
   */
  compareMemory(
    profile: UserHardwareProfile,
    minStr?: string,
    recStr?: string
  ): ComponentComparisonResult {
    const minGb = this.extractGb(minStr);
    const recGb = this.extractGb(recStr);

    const userRamGb = profile.manualRamGb || profile.detected.deviceMemoryGb;
    const isApproximated = !profile.manualRamGb && profile.detected.deviceMemoryApproximated;

    let userValue = 'Not detected';
    if (profile.manualRamGb) {
      userValue = `${profile.manualRamGb} GB (User entered)`;
    } else if (profile.detected.deviceMemoryGb) {
      userValue = isApproximated
        ? `Approx. ${profile.detected.deviceMemoryGb} GB (Browser reported)`
        : `${profile.detected.deviceMemoryGb} GB`;
    }

    if (!userRamGb) {
      return {
        component: 'RAM',
        userValue,
        minimumValue: minStr,
        recommendedValue: recStr,
        status: 'unknown',
        notes: 'Memory was not exposed by browser API. Enter your RAM manually for an exact comparison.',
      };
    }

    let status: ComponentStatus = 'unknown';
    let notes: string | undefined;

    if (minGb !== null && userRamGb < minGb) {
      status = 'below_minimum';
      notes = `Your available RAM (${userRamGb} GB) is below the published minimum of ${minGb} GB.`;
    } else if (recGb !== null && userRamGb < recGb) {
      status = 'below_recommended';
      notes = `Meets minimum requirements (${minGb ?? '?'} GB), but falls below recommended memory (${recGb} GB).`;
    } else if (minGb !== null && userRamGb >= minGb) {
      status = 'meets';
      notes = recGb ? `Meets both minimum and recommended RAM (${recGb} GB).` : `Meets minimum RAM requirement (${minGb} GB).`;
    } else {
      status = 'meets';
    }

    if (isApproximated && userRamGb === 8 && minGb && minGb > 8) {
      notes += ' Note: Browsers cap reported memory at 8 GB for privacy protection. If your PC has 16 GB or 32 GB, enter it manually.';
    }

    return {
      component: 'RAM',
      userValue,
      minimumValue: minStr,
      recommendedValue: recStr,
      status,
      notes,
    };
  },

  /**
   * Evaluates OS compatibility.
   */
  compareOS(
    profile: UserHardwareProfile,
    minStr?: string,
    recStr?: string
  ): ComponentComparisonResult {
    const userOs = profile.manualOs || profile.detected.os || 'Desktop OS';
    const isWindows = /windows/i.test(userOs);
    const minReqWindows = minStr ? /windows/i.test(minStr) : true;

    let status: ComponentStatus = 'meets';
    let notes: string | undefined;

    if (minReqWindows && !isWindows && profile.detected.os) {
      status = 'below_minimum';
      notes = `Game specifies Windows, but your detected OS is ${userOs}. May require compatibility layers (e.g. Proton/Wine).`;
    } else if (isWindows) {
      status = 'meets';
      notes = `Compatible operating system environment (${userOs}).`;
    } else {
      status = 'unknown';
      notes = 'OS compatibility could not be definitively verified.';
    }

    return {
      component: 'OS',
      userValue: userOs,
      minimumValue: minStr,
      recommendedValue: recStr,
      status,
      notes,
    };
  },

  /**
   * Evaluates CPU capability.
   */
  compareCPU(
    profile: UserHardwareProfile,
    minStr?: string,
    recStr?: string
  ): ComponentComparisonResult {
    const manual = profile.manualCpu?.trim();
    const cores = profile.detected.cpuCores;

    if (manual) {
      return {
        component: 'CPU',
        userValue: `${manual} (User entered)`,
        minimumValue: minStr,
        recommendedValue: recStr,
        status: 'meets',
        notes: 'CPU specified manually. Exact benchmark comparison depends on clock speed and generation.',
      };
    }

    if (cores) {
      const status: ComponentStatus = cores >= 4 ? 'meets' : 'below_recommended';
      const notes = cores >= 4
        ? `${cores} logical cores detected. Meets typical modern multi-threaded requirements, but exact CPU model cannot be read by browsers.`
        : `${cores} logical cores detected. May bottleneck titles requiring 4 or more cores.`;

      return {
        component: 'CPU',
        userValue: `${cores} Logical Cores`,
        minimumValue: minStr,
        recommendedValue: recStr,
        status,
        notes,
      };
    }

    return {
      component: 'CPU',
      userValue: 'Not available',
      minimumValue: minStr,
      recommendedValue: recStr,
      status: 'unknown',
      notes: 'Browser security controls prevent reading the exact CPU model. You can enter your processor manually.',
    };
  },

  /**
   * Evaluates GPU capability using curated GPU capability database.
   */
  compareGPU(
    profile: UserHardwareProfile,
    minStr?: string,
    recStr?: string
  ): ComponentComparisonResult {
    const manual = profile.manualGpu?.trim();
    const detectedRenderer = profile.detected.gpuRenderer;
    const userGpuString = manual || detectedRenderer;

    if (!userGpuString) {
      return {
        component: 'GPU',
        userValue: 'Not available',
        minimumValue: minStr,
        recommendedValue: recStr,
        status: 'unknown',
        notes: 'Detailed GPU was not exposed by browser APIs. Enter your graphics card manually.',
      };
    }

    const userTier = this.matchGpuTier(userGpuString);
    const minTier = minStr ? this.matchGpuTier(minStr) : null;
    const recTier = recStr ? this.matchGpuTier(recStr) : null;

    let status: ComponentStatus = 'unknown';
    let notes: string | undefined;

    if (userTier && minTier) {
      if (userTier.tier < minTier.tier) {
        status = 'below_minimum';
        notes = `Your graphics card appears below the performance tier of the published minimum (${minTier.name}).`;
      } else if (recTier && userTier.tier < recTier.tier) {
        status = 'below_recommended';
        notes = `Meets minimum graphics tier (${minTier.name}), but falls below recommended tier (${recTier.name}).`;
      } else {
        status = 'meets';
        notes = recTier
          ? `Meets or exceeds recommended graphics tier (${recTier.name}).`
          : `Meets minimum graphics tier (${minTier.name}).`;
      }
    } else {
      status = 'unknown';
      notes = `Detected GPU: "${userGpuString}". Exact comparison could not be mapped reliably. Manual verification recommended.`;
    }

    return {
      component: 'GPU',
      userValue: manual ? `${manual} (User entered)` : userGpuString,
      minimumValue: minStr,
      recommendedValue: recStr,
      status,
      notes,
    };
  },

  /**
   * Evaluates Storage.
   */
  compareStorage(
    profile: UserHardwareProfile,
    minStr?: string,
    recStr?: string
  ): ComponentComparisonResult {
    const requiredGb = this.extractGb(minStr) || this.extractGb(recStr);
    const userStorage = profile.manualStorageGb;

    if (userStorage !== undefined && userStorage > 0) {
      const status: ComponentStatus = requiredGb && userStorage < requiredGb ? 'below_minimum' : 'meets';
      const notes = status === 'below_minimum'
        ? `Entered free storage (${userStorage} GB) is less than the required ${requiredGb} GB.`
        : `Sufficient free storage (${userStorage} GB available vs ${requiredGb ?? '?'} GB required).`;

      return {
        component: 'Storage',
        userValue: `${userStorage} GB Free`,
        minimumValue: minStr,
        recommendedValue: recStr,
        status,
        notes,
      };
    }

    return {
      component: 'Storage',
      userValue: 'Manual check required',
      minimumValue: minStr,
      recommendedValue: recStr,
      status: 'unknown',
      notes: 'Storage device space cannot be read by web browsers for privacy and security reasons.',
    };
  },

  /**
   * Evaluates DirectX.
   */
  compareDirectX(
    profile: UserHardwareProfile,
    minStr?: string,
    recStr?: string
  ): ComponentComparisonResult {
    const api = profile.detected.graphicsApi || 'Standard Graphics API';
    return {
      component: 'DirectX',
      userValue: api,
      minimumValue: minStr,
      recommendedValue: recStr,
      status: 'meets',
      notes: `Browser environment supports modern graphics acceleration (${api}).`,
    };
  },

  /**
   * Synthesizes component comparisons into an honest overall outcome.
   */
  synthesizeEvaluation(
    comparisons: ComponentComparisonResult[],
    profile: UserHardwareProfile
  ): CompatibilityEvaluation {
    const hasBelowMinimum = comparisons.some((c) => c.status === 'below_minimum');
    const hasBelowRecommended = comparisons.some((c) => c.status === 'below_recommended');
    const unknownCount = comparisons.filter((c) => c.status === 'unknown').length;
    const meetsCount = comparisons.filter((c) => c.status === 'meets').length;

    let overallOutcome: CompatibilityOutcome = 'SHOULD_RUN';
    let headline = '';
    let summary = '';
    const details: string[] = [];
    let confidence: 'HIGH' | 'ESTIMATE' | 'INSUFFICIENT' = 'ESTIMATE';

    if (hasBelowMinimum) {
      overallOutcome = 'DOES_NOT_MEET';
      headline = 'Does Not Meet Requirements';
      summary = 'Based on the available information, your PC does not meet one or more published minimum system requirements.';
      confidence = 'HIGH';

      comparisons
        .filter((c) => c.status === 'below_minimum')
        .forEach((c) => {
          details.push(`${c.component}: Below minimum requirement (${c.notes || c.userValue})`);
        });
    } else if (hasBelowRecommended) {
      overallOutcome = 'MAY_REQUIRE_LOWER_SETTINGS';
      headline = 'May Require Lower Settings';
      summary = 'Your PC appears capable of running this title at or near minimum requirements, but falls below recommended settings.';
      confidence = 'ESTIMATE';

      comparisons
        .filter((c) => c.status === 'below_recommended')
        .forEach((c) => {
          details.push(`${c.component}: Below recommended specification (${c.notes || c.userValue})`);
        });
    } else if (meetsCount > 0 && unknownCount <= 2) {
      overallOutcome = 'SHOULD_RUN';
      headline = 'Should Run';
      summary = 'Your detected and specified hardware appears sufficient to run this game based on published system requirements.';
      confidence = unknownCount === 0 ? 'HIGH' : 'ESTIMATE';

      details.push('All verified components meet or exceed published specifications.');
      if (unknownCount > 0) {
        details.push('Some hardware details could not be verified by browser APIs and remain an estimate.');
      }
    } else {
      overallOutcome = 'INSUFFICIENT_DATA';
      headline = 'Insufficient Hardware Information';
      summary = 'We could not safely identify enough hardware parameters to make a trustworthy determination.';
      confidence = 'INSUFFICIENT';

      details.push('Automatic browser detection was limited by privacy controls.');
      details.push('Enter your hardware manually in the options panel below to check compatibility.');
    }

    return {
      overallOutcome,
      headline,
      summary,
      details,
      comparisons,
      confidence,
      isComplete: true,
    };
  },

  /**
   * Helper: Matches string to GPU Tier Database.
   */
  matchGpuTier(str: string): { tier: number; name: string } | null {
    if (!str) return null;
    for (const entry of GPU_TIER_DATABASE) {
      if (entry.pattern.test(str)) {
        return { tier: entry.tier, name: entry.name };
      }
    }
    return null;
  },

  /**
   * Helper: Extracts GB number from strings like "16 GB RAM", "8GB", "512 MB".
   */
  extractGb(str?: string): number | null {
    if (!str) return null;
    const gbMatch = str.match(/(\d+(?:\.\d+)?)\s*GB/i);
    if (gbMatch) {
      return parseFloat(gbMatch[1]);
    }
    const mbMatch = str.match(/(\d+(?:\.\d+)?)\s*MB/i);
    if (mbMatch) {
      return parseFloat(mbMatch[1]) / 1024;
    }
    return null;
  },
};
