import { z } from 'zod';
import {
  requiredString,
  dinSchema,
  phoneSchema,
  optionalEmailSchema,
  directorPanSchema,
  dateStringSchema,
} from '../../../shared/validation/schemas';
import { getStartOfToday, parseDateString } from '../../../shared/utils/date';

/**
 * Validates calendar date format (DD-MM-YYYY) and blocks future dates.
 * Optional during intermediate step saves and drafts; mandatory at final submission.
 */
export const dateOfBirthSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || parseDateString(val) !== null, {
    message: 'Date of birth must be a valid date (DD-MM-YYYY)',
  })
  .refine(
    (val) => {
      if (!val) return true;
      const parsed = parseDateString(val);
      return parsed !== null && parsed <= getStartOfToday();
    },
    { message: 'Date of birth cannot be in the future' }
  );

export const strictDateOfBirthSchema = z
  .string()
  .trim()
  .min(1, 'Date of birth is required')
  .refine((val) => parseDateString(val) !== null, {
    message: 'Date of birth must be a valid date (DD-MM-YYYY)',
  })
  .refine(
    (val) => {
      const parsed = parseDateString(val);
      return parsed !== null && parsed <= getStartOfToday();
    },
    { message: 'Date of birth cannot be in the future' }
  );

export const directorItemSchema = z.object({
  id: z.string(),
  /** Stable identity for director-scoped documents. Never an array index. */
  directorKey: z.string().trim().min(1, 'Director reference is missing'),
  fullName: requiredString('Director full name'),
  din: dinSchema,
  designation: requiredString('Designation'),
  gender: requiredString('Gender'),
  appointmentDate: dateStringSchema('Appointment date'),
  dateOfBirth: dateOfBirthSchema,
  mobileNumber: phoneSchema,
  email: optionalEmailSchema,
  pan: directorPanSchema,
  socialCategory: z.string().optional(),
  activeStatus: requiredString('Active status'),
  photographName: z.string().optional(),
  /** Legacy single identity document retained for already-saved drafts. */
  identityDocName: z.string().optional(),
  aadhaarDocName: z.string().optional(),
  aadhaarDocumentId: z.string().optional(),
  panDocName: z.string().optional(),
  panDocumentId: z.string().optional(),
  voterIdDocName: z.string().optional(),
  voterIdDocumentId: z.string().optional(),
});

export const boardOfDirectorsSchema = z.object({
  directors: z
    .array(directorItemSchema)
    .min(1, 'At least one director is required')
    .max(20, 'The board of directors cannot exceed 20 members'),
});

export type BoardOfDirectorsFormValues = z.infer<typeof boardOfDirectorsSchema>;
