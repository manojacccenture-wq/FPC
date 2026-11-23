import type { PaginationParams } from './pagination.types';

/**
 * Query arguments for paged FPC retrieval.
 */
export interface GetFpcsPagedArgs extends PaginationParams {
  search?: string;
  status?: string;
  state?: string;
}

/**
 * Query arguments for paged Onboarding / Invitations retrieval.
 */
export interface GetOnboardRecordsArgs extends PaginationParams {
  search?: string;
  status?: string;
  all?: boolean;
}

