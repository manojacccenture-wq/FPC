/**
 * Browser Geolocation wrapper.
 *
 * The browser permission prompt is only ever triggered by an explicit user
 * action — this module never observes position on its own, and the form only
 * calls it from the "Use current location" click handler.
 *
 * Concurrency: a second call while one is in flight reuses the first promise,
 * so a double click or a re-render cannot open two requests (and cannot show
 * two native prompts).
 */
import type { GeolocationFailureReason, GeolocationOutcome } from '../types/geolocation.types';
import { normalizeCoordinates } from '../utils/coordinates';

const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  // Reusing a fix younger than a minute avoids a redundant satellite round-trip
  // without ever returning a stale position.
  maximumAge: 60_000,
};

const MESSAGES: Record<GeolocationFailureReason, string> = {
  unsupported: 'This browser does not support location detection. Please enter the coordinates manually.',
  insecure_context:
    'Location detection needs a secure (https) connection. Please enter the coordinates manually.',
  permission_denied:
    'Location access is blocked. To allow it, open your browser site settings for this page (the icon left of the address bar), set Location to "Allow", then try again.',
  position_unavailable:
    'Your device could not determine its location right now. Move to an open area and try again, or enter the coordinates manually.',
  timeout: 'Location detection timed out. Please try again, or enter the coordinates manually.',
  invalid_coordinates:
    'The device returned an invalid location. Please try again, or enter the coordinates manually.',
  unknown: 'Location could not be detected. Please enter the coordinates manually.',
};

let inFlight: Promise<GeolocationOutcome> | null = null;

function failure(reason: GeolocationFailureReason, message = MESSAGES[reason]): GeolocationOutcome {
  return { ok: false, reason, message };
}

export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator && !!navigator.geolocation;
}

/** Best-effort check: distinguishes an explicit block from a dismissed prompt. */
async function isPermissionBlocked(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) return false;
    const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return status.state === 'denied';
  } catch {
    return false;
  }
}

function requestPosition(): Promise<GeolocationOutcome> {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return Promise.resolve(failure('insecure_context'));
  }

  if (!isGeolocationSupported()) {
    return Promise.resolve(failure('unsupported'));
  }

  return new Promise<GeolocationOutcome>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = normalizeCoordinates(
          position.coords.latitude,
          position.coords.longitude
        );

        if (!coordinates) {
          resolve(failure('invalid_coordinates'));
          return;
        }

        const accuracy = position.coords.accuracy;
        resolve({
          ok: true,
          coordinates,
          accuracyMeters: Number.isFinite(accuracy) ? Math.round(accuracy) : null,
        });
      },
      async (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          const blocked = await isPermissionBlocked();
          resolve(
            failure(
              'permission_denied',
              blocked
                ? MESSAGES.permission_denied
                : 'Location permission was not granted. Allow location access when your browser asks, or enter the coordinates manually.'
            )
          );
          return;
        }

        resolve(failure(error.code === error.TIMEOUT ? 'timeout' : 'position_unavailable'));
      },
      POSITION_OPTIONS
    );
  });
}

/**
 * Resolves the device's current position. Concurrent callers share one request.
 */
export function getDeviceLocation(): Promise<GeolocationOutcome> {
  if (inFlight) return inFlight;

  inFlight = requestPosition().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
