/**
 * Single source of truth for coordinate validation, parsing and formatting.
 *
 * Every producer (GPS, address geocoding, manual typing) and every consumer
 * (Zod schema, form writer) goes through these helpers so the ±90 / ±180 rules
 * and the precision used for comparisons can never drift apart.
 */
import type { GeoCoordinates } from '../types/geolocation.types';

export const MIN_LATITUDE = -90;
export const MAX_LATITUDE = 90;
export const MIN_LONGITUDE = -180;
export const MAX_LONGITUDE = 180;

/** Decimals stored and displayed (6 dp ≈ 11 cm). */
export const COORDINATE_DECIMALS = 6;

/** Decimals used when deciding whether two readings are the same place (≈ 1 m). */
const COMPARISON_DECIMALS = 5;

export function isValidLatitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= MIN_LATITUDE && value <= MAX_LATITUDE;
}

export function isValidLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= MIN_LONGITUDE && value <= MAX_LONGITUDE;
}

/**
 * Validates a coordinate pair. The null island (0, 0) is rejected: it is what
 * devices and providers return when they have no fix at all, never a real
 * Indian registered office.
 */
export function isValidCoordinates(value: Partial<GeoCoordinates> | null | undefined): value is GeoCoordinates {
  if (!value) return false;
  const { latitude, longitude } = value;
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) return false;
  return !(latitude === 0 && longitude === 0);
}

/** Parses user-typed or provider-provided text into a number, or null. */
export function parseCoordinate(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const trimmed = raw.trim().replace(',', '.');
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Rounds to storage precision and renders without exponent or trailing noise. */
export function formatCoordinate(value: number): string {
  return value.toFixed(COORDINATE_DECIMALS);
}

/** "22.260412, 84.853601" — for status messages only. */
export function formatCoordinatePair(coordinates: GeoCoordinates): string {
  return `${formatCoordinate(coordinates.latitude)}, ${formatCoordinate(coordinates.longitude)}`;
}

/** True when both readings describe the same point at ~1 m tolerance. */
export function coordinatesEqual(a: GeoCoordinates | null, b: GeoCoordinates | null): boolean {
  if (!a || !b) return false;
  const sameValue = (left: number, right: number) =>
    Math.abs(left - right) < Math.pow(10, -COMPARISON_DECIMALS);
  return sameValue(a.latitude, b.latitude) && sameValue(a.longitude, b.longitude);
}

/** Normalizes a provider/device reading into storage-ready values, or null. */
export function normalizeCoordinates(
  latitude: unknown,
  longitude: unknown
): GeoCoordinates | null {
  const lat = typeof latitude === 'number' ? latitude : parseCoordinate(String(latitude ?? ''));
  const lng = typeof longitude === 'number' ? longitude : parseCoordinate(String(longitude ?? ''));
  if (lat === null || lng === null) return null;
  const candidate = { latitude: lat, longitude: lng };
  return isValidCoordinates(candidate) ? candidate : null;
}
