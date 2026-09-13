import { compatibilityService } from '../src/services/compatibilityService';
import { hardwareDetectionService } from '../src/services/hardwareDetectionService';
import { SystemRequirements } from '../src/types/game';
import { UserHardwareProfile } from '../src/types/compatibility';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

console.log('=====================================================');
console.log('      GAMEVAULT PC CHECK COMPATIBILITY TESTS         ');
console.log('=====================================================\n');

// Mock game specifications
const completeSpecs: SystemRequirements = {
  minimum: {
    os: 'Windows 10 64-bit',
    processor: 'Intel Core i5-6600K',
    memory: '12 GB RAM',
    graphics: 'NVIDIA GeForce GTX 1060 6GB',
    directX: 'Version 12',
    storage: '70 GB available space',
  },
  recommended: {
    os: 'Windows 11 64-bit',
    processor: 'Intel Core i7-12700',
    memory: '16 GB RAM',
    graphics: 'NVIDIA GeForce RTX 3070',
    directX: 'Version 12',
    storage: '70 GB SSD',
  },
};

const minOnlySpecs: SystemRequirements = {
  minimum: {
    os: 'Windows 7',
    processor: '1.7 GHz Processor',
    memory: '512 MB RAM',
    graphics: 'DirectX 8.1 level Graphics Card',
    storage: '6.5 GB available space',
  },
};

const incompleteSpecs: SystemRequirements = {};

// Test 1: Incomplete Game Requirements -> INSUFFICIENT_DATA
console.log('Test 1: Incomplete / Missing Game Requirements');
const emptyProfile: UserHardwareProfile = {
  detected: { deviceMemoryApproximated: false },
};
const res1 = compatibilityService.evaluateCompatibility(incompleteSpecs, emptyProfile);
assert(res1.overallOutcome === 'INSUFFICIENT_DATA', 'Outcome is INSUFFICIENT_DATA for incomplete game requirements');
assert(res1.confidence === 'INSUFFICIENT', 'Confidence is INSUFFICIENT');
assert(res1.isComplete === false, 'isComplete is false');

// Test 2: Below Minimum RAM
console.log('\nTest 2: Below Minimum RAM Detection');
const lowRamProfile: UserHardwareProfile = {
  detected: {
    deviceMemoryGb: 8,
    deviceMemoryApproximated: true,
    cpuCores: 8,
    gpuRenderer: 'NVIDIA GeForce RTX 3070',
    os: 'Windows 10 / 11 64-bit',
    graphicsApi: 'WebGL 2.0',
  },
};
const res2 = compatibilityService.evaluateCompatibility(completeSpecs, lowRamProfile);
assert(res2.overallOutcome === 'DOES_NOT_MEET', 'Outcome is DOES_NOT_MEET when detected RAM (8GB) < minimum RAM (12GB)');
const ramComp2 = res2.comparisons.find((c) => c.component === 'RAM');
assert(ramComp2?.status === 'below_minimum', 'RAM component status is below_minimum');

// Test 3: Meets Minimum, Below Recommended (May Require Lower Settings)
console.log('\nTest 3: Meets Minimum, Below Recommended');
const midTierProfile: UserHardwareProfile = {
  detected: {
    deviceMemoryGb: 12,
    deviceMemoryApproximated: false,
    cpuCores: 8,
    gpuRenderer: 'NVIDIA GeForce GTX 1060 6GB',
    os: 'Windows 10 / 11 64-bit',
    graphicsApi: 'WebGL 2.0',
  },
};
const res3 = compatibilityService.evaluateCompatibility(completeSpecs, midTierProfile);
assert(res3.overallOutcome === 'MAY_REQUIRE_LOWER_SETTINGS', 'Outcome is MAY_REQUIRE_LOWER_SETTINGS when RAM and GPU are at minimum tier');
const ramComp3 = res3.comparisons.find((c) => c.component === 'RAM');
assert(ramComp3?.status === 'below_recommended', 'RAM status is below_recommended (12GB < 16GB)');
const gpuComp3 = res3.comparisons.find((c) => c.component === 'GPU');
assert(gpuComp3?.status === 'below_recommended', 'GPU status is below_recommended (GTX 1060 < RTX 3070)');

// Test 4: Fully Meets Recommended Specifications
console.log('\nTest 4: High-End Hardware Meets Recommended');
const highEndProfile: UserHardwareProfile = {
  detected: {
    deviceMemoryGb: 8,
    deviceMemoryApproximated: true,
    cpuCores: 16,
    gpuRenderer: 'NVIDIA GeForce RTX 4080',
    os: 'Windows 10 / 11 64-bit',
    graphicsApi: 'WebGPU Ready',
  },
  manualRamGb: 32,
  manualCpu: 'Intel Core i9-13900K',
  manualStorageGb: 500,
};
const res4 = compatibilityService.evaluateCompatibility(completeSpecs, highEndProfile);
assert(res4.overallOutcome === 'SHOULD_RUN', 'Outcome is SHOULD_RUN for high-end hardware');
const ramComp4 = res4.comparisons.find((c) => c.component === 'RAM');
assert(ramComp4?.status === 'meets', 'RAM status is meets with manual 32GB override');
const gpuComp4 = res4.comparisons.find((c) => c.component === 'GPU');
assert(gpuComp4?.status === 'meets', 'GPU status is meets for RTX 4080');
const storageComp4 = res4.comparisons.find((c) => c.component === 'Storage');
assert(storageComp4?.status === 'meets', 'Storage status is meets with manual 500GB free space');

// Test 5: Minimum-Only Game Specification (e.g. Classic/Indie Titles)
console.log('\nTest 5: Single-Tier (Minimum Only) Specification');
const indieProfile: UserHardwareProfile = {
  detected: {
    deviceMemoryGb: 4,
    deviceMemoryApproximated: false,
    cpuCores: 4,
    os: 'Windows 10 / 11 64-bit',
    graphicsApi: 'WebGL 2.0',
  },
};
const res5 = compatibilityService.evaluateCompatibility(minOnlySpecs, indieProfile);
assert(res5.overallOutcome === 'SHOULD_RUN', 'Outcome is SHOULD_RUN when minimum specs are comfortably exceeded');

// Test 6: Missing CPU / Unidentified GPU Graceful Handling
console.log('\nTest 6: Missing CPU & Unidentified GPU (Browser Boundary)');
const anonymousBrowserProfile: UserHardwareProfile = {
  detected: {
    deviceMemoryApproximated: false,
  },
};
const res6 = compatibilityService.evaluateCompatibility(completeSpecs, anonymousBrowserProfile);
assert(res6.overallOutcome === 'INSUFFICIENT_DATA', 'Outcome is INSUFFICIENT_DATA when browser exposes no hardware metrics');
assert(res6.details.length > 0, 'Provides clear instructions to enter specs manually');

// Test 7: Hardware Detection Service in Node / Non-Browser Environment
console.log('\nTest 7: Hardware Detection Service Graceful Degradation in Non-Browser Environment');
async function testHardwareDetection() {
  const steps: string[] = [];
  const detected = await hardwareDetectionService.scanHardware((s) => steps.push(s.id));
  assert(detected.deviceMemoryApproximated === false, 'Handles non-browser execution without throwing');
  assert(typeof hardwareDetectionService.cleanGpuRenderer === 'function', 'cleanGpuRenderer utility exists');
  const cleaned = hardwareDetectionService.cleanGpuRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0, D3D11)');
  assert(cleaned === 'NVIDIA GeForce RTX 3080', `Cleans ANGLE renderer correctly (got: "${cleaned}")`);
}

testHardwareDetection().then(() => {
  // Test 8: Zero Commercial / Storage / Fingerprint Violations
  console.log('\nTest 8: Zero Fake Metrics & Zero Storage Policy');
  const evaluationString = JSON.stringify(res4);
  assert(!evaluationString.includes('%'), 'Zero percentage compatibility scores');
  assert(!evaluationString.includes('144 FPS') && !evaluationString.includes('60 FPS'), 'Zero FPS promises or claims');
  assert(!evaluationString.includes('price') && !evaluationString.includes('stock'), 'Zero commercial fields');

  console.log('\n=====================================================');
  console.log('      ALL COMPATIBILITY ENGINE TESTS PASSED!         ');
  console.log('=====================================================\n');
});
