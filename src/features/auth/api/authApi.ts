import { baseApi } from '../../../app/api/baseApi';
import { setCredentials, loggedOut, type CurrentUserProfile } from '../slices/authSlice';
import { AUTH_ENDPOINTS } from '../../../shared/api/endpoints/auth.endpoints';

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
  targetFpcId: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ValidateResetTokenRequest {
  token: string;
}

export interface ValidateResetTokenResponse {
  isValid: boolean;
  email?: string;
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
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
        url: AUTH_ENDPOINTS.LOGIN,
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
        url: AUTH_ENDPOINTS.VERIFY_2FA,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    resendTwoFactor: builder.mutation<ApiResponse<TwoFactorChallengeResponse>, ResendTwoFactorRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.RESEND_2FA,
        method: 'POST',
        body,
      }),
    }),

    getCurrentUser: builder.query<ApiResponse<CurrentUserProfile>, void>({
      query: () => ({
        url: AUTH_ENDPOINTS.ME,
        method: 'GET',
      }),
      providesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            dispatch(
              setCredentials({
                user: data.data,
                activeFpcId: data.data.activeFpcId ?? undefined,
                activeRole: data.data.activeRoleCode ?? undefined,
                memberships: data.data.memberships,
              })
            );
          }
        } catch {
          dispatch(loggedOut());
        }
      },
    }),

    refreshToken: builder.mutation<ApiResponse<CurrentUserProfile>, void>({
      query: () => ({
        url: AUTH_ENDPOINTS.REFRESH,
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    switchFpc: builder.mutation<ApiResponse<CurrentUserProfile>, SwitchFpcRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.SWITCH_FPC,
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            // 1. Purge ALL cached queries across all feature APIs and abort in-flight requests
            dispatch(baseApi.util.resetApiState());

            // 2. Set updated profile in Redux store
            dispatch(
              setCredentials({
                user: data.data,
                activeFpcId: data.data.activeFpcId ?? undefined,
                activeRole: data.data.activeRoleCode ?? undefined,
                memberships: data.data.memberships,
              })
            );
          }
        } catch {
          // Error handled in UI component
        }
      },
      invalidatesTags: ['Auth', 'Tenant'],
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: AUTH_ENDPOINTS.LOGOUT,
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    changePassword: builder.mutation<ApiResponse<CurrentUserProfile>, ChangePasswordRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.CHANGE_PASSWORD,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    forgotPassword: builder.mutation<ApiResponse<void>, ForgotPasswordRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.FORGOT_PASSWORD,
        method: 'POST',
        body,
      }),
    }),

    validateResetToken: builder.query<ApiResponse<ValidateResetTokenResponse>, ValidateResetTokenRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.VALIDATE_RESET_TOKEN,
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<ApiResponse<void>, ResetPasswordRequest>({
      query: (body) => ({
        url: AUTH_ENDPOINTS.RESET_PASSWORD,
        method: 'POST',
        body,
      }),
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
  useForgotPasswordMutation,
  useValidateResetTokenQuery,
  useResetPasswordMutation,
} = authApi;

