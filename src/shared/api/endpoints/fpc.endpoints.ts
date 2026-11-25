import { encodeSegment, buildUrl } from '../utils/urlBuilder';
import type { GetFpcsPagedArgs } from '../../types/api.types';

/**
 * FPC Management & Registration API Endpoints.
 * Aligned with ASP.NET Core FpcsController (api/v1/fpcs).
 */
export const FPC_ENDPOINTS = {
  ROOT: '/fpcs',
  PAGED: (args?: GetFpcsPagedArgs | void) => buildUrl('/fpcs/paged', args as Record<string, unknown>),
  BY_ID: (id: string) => `/fpcs/${encodeSegment(id)}`,
  DETAILS: (id: string) => `/fpcs/${encodeSegment(id)}/details`,
  DRAFT: (id: string) => `/fpcs/${encodeSegment(id)}/draft`,
  SUBMIT_REGISTRATION: (id: string) => `/fpcs/${encodeSegment(id)}/submit-registration`,
  APPROVE: (id: string) => `/fpcs/${encodeSegment(id)}/approve`,
  REJECT: (id: string) => `/fpcs/${encodeSegment(id)}/reject`,
  DOCUMENTS: (fpcId: string) => `/fpcs/${encodeSegment(fpcId)}/documents`,
  DOCUMENT_CONTENT: (fpcId: string, documentId: string, download?: boolean) =>
    buildUrl(
      `/fpcs/${encodeSegment(fpcId)}/documents/${encodeSegment(documentId)}/content`,
      download ? { download: true } : undefined
    ),
  DOCUMENT_HISTORY: (fpcId: string, documentSlotKey: string) =>
    buildUrl(`/fpcs/${encodeSegment(fpcId)}/documents/history`, { documentSlotKey }),
  DOCUMENT_VERSIONS: (fpcId: string) => `/fpcs/${encodeSegment(fpcId)}/documents/versions`,
  DOCUMENT_BY_ID: (fpcId: string, documentId: string) =>
    `/fpcs/${encodeSegment(fpcId)}/documents/${encodeSegment(documentId)}`,
} as const;

