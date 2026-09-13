import fs from 'fs';
import path from 'path';
import https from 'https';
import { IMPORTED_GAMES } from '../src/data/catalog/importedGames';
import { GAME_ARTWORK_MAP } from '../src/data/artwork/gameArtwork';
import { VERIFIED_SYSTEM_REQUIREMENTS as EXISTING_VERIFIED } from '../src/data/catalog/systemRequirementsData';
import { parseSteamRequirements } from '../src/utils/steamRequirementsParser';
import { SystemRequirements } from '../src/types/game';

interface CacheEntry {
  slug: string;
  appId?: number;
  requirements?: SystemRequirements;
  unavailable?: boolean;
  source: 'Steam' | 'Official publisher' | 'REQUIREMENTS_UNAVAILABLE';
  lastChecked: string;
}

const CACHE_FILE = path.resolve('scripts/.system-requirements-cache.json');
const OUTPUT_FILE = path.resolve('src/data/catalog/systemRequirementsData.ts');

function loadCache(): Record<string, CacheEntry> {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch (e) {
      console.warn('Could not read cache file, starting fresh:', e);
    }
  }
  return {};
}

function saveCache(cache: Record<string, CacheEntry>) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

function fetchAppDetails(appId: number): Promise<{ status: number; data: any }> {
  return new Promise((resolve) => {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`;
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              resolve({ status: res.statusCode || 500, data: null });
              return;
            }
            const json = JSON.parse(data);
            resolve({ status: 200, data: json[appId]?.data?.pc_requirements });
          } catch (e) {
            resolve({ status: 200, data: null });
          }
        });
      }
    );

    req.on('error', () => resolve({ status: 500, data: null }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ status: 408, data: null });
    });
  });
}

async function fetchWithRetry(appId: number, maxRetries = 3): Promise<{ status: number; data: any }> {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    const res = await fetchAppDetails(appId);
    if (res.status === 429) {
      console.warn(`[RateLimit 429] Backing off for 15s (attempt ${attempt}/${maxRetries}) for appId ${appId}...`);
      await new Promise((r) => setTimeout(r, 15000));
      continue;
    }
    return res;
  }
  return { status: 429, data: null };
}

async function main() {
  console.log('=====================================================');
  console.log('  GAMEVAULT SYSTEM REQUIREMENTS ENRICHMENT PIPELINE  ');
  console.log('=====================================================\n');

  const cache = loadCache();
  console.log(`Loaded ${Object.keys(cache).length} entries from cache.`);

  const allGames = IMPORTED_GAMES;
  console.log(`Total canonical games in catalog: ${allGames.length}`);

  let enrichedCount = 0;
  let cachedCount = 0;
  let unavailableCount = 0;
  let publisherCount = 0;

  for (let i = 0; i < allGames.length; i++) {
    const game = allGames[i];
    const slug = game.slug;

    // 1. Check existing verified official publisher requirements
    if (EXISTING_VERIFIED[slug] && (EXISTING_VERIFIED[slug].minimum || EXISTING_VERIFIED[slug].recommended)) {
      cache[slug] = {
        slug,
        requirements: {
          ...EXISTING_VERIFIED[slug],
          requirementsSource: EXISTING_VERIFIED[slug].requirementsSource || 'Official publisher',
        },
        source: 'Official publisher',
        lastChecked: new Date().toISOString(),
      };
      publisherCount++;
      continue;
    }

    // 2. Check if already cached
    if (cache[slug]) {
      cachedCount++;
      continue;
    }

    // 3. Check for Steam App ID
    const artworkEntry = (GAME_ARTWORK_MAP as any)[slug];
    const appId = artworkEntry?.appId;

    if (!appId || typeof appId !== 'number') {
      cache[slug] = {
        slug,
        unavailable: true,
        source: 'REQUIREMENTS_UNAVAILABLE',
        lastChecked: new Date().toISOString(),
      };
      unavailableCount++;
      continue;
    }

    // 4. Fetch from Steam API with rate limiting
    process.stdout.write(`[${i + 1}/${allGames.length}] Fetching ${slug} (App ID: ${appId})... `);
    const res = await fetchWithRetry(appId);

    if (res.status === 200 && res.data) {
      const parsed = parseSteamRequirements(res.data);
      if (parsed && (parsed.minimum || parsed.recommended)) {
        cache[slug] = {
          slug,
          appId,
          requirements: parsed,
          source: 'Steam',
          lastChecked: new Date().toISOString(),
        };
        enrichedCount++;
        console.log(`OK (Min: ${parsed.minimum ? 'YES' : 'NO'}, Rec: ${parsed.recommended ? 'YES' : 'NO'})`);
      } else {
        cache[slug] = {
          slug,
          appId,
          unavailable: true,
          source: 'REQUIREMENTS_UNAVAILABLE',
          lastChecked: new Date().toISOString(),
        };
        unavailableCount++;
        console.log('NO PC REQS');
      }
    } else {
      cache[slug] = {
        slug,
        appId,
        unavailable: true,
        source: 'REQUIREMENTS_UNAVAILABLE',
        lastChecked: new Date().toISOString(),
      };
      unavailableCount++;
      console.log(`FAILED (${res.status})`);
    }

    // Checkpoint save every 10 games
    if ((i + 1) % 10 === 0) {
      saveCache(cache);
    }

    // Polite delay between Steam requests (350ms)
    await new Promise((r) => setTimeout(r, 350));
  }

  // Final cache save
  saveCache(cache);

  console.log('\n=====================================================');
  console.log('ENRICHMENT SUMMARY:');
  console.log(`Total games: ${allGames.length}`);
  console.log(`Official Publisher verified: ${publisherCount}`);
  console.log(`Steam Enriched newly: ${enrichedCount}`);
  console.log(`Cached from previous run: ${cachedCount}`);
  console.log(`Unavailable / No PC spec: ${unavailableCount}`);
  console.log('=====================================================\n');

  // Build the compiled systemRequirementsData.ts file
  const enrichedMap: Record<string, SystemRequirements> = {};
  let totalWithRequirements = 0;

  for (const game of allGames) {
    const entry = cache[game.slug];
    if (entry && entry.requirements && (entry.requirements.minimum || entry.requirements.recommended)) {
      enrichedMap[game.slug] = entry.requirements;
      totalWithRequirements++;
    }
  }

  const tsContent = `import { SystemRequirements } from '../../types/game';

/**
 * Authentic, published PC system requirements for canonical titles in the GameVault catalog.
 * ZERO FABRICATION RULE: Only games with official, verified developer/publisher/Steam requirements are included here.
 * If requirements are unverified or unknown, games remain unpopulated.
 * Total populated records: ${totalWithRequirements} / ${allGames.length}
 * Generated: ${new Date().toISOString()}
 */
export const VERIFIED_SYSTEM_REQUIREMENTS: Record<string, SystemRequirements> = ${JSON.stringify(enrichedMap, null, 2)};

/**
 * Helper to safely look up verified requirements for a given game slug or ID.
 */
export function getVerifiedSystemRequirements(slugOrId: string): SystemRequirements | undefined {
  return VERIFIED_SYSTEM_REQUIREMENTS[slugOrId];
}
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
  console.log(`Successfully written ${totalWithRequirements} verified requirements to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Fatal error during enrichment:', err);
  process.exit(1);
});
