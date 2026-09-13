import { SystemRequirements, SystemSpec } from '../types/game';

/**
 * Decode common HTML entities into plain text.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&reg;/gi, '')
    .replace(/&trade;/gi, '')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/™/g, '')
    .replace(/®/g, '');
}

/**
 * Strips HTML tags and collapses whitespace.
 */
function cleanText(text: string): string {
  return decodeHtmlEntities(text)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse an HTML fragment (e.g. <ul><li>...</li></ul>) representing
 * either Minimum or Recommended specifications into a SystemSpec object.
 */
export function parseSteamSpecHtml(html: string): SystemSpec | undefined {
  if (!html || typeof html !== 'string') return undefined;

  const spec: SystemSpec = {};
  
  // Clean up formatting
  const normalized = html
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/<\/?(?:ul|p|div)[^>]*>/gi, '');

  // Match list items or split by <li>
  const itemMatches = normalized.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  const rawItems: string[] = itemMatches
    ? itemMatches.map((item) => item.replace(/<\/?li[^>]*>/gi, ''))
    : normalized.split(/<br\s*\/?>/i);

  for (const raw of rawItems) {
    // Check for strong or bold label e.g. <strong>OS:</strong> Windows 10
    const labelMatch = raw.match(/<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>\s*:?\s*([\s\S]*)/i);
    let label = '';
    let val = '';

    if (labelMatch) {
      label = cleanText(labelMatch[1]).replace(/[:*]/g, '').trim().toLowerCase();
      val = cleanText(labelMatch[2]);
    } else {
      // Fallback: look for Label: Value pattern in plain text
      const plain = cleanText(raw);
      const colonIdx = plain.indexOf(':');
      if (colonIdx > 0 && colonIdx < 30) {
        label = plain.substring(0, colonIdx).replace(/[*]/g, '').trim().toLowerCase();
        val = plain.substring(colonIdx + 1).trim();
      }
    }

    if (!val || !label) continue;

    // Clean leading colons or stars from value
    val = val.replace(/^[:* \t]+/, '').trim();
    if (!val) continue;

    if (label === 'os' || label === 'operating system') {
      spec.os = val;
    } else if (label.startsWith('processor') || label === 'cpu') {
      spec.processor = val;
    } else if (label.startsWith('memory') || label === 'ram') {
      spec.memory = val;
    } else if (label.startsWith('graphics') || label.startsWith('video card') || label === 'gpu') {
      spec.graphics = val;
    } else if (label.startsWith('directx') || label.startsWith('direct x')) {
      spec.directX = val;
    } else if (label.startsWith('storage') || label.startsWith('hard drive') || label.startsWith('hard disk') || label.startsWith('disk space')) {
      spec.storage = val;
    } else if (label.startsWith('additional notes') || label.startsWith('notes')) {
      spec.additionalNotes = val;
    }
  }

  // If none of the recognized fields were populated, check if this is an empty or unparseable blob
  const hasFields = Object.keys(spec).length > 0;
  return hasFields ? spec : undefined;
}

/**
 * Parse raw Steam pc_requirements data into structured SystemRequirements.
 */
export function parseSteamRequirements(rawReqs: any): SystemRequirements | null {
  if (!rawReqs || typeof rawReqs !== 'object') return null;

  // Sometimes rawReqs is an empty array []
  if (Array.isArray(rawReqs)) return null;

  let minHtml = rawReqs.minimum;
  let recHtml = rawReqs.recommended;

  // Sometimes both minimum and recommended are inside minimumHtml
  if (minHtml && !recHtml && typeof minHtml === 'string') {
    const recIndex = minHtml.search(/<(?:strong|b)>Recommended:?<\/(?:strong|b)>/i);
    if (recIndex !== -1) {
      recHtml = minHtml.substring(recIndex);
      minHtml = minHtml.substring(0, recIndex);
    }
  }

  const minimum = minHtml ? parseSteamSpecHtml(minHtml) : undefined;
  const recommended = recHtml ? parseSteamSpecHtml(recHtml) : undefined;

  if (!minimum && !recommended) {
    return null;
  }

  return {
    minimum,
    recommended,
    requirementsSource: 'Steam',
  };
}
