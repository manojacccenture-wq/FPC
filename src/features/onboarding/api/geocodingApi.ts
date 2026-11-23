/**
 * Address-based geocoding client.
 *
 * Kept separate from `baseApi` on purpose: the lookup is anonymous, so it must
 * not run through the authenticated base query (and its token-refresh retry),
 * and its results are worth caching for a whole session because an unchanged
 * address must never be looked up twice.
 *
 * The endpoint is only queried when `ADDRESS_GEOCODING_ENABLED` is on; until the
 * backend proxy exists the form shows no lookup UI and makes no requests.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../../shared/config/env';
import { GEOCODING_ENDPOINTS } from '../../../shared/api/endpoints/geocoding.endpoints';
import type {
  ApiEnvelope,
  GeocodeAddressResponseDto,
} from '../../../shared/api/endpoints/geocoding.endpoints';
import type { GeocodeAddress } from '../../../shared/types/geolocation.types';
import { normalizeCoordinates } from '../../../shared/utils/coordinates';

export interface GeocodeAddressResult {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  formattedAddress: string | null;
}

const ONE_DAY_SECONDS = 60 * 60 * 24;

export const geocodingApi = createApi({
  reducerPath: 'geocodingApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL, credentials: 'same-origin' }),
  keepUnusedDataFor: ONE_DAY_SECONDS,
  endpoints: (builder) => ({
    geocodeAddress: builder.query<GeocodeAddressResult, GeocodeAddress>({
      query: (address) => ({ url: GEOCODING_ENDPOINTS.ADDRESS(address), method: 'GET' }),
      keepUnusedDataFor: ONE_DAY_SECONDS,
      transformResponse: (response: ApiEnvelope<GeocodeAddressResponseDto>) => {
        const payload = response?.data ?? (response as unknown as GeocodeAddressResponseDto);
        const coordinates = normalizeCoordinates(payload?.latitude, payload?.longitude);

        // A payload we cannot trust must fail loudly rather than be written.
        if (!coordinates) {
          throw new Error('The address lookup did not return usable coordinates.');
        }

        const accuracy = payload?.accuracyMeters;
        return {
          ...coordinates,
          accuracyMeters: typeof accuracy === 'number' && Number.isFinite(accuracy) ? accuracy : null,
          formattedAddress: payload?.formattedAddress ?? null,
        };
      },
    }),
  }),
});

export const { useLazyGeocodeAddressQuery } = geocodingApi;
