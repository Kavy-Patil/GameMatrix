import { Game, PlatformId, GenreId } from '../../types/game';
import { CatalogGameImport, CatalogImportBatch, CatalogValidationResult } from './types';
import { PLATFORMS } from '../platforms';
import { GENRES } from '../genres';

const VALID_PLATFORM_IDS = new Set<string>(PLATFORMS.map((p) => p.id));
const VALID_GENRE_IDS = new Set<string>(GENRES.map((g) => g.id));

/**
 * Validates a single imported game candidate against the standardized schema.
 */
export function validateGameImport(candidate: any, index: number): { valid: boolean; game?: Game; errors: string[] } {
  const errors: string[] = [];
  const ref = candidate?.title ? `"${candidate.title}" (index ${index})` : `Game at index ${index}`;

  if (!candidate || typeof candidate !== 'object') {
    return { valid: false, errors: [`${ref}: Record is not a valid object.`] };
  }

  // 1. Strict Zero-Price Compliance Check
  if ('price' in candidate || 'discount' in candidate || 'cost' in candidate || 'msrp' in candidate) {
    errors.push(`${ref}: Forbidden price or discount field detected in product record.`);
  }

  // 2. Strict Stock Check
  if ('stock' in candidate || 'inventory' in candidate || 'quantity' in candidate) {
    errors.push(`${ref}: Forbidden stock/inventory field detected in product record.`);
  }

  // 3. Required String Identifiers
  if (!candidate.id || typeof candidate.id !== 'string' || !candidate.id.trim()) {
    errors.push(`${ref}: Missing or invalid "id".`);
  }

  if (!candidate.slug || typeof candidate.slug !== 'string' || !candidate.slug.trim()) {
    errors.push(`${ref}: Missing or invalid "slug".`);
  } else if (!/^[a-z0-9-]+$/.test(candidate.slug)) {
    errors.push(`${ref}: Slug "${candidate.slug}" must be lowercase alphanumeric with hyphens only.`);
  }

  if (!candidate.title || typeof candidate.title !== 'string' || !candidate.title.trim()) {
    errors.push(`${ref}: Missing or empty "title".`);
  }

  // 4. Platforms validation
  const platforms = Array.isArray(candidate.platforms) ? candidate.platforms : candidate.platform ? [candidate.platform] : [];
  if (platforms.length === 0) {
    errors.push(`${ref}: Must specify at least one supported platform.`);
  } else {
    for (const p of platforms) {
      if (!VALID_PLATFORM_IDS.has(p)) {
        errors.push(`${ref}: Invalid platform identifier "${p}".`);
      }
    }
  }

  // 5. Genres validation
  const genres = Array.isArray(candidate.genres) ? candidate.genres : candidate.genre ? [candidate.genre] : [];
  if (genres.length === 0) {
    errors.push(`${ref}: Must specify at least one genre.`);
  } else {
    for (const g of genres) {
      if (!VALID_GENRE_IDS.has(g)) {
        errors.push(`${ref}: Invalid genre identifier "${g}".`);
      }
    }
  }

  // 6. Cover and Media
  if (!candidate.coverImage || typeof candidate.coverImage !== 'string') {
    errors.push(`${ref}: Missing or invalid "coverImage" URL.`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Assemble canonical Game object
  const primaryPlatform: PlatformId = platforms[0] as PlatformId;
  const primaryGenre: GenreId = genres[0] as GenreId;

  const validGame: Game = {
    id: candidate.id.trim(),
    slug: candidate.slug.trim(),
    title: candidate.title.trim(),
    shortDescription: candidate.shortDescription || candidate.tagline || candidate.description?.slice(0, 120) || '',
    tagline: candidate.tagline || candidate.shortDescription || '',
    description: candidate.description || candidate.shortDescription || '',
    detailedDescription: candidate.detailedDescription || candidate.description || '',
    platform: primaryPlatform,
    platforms: platforms as PlatformId[],
    genre: primaryGenre,
    genres: genres as GenreId[],
    developer: candidate.developer || 'Independent Studio',
    publisher: candidate.publisher || 'GameVault Showcase',
    releaseDate: candidate.releaseDate || '2026',
    coverImage: candidate.coverImage,
    heroImage: candidate.heroImage || candidate.coverImage,
    screenshots: Array.isArray(candidate.screenshots) && candidate.screenshots.length > 0 ? candidate.screenshots : [candidate.coverImage],
    systemRequirements: candidate.systemRequirements,
    status: candidate.status || 'Available',
    badges: Array.isArray(candidate.badges) ? candidate.badges : candidate.badge ? [candidate.badge] : [],
    badge: candidate.badge || (Array.isArray(candidate.badges) && candidate.badges[0]) || undefined,
    featured: Boolean(candidate.featured),
    popular: Boolean(candidate.popular),
    rating: typeof candidate.rating === 'number' ? candidate.rating : 4.8,
    searchableTags: Array.isArray(candidate.searchableTags) ? candidate.searchableTags : [primaryGenre, primaryPlatform],
    tags: Array.isArray(candidate.tags) ? candidate.tags : Array.isArray(candidate.searchableTags) ? candidate.searchableTags : [primaryGenre],
  };

  return { valid: true, game: validGame, errors: [] };
}

/**
 * Validates and ingests a batch of raw game imports.
 */
export function validateAndParseBatch(
  rawCandidates: unknown[],
  existingIds: Set<string> = new Set(),
  existingSlugs: Set<string> = new Set()
): { validGames: Game[]; result: CatalogValidationResult } {
  const validGames: Game[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>(existingIds);
  const seenSlugs = new Set<string>(existingSlugs);

  if (!Array.isArray(rawCandidates)) {
    return {
      validGames: [],
      result: {
        valid: false,
        errors: ['Import payload must be an array of game objects.'],
        warnings: [],
        acceptedCount: 0,
        rejectedCount: 0,
      },
    };
  }

  rawCandidates.forEach((candidate, idx) => {
    const check = validateGameImport(candidate, idx);
    if (!check.valid || !check.game) {
      errors.push(...check.errors);
      return;
    }

    const game = check.game;

    if (seenIds.has(game.id)) {
      errors.push(`Duplicate ID detected in batch: "${game.id}" on title "${game.title}".`);
      return;
    }

    if (seenSlugs.has(game.slug)) {
      errors.push(`Duplicate URL slug detected in batch: "${game.slug}" on title "${game.title}".`);
      return;
    }

    seenIds.add(game.id);
    seenSlugs.add(game.slug);
    validGames.push(game);
  });

  return {
    validGames,
    result: {
      valid: errors.length === 0,
      errors,
      warnings,
      acceptedCount: validGames.length,
      rejectedCount: rawCandidates.length - validGames.length,
    },
  };
}
