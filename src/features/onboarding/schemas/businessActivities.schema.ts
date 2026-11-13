import { z } from 'zod';
import {
  requiredString,
  dateStringSchema,
} from '../../../shared/validation/schemas';

export const businessActivitiesSchema = z.object({
  primaryActivity: z.union([
    z.array(z.string().trim()).min(1, 'Select at least one primary business activity'),
    z.string().trim().min(1, 'Primary business activity is required'),
  ]),
  operationalStatus: requiredString('Operational status'),
  commencementDate: dateStringSchema('Date of commencement'),
  commoditiesHandled: z.union([
    z.array(z.string().trim()).min(1, 'Select at least one commodity handled'),
    z.string().trim().min(1, 'Commodities handled is required'),
  ]),
  targetFarmers: requiredString('Target farmers enrolment'),
  villagesCovered: requiredString('Villages covered'),
  activityScope: requiredString('Activity scope & operational description'),
});

export type BusinessActivitiesFormValues = z.infer<typeof businessActivitiesSchema>;

