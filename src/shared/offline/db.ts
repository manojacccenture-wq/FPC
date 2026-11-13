import Dexie, { type EntityTable } from 'dexie';
import type {
  LocalFarmerRecord,
  LocalVoucherRecord,
  OfflineMutationRecord,
  SyncConflictRecord,
  LocalFormDraftRecord,
} from './types';

/**
 * FpcOfflineDatabase: Free & Open Source IndexedDB storage via Dexie.js v4
 * Enforces compound multi-tenant indexes: [fpcId+id] for complete cross-FPC isolation.
 */
export class FpcOfflineDatabase extends Dexie {
  farmers!: EntityTable<LocalFarmerRecord, 'id'>;
  vouchers!: EntityTable<LocalVoucherRecord, 'id'>;
  mutationsQueue!: EntityTable<OfflineMutationRecord, 'id'>;
  syncConflicts!: EntityTable<SyncConflictRecord, 'id'>;
  formDrafts!: EntityTable<LocalFormDraftRecord, 'id'>;

  constructor() {
    super('FpcOfflineDb');
    this.version(1).stores({
      farmers: 'id, [fpcId+id], fpcId, syncStatus, isDeleted',
      vouchers: 'id, [fpcId+id], fpcId, syncStatus, isDeleted',
      mutationsQueue: 'id, [fpcId+entityType], fpcId, createdAtUtc',
      syncConflicts: 'id, [fpcId+entityId], fpcId, resolutionStatus',
      formDrafts: 'id, [fpcId+userId+formKey], fpcId',
    });
  }

  /**
   * Explicitly opens and initializes the IndexedDB database in the browser.
   * Ensures the database schema is created and visible in browser DevTools immediately.
   */
  async initialize(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return false;
      }
      if (!this.isOpen()) {
        await this.open();
      }
      return true;
    } catch (err) {
      console.warn('Failed to open FpcOfflineDb:', err);
      return false;
    }
  }

  /**
   * Helper to retrieve all pending mutations for a specific active tenant
   */
  async getPendingMutations(fpcId: string): Promise<OfflineMutationRecord[]> {
    return this.mutationsQueue.where('fpcId').equals(fpcId).sortBy('createdAtUtc');
  }

  /**
   * Helper to clear processed mutations atomically
   */
  async removeProcessedMutations(ids: string[]): Promise<void> {
    await this.transaction('rw', this.mutationsQueue, async () => {
      await this.mutationsQueue.bulkDelete(ids);
    });
  }
}

export const offlineDb = new FpcOfflineDatabase();

