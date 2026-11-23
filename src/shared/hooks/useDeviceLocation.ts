import { useCallback, useState } from 'react';
import { getDeviceLocation } from '../services/geolocation';
import type { GeoCoordinates, GeolocationOutcome } from '../types/geolocation.types';

export type DeviceLocationStatus = 'idle' | 'locating' | 'success' | 'error';

export interface DeviceLocationState {
  status: DeviceLocationStatus;
  message: string;
  coordinates: GeoCoordinates | null;
  accuracyMeters: number | null;
}

const IDLE_STATE: DeviceLocationState = {
  status: 'idle',
  message: '',
  coordinates: null,
  accuracyMeters: null,
};

/**
 * Local UI state for one geolocation attempt.
 *
 * Deliberately knows nothing about React Hook Form or about the FPC business
 * rules: it exposes the outcome and lets the caller decide whether the values
 * may be written. `detect` resolves with the outcome so the caller can act on
 * the exact result it just triggered.
 */
export function useDeviceLocation() {
  const [state, setState] = useState<DeviceLocationState>(IDLE_STATE);

  const detect = useCallback(async (): Promise<GeolocationOutcome> => {
    setState({
      status: 'locating',
      message: 'Getting your device location…',
      coordinates: null,
      accuracyMeters: null,
    });

    const outcome = await getDeviceLocation();

    if (outcome.ok) {
      setState({
        status: 'success',
        message: 'Current device location detected.',
        coordinates: outcome.coordinates,
        accuracyMeters: outcome.accuracyMeters,
      });
    } else {
      setState({
        status: 'error',
        message: outcome.message,
        coordinates: null,
        accuracyMeters: null,
      });
    }

    return outcome;
  }, []);

  const reset = useCallback(() => setState(IDLE_STATE), []);

  return { ...state, detect, reset };
}
