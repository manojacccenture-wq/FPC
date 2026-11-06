/**
 * Centralized Authentication API for FPC Management
 */

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  token?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthUser> => {
    // Simulated auth service call
    return {
      id: 'usr_tsf_admin_001',
      name: 'TSF Central Administrator',
      email: credentials.email || 'admin@tsf.org',
      role: 'TSF Admin',
      organization: 'Tata Steel Foundation',
      token: 'mock_jwt_token_fpc_2026',
    };
  },

  logout: async (): Promise<boolean> => {
    return true;
  },

  getSession: async (): Promise<AuthUser | null> => {
    return {
      id: 'usr_tsf_admin_001',
      name: 'TSF Central Administrator',
      email: 'admin@tsf.org',
      role: 'TSF Admin',
      organization: 'Tata Steel Foundation',
    };
  },
};

