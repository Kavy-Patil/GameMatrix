import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { IMPORTED_GAMES } from '../src/data/catalog/importedGames';
import { GAME_ARTWORK_MAP } from '../src/data/artwork/gameArtwork';
import { VERIFIED_SYSTEM_REQUIREMENTS } from '../src/data/catalog/systemRequirementsData';
import { Game } from '../src/types/game';

function sqlEscape(str: string): string {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

function sqlArray(arr: string[]): string {
  if (!arr || arr.length === 0) return "'{}'";
  const escaped = arr.map((item) => '"' + item.replace(/"/g, '\\"') + '"').join(',');
  return "'{" + escaped + "}'";
}

async function main() {
  console.log('=====================================================');
  console.log('       GAMEVAULT SUPABASE CATALOG SEED & MIGRATION   ');
  console.log('=====================================================\n');

  const games: Game[] = IMPORTED_GAMES;
  const expectedTotal = 805;

  console.log(`Expected canonical games: ${expectedTotal}`);
  console.log(`Loaded catalog records: ${games.length}`);

  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const validatedGames: Array<Game & { cover_image: string; hero_image: string }> = [];
  let duplicateCount = 0;
  let failedCount = 0;

  for (const game of games) {
    if (!game.id || seenIds.has(game.id)) {
      duplicateCount++;
      continue;
    }
    seenIds.add(game.id);

    if (!game.slug || seenSlugs.has(game.slug)) {
      duplicateCount++;
      continue;
    }
    seenSlugs.add(game.slug);

    if (!game.title || game.title.trim() === '') {
      failedCount++;
      continue;
    }

    if (!Array.isArray(game.platforms) || game.platforms.length === 0) {
      failedCount++;
      continue;
    }

    if (!Array.isArray(game.genres) || game.genres.length === 0) {
      failedCount++;
      continue;
    }

    const artwork = GAME_ARTWORK_MAP[game.slug];
    const coverImage = artwork?.coverImage || game.coverImage || '';
    const heroImage = artwork?.heroImage || game.heroImage || coverImage || '';
    const sysReqs = VERIFIED_SYSTEM_REQUIREMENTS[game.slug] || undefined;

    validatedGames.push({
      ...game,
      cover_image: coverImage,
      hero_image: heroImage,
      systemRequirements: sysReqs,
    });
  }

  console.log(`Validated canonical games: ${validatedGames.length}`);
  console.log(`Duplicates detected: ${duplicateCount}`);
  console.log(`Failed records: ${failedCount}`);

  // Generate supabase/seed.sql
  const seedSqlPath = path.resolve('supabase/seed.sql');
  const sqlLines: string[] = [
    '-- GameVault Canonical PC Game Catalog Seed',
    `-- Total Records: ${validatedGames.length}`,
    `-- Generated at: ${new Date().toISOString()}`,
    '-- STRICT ZERO-PRICE & ZERO-STOCK: No price, discount, stock, or inventory columns.\n',
    'TRUNCATE TABLE public.games CASCADE;\n',
  ];

  const BATCH_SIZE = 50;
  for (let i = 0; i < validatedGames.length; i += BATCH_SIZE) {
    const chunk = validatedGames.slice(i, i + BATCH_SIZE);
    sqlLines.push('INSERT INTO public.games (');
    sqlLines.push('  id, slug, title, platforms, genres, description, short_description,');
    sqlLines.push('  developer, publisher, release_date, rating, cover_image, hero_image,');
    sqlLines.push('  screenshots, featured, popular, badges, searchable_tags, system_requirements');
    sqlLines.push(') VALUES');

    const valueRows = chunk.map((g) => {
      const req = g.systemRequirements ? sqlEscape(JSON.stringify(g.systemRequirements)) : 'NULL';
      return `  (${sqlEscape(g.id)}, ${sqlEscape(g.slug)}, ${sqlEscape(g.title)}, ${sqlArray(g.platforms)}, ${sqlArray(g.genres)}, ${sqlEscape(g.description || '')}, ${sqlEscape(g.shortDescription || '')}, ${sqlEscape(g.developer || '')}, ${sqlEscape(g.publisher || '')}, ${sqlEscape(g.releaseDate || '')}, ${g.rating || 4.5}, ${sqlEscape(g.cover_image)}, ${sqlEscape(g.hero_image)}, ${sqlArray(g.screenshots || [])}, ${g.featured ? 'true' : 'false'}, ${g.popular ? 'true' : 'false'}, ${sqlArray(g.badges || [])}, ${sqlArray(g.searchableTags || [])}, ${req})`;
    });

    sqlLines.push(valueRows.join(',\n') + ';\n');
  }

  fs.writeFileSync(seedSqlPath, sqlLines.join('\n'), 'utf8');
  console.log(`\nGenerated reproducible SQL seed file at: ${seedSqlPath}`);
  console.log(`File size: ${(fs.statSync(seedSqlPath).size / 1024).toFixed(1)} KB`);

  // Report
  console.log('\n=====================================================');
  console.log('               DATABASE CATALOG REPORT');
  console.log('=====================================================');
  console.log(`Expected canonical games: ${expectedTotal}`);
  console.log(`Inserted games:          ${validatedGames.length}`);
  console.log(`Duplicate games:         ${duplicateCount}`);
  console.log(`Failed records:          ${failedCount}`);
  console.log(`Final database games:    ${validatedGames.length}`);
  console.log('=====================================================');
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
