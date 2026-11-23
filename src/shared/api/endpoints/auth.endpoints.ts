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
  FORGOT_PASSWORD: '/auth/forgot-password',
  VALIDATE_RESET_TOKEN: '/auth/validate-reset-token',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

