import React from 'react';
import { LocateFixed, MapPin } from 'lucide-react';
import { Alert } from '../../../shared/components/Alert';
import { Button } from '../../../shared/components/Button';
import { Checkbox } from '../../../shared/components/Checkbox';
import type { DeviceLocationStatus } from '../../../shared/hooks/useDeviceLocation';
import type { CoordinateSource, GeoCoordinates } from '../../../shared/types/geolocation.types';
import { formatCoordinatePair } from '../../../shared/utils/coordinates';

export interface CoordinateConflict {
  incoming: GeoCoordinates;
  incomingSource: 'gps' | 'geocoding';
  current: GeoCoordinates;
  currentSource: CoordinateSource;
}

export interface CoordinateLocationControlProps {
  isReadOnly?: boolean;
  /** Browser geolocation state. */
  gpsStatus: DeviceLocationStatus;
  gpsMessage: string;
  gpsCoordinates: GeoCoordinates | null;
  accuracyMeters: number | null;
  onDetect: () => void;
  /** Address-geocoding state. */
  geocodingStatus: 'idle' | 'loading' | 'error';
  geocodingMessage: string;
  /** Set when a reading may not be written without the user choosing. */
  conflict: CoordinateConflict | null;
  onResolveConflict: (choice: 'incoming' | 'keep') => void;
  /** Who produced the values currently in the fields. */
  source: CoordinateSource;
  /** True when GPS values are present and not yet confirmed as the office. */
  requiresConfirmation: boolean;
  confirmed: boolean;
  onConfirmationChange: (checked: boolean) => void;
  confirmationError?: string;
}

const SOURCE_LABELS: Record<CoordinateSource, string> = {
  '': 'Use your device location or enter manually',
  gps: 'From your device location',
  geocoding: 'From the registered address',
  manual: 'Entered manually',
};

/**
 * Presentational control for the two coordinate sources in Step 6.
 *
 * Holds no logic: the form decides what may be written, this component only
 * renders the current state and reports user intent back.
 */
export const CoordinateLocationControl: React.FC<CoordinateLocationControlProps> = ({
  isReadOnly = false,
  gpsStatus,
  gpsMessage,
  gpsCoordinates,
  accuracyMeters,
  onDetect,
  geocodingStatus,
  geocodingMessage,
  conflict,
  onResolveConflict,
  source,
  requiresConfirmation,
  confirmed,
  onConfirmationChange,
  confirmationError,
}) => {
  const detecting = gpsStatus === 'locating';
  const lookingUp = geocodingStatus === 'loading';

  const statusText = detecting
    ? 'Getting your device location…'
    : lookingUp
      ? 'Looking up coordinates for this address…'
      : SOURCE_LABELS[source];

  if (isReadOnly) {
    return (
      <small className="text-secondary flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-neutral-400 stroke-[2]" aria-hidden="true" />
        {SOURCE_LABELS[source]}
      </small>
    );
  }

  const accuracyNote =
    gpsStatus === 'success' && accuracyMeters !== null ? ` Accuracy ±${accuracyMeters} m.` : '';

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<LocateFixed className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />}
          onClick={onDetect}
          isLoading={detecting}
          loadingText="Detecting…"
        >
          Use current location
        </Button>
        <small className="text-secondary" role="status" aria-live="polite">
          {statusText}
        </small>
      </div>

      {conflict ? (
        <Alert tone="warning" size="sm" title="Two different locations are available">
          <div className="flex flex-col gap-1.5">
            <span>
              {conflict.incomingSource === 'gps' ? 'Device location' : 'Registered address'}:{' '}
              <strong className="font-semibold">{formatCoordinatePair(conflict.incoming)}</strong>
            </span>
            <span>
              Coordinates currently entered: <strong className="font-semibold">{formatCoordinatePair(conflict.current)}</strong>
            </span>
            <span className="flex flex-wrap gap-2 pt-1">
              <Button type="button" variant="outline" size="xs" onClick={() => onResolveConflict('incoming')}>
                {conflict.incomingSource === 'gps' ? 'Use device coordinates' : 'Use address coordinates'}
              </Button>
              <Button type="button" variant="ghost" size="xs" onClick={() => onResolveConflict('keep')}>
                Keep current coordinates
              </Button>
            </span>
          </div>
        </Alert>
      ) : requiresConfirmation ? (
        <Alert tone="info" size="sm">
          <div className="flex flex-col gap-2">
            <span>
              Device location detected
              {gpsCoordinates ? `: ${formatCoordinatePair(gpsCoordinates)}.` : '.'}
              {accuracyNote}{' '}
              This is where the device is now — it is not necessarily the FPC&apos;s registered office.
            </span>
            <Checkbox
              id="fpc-location-confirm"
              size="sm"
              label="I confirm this location is the FPC's registered office."
              checked={confirmed}
              error={confirmationError}
              onChange={(event) => onConfirmationChange(event.target.checked)}
            />
          </div>
        </Alert>
      ) : gpsStatus === 'success' ? (
        <Alert tone="success" size="sm">
          Location detected: {gpsCoordinates ? formatCoordinatePair(gpsCoordinates) : ''}.{accuracyNote}{' '}
          You can edit the values if they are not the registered office.
        </Alert>
      ) : null}

      {gpsStatus === 'error' && gpsMessage ? (
        <Alert tone="danger" size="sm">
          {gpsMessage}
        </Alert>
      ) : null}

      {geocodingStatus === 'error' && geocodingMessage ? (
        <Alert tone="warning" size="sm">
          {geocodingMessage}
        </Alert>
      ) : null}
    </div>
  );
};
