import { catalogService } from '../src/services/catalogService';
import { calculateSystemRequirementsHealth, getGameRequirementsStatus } from '../src/services/systemRequirementsHealth';
import { compatibilityService } from '../src/services/compatibilityService';
import { UserHardwareProfile } from '../src/types/compatibility';

async function main() {
  console.log('=====================================================');
  console.log('    GAMEVAULT SYSTEM REQUIREMENTS PIPELINE AUDIT     ');
  console.log('=====================================================\n');

  const games = catalogService.getAllGames();
  const health = calculateSystemRequirementsHealth(games);

  console.log('SYSTEM REQUIREMENTS COVERAGE METRICS:');
  console.log('-------------------------------------');
  console.log(`Total canonical games:        ${health.total}`);
  console.log(`With requirements:            ${health.withRequirements} (${health.coveragePercentage}%)`);
  console.log(`Complete minimum specs:       ${health.minimumComplete}`);
  console.log(`Complete recommended specs:   ${health.recommendedComplete}`);
  console.log(`Partial requirements:         ${health.partial}`);
  console.log(`Without requirements:         ${health.withoutRequirements}`);

  console.log('\nFIELD-LEVEL COVERAGE BREAKDOWN:');
  console.log('-------------------------------');
  console.log(`Minimum CPU coverage:         ${health.fieldCoverage.minCpu} / ${health.total}`);
  console.log(`Minimum GPU coverage:         ${health.fieldCoverage.minGpu} / ${health.total}`);
  console.log(`Minimum RAM coverage:         ${health.fieldCoverage.minRam} / ${health.total}`);
  console.log(`Minimum storage coverage:     ${health.fieldCoverage.minStorage} / ${health.total}`);
  console.log(`Minimum OS coverage:          ${health.fieldCoverage.minOs} / ${health.total}`);
  console.log(`Recommended CPU coverage:     ${health.fieldCoverage.recCpu} / ${health.total}`);
  console.log(`Recommended GPU coverage:     ${health.fieldCoverage.recGpu} / ${health.total}`);
  console.log(`Recommended RAM coverage:     ${health.fieldCoverage.recRam} / ${health.total}`);
  console.log(`Recommended storage coverage: ${health.fieldCoverage.recStorage} / ${health.total}`);
  console.log(`Recommended OS coverage:      ${health.fieldCoverage.recOs} / ${health.total}`);

  console.log('\nREPRESENTATIVE GAMES VERIFICATION (Section 9):');
  console.log('----------------------------------------------');
  const targetSlugs = [
    'cyberpunk-2077',
    'grand-theft-auto-v',
    'red-dead-redemption-2',
    'the-witcher-3-wild-hunt',
    'elden-ring',
    'forza-horizon-5',
    'portal-2',
    'dead-space',
  ];

  const mockProfile: UserHardwareProfile = {
    detected: {
      logicalCores: 8,
      approximateMemoryGb: 16,
      webGpuAvailable: true,
      webGlAvailable: true,
      gpuRenderer: 'NVIDIA GeForce RTX 3070',
      deviceMemoryApproximated: true,
    },
    manualRamGb: 16,
    manualStorageGb: 500,
  };

  let allTargetsPassed = true;

  for (const slug of targetSlugs) {
    const game = catalogService.getGameBySlug(slug);
    if (!game) {
      console.error(`❌ Game not found in catalog: ${slug}`);
      allTargetsPassed = false;
      continue;
    }

    const reqs = game.systemRequirements;
    if (!reqs || (!reqs.minimum && !reqs.recommended)) {
      console.error(`❌ Missing requirements for target game: ${slug}`);
      allTargetsPassed = false;
      continue;
    }

    // Evaluate compatibility through service
    const evalResult = compatibilityService.evaluateCompatibility(reqs, mockProfile);
    const status = getGameRequirementsStatus(game);

    console.log(`\n[TARGET] ${game.title} (${slug})`);
    console.log(`  Requirements Status: ${status}`);
    console.log(`  Source Provenance:   ${reqs.requirementsSource || 'N/A'}`);
    console.log(`  Minimum Populated:   ${Boolean(reqs.minimum)} (CPU: ${reqs.minimum?.processor || 'N/A'}, GPU: ${reqs.minimum?.graphics || 'N/A'})`);
    console.log(`  Recommended Pop:     ${Boolean(reqs.recommended)} (CPU: ${reqs.recommended?.processor || 'N/A'})`);
    console.log(`  Compatibility Check: ${evalResult.overallOutcome} (${evalResult.headline})`);
    console.log(`  Comparisons Count:   ${evalResult.comparisons.length} components evaluated`);
  }

  if (allTargetsPassed) {
    console.log('\n✅ ALL 8 REPRESENTATIVE TARGET GAMES VERIFIED SUCCESSFULLY!');
  } else {
    console.error('\n❌ Some representative target games failed verification.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
