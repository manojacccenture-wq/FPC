/**
 * Safe encoding for dynamic path segments (IDs, tokens, slugs).
 */
export function encodeSegment(segment: string | number): string {
  return encodeURIComponent(String(segment).trim());
}

/**
 * Serializes query parameters cleanly into a standard URL query string.
 * - Skips null, undefined, and empty string values.
 * - Only appends boolean parameters when true ('true').
 * - Encodes keys and values using URLSearchParams.
 * - Prepends '?' only when at least one valid parameter exists.
 */
export function toQueryString(params?: Record<string, unknown> | null): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') {
      continue;
    }
    if (typeof value === 'boolean') {
      if (value) {
        searchParams.append(key, 'true');
      }
      continue;
    }
    searchParams.append(key, String(value));
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Combines a base path with dynamic query parameters.
 * Guarantees leading slash and clean query concatenation.
 * Safely determines whether to use '?' or '&' based on whether the basePath already includes query parameters.
 */
export function buildUrl(basePath: string, params?: Record<string, unknown> | null): string {
  const cleanPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const qs = toQueryString(params);
  if (!qs) return cleanPath;

  const queryContent = qs.slice(1);
  if (cleanPath.endsWith('?') || cleanPath.endsWith('&')) {
    return `${cleanPath}${queryContent}`;
  }

  const separator = cleanPath.includes('?') ? '&' : '?';
  return `${cleanPath}${separator}${queryContent}`;
}

