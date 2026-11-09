import { z } from 'zod';
import { emailSchema } from '../../../shared/validation/schemas';

/**
 * Zod schema for the TSF Admin login form.
 * Email uses the centralized shared rule. Password is intentionally limited to
 * "required" because the login endpoint authenticates credentials; it does not
 * enforce registration-style password complexity.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
