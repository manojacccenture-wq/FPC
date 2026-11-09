import { baseApi } from '../../../app/api/baseApi';
import { TAG_TYPES } from '../../../app/api/tagTypes';

export interface CreateFpcInvitationRequest {
  companyName: string;
  nominatedAdmin: string;
  email: string;
  phoneNumber: string;
  state: string;
  district: string;
}

export interface FpcInvitationDto {
  id: string;
  token: string;
  companyName: string;
  nominatedAdmin: string;
  email: string;
  phoneNumber: string;
  state: string;
  district: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Expired' | 'Revoked';
  expiresAtUtc: string;
  registrationUrl: string;
  createdAtUtc: string;
}

export interface InvitationValidationResult {
  isValid: boolean;
  errorMessage?: string | null;
  companyName?: string | null;
  nominatedAdmin?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  state?: string | null;
  district?: string | null;
  expiresAtUtc?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string | null;
  timestampUtc: string;
  correlationId: string;
}

export const fpcInvitationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFpcInvitations: builder.query<FpcInvitationDto[], void>({
      query: () => '/fpc-invitations',
      transformResponse: (response: ApiResponse<FpcInvitationDto[]>) => response.data,
      providesTags: [TAG_TYPES.FpcInvitation],
    }),

    validateFpcInvitation: builder.query<InvitationValidationResult, string>({
      query: (token) => `/fpc-invitations/validate?token=${encodeURIComponent(token)}`,
      transformResponse: (response: ApiResponse<InvitationValidationResult>) => response.data,
    }),

    createFpcInvitation: builder.mutation<FpcInvitationDto, CreateFpcInvitationRequest>({
      query: (body) => ({
        url: '/fpc-invitations',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<FpcInvitationDto>) => response.data,
      invalidatesTags: [TAG_TYPES.FpcInvitation],
    }),

    revokeFpcInvitation: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/fpc-invitations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [TAG_TYPES.FpcInvitation],
    }),

    completeFpcInvitation: builder.mutation<{ success: boolean; message?: string }, { token: string }>({
      query: (body) => ({
        url: '/fpc-invitations/complete',
        method: 'POST',
        body,
      }),
      invalidatesTags: [TAG_TYPES.FpcInvitation],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFpcInvitationsQuery,
  useValidateFpcInvitationQuery,
  useCreateFpcInvitationMutation,
  useRevokeFpcInvitationMutation,
  useCompleteFpcInvitationMutation,
} = fpcInvitationApi;

