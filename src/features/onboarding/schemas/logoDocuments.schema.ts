import { z } from 'zod';

export const logoDocumentsSchema = z.object({
  logoFileName: z.string().optional(),
  incorporationCertName: z.string().optional(),
  panCertName: z.string().optional(),
  gstinCertName: z.string().optional(),
  fssaiLicenseName: z.string().optional(),
  seedLicenseName: z.string().optional(),
  fertilizerLicenseName: z.string().optional(),
  moaAoaDocName: z.string().optional(),
  boardResolutionDocName: z.string().optional(),
});

export type LogoDocumentsFormValues = z.infer<typeof logoDocumentsSchema>;

