/**
 * Security, Anti-Abuse, and Validation Utilities for GameVault
 * Phase 6 Security Hardening Pass
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const submissionTracker = new Map<string, RateLimitRecord>();

/**
 * Client-boundary submission rate limiter.
 * Limits enquiries to max 3 submissions per 60 seconds per browser session.
 */
export function checkSubmissionRateLimit(sessionId: string = 'global_client'): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxSubmissions = 3;

  const record = submissionTracker.get(sessionId);

  if (!record || now > record.resetTime) {
    submissionTracker.set(sessionId, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxSubmissions) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfterSeconds: retryAfter };
  }

  record.count += 1;
  return { allowed: true };
}

/**
 * Robust string sanitization to neutralize XSS, script injections, and HTML markup.
 * Strips script tags, HTML tags, javascript: schemes, and null characters.
 */
export function sanitizeInput(str: string): string {
  if (!str) return '';
  return str
    .replace(/\0/g, '') // Null byte protection
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip complete <script>...</script> blocks
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Strip complete <style>...</style> blocks
    .replace(/<[^>]*>?/gm, '') // Strip all remaining HTML tags
    .replace(/javascript:/gi, '') // Strip inline javascript: schemes
    .replace(/vbscript:/gi, '') // Strip inline vbscript: schemes
    .replace(/on\w+\s*=/gi, '') // Strip event handlers like onclick=, onerror=
    .trim();
}

/**
 * Artwork and image URL validator.
 * Strictly verifies URL scheme to prevent javascript:, vbscript:, or executable content.
 */
export function isValidArtworkUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();

  // Explicitly deny dangerous schemes
  if (/^(javascript|vbscript|file|data:(?!image\/))/i.test(trimmed)) {
    return false;
  }

  // Accept valid relative paths or safe image data URLs
  if (trimmed.startsWith('/') || trimmed.startsWith('data:image/')) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    // Reject plain HTTP to prevent mixed content in HTTPS production
    if (parsed.protocol !== 'https:') {
      return false;
    }
    // Reject credential-bearing URLs (e.g. https://user:pass@evil.com)
    if (parsed.username || parsed.password) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates enquiry input fields against server-boundary length, format, and enum rules.
 */
export function validateEnquiryInput(input: {
  customerName: string;
  contactValue: string;
  gameTitle: string;
  gameId?: string;
  platform?: string;
  contactMethod?: string;
  message?: string;
}): { valid: boolean; error?: string } {
  // 1. Name validation
  if (!input.customerName || input.customerName.trim().length < 2) {
    return { valid: false, error: 'Full name must be at least 2 characters.' };
  }
  if (input.customerName.length > 100) {
    return { valid: false, error: 'Full name exceeds 100 characters limit.' };
  }
  if (/<script/i.test(input.customerName) || /javascript:/i.test(input.customerName)) {
    return { valid: false, error: 'Full name contains invalid or unsafe characters.' };
  }

  // 2. Contact value validation
  if (!input.contactValue || input.contactValue.trim().length < 3) {
    return { valid: false, error: 'Contact detail must be at least 3 characters.' };
  }
  if (input.contactValue.length > 120) {
    return { valid: false, error: 'Contact detail exceeds 120 characters limit.' };
  }

  // 3. Contact method enum validation
  if (input.contactMethod) {
    const validMethods = ['whatsapp', 'email', 'discord', 'telegram'];
    if (!validMethods.includes(input.contactMethod.toLowerCase())) {
      return { valid: false, error: 'Invalid contact method selected.' };
    }
  }

  // 4. Game Reference validation
  if (!input.gameTitle || input.gameTitle.trim().length === 0) {
    return { valid: false, error: 'Game title reference is required.' };
  }
  if (input.gameId && !/^[a-zA-Z0-9_\-]+$/.test(input.gameId)) {
    return { valid: false, error: 'Malformed game identifier.' };
  }

  // 5. Message length & safety
  if (input.message && input.message.length > 2000) {
    return { valid: false, error: 'Message exceeds 2,000 characters limit.' };
  }

  return { valid: true };
}

/**
 * Admin Login Brute-Force Throttler
 * Locks login attempts after 5 consecutive failures for 60 seconds.
 */
interface LoginThrottle {
  attempts: number;
  lockedUntil: number;
}

const loginThrottle: LoginThrottle = {
  attempts: 0,
  lockedUntil: 0,
};

export function checkAdminLoginThrottle(): {
  allowed: boolean;
  remainingLockSeconds?: number;
} {
  const now = Date.now();
  if (now < loginThrottle.lockedUntil) {
    const remaining = Math.ceil((loginThrottle.lockedUntil - now) / 1000);
    return { allowed: false, remainingLockSeconds: remaining };
  }
  return { allowed: true };
}

export function recordFailedAdminLogin(): { locked: boolean; remainingLockSeconds?: number } {
  const now = Date.now();
  if (now < loginThrottle.lockedUntil) {
    const remaining = Math.ceil((loginThrottle.lockedUntil - now) / 1000);
    return { locked: true, remainingLockSeconds: remaining };
  }

  loginThrottle.attempts += 1;
  if (loginThrottle.attempts >= 5) {
    loginThrottle.lockedUntil = now + 60 * 1000; // 60 seconds lockout
    loginThrottle.attempts = 0;
    return { locked: true, remainingLockSeconds: 60 };
  }

  return { locked: false };
}

export function resetAdminLoginThrottle(): void {
  loginThrottle.attempts = 0;
  loginThrottle.lockedUntil = 0;
}

/**
 * Forbidden commercial field keys that violate the Zero-Price & Zero-Inventory policy.
 */
export const FORBIDDEN_COMMERCIAL_FIELDS = [
  'price',
  'cost',
  'discount',
  'stock',
  'inventory',
  'quantity',
  'qty',
  'availability',
  'is_in_stock',
  'in_stock',
  'out_of_stock',
  'checkout',
  'payment',
  'order_total',
] as const;

/**
 * Inspects any object or header set for forbidden commercial fields.
 */
export function checkForForbiddenCommercialFields(record: Record<string, any>): {
  forbidden: boolean;
  hasForbidden: boolean;
  field?: string;
  matchedFields: string[];
} {
  if (!record || typeof record !== 'object') {
    return { forbidden: false, hasForbidden: false, matchedFields: [] };
  }

  const matchedFields: string[] = [];
  for (const key of Object.keys(record)) {
    const normalized = key.toLowerCase().replace(/[\s\-_]/g, '');
    for (const forbidden of FORBIDDEN_COMMERCIAL_FIELDS) {
      const normalizedForbidden = forbidden.replace(/[\s\-_]/g, '');
      if (normalized === normalizedForbidden || normalized.includes(normalizedForbidden)) {
        matchedFields.push(key);
        break;
      }
    }
  }

  const isForbidden = matchedFields.length > 0;
  return {
    forbidden: isForbidden,
    hasForbidden: isForbidden,
    field: matchedFields[0],
    matchedFields,
  };
}

/**
 * Validates administrative game catalog input before persistence.
 */
export function validateGameInput(input: {
  title?: string;
  slug?: string;
  platform?: string;
  platforms?: string[];
  genre?: string;
  genres?: string[];
  coverImage?: string;
  heroImage?: string;
  [key: string]: any;
}): { valid: boolean; error?: string } {
  // 1. Zero-price / Zero-inventory commercial violation check
  const commercialCheck = checkForForbiddenCommercialFields(input);
  if (commercialCheck.forbidden) {
    return {
      valid: false,
      error: `Forbidden commercial field "${commercialCheck.field}" detected. GameVault strictly disallows prices, discounts, stock, and checkout systems.`,
    };
  }

  // 2. Title validation
  if (!input.title || input.title.trim().length === 0) {
    return { valid: false, error: 'Game title is required.' };
  }
  if (input.title.length > 200) {
    return { valid: false, error: 'Game title cannot exceed 200 characters.' };
  }
  if (/<script/i.test(input.title) || /javascript:/i.test(input.title)) {
    return { valid: false, error: 'Game title contains unsafe characters.' };
  }

  // 3. Slug validation
  if (!input.slug || input.slug.trim().length === 0) {
    return { valid: false, error: 'Game slug is required.' };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    return {
      valid: false,
      error: 'Game slug must be lowercase alphanumeric characters separated by single hyphens (e.g. "game-title-pc").',
    };
  }

  // 4. Platform validation
  const platforms = input.platforms && input.platforms.length > 0
    ? input.platforms
    : input.platform ? [input.platform] : [];
  if (platforms.length === 0) {
    return { valid: false, error: 'At least one valid PC platform must be selected.' };
  }

  // 5. Genre validation
  const genres = input.genres && input.genres.length > 0
    ? input.genres
    : input.genre ? [input.genre] : [];
  if (genres.length === 0) {
    return { valid: false, error: 'At least one game genre must be selected.' };
  }

  // 6. Artwork URL validation
  if (input.coverImage && input.coverImage.trim() !== '' && !isValidArtworkUrl(input.coverImage)) {
    return { valid: false, error: 'Cover artwork URL must use a safe protocol (https:// or approved path).' };
  }
  if (input.heroImage && input.heroImage.trim() !== '' && !isValidArtworkUrl(input.heroImage)) {
    return { valid: false, error: 'Hero artwork URL must use a safe protocol (https:// or approved path).' };
  }

  return { valid: true };
}

