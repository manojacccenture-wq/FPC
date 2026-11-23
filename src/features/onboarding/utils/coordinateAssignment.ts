/**
 * Write-protection rules for the two coordinate sources.
 *
 * GPS and address geocoding both want to fill the same two fields, so neither
 * may write unconditionally. This module owns the arbitration and is pure — the
 * form only performs whatever decision it returns.
 */
import type { CoordinateSource, GeoCoordinates } from '../../../shared/types/geolocation.types';
import {
  coordinatesEqual,
  normalizeCoordinates,
  parseCoordinate,
} from '../../../shared/utils/coordinates';

export type CoordinateWriteReason = 'empty' | 'same_source' | 'unchanged_auto';
export type CoordinateConflictReason = 'user_value' | 'different_source';

export type CoordinateAssignmentDecision =
  | { action: 'write'; reason: CoordinateWriteReason }
  | { action: 'noop'; reason: 'identical' }
  | { action: 'conflict'; reason: CoordinateConflictReason };

export interface CoordinateAssignmentInput {
  /** Current raw field values. */
  latitude: string;
  longitude: string;
  /** Values this form last wrote itself; null once the user edits anything. */
  lastAutoFilled: GeoCoordinates | null;
  /** Source recorded for the values currently in the fields. */
  currentSource: CoordinateSource;
  /** Source of the incoming reading. */
  incomingSource: Exclude<CoordinateSource, '' | 'manual'>;
  incoming: GeoCoordinates;
}

export function parseFieldCoordinates(
  latitude: string,
  longitude: string
): GeoCoordinates | null {
  return normalizeCoordinates(parseCoordinate(latitude) ?? undefined, parseCoordinate(longitude) ?? undefined);
}

export function resolveCoordinateAssignment(
  input: CoordinateAssignmentInput
): CoordinateAssignmentDecision {
  const current = parseFieldCoordinates(input.latitude, input.longitude);

  // 1. Empty fields are always safe to fill.
  if (!current) {
    return { action: 'write', reason: 'empty' };
  }

  // 2. Same point: nothing to change, no prompt.
  if (coordinatesEqual(current, input.incoming)) {
    return { action: 'noop', reason: 'identical' };
  }

  // 3. Same source re-detecting (clicking GPS twice) refreshes its own value.
  if (input.currentSource === input.incomingSource) {
    return { action: 'write', reason: 'same_source' };
  }

  // 4. Values we wrote ourselves and the user never touched: still ours to replace.
  if (
    input.currentSource !== 'manual' &&
    input.lastAutoFilled &&
    coordinatesEqual(current, input.lastAutoFilled)
  ) {
    return { action: 'write', reason: 'unchanged_auto' };
  }

  // 5. Anything the user typed, or a different source's confirmed value, needs a choice.
  return {
    action: 'conflict',
    reason: input.currentSource === 'manual' ? 'user_value' : 'different_source',
  };
}
