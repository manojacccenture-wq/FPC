import { z } from 'zod';
import {
  panSchema,
  tanSchema,
  gstinSchema,
  fssaiSchema,
  requiredString,
} from '../../../shared/validation/schemas';

export const operatingLicenseSchema = z.object({
  id: z.string(),
  licenseType: requiredString('License type'),
  licenseNumber: requiredString('License number'),
  issuingAuthority: requiredString('Issuing authority'),
});

export const legalRegistrationSchema = z.object({
  companyPan: panSchema,
  companyTan: tanSchema,
  gstin: gstinSchema,
  fssaiLicense: fssaiSchema,
  seedLicense: requiredString('Seed license number'),
  fertilizerLicense: requiredString('Fertilizer license number'),
  additionalLicenses: z.array(operatingLicenseSchema),
});

export type LegalRegistrationFormValues = z.infer<typeof legalRegistrationSchema>;
