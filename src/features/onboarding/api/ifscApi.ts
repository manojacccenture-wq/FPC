/**
 * IFSC → bank/branch lookup client.
 *
 * Kept separate from `baseApi` on purpose: the provider is public and keyless,
 * so the request must not carry our auth cookie or the token-refresh retry, and
 * a branch's details never change in practice, so one lookup per session is
 * enough.
 *
 * The endpoint is only queried when `IFSC_LOOKUP_ENABLED` is on, and only from
 * the IFSC field's blur handler — never while the user types.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

/** Public Razorpay IFSC directory: no API key, CORS-enabled. */
export const IFSC_LOOKUP_BASE_URL = 'https://ifsc.razorpay.com/';

/** Raw provider payload; keys are upper-case and every value may be missing. */
interface IfscLookupResponse {
  IFSC?: string;
  BANK?: string;
  BRANCH?: string;
  ADDRESS?: string;
  CITY?: string;
  DISTRICT?: string;
  STATE?: string;
}

export interface IfscLookupResult {
  ifsc: string;
  bank: string;
  branch: string;
  address: string;
  city: string;
  district: string;
  state: string;
}

const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export const ifscApi = createApi({
  reducerPath: 'ifscApi',
  baseQuery: fetchBaseQuery({ baseUrl: IFSC_LOOKUP_BASE_URL }),
  keepUnusedDataFor: THIRTY_DAYS_SECONDS,
  endpoints: (builder) => ({
    lookupIfsc: builder.query<IfscLookupResult, string>({
      query: (ifsc) => ({ url: encodeURIComponent(ifsc.trim().toUpperCase()), method: 'GET' }),
      keepUnusedDataFor: THIRTY_DAYS_SECONDS,
      transformResponse: (response: IfscLookupResponse) => {
        const ifsc = asText(response?.IFSC);
        const bank = asText(response?.BANK);
        const branch = asText(response?.BRANCH);

        // A payload without a bank and branch cannot safely pre-fill anything.
        if (!ifsc || !bank || !branch) {
          throw new Error('The IFSC lookup did not return usable bank details.');
        }

        return {
          ifsc,
          bank,
          branch,
          address: asText(response?.ADDRESS),
          city: asText(response?.CITY),
          district: asText(response?.DISTRICT),
          state: asText(response?.STATE),
        };
      },
    }),
  }),
});

export const { useLazyLookupIfscQuery } = ifscApi;
