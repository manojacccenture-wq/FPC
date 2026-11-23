import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '../../shared/config/env';
import { AUTH_ENDPOINTS } from '../../shared/api/endpoints/auth.endpoints';

/**
 * Utility to extract cookie value by name (used for non-HttpOnly XSRF-TOKEN)
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match && match[3] ? decodeURIComponent(match[3]) : null;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include', // Automatically sends HttpOnly cookies (__Host-fpc-access, __Secure-fpc-refresh)
  prepareHeaders: (headers, { getState, endpoint, extra }) => {
    // 1. Attach CSRF token on mutating requests if present in document.cookie
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
      headers.set('X-XSRF-TOKEN', xsrfToken);
    }

    // 2. Attach active FpcId tenant header if resolved in Redux state (exclude platform and invitation endpoints)
    const state = getState() as { auth?: { activeFpcId?: string | null } };
    const activeFpcId = state.auth?.activeFpcId;
    const isPlatformOrInvitation =
      endpoint === 'completeInvitation' ||
      endpoint === 'validateFpcInvitation' ||
      endpoint === 'createFpcInvitation' ||
      endpoint === 'getFpcInvitations' ||
      endpoint === 'getOnboardRecords' ||
      endpoint === 'getFpcInvitationById' ||
      endpoint === 'revokeFpcInvitation' ||
      endpoint === 'uploadDocument' ||
      endpoint === 'approveFpc' ||
      endpoint === 'rejectFpc' ||
      endpoint === 'deleteFpc' ||
      endpoint === 'getFpcs' ||
      endpoint === 'getFpcsPaged' ||
      endpoint === 'getFpcById' ||
      endpoint === 'getFpcDetails' ||
      endpoint === 'getFpcDocumentContent';

    if (activeFpcId && !isPlatformOrInvitation) {
      headers.set('X-Active-Fpc-Id', activeFpcId);
    }

    // 3. Mark request as JSON
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    // Prevent overriding Content-Type for FormData uploads (allows browser to set multipart boundary)
    const isFormData =
      (extra as { isFormData?: boolean })?.isFormData ||
      endpoint === 'uploadDocument' ||
      endpoint === 'uploadFpcDocument';

    if (!isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  },
});

/**
 * Custom baseQuery that handles automatic token refresh on 401 Unauthorized
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const isFormData =
    typeof args === 'object' &&
    args !== null &&
    'body' in args &&
    typeof FormData !== 'undefined' &&
    args.body instanceof FormData;

  const endpoint = typeof args === 'string' ? args : args.url;
  const isPlatformOrAuth =
    endpoint.includes('/auth/') ||
    endpoint.includes('/fpcs/invitations') ||
    endpoint.includes('/onboard') ||
    endpoint.includes('/approve') ||
    endpoint.includes('/reject');

  const requestWorkspace = (api.getState() as { auth?: { activeFpcId?: string | null } }).auth?.activeFpcId;

  const mergedExtra = isFormData
    ? { ...((extraOptions as Record<string, unknown>) || {}), isFormData: true }
    : extraOptions;

  let result = await rawBaseQuery(args, api, mergedExtra);

  // If 401 Unauthorized occurs and not already on the refresh/login endpoint, attempt token refresh
  if (result.error && result.error.status === 401) {
    const isAuthEndpoint =
      typeof args === 'string'
        ? args.includes(AUTH_ENDPOINTS.LOGIN) || args.includes(AUTH_ENDPOINTS.REFRESH)
        : args.url.includes(AUTH_ENDPOINTS.LOGIN) || args.url.includes(AUTH_ENDPOINTS.REFRESH);

    if (!isAuthEndpoint) {
      // If the browser has no session indicator (XSRF-TOKEN cookie) during initial /auth/me check,
      // skip the doomed refresh request to keep network tab clean for unauthenticated visitors.
      const hasSessionIndicator = Boolean(getCookie('XSRF-TOKEN'));
      const isMeEndpoint =
        typeof args === 'string' ? args.includes(AUTH_ENDPOINTS.ME) : args.url.includes(AUTH_ENDPOINTS.ME);

      if (!hasSessionIndicator && isMeEndpoint) {
        api.dispatch({ type: 'auth/loggedOut' });
        return result;
      }

      // Attempt to refresh the access token via HttpOnly refresh cookie
      const refreshResult = await rawBaseQuery(
        {
          url: AUTH_ENDPOINTS.REFRESH,
          method: 'POST',
        },
        api,
        mergedExtra
      );

      if (refreshResult.data) {
        if (import.meta.env.DEV) {
          console.debug(
            '[Auth] Access token refreshed; successfully retrying request:',
            typeof args === 'string' ? args : args.url
          );
        }
        // Retry the original query now that cookies are refreshed
        result = await rawBaseQuery(args, api, mergedExtra);
      } else {
        // Refresh token expired or revoked - trigger client-side logout
        api.dispatch({ type: 'auth/loggedOut' });
      }
    }
  }

  // In-flight workspace drift protection: discard tenant response if active workspace changed while request was in-flight
  const currentWorkspace = (api.getState() as { auth?: { activeFpcId?: string | null } }).auth?.activeFpcId;
  if (!isPlatformOrAuth && requestWorkspace !== currentWorkspace) {
    if (import.meta.env.DEV) {
      console.warn('[TenantIsolation] Workspace switched during in-flight request; discarded stale tenant response for:', endpoint);
    }
    return {
      error: {
        status: 'CUSTOM_ERROR',
        error: 'Tenant context changed during request; stale response discarded.',
      },
    };
  }

  return result;
};

