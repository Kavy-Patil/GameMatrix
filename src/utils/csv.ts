import { Game, PlatformId, GenreId, SystemRequirements } from '../types/game';
import { PLATFORMS } from '../data/platforms';
import { GENRES } from '../data/genres';
import { checkForForbiddenCommercialFields, isValidArtworkUrl } from './security';

export interface CsvRowError {
  rowNumber: number;
  title: string;
  field?: string;
  message: string;
}

export interface ParsedCsvGame {
  id: string;
  slug: string;
  title: string;
  platform: PlatformId;
  platforms: PlatformId[];
  genre: GenreId;
  genres: GenreId[];
  description?: string;
  shortDescription?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  coverImage?: string;
  heroImage?: string;
  featured?: boolean;
  popular?: boolean;
  systemRequirements?: SystemRequirements;
}

export interface CsvParseResult {
  success: boolean;
  fatalError?: string;
  totalRows: number;
  validGames: ParsedCsvGame[];
  errors: CsvRowError[];
}

const VALID_PLATFORM_IDS = new Set<string>(PLATFORMS.map((p) => p.id));
const VALID_GENRE_IDS = new Set<string>(GENRES.map((g) => g.id));

/**
 * Parses raw CSV text into a 2D array of string cells, following RFC 4180.
 */
export function parseCsvToGrid(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;
  let i = 0;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i += 2;
        continue;
      }
      insideQuotes = !insideQuotes;
      i++;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
      i++;
      continue;
    }

    if (char === '\n' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
      i++;
      continue;
    }

    currentCell += char;
    i++;
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Generates a clean URL slug from title and primary platform.
 */
export function generateSlug(title: string, platform?: string): string {
  let base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!base) base = 'game-title';

  if (platform && platform !== 'other' && !base.includes(platform)) {
    return `${base}-${platform}`;
  }
  return base;
}

/**
 * Validates and parses an uploaded GameVault CSV file.
 * Strictly verifies headers and halts if ANY forbidden price/stock/inventory column is found.
 */
export function parseAndValidateCatalogCsv(
  csvContent: string,
  existingGames: Game[] = []
): CsvParseResult {
  const grid = parseCsvToGrid(csvContent);
  if (grid.length < 2) {
    return {
      success: false,
      fatalError: 'CSV file is empty or missing data rows.',
      totalRows: 0,
      validGames: [],
      errors: [],
    };
  }

  const rawHeaders = grid[0];
  const headers = rawHeaders.map((h) => h.toLowerCase().trim().replace(/[\s\-_]/g, ''));

  // 1. FATAL REJECTION: Check for forbidden commercial columns
  for (const rawHeader of rawHeaders) {
    const check = checkForForbiddenCommercialFields({ [rawHeader]: 'dummy' });
    if (check.forbidden) {
      return {
        success: false,
        fatalError: `REJECTED: Forbidden column "${rawHeader}" detected. GameVault operates strictly as a zero-price, zero-stock digital catalog. CSV files containing pricing or inventory columns cannot be imported.`,
        totalRows: grid.length - 1,
        validGames: [],
        errors: [
          {
            rowNumber: 1,
            title: 'Header Row',
            field: rawHeader,
            message: `Column "${rawHeader}" violates Zero-Price & Zero-Inventory policy.`,
          },
        ],
      };
    }
  }

  // Find column indices
  const titleIdx = headers.findIndex((h) => h === 'title' || h === 'gametitle' || h === 'name');
  if (titleIdx === -1) {
    return {
      success: false,
      fatalError: 'CSV missing required "title" column in header row.',
      totalRows: grid.length - 1,
      validGames: [],
      errors: [],
    };
  }

  const platformIdx = headers.findIndex((h) => h === 'platform' || h === 'launcher' || h === 'platforms');
  const genreIdx = headers.findIndex((h) => h === 'genre' || h === 'category' || h === 'genres');
  const idIdx = headers.findIndex((h) => h === 'id' || h === 'gameid');
  const slugIdx = headers.findIndex((h) => h === 'slug');
  const descIdx = headers.findIndex((h) => h === 'description' || h === 'desc');
  const shortDescIdx = headers.findIndex((h) => h === 'shortdescription' || h === 'tagline');
  const devIdx = headers.findIndex((h) => h === 'developer' || h === 'dev');
  const pubIdx = headers.findIndex((h) => h === 'publisher' || h === 'pub');
  const dateIdx = headers.findIndex((h) => h === 'releasedate' || h === 'release_date' || h === 'year');
  const coverIdx = headers.findIndex((h) => h === 'coverimage' || h === 'cover_image' || h === 'image' || h === 'artwork' || h === 'artworkurl');
  const heroIdx = headers.findIndex((h) => h === 'heroimage' || h === 'hero_image' || h === 'banner');

  // Optional System Requirement Column Indices
  const minOsIdx = headers.findIndex((h) => h === 'minos' || h === 'min_os');
  const minCpuIdx = headers.findIndex((h) => h === 'minprocessor' || h === 'min_processor' || h === 'mincpu' || h === 'min_cpu');
  const minMemIdx = headers.findIndex((h) => h === 'minmemory' || h === 'min_memory' || h === 'minram' || h === 'min_ram');
  const minGpuIdx = headers.findIndex((h) => h === 'mingraphics' || h === 'min_graphics' || h === 'mingpu' || h === 'min_gpu');
  const minDxIdx = headers.findIndex((h) => h === 'mindirectx' || h === 'min_directx' || h === 'mindx' || h === 'min_dx');
  const minStorageIdx = headers.findIndex((h) => h === 'minstorage' || h === 'min_storage' || h === 'mindisk' || h === 'min_disk');
  const minNotesIdx = headers.findIndex((h) => h === 'minnotes' || h === 'min_notes' || h === 'minadditionalnotes' || h === 'min_additional_notes');

  const recOsIdx = headers.findIndex((h) => h === 'recos' || h === 'rec_os');
  const recCpuIdx = headers.findIndex((h) => h === 'recprocessor' || h === 'rec_processor' || h === 'reccpu' || h === 'rec_cpu');
  const recMemIdx = headers.findIndex((h) => h === 'recmemory' || h === 'rec_memory' || h === 'recram' || h === 'rec_ram');
  const recGpuIdx = headers.findIndex((h) => h === 'recgraphics' || h === 'rec_graphics' || h === 'recgpu' || h === 'rec_gpu');
  const recDxIdx = headers.findIndex((h) => h === 'recdirectx' || h === 'rec_directx' || h === 'recdx' || h === 'rec_dx');
  const recStorageIdx = headers.findIndex((h) => h === 'recstorage' || h === 'rec_storage' || h === 'recdisk' || h === 'rec_disk');
  const recNotesIdx = headers.findIndex((h) => h === 'recnotes' || h === 'rec_notes' || h === 'recadditionalnotes' || h === 'rec_additional_notes');

  const validGames: ParsedCsvGame[] = [];
  const errors: CsvRowError[] = [];

  const existingSlugs = new Set<string>(existingGames.map((g) => g.slug.toLowerCase()));
  const existingIds = new Set<string>(existingGames.map((g) => g.id.toLowerCase()));

  const fileSlugs = new Set<string>();
  const fileIds = new Set<string>();

  for (let r = 1; r < grid.length; r++) {
    const rowNumber = r + 1;
    const row = grid[r];
    const title = (row[titleIdx] || '').trim();

    if (!title) {
      errors.push({
        rowNumber,
        title: '(Empty)',
        field: 'title',
        message: 'Game title cannot be blank.',
      });
      continue;
    }

    // Platform validation (supports single value or delimited: steam,epic or steam;epic)
    const rawPlatformCell = platformIdx !== -1 ? (row[platformIdx] || '').toLowerCase().trim() : 'other';
    const splitPlatforms = rawPlatformCell
      ? rawPlatformCell.split(/[,;|]/).map((p) => p.trim().toLowerCase()).filter(Boolean)
      : ['other'];

    const invalidPlatforms = splitPlatforms.filter((p) => !VALID_PLATFORM_IDS.has(p));
    if (invalidPlatforms.length > 0) {
      errors.push({
        rowNumber,
        title,
        field: 'platform',
        message: `Invalid platform "${invalidPlatforms.join(', ')}". Must be one of: ${Array.from(VALID_PLATFORM_IDS).join(', ')}.`,
      });
      continue;
    }

    const parsedPlatforms = (splitPlatforms.length > 0 ? splitPlatforms : ['other']) as PlatformId[];
    const primaryPlatform = parsedPlatforms[0];

    // Genre validation (supports single value or delimited: action,rpg or action;rpg)
    const rawGenreCell = genreIdx !== -1 ? (row[genreIdx] || '').toLowerCase().trim() : 'action';
    const splitGenres = rawGenreCell
      ? rawGenreCell.split(/[,;|]/).map((g) => g.trim().toLowerCase()).filter(Boolean)
      : ['action'];

    const invalidGenres = splitGenres.filter((g) => !VALID_GENRE_IDS.has(g));
    if (invalidGenres.length > 0) {
      errors.push({
        rowNumber,
        title,
        field: 'genre',
        message: `Invalid genre "${invalidGenres.join(', ')}". Must be one of: ${Array.from(VALID_GENRE_IDS).join(', ')}.`,
      });
      continue;
    }

    const parsedGenres = (splitGenres.length > 0 ? splitGenres : ['action']) as GenreId[];
    const primaryGenre = parsedGenres[0];

    // Slug generation and collision check
    let slug = slugIdx !== -1 && row[slugIdx] ? row[slugIdx].trim().toLowerCase() : generateSlug(title, primaryPlatform);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      slug = generateSlug(title, primaryPlatform);
    }

    if (fileSlugs.has(slug)) {
      errors.push({
        rowNumber,
        title,
        field: 'slug',
        message: `Duplicate slug "${slug}" found within uploaded CSV file.`,
      });
      continue;
    }
    if (existingSlugs.has(slug)) {
      errors.push({
        rowNumber,
        title,
        field: 'slug',
        message: `Slug "${slug}" already exists in the canonical GameVault catalog.`,
      });
      continue;
    }

    // ID generation and collision check
    let id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim().toLowerCase() : `gv-${slug}`;
    if (fileIds.has(id)) {
      errors.push({
        rowNumber,
        title,
        field: 'id',
        message: `Duplicate ID "${id}" found within uploaded CSV file.`,
      });
      continue;
    }
    if (existingIds.has(id)) {
      errors.push({
        rowNumber,
        title,
        field: 'id',
        message: `Game ID "${id}" already exists in the canonical GameVault catalog.`,
      });
      continue;
    }

    // Artwork validation
    const coverImage = coverIdx !== -1 ? (row[coverIdx] || '').trim() : '';
    const heroImage = heroIdx !== -1 ? (row[heroIdx] || '').trim() : '';

    if (coverImage && !isValidArtworkUrl(coverImage)) {
      errors.push({
        rowNumber,
        title,
        field: 'coverImage',
        message: `Unsafe cover artwork URL protocol: "${coverImage}". Only https:// or approved paths are allowed.`,
      });
      continue;
    }
    if (heroImage && !isValidArtworkUrl(heroImage)) {
      errors.push({
        rowNumber,
        title,
        field: 'heroImage',
        message: `Unsafe hero artwork URL protocol: "${heroImage}". Only https:// or approved paths are allowed.`,
      });
      continue;
    }

    // Record slug and ID to prevent duplicates
    fileSlugs.add(slug);
    fileIds.add(id);

    // Optional System Requirements Parsing
    const buildSpec = (osIdx: number, cpuIdx: number, memIdx: number, gpuIdx: number, dxIdx: number, storageIdx: number, notesIdx: number) => {
      const os = osIdx !== -1 && row[osIdx] ? row[osIdx].trim() : '';
      const processor = cpuIdx !== -1 && row[cpuIdx] ? row[cpuIdx].trim() : '';
      const memory = memIdx !== -1 && row[memIdx] ? row[memIdx].trim() : '';
      const graphics = gpuIdx !== -1 && row[gpuIdx] ? row[gpuIdx].trim() : '';
      const directX = dxIdx !== -1 && row[dxIdx] ? row[dxIdx].trim() : '';
      const storage = storageIdx !== -1 && row[storageIdx] ? row[storageIdx].trim() : '';
      const additionalNotes = notesIdx !== -1 && row[notesIdx] ? row[notesIdx].trim() : '';

      const spec: Record<string, string> = {};
      if (os) spec.os = os;
      if (processor) spec.processor = processor;
      if (memory) spec.memory = memory;
      if (graphics) spec.graphics = graphics;
      if (directX) spec.directX = directX;
      if (storage) spec.storage = storage;
      if (additionalNotes) spec.additionalNotes = additionalNotes;
      return Object.keys(spec).length > 0 ? spec : undefined;
    };

    const minSpec = buildSpec(minOsIdx, minCpuIdx, minMemIdx, minGpuIdx, minDxIdx, minStorageIdx, minNotesIdx);
    const recSpec = buildSpec(recOsIdx, recCpuIdx, recMemIdx, recGpuIdx, recDxIdx, recStorageIdx, recNotesIdx);

    const systemRequirements = (minSpec || recSpec) ? {
      minimum: minSpec,
      recommended: recSpec,
    } : undefined;

    validGames.push({
      id,
      slug,
      title,
      platform: primaryPlatform,
      platforms: parsedPlatforms,
      genre: primaryGenre,
      genres: parsedGenres,
      description: descIdx !== -1 ? (row[descIdx] || '').trim() : '',
      shortDescription: shortDescIdx !== -1 ? (row[shortDescIdx] || '').trim() : '',
      developer: devIdx !== -1 ? (row[devIdx] || '').trim() : '',
      publisher: pubIdx !== -1 ? (row[pubIdx] || '').trim() : '',
      releaseDate: dateIdx !== -1 ? (row[dateIdx] || '').trim() : '',
      coverImage,
      heroImage,
      featured: false,
      popular: false,
      systemRequirements,
    });
  }

  return {
    success: errors.length === 0,
    totalRows: grid.length - 1,
    validGames,
    errors,
  };
}

/**
 * Exports approved catalog metadata to CSV format.
 * STRICT PRIVACY: Zero passwords, sessions, secrets, or enquiry records are ever included.
 */
export function generateCatalogCSV(games: Game[]): string {
  const headers = [
    'id',
    'title',
    'slug',
    'platform',
    'platforms',
    'genre',
    'genres',
    'developer',
    'publisher',
    'release_date',
    'rating',
    'short_description',
    'cover_image',
    'hero_image',
    'min_os',
    'min_processor',
    'min_memory',
    'min_graphics',
    'min_directx',
    'min_storage',
    'min_notes',
    'rec_os',
    'rec_processor',
    'rec_memory',
    'rec_graphics',
    'rec_directx',
    'rec_storage',
    'rec_notes',
  ];

  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '';
    let str = Array.isArray(val) ? val.join(';') : String(val);
    
    // CSV Formula Injection (CWE-1236) defense:
    // If field starts with =, +, -, @, \t, or \r, prefix with a single quote
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }

    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.join(',')];

  for (const game of games) {
    const row = [
      escapeCell(game.id),
      escapeCell(game.title),
      escapeCell(game.slug),
      escapeCell(game.platform),
      escapeCell(game.platforms),
      escapeCell(game.genre),
      escapeCell(game.genres),
      escapeCell(game.developer || ''),
      escapeCell(game.publisher || ''),
      escapeCell(game.releaseDate || ''),
      escapeCell(game.rating > 0 ? game.rating : ''),
      escapeCell(game.shortDescription || game.tagline || ''),
      escapeCell(game.coverImage || ''),
      escapeCell(game.heroImage || ''),
      escapeCell(game.systemRequirements?.minimum?.os || ''),
      escapeCell(game.systemRequirements?.minimum?.processor || ''),
      escapeCell(game.systemRequirements?.minimum?.memory || ''),
      escapeCell(game.systemRequirements?.minimum?.graphics || ''),
      escapeCell(game.systemRequirements?.minimum?.directX || ''),
      escapeCell(game.systemRequirements?.minimum?.storage || ''),
      escapeCell(game.systemRequirements?.minimum?.additionalNotes || ''),
      escapeCell(game.systemRequirements?.recommended?.os || ''),
      escapeCell(game.systemRequirements?.recommended?.processor || ''),
      escapeCell(game.systemRequirements?.recommended?.memory || ''),
      escapeCell(game.systemRequirements?.recommended?.graphics || ''),
      escapeCell(game.systemRequirements?.recommended?.directX || ''),
      escapeCell(game.systemRequirements?.recommended?.storage || ''),
      escapeCell(game.systemRequirements?.recommended?.additionalNotes || ''),
    ];
    lines.push(row.join(','));
  }

  return lines.join('\r\n');
}
