/**
 * Offline entity and synchronization types for Dexie.js IndexedDB
 */

export type SyncStatus = 'synced' | 'created_offline' | 'updated_offline' | 'conflict';

export type MutationOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export interface LocalFarmerRecord {
  id: string; // UUIDv7
  fpcId: string;
  fullName: string;
  mobileNumber: string;
  panNumber?: string;
  landHoldingAcres: number;
  primaryCrop?: string;
  village?: string;
  syncVersion: number;
  syncStatus: SyncStatus;
  clientUpdatedAtUtc: string;
  isDeleted: boolean;
}

export interface LocalVoucherRecord {
  id: string; // UUIDv7
  fpcId: string;
  voucherNumber: string;
  voucherDate: string;
  voucherType: 'PURCHASE' | 'SALE' | 'PAYMENT' | 'RECEIPT';
  partyName: string;
  totalAmount: number;
  syncVersion: number;
  syncStatus: SyncStatus;
  clientUpdatedAtUtc: string;
  isDeleted: boolean;
}

export interface OfflineMutationRecord {
  id: string; // UUIDv7
  fpcId: string;
  userId: string;
  clientMutationId: string; // Deterministic idempotency key
  entityType: 'farmer' | 'voucher' | 'shareholder' | 'baseline';
  entityId: string;
  operation: MutationOperation;
  baseSyncVersion: number;
  payloadJson: string;
  createdAtUtc: string;
  retryCount: number;
  lastError?: string;
}

export interface SyncConflictRecord {
  id: string;
  fpcId: string;
  entityType: string;
  entityId: string;
  clientMutationId: string;
  serverVersion: number;
  clientStateJson: string;
  serverStateJson: string;
  conflictType: 'CONCURRENT_UPDATE' | 'TOMBSTONE_DELETED' | 'TENANT_REVOKED';
  resolutionStatus: 'PENDING_REVIEW' | 'RESOLVED_KEEP_SERVER' | 'RESOLVED_OVERWRITE';
  createdAtUtc: string;
}

export interface LocalFormDraftRecord {
  id: string; // [fpcId+userId+formKey]
  fpcId: string;
  userId: string;
  formKey: string; // e.g. 'onboard_step1', 'new_voucher'
  dataJson: string;
  lastSavedAtUtc: string;
}

