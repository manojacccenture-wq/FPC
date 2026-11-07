import { z } from 'zod';
import {
  requiredString,
  dinSchema,
  phoneSchema,
  optionalEmailSchema,
  directorPanSchema,
  dateStringSchema,
} from '../../../shared/validation/schemas';

export const directorItemSchema = z.object({
  id: z.string(),
  fullName: requiredString('Director full name'),
  din: dinSchema,
  designation: requiredString('Designation'),
  gender: requiredString('Gender'),
  appointmentDate: dateStringSchema('Appointment date'),
  mobileNumber: phoneSchema,
  email: optionalEmailSchema,
  pan: directorPanSchema,
  socialCategory: z.string().optional(),
  activeStatus: requiredString('Active status'),
  photographName: z.string().optional(),
  identityDocName: z.string().optional(),
});

export const boardOfDirectorsSchema = z.object({
  directors: z.array(directorItemSchema).min(1, 'At least one director is required'),
});

export type BoardOfDirectorsFormValues = z.infer<typeof boardOfDirectorsSchema>;

