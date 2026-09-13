import { Game, PlatformId, GenreId, SystemRequirements, PromoBadge } from '../../types/game';

/**
 * Standardized schema format for importing raw game catalog data into GameVault.
 * Designed to scale to hundreds or thousands of products without manual React components.
 *
 * NOTE: Strictly excludes price, currency, stock, or credential fields.
 */
export interface CatalogGameImport {
  id: string;
  slug: string;
  title: string;
  platforms: PlatformId[];
  genres: GenreId[];
  developer: string;
  publisher: string;
  releaseDate: string;
  shortDescription: string;
  description: string;
  detailedDescription?: string;
  coverImage: string;
  heroImage: string;
  screenshots: string[];
  systemRequirements?: SystemRequirements;
  badges?: PromoBadge[];
  featured?: boolean;
  popular?: boolean;
  rating?: number;
  searchableTags: string[];
}

/**
 * Metadata recorded for catalog import batches.
 */
export interface CatalogImportBatch {
  batchId: string;
  importedAt: string;
  source: string;
  gamesCount: number;
  version: string;
  isCompleteCatalog: boolean;
}

/**
 * Real-time calculated catalog statistics.
 */
export interface CatalogStats {
  totalGames: number;
  totalPlatforms: number;
  totalGenres: number;
  featuredCount: number;
  popularCount: number;
  newCount: number;
  platformDistribution: Record<PlatformId, number>;
  genreDistribution: Record<GenreId, number>;
  isCompleteCatalog: boolean;
  developmentTitlesCount: number;
  realImportedCount: number;
}

/**
 * Validation result for catalog import batches.
 */
export interface CatalogValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  acceptedCount: number;
  rejectedCount: number;
}
