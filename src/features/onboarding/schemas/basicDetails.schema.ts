import { z } from 'zod';
import {
  requiredString,
  emailSchema,
  phoneSchema,
  cinSchema,
  optionalUrlSchema,
  dateStringSchema,
} from '../../../shared/validation/schemas';

/**
 * Zod schema for Step 1: Basic Company Details of FPC Onboarding.
 * Follows the centralized validation rules while defining feature-specific constraints.
 */
export const basicDetailsSchema = z.object({
  legalName: requiredString('FPC legal name', 3),
  cin: cinSchema,
  registrationNumber: requiredString('FPC registration number', 1),
  rocOffice: requiredString('ROC office', 2),
  dateOfIncorporation: dateStringSchema('Date of incorporation'),
  companyCategory: requiredString('Company category', 2),
  contactEmail: emailSchema,
  contactMobile: phoneSchema,
  website: optionalUrlSchema,
});

export type BasicDetailsFormValues = z.infer<typeof basicDetailsSchema>;

