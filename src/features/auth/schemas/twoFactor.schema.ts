import { z } from 'zod';

/**
 * Zod schema for 2FA OTP code validation.
 * Enforces exactly 6 numeric digits.
 */
export const otpSchema = z
  .string()
  .trim()
  .min(1, 'Verification code is required')
  .length(6, 'Verification code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain only numeric digits');

export const twoFactorSchema = z.object({
  code: otpSchema,
});

export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

