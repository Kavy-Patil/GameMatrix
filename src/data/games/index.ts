import { Game } from '../../types/game';
import { IMPORTED_GAMES } from '../catalog/importedGames';

export const ALL_GAMES: Game[] = IMPORTED_GAMES;

// Indexed maps for O(1) lookups
export const GAMES_BY_ID: Map<string, Game> = new Map(
  ALL_GAMES.map((game) => [game.id, game])
);

export const GAMES_BY_SLUG: Map<string, Game> = new Map(
  ALL_GAMES.map((game) => [game.slug, game])
);
