import { z } from 'zod';
import {
  requiredString,
  emailSchema,
  phoneSchema,
  pinCodeSchema,
} from '../../../shared/validation/schemas';

export const addressLocationSchema = z.object({
  streetAddress: requiredString('Registered office street address'),
  state: requiredString('State'),
  district: requiredString('District'),
  block: requiredString('Block'),
  gramPanchayat: requiredString('Gram Panchayat'),
  village: requiredString('Village'),
  pinCode: pinCodeSchema,
  officeMobile: phoneSchema,
  officialEmail: emailSchema,
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export type AddressLocationFormValues = z.infer<typeof addressLocationSchema>;

