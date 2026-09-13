import { Game, PlatformId, GenreId } from '../../types/game';
import { IMPORTED_GAMES } from './importedGames';
import { CatalogStats, CatalogValidationResult } from './types';
import { validateGameImport, validateAndParseBatch } from './importer';
import { PLATFORMS } from '../platforms';
import { GENRES } from '../genres';
import { VERIFIED_SYSTEM_REQUIREMENTS } from './systemRequirementsData';

// In-memory active catalog list initialized with the imported official GameVault catalog
// Hydrate authentic system requirements where verified data exists
const activeCatalog: Game[] = IMPORTED_GAMES.map((g) => {
  const verifiedReq = VERIFIED_SYSTEM_REQUIREMENTS[g.slug];
  if (verifiedReq) {
    return { ...g, systemRequirements: verifiedReq };
  }
  return { ...g, systemRequirements: undefined };
});

// Fast O(1) in-memory lookup maps
const gamesById = new Map<string, Game>(activeCatalog.map((g) => [g.id, g]));
const gamesBySlug = new Map<string, Game>(activeCatalog.map((g) => [g.slug, g]));

// Number of development baseline titles preserved vs imported real catalog
const DEV_TITLES_COUNT = 0;
let importedRealTitlesCount = IMPORTED_GAMES.length;

/**
 * Re-indexes the lookup maps after insertions or modifications.
 */
function refreshIndexes(): void {
  gamesById.clear();
  gamesBySlug.clear();
  for (const game of activeCatalog) {
    gamesById.set(game.id, game);
    gamesBySlug.set(game.slug, game);
  }
}

/**
 * Central active catalog registry.
 */
export const catalogRegistry = {
  /**
   * Get all games currently in the active catalog.
   */
  getAll(): Game[] {
    return [...activeCatalog];
  },

  /**
   * Get a game by its ID.
   */
  getById(id: string): Game | undefined {
    return gamesById.get(id);
  },

  /**
   * Get a game by its URL slug.
   */
  getBySlug(slug: string): Game | undefined {
    return gamesBySlug.get(slug);
  },

  /**
   * Dual resolver matching either slug or id.
   */
  getByIdOrSlug(idOrSlug: string): Game | undefined {
    return gamesBySlug.get(idOrSlug) || gamesById.get(idOrSlug);
  },

  /**
   * Hydrates the in-memory catalog from PostgreSQL via Supabase.
   */
  hydrateFromSupabase(games: Game[]): void {
    if (!games || games.length === 0) return;
    activeCatalog.length = 0;
    activeCatalog.push(...games);
    refreshIndexes();
    importedRealTitlesCount = games.length;
  },

  /**
   * Adds a newly validated game to the active development catalog.
   */
  addGame(gameCandidate: any): { success: boolean; game?: Game; error?: string } {
    const check = validateGameImport(gameCandidate, activeCatalog.length);
    if (!check.valid || !check.game) {
      return { success: false, error: check.errors.join(' ') };
    }

    const game = check.game;

    if (gamesById.has(game.id)) {
      return { success: false, error: `A game with ID "${game.id}" already exists.` };
    }

    if (gamesBySlug.has(game.slug)) {
      return { success: false, error: `A game with slug "${game.slug}" already exists.` };
    }

    activeCatalog.unshift(game);
    gamesById.set(game.id, game);
    gamesBySlug.set(game.slug, game);
    importedRealTitlesCount++;

    return { success: true, game };
  },

  /**
   * Updates an existing game in the active development catalog.
   */
  updateGame(id: string, updates: Partial<Game>): { success: boolean; game?: Game; error?: string } {
    const existing = gamesById.get(id);
    if (!existing) {
      return { success: false, error: `Game with ID "${id}" not found.` };
    }

    // Disallow adding prices or stock during update
    if ('price' in updates || 'discount' in updates || 'stock' in updates) {
      return { success: false, error: 'Cannot add price or stock fields (Zero-Price Compliance).' };
    }

    // If slug is changed, check collision
    if (updates.slug && updates.slug !== existing.slug && gamesBySlug.has(updates.slug)) {
      return { success: false, error: `A game with slug "${updates.slug}" already exists.` };
    }

    const updatedGame: Game = {
      ...existing,
      ...updates,
      id: existing.id, // ID remains immutable
      platforms: updates.platforms || (updates.platform ? [updates.platform] : existing.platforms),
      genres: updates.genres || (updates.genre ? [updates.genre] : existing.genres),
    };

    // Update in array
    const idx = activeCatalog.findIndex((g) => g.id === id);
    if (idx !== -1) {
      activeCatalog[idx] = updatedGame;
    }

    refreshIndexes();
    return { success: true, game: updatedGame };
  },

  /**
   * Removes a game from the active development catalog.
   */
  removeGame(id: string): { success: boolean; error?: string } {
    const idx = activeCatalog.findIndex((g) => g.id === id);
    if (idx === -1) {
      return { success: false, error: `Game with ID "${id}" not found.` };
    }

    activeCatalog.splice(idx, 1);
    refreshIndexes();
    return { success: true };
  },

  /**
   * Ingests a batch of imported titles.
   */
  importBatch(rawGames: unknown[]): CatalogValidationResult {
    const existingIds = new Set(gamesById.keys());
    const existingSlugs = new Set(gamesBySlug.keys());

    const { validGames, result } = validateAndParseBatch(rawGames, existingIds, existingSlugs);

    if (validGames.length > 0) {
      for (const game of validGames) {
        activeCatalog.push(game);
        gamesById.set(game.id, game);
        gamesBySlug.set(game.slug, game);
      }
      importedRealTitlesCount += validGames.length;
    }

    return result;
  },

  /**
   * Dynamically calculates accurate catalog metrics without fake numbers.
   */
  getStats(): CatalogStats {
    const totalGames = activeCatalog.length;
    const platformDistribution: Record<PlatformId, number> = {
      steam: 0,
      epic: 0,
      rockstar: 0,
      ea: 0,
      ubisoft: 0,
      gog: 0,
      battlenet: 0,
      other: 0,
    };

    const genreDistribution: Record<GenreId, number> = {
      action: 0,
      adventure: 0,
      rpg: 0,
      fps: 0,
      racing: 0,
      sports: 0,
      strategy: 0,
      horror: 0,
      simulation: 0,
      puzzle: 0,
      sandbox: 0,
      survival: 0,
      indie: 0,
    };

    let featuredCount = 0;
    let popularCount = 0;
    let newCount = 0;

    for (const g of activeCatalog) {
      if (g.featured) featuredCount++;
      if (g.popular) popularCount++;
      if (g.badges?.includes('NEW') || g.badge === 'NEW') newCount++;

      for (const p of g.platforms) {
        if (p in platformDistribution) {
          platformDistribution[p]++;
        }
      }

      for (const genre of g.genres) {
        if (genre in genreDistribution) {
          genreDistribution[genre]++;
        }
      }
    }

    return {
      totalGames,
      totalPlatforms: PLATFORMS.length,
      totalGenres: GENRES.length,
      featuredCount,
      popularCount,
      newCount,
      platformDistribution,
      genreDistribution,
      isCompleteCatalog: true, // Imported full official GameVault catalog
      developmentTitlesCount: DEV_TITLES_COUNT,
      realImportedCount: importedRealTitlesCount,
    };
  },
};
