import { baseApi } from '../../../app/api/baseApi';
import { TAG_TYPES } from '../../../app/api/tagTypes';
import type { PagedResult } from '../../../shared/types/pagination.types';
import type { GetOnboardRecordsArgs } from '../../../shared/types/api.types';
import { INVITATION_ENDPOINTS } from '../../../shared/api/endpoints/invitations.endpoints';

export type { GetOnboardRecordsArgs };

export interface OnboardRecordDto {
  id: string;
  recordType: 'invitation' | 'fpc';
  invitationId?: string | null;
  fpcId?: string | null;
  cin?: string | null;
  token?: string | null;
  name: string;
  location: string;
  state: string;
  district: string;
  farmers: number;
  shareholders: number;
  status: string;
  statusLabel: string;
  createdAtUtc: string;
}

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
  invitationId?: string | null;
}

export interface FpcDocumentPayload {
  documentType: string;
  fileName: string;
  /** Identifier returned by the upload endpoint; attaches the stored file. */
  documentId?: string;
  expiryDate?: string;
}

export interface UploadedFpcDocument {
  documentId: string;
  documentType: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  expiryDate?: string | null;
}

export interface UploadFpcDocumentRequest {
  token: string;
  documentType: string;
  file: File;
  expiryDate?: string;
}

export interface CompleteFpcInvitationRequest {
  token: string;
  legalName?: string;
  cin?: string;
  registrationDate?: string;
  officialEmail?: string;
  officialMobile?: string;
  pan?: string;
  tan?: string;
  gstin?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  addressLine1?: string;
  addressLine2?: string;
  pincode?: string;
  district?: string;
  state?: string;
  documents?: FpcDocumentPayload[];
  clientMutationId?: string;
  registrationDataJson?: string;
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
      query: () => INVITATION_ENDPOINTS.ROOT,
      transformResponse: (response: ApiResponse<FpcInvitationDto[]>) => response.data,
      providesTags: [TAG_TYPES.FpcInvitation],
    }),

    getOnboardRecords: builder.query<PagedResult<OnboardRecordDto>, GetOnboardRecordsArgs | void>({
      query: (args) => INVITATION_ENDPOINTS.ONBOARD_RECORDS(args),
      transformResponse: (response: ApiResponse<PagedResult<OnboardRecordDto>>) => response.data,
      providesTags: [TAG_TYPES.FpcInvitation, TAG_TYPES.Fpc],
    }),

    getFpcInvitationById: builder.query<FpcInvitationDto, string>({
      query: (id) => INVITATION_ENDPOINTS.BY_ID(id),
      transformResponse: (response: ApiResponse<FpcInvitationDto>) => response.data,
      providesTags: (_result, _error, id) => [{ type: TAG_TYPES.FpcInvitation, id }],
    }),

    validateFpcInvitation: builder.query<InvitationValidationResult, string>({
      query: (token) => INVITATION_ENDPOINTS.VALIDATE(token),
      transformResponse: (response: ApiResponse<InvitationValidationResult>) => response.data,
    }),

    createFpcInvitation: builder.mutation<FpcInvitationDto, CreateFpcInvitationRequest>({
      query: (body) => ({
        url: INVITATION_ENDPOINTS.ROOT,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<FpcInvitationDto>) => response.data,
      invalidatesTags: [TAG_TYPES.FpcInvitation],
    }),

    revokeFpcInvitation: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: INVITATION_ENDPOINTS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: [TAG_TYPES.FpcInvitation],
    }),

    /**
     * Uploads the actual file bytes for an onboarding document. The browser sets the
     * multipart boundary, so no Content-Type header is forced for this endpoint.
     */
    uploadDocument: builder.mutation<UploadedFpcDocument, UploadFpcDocumentRequest>({
      query: ({ token, documentType, file, expiryDate }) => {
        const body = new FormData();
        body.append('documentType', documentType);
        body.append('file', file, file.name);
        if (expiryDate) {
          body.append('expiryDate', expiryDate);
        }

        return {
          url: INVITATION_ENDPOINTS.DOCUMENTS(token),
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: ApiResponse<UploadedFpcDocument>) => response.data,
    }),

    completeFpcInvitation: builder.mutation<
      { success: boolean; message?: string },
      CompleteFpcInvitationRequest
    >({
      query: (body) => ({
        url: INVITATION_ENDPOINTS.COMPLETE,
        method: 'POST',
        body,
      }),
      invalidatesTags: [TAG_TYPES.FpcInvitation, TAG_TYPES.Fpc],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFpcInvitationsQuery,
  useGetOnboardRecordsQuery,
  useLazyGetOnboardRecordsQuery,
  useGetFpcInvitationByIdQuery,
  useValidateFpcInvitationQuery,
  useCreateFpcInvitationMutation,
  useRevokeFpcInvitationMutation,
  useUploadDocumentMutation,
  useCompleteFpcInvitationMutation,
} = fpcInvitationApi;

