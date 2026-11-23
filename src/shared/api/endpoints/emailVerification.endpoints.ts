/**
 * Email Verification API Endpoints.
 * Aligned with ASP.NET Core EmailVerificationController (api/v1/email-verification).
 */
export const EMAIL_VERIFICATION_ENDPOINTS = {
  SEND: '/email-verification/send',
  CONFIRM: '/email-verification/confirm',
  STATUS: '/email-verification/status',
} as const;

