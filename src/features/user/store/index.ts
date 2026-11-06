import type { AuthUser } from '../../auth/api/auth.api';

export interface UserState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const initialUserState: UserState = {
  currentUser: {
    id: 'usr_tsf_admin_001',
    name: 'TSF Central Administrator',
    email: 'admin@tsf.org',
    role: 'TSF Admin',
    organization: 'Tata Steel Foundation',
  },
  isAuthenticated: true,
  isLoading: false,
};

