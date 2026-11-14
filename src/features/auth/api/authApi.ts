import { baseApi } from '../../../app/api/baseApi';
import type { CurrentUserProfile } from '../slices/authSlice';

export interface LoginRequest {
  email: string;
  password?: string;
  twoFactorCode?: string;
}

export interface TwoFactorChallengeResponse {
  challengeId: string;
  message: string;
}

export type LoginResponseData = CurrentUserProfile | TwoFactorChallengeResponse;

export interface VerifyTwoFactorRequest {
  email: string;
  code: string;
  challengeId?: string;
}

export interface ResendTwoFactorRequest {
  email: string;
  challengeId?: string;
}

export interface SwitchFpcRequest {
  targetFpcId: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  correlationId?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponseData>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Only a full successful login changes the authenticated session.
      // When a 2FA challenge is returned, cookies have not been issued yet.
      // Refetching /auth/me on a challenge would receive 401 and trigger an accidental logout.
      invalidatesTags: (result, error) => {
        if (error) return [];
        if (result?.data && 'challengeId' in result.data) return [];
        return ['Auth'];
      },
    }),

    verifyTwoFactor: builder.mutation<ApiResponse<CurrentUserProfile>, VerifyTwoFactorRequest>({
      query: (body) => ({
        url: '/auth/verify-2fa',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    resendTwoFactor: builder.mutation<ApiResponse<TwoFactorChallengeResponse>, ResendTwoFactorRequest>({
      query: (body) => ({
        url: '/auth/2fa/resend',
        method: 'POST',
        body,
      }),
    }),

    getCurrentUser: builder.query<ApiResponse<CurrentUserProfile>, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),

    refreshToken: builder.mutation<ApiResponse<CurrentUserProfile>, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    switchFpc: builder.mutation<ApiResponse<CurrentUserProfile>, SwitchFpcRequest>({
      query: (body) => ({
        url: '/auth/switch-fpc',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth', 'Tenant'],
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    changePassword: builder.mutation<ApiResponse<CurrentUserProfile>, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useVerifyTwoFactorMutation,
  useResendTwoFactorMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useRefreshTokenMutation,
  useSwitchFpcMutation,
  useLogoutMutation,
  useChangePasswordMutation,
} = authApi;

