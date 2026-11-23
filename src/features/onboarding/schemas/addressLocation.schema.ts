import { z } from 'zod';
import {
  requiredString,
  emailSchema,
  phoneSchema,
  pinCodeSchema,
  coordinateStringSchema,
} from '../../../shared/validation/schemas';
import { MAX_LATITUDE, MAX_LONGITUDE, MIN_LATITUDE, MIN_LONGITUDE } from '../../../shared/utils/coordinates';

/** Where the coordinates in the form came from; stored with the draft. */
export const coordinateSourceSchema = z.enum(['', 'gps', 'geocoding', 'manual']).optional();

export const addressLocationSchema = z
  .object({
    streetAddress: requiredString('Registered office street address'),
    state: requiredString('State'),
    district: requiredString('District'),
    block: requiredString('Block'),
    gramPanchayat: requiredString('Gram Panchayat'),
    village: requiredString('Village'),
    pinCode: pinCodeSchema,
    officeMobile: phoneSchema,
    officialEmail: emailSchema,
    latitude: coordinateStringSchema('Latitude', MIN_LATITUDE, MAX_LATITUDE),
    longitude: coordinateStringSchema('Longitude', MIN_LONGITUDE, MAX_LONGITUDE),
    coordinateSource: coordinateSourceSchema,
    coordinatesConfirmed: z.boolean().optional(),
  })
  .superRefine((values, ctx) => {
    const latitude = (values.latitude ?? '').trim();
    const longitude = (values.longitude ?? '').trim();

    if (latitude && !longitude) {
      ctx.addIssue({
        code: 'custom',
        path: ['longitude'],
        message: 'Enter the longitude as well, or clear the latitude',
      });
    }

    if (!latitude && longitude) {
      ctx.addIssue({
        code: 'custom',
        path: ['latitude'],
        message: 'Enter the latitude as well, or clear the longitude',
      });
    }

    if (!latitude || !longitude) return;

    if (Number(latitude) === 0 && Number(longitude) === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['latitude'],
        message: '0, 0 is not a valid office location',
      });
    }

    // Device coordinates are the administrator's position, not necessarily the
    // FPC's registered office, so they must be confirmed before being saved.
    if (values.coordinateSource === 'gps' && values.coordinatesConfirmed !== true) {
      ctx.addIssue({
        code: 'custom',
        path: ['latitude'],
        message: "Confirm that the detected location is the FPC's registered office",
      });
    }
  });

export type AddressLocationFormValues = z.infer<typeof addressLocationSchema>;
