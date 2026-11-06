import type { AuthUser } from '../../auth/api/auth.api';

export const userApi = {
  getProfile: async (userId: string): Promise<AuthUser> => {
    return {
      id: userId,
      name: 'TSF Central Administrator',
      email: 'admin@tsf.org',
      role: 'TSF Admin',
      organization: 'Tata Steel Foundation',
    };
  },

  updateProfile: async (userId: string, data: Partial<AuthUser>): Promise<AuthUser> => {
    return {
      id: userId,
      name: data.name || 'TSF Central Administrator',
      email: data.email || 'admin@tsf.org',
      role: data.role || 'TSF Admin',
      organization: 'Tata Steel Foundation',
    };
  },
};

