import { z } from 'zod';
import { requiredString, emailSchema, phoneSchema } from '../../../shared/validation/schemas';

/**
 * Zod schema for the TSF Admin "Registration invitation" modal.
 *
 * Mirrors the backend contract in `FpcInvitationService.CreateAsync`, which
 * rejects an empty CompanyName / NominatedAdmin / Email / PhoneNumber / State /
 * District. Email and phone formats are enforced client-side using the shared
 * rules so the user gets inline feedback before the request is sent.
 */
export const inviteFpcSchema = z.object({
  companyName: requiredString('Company name'),
  nominatedAdmin: requiredString('Nominated admin'),
  email: emailSchema,
  phoneNumber: phoneSchema,
  state: requiredString('State'),
  district: requiredString('District'),
});

export type InviteFpcFormValues = z.infer<typeof inviteFpcSchema>;
