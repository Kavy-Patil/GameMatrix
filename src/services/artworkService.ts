import { Game } from '../types/game';
import { ArtworkEntry } from '../data/artwork/types';
import { GAME_ARTWORK_MAP } from '../data/artwork/gameArtwork';
import { isValidArtworkUrl } from '../utils/security';
import { catalogService } from './catalogService';
import { auditService } from './auditService';

export const artworkService = {
  /**
   * Look up resolved artwork metadata for a game slug.
   */
  getArtwork(slug: string): ArtworkEntry | undefined {
    return GAME_ARTWORK_MAP[slug];
  },

  /**
   * Returns a valid cover image URL for a game, cascading through:
   * 1. Existing valid coverImage on the game object
   * 2. Resolved, verified artwork from GAME_ARTWORK_MAP
   * 3. Empty string if genuine fallback is required
   */
  getCoverUrl(game: Game): string {
    if (game.coverImage && game.coverImage.trim() !== '') {
      return game.coverImage;
    }

    const entry = GAME_ARTWORK_MAP[game.slug];
    if (entry && entry.verified && entry.coverImage) {
      return entry.coverImage;
    }

    return '';
  },

  /**
   * Returns a valid hero/wide banner image URL for a game.
   */
  getHeroUrl(game: Game): string {
    if (game.heroImage && game.heroImage.trim() !== '') {
      return game.heroImage;
    }

    const entry = GAME_ARTWORK_MAP[game.slug];
    if (entry && entry.verified) {
      return entry.heroImage || entry.coverImage || '';
    }

    if (game.coverImage && game.coverImage.trim() !== '') {
      return game.coverImage;
    }

    return '';
  },

  /**
   * Artwork status for administrative inspection and filtering.
   * Returns: 'VERIFIED' | 'FALLBACK' | 'MISSING'
   */
  getArtworkStatus(gameOrSlug: Game | string): 'VERIFIED' | 'FALLBACK' | 'MISSING' {
    const slug = typeof gameOrSlug === 'string' ? gameOrSlug : gameOrSlug.slug;
    if (typeof gameOrSlug !== 'string' && gameOrSlug.coverImage && gameOrSlug.coverImage.trim() !== '') {
      return 'VERIFIED';
    }
    const entry = GAME_ARTWORK_MAP[slug];
    if (!entry) return 'MISSING';
    if (entry.verified && entry.coverImage) return 'VERIFIED';
    return 'FALLBACK';
  },

  /**
   * Checks if artwork is verified.
   */
  isVerified(gameOrSlug: Game | string): boolean {
    return this.getArtworkStatus(gameOrSlug) === 'VERIFIED';
  },

  /**
   * Updates game artwork with strict protocol validation and audit logging.
   */
  async updateGameArtwork(
    gameId: string,
    coverUrl: string,
    heroUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isValidArtworkUrl(coverUrl)) {
      return {
        success: false,
        error: 'Invalid artwork URL: Must use a safe protocol (https:// or approved path).',
      };
    }

    if (heroUrl && heroUrl.trim() !== '' && !isValidArtworkUrl(heroUrl)) {
      return {
        success: false,
        error: 'Invalid hero artwork URL: Must use a safe protocol (https:// or approved path).',
      };
    }

    const res = await catalogService.updateGame(gameId, {
      coverImage: coverUrl.trim(),
      heroImage: heroUrl && heroUrl.trim() !== '' ? heroUrl.trim() : coverUrl.trim(),
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    await auditService.logAction({
      action: 'ARTWORK_UPDATE',
      entityType: 'artwork',
      entityId: gameId,
      details: { coverUrl, heroUrl },
    });

    return { success: true };
  },

  /**
   * Calculates genuine real-data artwork health across the active catalog.
   */
  getArtworkHealthBreakdown(games: Game[]) {
    const total = games.length;
    let verified = 0;
    let fallback = 0;
    let missing = 0;

    for (const game of games) {
      const status = this.getArtworkStatus(game);
      if (status === 'VERIFIED') verified++;
      else if (status === 'FALLBACK') fallback++;
      else missing++;
    }

    return {
      total,
      verified,
      fallback,
      missing,
      percentage: total > 0 ? Math.round((verified / total) * 100) : 0,
    };
  },

  /**
   * Summary metrics across active artwork catalog map.
   */
  getStats() {
    const entries = Object.values(GAME_ARTWORK_MAP);
    const total = entries.length;
    const verified = entries.filter((e) => e.verified && e.coverImage).length;
    const fallback = total - verified;
    const steam = entries.filter((e) => e.source === 'steam' && e.verified).length;
    const other = entries.filter((e) => e.source !== 'steam' && e.verified).length;

    return {
      total,
      verified,
      fallback,
      steam,
      other,
      percentage: total > 0 ? Math.round((verified / total) * 100) : 0,
    };
  },
};
