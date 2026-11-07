import { z } from 'zod';
import {
  requiredString,
  dateStringSchema,
} from '../../../shared/validation/schemas';

export const businessActivitiesSchema = z.object({
  primaryActivity: requiredString('Primary business activity'),
  operationalStatus: requiredString('Operational status'),
  commencementDate: dateStringSchema('Date of commencement'),
  commoditiesHandled: requiredString('Commodities handled'),
  targetFarmers: requiredString('Target farmers enrolment'),
  villagesCovered: requiredString('Villages covered'),
  activityScope: requiredString('Activity scope & operational description'),
});

export type BusinessActivitiesFormValues = z.infer<typeof businessActivitiesSchema>;

