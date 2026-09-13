export type ArtworkSource =
  | 'catalog'
  | 'steam'
  | 'publisher'
  | 'epic'
  | 'ea'
  | 'ubisoft'
  | 'rockstar'
  | 'battlenet'
  | 'gog'
  | 'local'
  | 'fallback';

export interface ArtworkEntry {
  slug: string;
  title: string;
  coverImage: string;
  heroImage?: string;
  source: ArtworkSource;
  verified: boolean;
  appId?: number | string;
  lastChecked?: string;
}

export type GameArtworkMap = Record<string, ArtworkEntry>;

export interface ArtworkReport {
  totalGames: number;
  existingValidArtwork: number;
  automaticallyResolved: number;
  steamArtworkResolved: number;
  otherVerifiedArtwork: number;
  failedResolution: number;
  fallbackRequired: number;
  brokenUrlsRemoved: number;
  invalidUrlsRemoved: number;
  verifiedTitles: string[];
  fallbackTitles: string[];
}
