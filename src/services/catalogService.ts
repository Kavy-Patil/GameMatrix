import { Game, PlatformId, GenreId, CatalogFilters } from '../types/game';
import { catalogRegistry } from '../data/catalog';
import { CatalogStats } from '../data/catalog/types';
import { getVerifiedSystemRequirements } from '../data/catalog/systemRequirementsData';
import { logCatalogValidation } from '../utils/catalogValidator';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { auditService } from './auditService';
import { validateGameInput } from '../utils/security';
import { generateCatalogCSV } from '../utils/csv';

// Execute initial baseline validation in development
try {
  logCatalogValidation(catalogRegistry.getAll());
} catch (e) {
  console.error('[CatalogService] Initial catalog validation failed:', e);
}

// Hydrate from Supabase PostgreSQL if configured
if (isSupabaseConfigured()) {
  Promise.resolve(supabase.from('games').select('*'))
    .then(({ data, error }: any) => {
      if (error) {
        console.warn('[CatalogService] Supabase query notice (using local catalog fallback):', error.message);
      } else if (data && data.length > 0) {
        const mappedGames: Game[] = data.map((row: any) => ({
          id: row.id,
          slug: row.slug,
          title: row.title,
          platforms: row.platforms || [],
          platform: row.platforms?.[0] || 'steam',
          genres: row.genres || [],
          genre: row.genres?.[0] || 'action',
          description: row.description || '',
          shortDescription: row.short_description || '',
          developer: row.developer || '',
          publisher: row.publisher || '',
          releaseDate: row.release_date || '',
          rating: Number(row.rating) || 4.5,
          coverImage: row.cover_image || '',
          heroImage: row.hero_image || '',
          screenshots: row.screenshots || [],
          systemRequirements: row.system_requirements || getVerifiedSystemRequirements(row.slug) || undefined,
          status: 'available',
          featured: Boolean(row.featured),
          popular: Boolean(row.popular),
          badges: row.badges || [],
          searchableTags: row.searchable_tags || [],
        }));
        catalogRegistry.hydrateFromSupabase(mappedGames);
        console.log(`[CatalogService] Hydrated ${mappedGames.length} games from Supabase PostgreSQL.`);
      }
    })
    .catch((err: any) => {
      console.warn('[CatalogService] Supabase hydration notice:', err);
    });
}

export const catalogService = {
  /**
   * Retrieve all games in the active catalog.
   */
  getAllGames(): Game[] {
    return catalogRegistry.getAll();
  },

  /**
   * Find a game by its unique ID.
   */
  getGameById(id: string): Game | undefined {
    return catalogRegistry.getById(id);
  },

  /**
   * Find a game by its URL slug.
   */
  getGameBySlug(slug: string): Game | undefined {
    return catalogRegistry.getBySlug(slug);
  },

  /**
   * Flexible lookup matching either slug or id for backwards compatibility.
   */
  getGameByIdOrSlug(idOrSlug: string): Game | undefined {
    return catalogRegistry.getByIdOrSlug(idOrSlug);
  },

  /**
   * Search catalog across title, description, platform, genres, developer, publisher, and tags.
   */
  searchGames(query: string): Game[] {
    const all = catalogRegistry.getAll();
    if (!query || !query.trim()) return all;
    const q = query.toLowerCase().trim();

    return all.filter((game) => {
      const matchTitle = game.title.toLowerCase().includes(q);
      const matchDesc =
        game.description.toLowerCase().includes(q) ||
        (game.shortDescription && game.shortDescription.toLowerCase().includes(q));
      const matchDev = game.developer.toLowerCase().includes(q);
      const matchPub = game.publisher.toLowerCase().includes(q);
      const matchPlatform = game.platforms.some((p) => p.toLowerCase().includes(q));
      const matchGenre = game.genres.some((g) => g.toLowerCase().includes(q));
      const matchTags = game.searchableTags.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchDesc || matchDev || matchPub || matchPlatform || matchGenre || matchTags;
    });
  },

  /**
   * Composable multi-dimensional filtering for public store.
   */
  filterGames(filters: CatalogFilters): Game[] {
    const { searchQuery, platforms = [], genres = [], status = 'all', sortBy = 'featured' } = filters;

    let result = searchQuery && searchQuery.trim() ? this.searchGames(searchQuery) : catalogRegistry.getAll();

    // Filter by platforms
    if (platforms.length > 0) {
      result = result.filter((game) =>
        platforms.some((p) => game.platforms.includes(p) || game.platform === p)
      );
    }

    // Filter by genres
    if (genres.length > 0) {
      result = result.filter((game) =>
        genres.some((g) => game.genres.includes(g) || game.genre === g)
      );
    }

    // Filter by highlight status
    if (status === 'featured') {
      result = result.filter((game) => game.featured);
    } else if (status === 'popular') {
      result = result.filter((game) => game.popular);
    } else if (status === 'new') {
      result = result.filter((game) => game.badges.includes('NEW') || game.badge === 'NEW');
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.rating - a.rating;
      }
      if (sortBy === 'newest') {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      // 'featured'
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating;
    });

    return result;
  },

  /**
   * Get featured games for home spotlight.
   */
  getFeaturedGames(limit: number = 6): Game[] {
    return catalogRegistry.getAll().filter((game) => game.featured).slice(0, limit);
  },

  /**
   * Get popular games.
   */
  getPopularGames(limit: number = 6): Game[] {
    return catalogRegistry.getAll().filter((game) => game.popular).slice(0, limit);
  },

  /**
   * Get games by platform ID.
   */
  getGamesByPlatform(platform: PlatformId): Game[] {
    return catalogRegistry
      .getAll()
      .filter((game) => game.platform === platform || game.platforms.includes(platform));
  },

  /**
   * Get games by genre ID.
   */
  getGamesByGenre(genre: GenreId): Game[] {
    return catalogRegistry
      .getAll()
      .filter((game) => game.genre === genre || game.genres.includes(genre));
  },

  /**
   * Related games recommendation algorithm based on shared genres and platforms.
   */
  getRelatedGames(game: Game, limit: number = 4): Game[] {
    const scored = catalogRegistry
      .getAll()
      .filter((g) => g.id !== game.id && g.slug !== game.slug)
      .map((candidate) => {
        let score = 0;
        if (candidate.genre && candidate.genre === game.genre) score += 3;
        const sharedGenres = candidate.genres.filter((g) => game.genres.includes(g));
        score += sharedGenres.length * 2;
        if (candidate.platform && candidate.platform === game.platform) score += 1.5;
        if (candidate.developer && game.developer && candidate.developer.trim() && candidate.developer === game.developer) {
          score += 2.5;
        }
        if (candidate.publisher && game.publisher && candidate.publisher.trim() && candidate.publisher === game.publisher) {
          score += 2.0;
        }

        return { game: candidate, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || (b.game.popular ? 1 : 0) - (a.game.popular ? 1 : 0));

    return scored.slice(0, limit).map((item) => item.game);
  },

  // ================= ADMIN HELPERS ================= //

  /**
   * Returns calculated real-time catalog statistics.
   */
  getCatalogStats(): CatalogStats {
    return catalogRegistry.getStats();
  },

  /**
   * Adds a game to the active catalog, syncing to Supabase if configured.
   */
  async addGame(gameCandidate: any): Promise<{ success: boolean; game?: Game; error?: string }> {
    // 1. Server-boundary validation
    const validation = validateGameInput(gameCandidate);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const result = catalogRegistry.addGame(gameCandidate);
    if (!result.success || !result.game) return result;

    const newGame = result.game;

    // 2. Log admin mutation
    await auditService.logAction({
      action: 'GAME_CREATE',
      entityType: 'game',
      entityId: newGame.id,
      details: { title: newGame.title, slug: newGame.slug },
    });

    // 3. Sync to Supabase PostgreSQL with RLS
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('games').insert({
          id: newGame.id,
          slug: newGame.slug,
          title: newGame.title,
          platforms: newGame.platforms,
          genres: newGame.genres,
          description: newGame.description || '',
          short_description: newGame.shortDescription || '',
          developer: newGame.developer || '',
          publisher: newGame.publisher || '',
          release_date: newGame.releaseDate || '',
          rating: newGame.rating || 4.5,
          cover_image: newGame.coverImage || '',
          hero_image: newGame.heroImage || '',
          screenshots: newGame.screenshots || [],
          featured: newGame.featured || false,
          popular: newGame.popular || false,
          badges: newGame.badges || [],
          searchable_tags: newGame.searchableTags || [],
          system_requirements: newGame.systemRequirements || null,
        });

        if (error) {
          console.error('[CatalogService] Supabase insert error:', error.message);
          catalogRegistry.removeGame(newGame.id);
          return { success: false, error: `Database error: ${error.message}` };
        }
      } catch (err: any) {
        console.warn('[CatalogService] Supabase insert exception:', err.message);
      }
    }

    return result;
  },

  /**
   * Updates an existing game in the active catalog, syncing to Supabase if configured.
   */
  async updateGame(id: string, updates: Partial<Game>): Promise<{ success: boolean; game?: Game; error?: string }> {
    const existing = catalogRegistry.getById(id);
    if (!existing) {
      return { success: false, error: `Game with ID "${id}" not found.` };
    }

    // Server-boundary validation
    const candidateToValidate = { ...existing, ...updates };
    const validation = validateGameInput(candidateToValidate);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const result = catalogRegistry.updateGame(id, updates);
    if (!result.success || !result.game) return result;

    const updatedGame = result.game;

    // Log admin mutation
    await auditService.logAction({
      action: 'GAME_UPDATE',
      entityType: 'game',
      entityId: updatedGame.id,
      details: { title: updatedGame.title, updates: Object.keys(updates) },
    });

    // Sync to Supabase PostgreSQL with RLS
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('games')
          .update({
            title: updatedGame.title,
            slug: updatedGame.slug,
            platforms: updatedGame.platforms,
            genres: updatedGame.genres,
            description: updatedGame.description || '',
            short_description: updatedGame.shortDescription || '',
            developer: updatedGame.developer || '',
            publisher: updatedGame.publisher || '',
            release_date: updatedGame.releaseDate || '',
            rating: updatedGame.rating || 4.5,
            cover_image: updatedGame.coverImage || '',
            hero_image: updatedGame.heroImage || '',
            screenshots: updatedGame.screenshots || [],
            featured: updatedGame.featured || false,
            popular: updatedGame.popular || false,
            badges: updatedGame.badges || [],
            searchable_tags: updatedGame.searchableTags || [],
            system_requirements: updatedGame.systemRequirements || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          console.error('[CatalogService] Supabase update error:', error.message);
          return { success: false, error: `Database error: ${error.message}` };
        }
      } catch (err: any) {
        console.warn('[CatalogService] Supabase update exception:', err.message);
      }
    }

    return result;
  },

  /**
   * Removes a game from the active catalog, syncing to Supabase if configured.
   */
  async removeGame(id: string): Promise<{ success: boolean; error?: string }> {
    const existing = catalogRegistry.getById(id);
    const result = catalogRegistry.removeGame(id);
    if (!result.success) return result;

    // Log admin mutation
    await auditService.logAction({
      action: 'GAME_DELETE',
      entityType: 'game',
      entityId: id,
      details: { title: existing?.title || id },
    });

    // Sync to Supabase PostgreSQL with RLS
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('games')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('[CatalogService] Supabase delete error:', error.message);
        }
      } catch (err: any) {
        console.warn('[CatalogService] Supabase delete exception:', err.message);
      }
    }

    return result;
  },

  /**
   * Bulk imports validated games with batch auditing.
   */
  async bulkImportGames(games: any[]): Promise<{ success: boolean; inserted: number; errors: string[] }> {
    const errors: string[] = [];
    let inserted = 0;

    for (const item of games) {
      const res = await this.addGame(item);
      if (res.success) {
        inserted++;
      } else if (res.error) {
        errors.push(`${item.title || 'Unknown'}: ${res.error}`);
      }
    }

    if (inserted > 0) {
      await auditService.logAction({
        action: 'CATALOG_BULK_IMPORT',
        entityType: 'catalog',
        entityId: `batch_${Date.now()}`,
        details: { insertedCount: inserted, errorCount: errors.length },
      });
    }

    return {
      success: inserted > 0,
      inserted,
      errors,
    };
  },

  /**
   * Exports approved catalog metadata to CSV format.
   */
  async exportCatalogCSV(): Promise<string> {
    const allGames = catalogRegistry.getAll();
    const csv = generateCatalogCSV(allGames);

    await auditService.logAction({
      action: 'CATALOG_EXPORT',
      entityType: 'catalog',
      entityId: `export_${Date.now()}`,
      details: { exportedCount: allGames.length },
    });

    return csv;
  },

  /**
   * Search for admin table with specific criteria.
   */
  searchCatalogAdmin(
    query: string,
    filters: { platform?: string; genre?: string; status?: string } = {}
  ): Game[] {
    let list = this.searchGames(query);

    if (filters.platform && filters.platform !== 'ALL') {
      list = list.filter((g) => g.platforms.includes(filters.platform as PlatformId) || g.platform === filters.platform);
    }

    if (filters.genre && filters.genre !== 'ALL') {
      list = list.filter((g) => g.genres.includes(filters.genre as GenreId) || g.genre === filters.genre);
    }

    if (filters.status && filters.status !== 'ALL') {
      if (filters.status === 'featured') list = list.filter((g) => g.featured);
      else if (filters.status === 'popular') list = list.filter((g) => g.popular);
      else if (filters.status === 'new') list = list.filter((g) => g.badges.includes('NEW') || g.badge === 'NEW');
    }

    return list;
  },
};
