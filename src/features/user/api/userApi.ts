import type { CurrentUserProfile } from '../../auth/slices/authSlice';

export const userApi = {
  getProfile: async (userId: string): Promise<Partial<CurrentUserProfile>> => {
    return {
      userId,
      fullName: 'TSF Central Administrator',
      email: 'admin@tsf.org',
      activeRoleCode: 'TsfAdmin',
    };
  },

  updateProfile: async (userId: string, data: Partial<CurrentUserProfile>): Promise<Partial<CurrentUserProfile>> => {
    return {
      userId,
      fullName: data.fullName || 'TSF Central Administrator',
      email: data.email || 'admin@tsf.org',
      activeRoleCode: data.activeRoleCode || 'TsfAdmin',
    };
  },
};
