import { encodeSegment } from '../utils/urlBuilder';

/**
 * Farmers API Endpoints.
 * Aligned with ASP.NET Core FarmersController (api/v1/farmers).
 */
export const FARMER_ENDPOINTS = {
  ROOT: '/farmers',
  BY_ID: (id: string) => `/farmers/${encodeSegment(id)}`,
} as const;

