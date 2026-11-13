/**
 * Pure timezone-safe date parsing and ISO normalization utilities
 */

/**
 * Pure timezone-safe date parsing from DD-MM-YYYY, DD/MM/YYYY, or YYYY-MM-DD.
 * Returns a valid Date object or null if parsing fails.
 */
export function parseDateString(val?: string | null): Date | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed) return null;

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      return d;
    }
    return null;
  }

  // YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      return d;
    }
    return null;
  }

  // Fallback: ISO timestamp parse
  const timestamp = Date.parse(trimmed);
  if (!Number.isNaN(timestamp)) {
    const d = new Date(timestamp);
    if (!Number.isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  }

  return null;
}

/**
 * Returns a Date representing today at 00:00:00:000 in local time.
 */
export function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Checks whether the given date is in the past.
 * If allowToday is true (default), today is considered valid (not past); only yesterday or earlier returns true.
 */
export function isPastDate(val: string | Date | null | undefined, allowToday = true): boolean {
  if (!val) return false;
  const dateObj = val instanceof Date ? val : parseDateString(val);
  if (!dateObj || Number.isNaN(dateObj.getTime())) return false;

  const target = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
  const today = getStartOfToday();

  return allowToday ? target < today : target <= today;
}

/**
 * Checks whether the given date is today or a future date.
 */
export function isFutureOrToday(val: string | Date | null | undefined): boolean {
  return !isPastDate(val, true);
}

/**
 * Normalizes any date string (DD-MM-YYYY, DD/MM/YYYY, or ISO YYYY-MM-DD) into standard ISO 8601 YYYY-MM-DD.
 * Returns undefined if input is empty, null, or invalid, ensuring safe REST API payload serialization.
 */
export function formatDateToISO(val?: string | null): string | undefined {
  if (!val || typeof val !== 'string') return undefined;
  const trimmed = val.trim();
  if (!trimmed) return undefined;

  // Already ISO format: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback: try parsing through JS Date if it contains a timestamp
  const timestamp = Date.parse(trimmed);
  if (!Number.isNaN(timestamp)) {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return undefined;
}

/**
 * Formats a Date or date string to Indian statutory DD-MM-YYYY format for UI presentation.
 */
export function formatDateToDMY(val?: Date | string | null): string {
  if (!val) return '';

  if (val instanceof Date) {
    if (Number.isNaN(val.getTime())) return '';
    const day = String(val.getDate()).padStart(2, '0');
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const year = val.getFullYear();
    return `${day}-${month}-${year}`;
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return '';

    // If already DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) return trimmed;

    // If ISO YYYY-MM-DD
    const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = isoMatch[2].padStart(2, '0');
      const day = isoMatch[3].padStart(2, '0');
      return `${day}-${month}-${year}`;
    }
  }

  return '';
}

