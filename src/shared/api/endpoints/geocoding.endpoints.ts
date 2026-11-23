import { buildUrl } from '../utils/urlBuilder';
import type { GeocodeAddress } from '../../types/geolocation.types';

/**
 * Geocoding API endpoints.
 *
 * The lookup is proxied through the backend so the provider credentials never
 * reach the browser bundle; the frontend only ever sees this relative path.
 */
export const GEOCODING_ENDPOINTS = {
  ADDRESS: (address: GeocodeAddress) =>
    buildUrl('/geocoding/address', {
      streetAddress: address.streetAddress.trim(),
      village: address.village.trim(),
      gramPanchayat: address.gramPanchayat.trim(),
      block: address.block.trim(),
      district: address.district.trim(),
      state: address.state.trim(),
      pinCode: address.pinCode.trim(),
    }),
} as const;

/** Shape of the backend geocoding payload. */
export interface GeocodeAddressResponseDto {
  latitude?: number | string | null;
  longitude?: number | string | null;
  accuracyMeters?: number | null;
  formattedAddress?: string | null;
}

export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T | null;
  message?: string | null;
}
