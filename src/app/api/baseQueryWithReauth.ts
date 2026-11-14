import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '../../shared/config/env';

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
      endpoint === 'getFpcInvitationById' ||
      endpoint === 'revokeFpcInvitation' ||
      endpoint === 'uploadDocument';

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

  const mergedExtra = isFormData
    ? { ...((extraOptions as Record<string, unknown>) || {}), isFormData: true }
    : extraOptions;

  let result = await rawBaseQuery(args, api, mergedExtra);

  // If 401 Unauthorized occurs and not already on the refresh/login endpoint, attempt token refresh
  if (result.error && result.error.status === 401) {
    const isAuthEndpoint =
      typeof args === 'string'
        ? args.includes('/auth/login') || args.includes('/auth/refresh')
        : args.url.includes('/auth/login') || args.url.includes('/auth/refresh');

    if (!isAuthEndpoint) {
      // If the browser has no session indicator (XSRF-TOKEN cookie) during initial /auth/me check,
      // skip the doomed refresh request to keep network tab clean for unauthenticated visitors.
      const hasSessionIndicator = Boolean(getCookie('XSRF-TOKEN'));
      const isMeEndpoint =
        typeof args === 'string' ? args.includes('/auth/me') : args.url.includes('/auth/me');

      if (!hasSessionIndicator && isMeEndpoint) {
        api.dispatch({ type: 'auth/loggedOut' });
        return result;
      }

      // Attempt to refresh the access token via HttpOnly refresh cookie
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh',
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

  return result;
};

