import { z } from 'zod';
import { futureOrTodayDateSchema } from '../../../shared/validation/schemas';

export const logoDocumentsSchema = z
  .object({
    logoFileName: z.string().optional(),
    incorporationCertName: z.string().optional(),
    panCertName: z.string().optional(),
    gstinCertName: z.string().optional(),
    fssaiLicenseName: z.string().optional(),
    fssaiExpiryDate: futureOrTodayDateSchema('FSSAI license expiry date', false),
    seedLicenseName: z.string().optional(),
    seedLicenseExpiryDate: futureOrTodayDateSchema('Seed license expiry date', false),
    fertilizerLicenseName: z.string().optional(),
    fertilizerLicenseExpiryDate: futureOrTodayDateSchema('Fertilizer license expiry date', false),
    moaAoaDocName: z.string().optional(),
    boardResolutionDocName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fssaiLicenseName && data.fssaiLicenseName.trim()) {
      if (!data.fssaiExpiryDate || !data.fssaiExpiryDate.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Expiry date is required when FSSAI license is uploaded',
          path: ['fssaiExpiryDate'],
        });
      }
    }
    if (data.seedLicenseName && data.seedLicenseName.trim()) {
      if (!data.seedLicenseExpiryDate || !data.seedLicenseExpiryDate.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Expiry date is required when Seed license is uploaded',
          path: ['seedLicenseExpiryDate'],
        });
      }
    }
    if (data.fertilizerLicenseName && data.fertilizerLicenseName.trim()) {
      if (!data.fertilizerLicenseExpiryDate || !data.fertilizerLicenseExpiryDate.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Expiry date is required when Fertilizer license is uploaded',
          path: ['fertilizerLicenseExpiryDate'],
        });
      }
    }
  });

export type LogoDocumentsFormValues = z.infer<typeof logoDocumentsSchema>;

