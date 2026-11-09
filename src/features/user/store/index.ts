import type { CurrentUserProfile } from '../../auth/slices/authSlice';

export interface UserState {
  currentUser: Partial<CurrentUserProfile> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const initialUserState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
};
