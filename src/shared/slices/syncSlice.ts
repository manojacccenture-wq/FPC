import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingMutationsCount: number;
  lastSyncedAtUtc: string | null;
  conflictCount: number;
  lastSyncError: string | null;
}

const initialState: SyncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
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
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
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
  setOnlineStatus,
  setSyncing,
  setPendingCount,
  setConflictCount,
  syncCompleted,
  syncFailed,
} = syncSlice.actions;

export default syncSlice.reducer;

