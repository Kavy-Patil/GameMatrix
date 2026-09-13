/**
 * Types for GameVault PC Hardware Detection and Compatibility Engine
 */

export interface DetectedHardware {
  cpuCores?: number;
  deviceMemoryGb?: number;
  deviceMemoryApproximated: boolean;
  gpuRenderer?: string;
  gpuVendor?: string;
  graphicsApi?: string;
  browser?: string;
  os?: string;
  detectedAt?: string;
}

export interface UserHardwareProfile {
  detected: DetectedHardware;
  manualCpu?: string;
  manualGpu?: string;
  manualRamGb?: number;
  manualStorageGb?: number;
  manualOs?: string;
}

export type ComponentStatus = 'meets' | 'below_recommended' | 'below_minimum' | 'unknown';

export interface ComponentComparisonResult {
  component: 'RAM' | 'CPU' | 'GPU' | 'OS' | 'Storage' | 'DirectX';
  userValue: string;
  minimumValue?: string;
  recommendedValue?: string;
  status: ComponentStatus;
  notes?: string;
}

export type CompatibilityOutcome = 
  | 'SHOULD_RUN'
  | 'MAY_REQUIRE_LOWER_SETTINGS'
  | 'DOES_NOT_MEET'
  | 'INSUFFICIENT_DATA';

export interface CompatibilityEvaluation {
  overallOutcome: CompatibilityOutcome;
  headline: string;
  summary: string;
  details: string[];
  comparisons: ComponentComparisonResult[];
  confidence: 'HIGH' | 'ESTIMATE' | 'INSUFFICIENT';
  isComplete: boolean;
}

export interface HardwareScanStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  detail?: string;
}
