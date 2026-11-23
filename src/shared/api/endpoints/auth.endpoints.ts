/**
 * Authentication and Session API Endpoints.
 * Aligned with ASP.NET Core AuthController (api/v1/auth).
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  VERIFY_2FA: '/auth/verify-2fa',
  RESEND_2FA: '/auth/2fa/resend',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
  SWITCH_FPC: '/auth/switch-fpc',
  LOGOUT: '/auth/logout',
  CHANGE_PASSWORD: '/auth/change-password',
} as const;

