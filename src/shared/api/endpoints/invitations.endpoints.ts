import { encodeSegment, buildUrl } from '../utils/urlBuilder';
import type { GetOnboardRecordsArgs } from '../../types/api.types';

/**
 * FPC Invitations & Onboarding Records API Endpoints.
 * Aligned with ASP.NET Core FpcInvitationsController (api/v1/fpc-invitations).
 */
export const INVITATION_ENDPOINTS = {
  ROOT: '/fpc-invitations',
  BY_ID: (id: string) => `/fpc-invitations/${encodeSegment(id)}`,
  VALIDATE: (token: string) => buildUrl('/fpc-invitations/validate', { token }),
  ONBOARD_RECORDS: (args?: GetOnboardRecordsArgs | void) =>
    buildUrl('/fpc-invitations/onboard-records', args as Record<string, unknown>),
  DOCUMENTS: (token: string) => `/fpc-invitations/${encodeSegment(token)}/documents`,
  COMPLETE: '/fpc-invitations/complete',
} as const;

