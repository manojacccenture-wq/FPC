import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserMembership {
  fpcId: string;
  fpcName: string;
  cin?: string;
  roleId: string;
  roleName: string;
  roleCode: string;
  isActive: boolean;
  logoUrl?: string | null;
}

export interface CurrentUserProfile {
  userId: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
  isTwoFactorEnabled: boolean;
  activeFpcId: string | null;
  activeFpcName: string | null;
  activeRoleCode: string | null;
  permissions: string[];
  memberships: UserMembership[];
  mustChangePassword?: boolean;
  activeFpcLogoUrl?: string | null;
  workspaceTitle?: string | null;
  organizationName?: string | null;
}

export interface PendingTwoFactorChallenge {
  challengeId: string;
  email: string;
  message?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: CurrentUserProfile | null;
  activeFpcId: string | null;
  activeRole: string | null;
  activeFpcLogoUrl: string | null;
  availableMemberships: UserMembership[];
  isInitialized: boolean;
  pendingTwoFactor: PendingTwoFactorChallenge | null;
  mustChangePassword?: boolean;
}

const PENDING_2FA_STORAGE_KEY = 'fpc_pending_2fa';

function getStoredPending2Fa(): PendingTwoFactorChallenge | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PENDING_2FA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.challengeId === 'string' && typeof parsed.email === 'string') {
      return parsed;
    }
  } catch {
    // Ignore JSON parse errors or storage failures
  }
  return null;
}

function persistPending2Fa(challenge: PendingTwoFactorChallenge | null) {
  if (typeof window === 'undefined') return;
  try {
    if (challenge) {
      sessionStorage.setItem(PENDING_2FA_STORAGE_KEY, JSON.stringify(challenge));
    } else {
      sessionStorage.removeItem(PENDING_2FA_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

const initialState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  activeFpcId: null,
  activeRole: null,
  activeFpcLogoUrl: null,
  availableMemberships: [],
  isInitialized: false,
  pendingTwoFactor: getStoredPending2Fa(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPendingTwoFactor: (state, action: PayloadAction<PendingTwoFactorChallenge>) => {
      state.pendingTwoFactor = action.payload;
      persistPending2Fa(action.payload);
    },
    clearPendingTwoFactor: (state) => {
      state.pendingTwoFactor = null;
      persistPending2Fa(null);
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        user: CurrentUserProfile;
        activeFpcId?: string;
        activeRole?: string;
        memberships?: UserMembership[];
      }>
    ) => {
      state.isAuthenticated = true;
      state.currentUser = action.payload.user;
      state.activeFpcId = action.payload.activeFpcId ?? action.payload.user.activeFpcId ?? null;
      state.activeRole = action.payload.activeRole ?? action.payload.user.activeRoleCode ?? null;
      state.activeFpcLogoUrl = action.payload.user.activeFpcLogoUrl ?? null;
      state.availableMemberships = action.payload.memberships ?? action.payload.user.memberships ?? [];
      state.mustChangePassword = action.payload.user.mustChangePassword ?? false;
      state.isInitialized = true;
      state.pendingTwoFactor = null;
      persistPending2Fa(null);
    },
    passwordChanged: (state) => {
      state.mustChangePassword = false;
      if (state.currentUser) {
        state.currentUser.mustChangePassword = false;
      }
    },
    setActiveFpc: (
      state,
      action: PayloadAction<{ fpcId: string; role?: string }>
    ) => {
      state.activeFpcId = action.payload.fpcId;
      if (action.payload.role) {
        state.activeRole = action.payload.role;
      }
      if (state.currentUser) {
        state.currentUser.activeFpcId = action.payload.fpcId;
        const matchedMembership = state.currentUser.memberships?.find(
          (m) => m.fpcId === action.payload.fpcId
        );
        if (matchedMembership) {
          state.currentUser.activeFpcName = matchedMembership.fpcName;
          state.currentUser.organizationName = matchedMembership.fpcName;
          if (matchedMembership.roleCode) {
            state.currentUser.activeRoleCode = matchedMembership.roleCode;
            state.activeRole = matchedMembership.roleCode;
          }
          state.currentUser.activeFpcLogoUrl = matchedMembership.logoUrl ?? null;
          state.activeFpcLogoUrl = matchedMembership.logoUrl ?? null;
        } else {
          // If no matching membership, clear logo so previous FPC's logo is never retained
          state.currentUser.activeFpcLogoUrl = null;
          state.activeFpcLogoUrl = null;
        }
      } else {
        state.activeFpcLogoUrl = null;
      }
    },
    loggedOut: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.activeFpcId = null;
      state.activeRole = null;
      state.activeFpcLogoUrl = null;
      state.availableMemberships = [];
      state.isInitialized = true;
      state.pendingTwoFactor = null;
      persistPending2Fa(null);
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const {
  setPendingTwoFactor,
  clearPendingTwoFactor,
  setCredentials,
  passwordChanged,
  setActiveFpc,
  loggedOut,
  setInitialized,
} = authSlice.actions;
export default authSlice.reducer;
