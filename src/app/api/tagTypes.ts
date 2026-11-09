/**
 * Centralized RTK Query Tag Types for cache invalidation & refetching
 */
export const TAG_TYPES = {
  Auth: 'Auth',
  Tenant: 'Tenant',
  Farmer: 'Farmer',
  Voucher: 'Voucher',
  Stock: 'Stock',
  Compliance: 'Compliance',
  Audit: 'Audit',
  Sync: 'Sync',
  FpcInvitation: 'FpcInvitation',
} as const;

export type TagType = (typeof TAG_TYPES)[keyof typeof TAG_TYPES];

export const ALL_TAG_TYPES: TagType[] = Object.values(TAG_TYPES);

