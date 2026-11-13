import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type NetworkBadgeVisibility = 'hidden' | 'offline' | 'online';

export interface SyncState {
  isOnline: boolean;
  badgeVisibility: NetworkBadgeVisibility;
  isSyncing: boolean;
  pendingMutationsCount: number;
  lastSyncedAtUtc: string | null;
  conflictCount: number;
  lastSyncError: string | null;
}

const isInitialOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

const initialState: SyncState = {
  isOnline: isInitialOnline,
  badgeVisibility: !isInitialOnline ? 'offline' : 'hidden',
  isSyncing: false,
  pendingMutationsCount: 0,
  lastSyncedAtUtc: null,
  conflictCount: 0,
  lastSyncError: null,
};

export const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    initializeConnectivity: (
      state,
      action: PayloadAction<{ isOnline: boolean; badgeVisibility: NetworkBadgeVisibility }>
    ) => {
      state.isOnline = action.payload.isOnline;
      state.badgeVisibility = action.payload.badgeVisibility;
    },
    setConnectivityOffline: (state) => {
      state.isOnline = false;
      state.badgeVisibility = 'offline';
    },
    setConnectivityOnline: (
      state,
      action: PayloadAction<{ showTemporaryBadge: boolean }>
    ) => {
      state.isOnline = true;
      state.badgeVisibility = action.payload.showTemporaryBadge ? 'online' : 'hidden';
    },
    dismissOnlineBadge: (state) => {
      if (state.badgeVisibility === 'online') {
        state.badgeVisibility = 'hidden';
      }
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      if (!action.payload) {
        state.badgeVisibility = 'offline';
      }
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
      if (action.payload) {
        state.lastSyncError = null;
      }
    },
    setPendingCount: (state, action: PayloadAction<number>) => {
      state.pendingMutationsCount = action.payload;
    },
    setConflictCount: (state, action: PayloadAction<number>) => {
      state.conflictCount = action.payload;
    },
    syncCompleted: (
      state,
      action: PayloadAction<{ syncedAt: string; remainingPending: number; conflicts: number }>
    ) => {
      state.isSyncing = false;
      state.lastSyncedAtUtc = action.payload.syncedAt;
      state.pendingMutationsCount = action.payload.remainingPending;
      state.conflictCount = action.payload.conflicts;
      state.lastSyncError = null;
    },
    syncFailed: (state, action: PayloadAction<string>) => {
      state.isSyncing = false;
      state.lastSyncError = action.payload;
    },
  },
});

export const {
  initializeConnectivity,
  setConnectivityOffline,
  setConnectivityOnline,
  dismissOnlineBadge,
  setOnlineStatus,
  setSyncing,
  setPendingCount,
  setConflictCount,
  syncCompleted,
  syncFailed,
} = syncSlice.actions;

export default syncSlice.reducer;

