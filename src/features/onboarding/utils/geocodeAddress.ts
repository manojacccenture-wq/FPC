/**
 * Address helpers for the geocoding lookup.
 *
 * Keeps the "is this address complete enough to look up" rule and the cache key
 * out of the form, so the same address never produces a second request.
 */
import type { GeocodeAddress } from '../../../shared/types/geolocation.types';

const ADDRESS_FIELDS: Array<keyof GeocodeAddress> = [
  'streetAddress',
  'village',
  'gramPanchayat',
  'block',
  'district',
  'state',
  'pinCode',
];

export function toGeocodeAddress(values: Partial<GeocodeAddress> | null | undefined): GeocodeAddress {
  return {
    streetAddress: values?.streetAddress?.trim() ?? '',
    village: values?.village?.trim() ?? '',
    gramPanchayat: values?.gramPanchayat?.trim() ?? '',
    block: values?.block?.trim() ?? '',
    district: values?.district?.trim() ?? '',
    state: values?.state?.trim() ?? '',
    pinCode: values?.pinCode?.trim() ?? '',
  };
}

/** A lookup only makes sense once every address component is present. */
export function isCompleteAddress(address: GeocodeAddress): boolean {
  return ADDRESS_FIELDS.every((field) => address[field].length > 0);
}

/** Stable, case-insensitive identity of an address; also used as the cache key. */
export function addressKey(address: GeocodeAddress): string {
  return ADDRESS_FIELDS.map((field) => address[field].toLocaleLowerCase('en-IN')).join('|');
}
