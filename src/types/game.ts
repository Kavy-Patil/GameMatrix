export type PlatformId =
  | 'steam'
  | 'epic'
  | 'rockstar'
  | 'ea'
  | 'ubisoft'
  | 'gog'
  | 'battlenet'
  | 'other';

export type GenreId =
  | 'action'
  | 'adventure'
  | 'rpg'
  | 'fps'
  | 'racing'
  | 'sports'
  | 'strategy'
  | 'horror'
  | 'simulation'
  | 'puzzle'
  | 'sandbox'
  | 'survival'
  | 'indie';

export type GameStatus = 'Available' | 'Pre-Order' | 'Early Access';

export type PromoBadge = 'LIMITED OFFER' | 'POPULAR' | 'BESTSELLER' | 'NEW' | 'FEATURED';

export interface SystemSpec {
  os?: string;
  processor?: string;
  memory?: string;
  graphics?: string;
  directX?: string;
  storage?: string;
  additionalNotes?: string;
}

export interface SystemRequirements {
  minimum?: SystemSpec;
  recommended?: SystemSpec;
  requirementsSource?: 'Steam' | 'Official publisher' | 'REQUIREMENTS_UNAVAILABLE';
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  tagline?: string;
  description: string;
  detailedDescription?: string;
  platform: PlatformId;
  platforms: PlatformId[];
  genre: GenreId;
  genres: GenreId[];
  developer: string;
  publisher: string;
  releaseDate: string;
  coverImage: string;
  heroImage: string;
  screenshots: string[];
  systemRequirements?: SystemRequirements;
  status: GameStatus;
  badges: PromoBadge[];
  badge?: PromoBadge;
  featured: boolean;
  popular: boolean;
  searchableTags: string[];
  tags?: string[];
  rating: number;
}

export type SortOption = 'featured' | 'popular' | 'newest' | 'alphabetical';

export interface CatalogFilters {
  searchQuery?: string;
  platforms?: PlatformId[];
  genres?: GenreId[];
  status?: 'all' | 'featured' | 'popular' | 'new';
  sortBy?: SortOption;
}

// Backwards compatibility aliases
export type Platform = PlatformId;
export type Genre = GenreId;
export type FilterState = {
  searchQuery: string;
  selectedPlatforms: PlatformId[];
  selectedGenres: GenreId[];
  statusFilter: 'all' | 'featured' | 'popular' | 'new';
  sortBy: SortOption;
};
