/**
 * Coordinate and location types shared by the two independent location sources:
 *
 * - `gps`       — the browser Geolocation API (device position, needs permission)
 * - `geocoding` — the backend address lookup (registered office address)
 *
 * Both produce the same `GeoCoordinates` shape and are written to the form
 * through the same guarded path, so the form never needs to know which source
 * produced a value beyond showing its provenance.
 */

/** Who produced the coordinates currently held in the form. */
export type CoordinateSource = '' | 'gps' | 'geocoding' | 'manual';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

/** Why a browser geolocation attempt produced no usable coordinates. */
export type GeolocationFailureReason =
  | 'unsupported'
  | 'insecure_context'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'invalid_coordinates'
  | 'unknown';

export type GeolocationOutcome =
  | { ok: true; coordinates: GeoCoordinates; accuracyMeters: number | null }
  | { ok: false; reason: GeolocationFailureReason; message: string };

/** Address components required to look up the registered office coordinates. */
export interface GeocodeAddress {
  streetAddress: string;
  village: string;
  gramPanchayat: string;
  block: string;
  district: string;
  state: string;
  pinCode: string;
}

/** Why an address lookup produced no usable coordinates. */
export type GeocodeFailureReason =
  | 'incomplete_address'
  | 'no_result'
  | 'unavailable'
  | 'invalid_coordinates';

export type GeocodeOutcome =
  | {
      ok: true;
      coordinates: GeoCoordinates;
      accuracyMeters: number | null;
      formattedAddress: string | null;
    }
  | { ok: false; reason: GeocodeFailureReason; message: string };
