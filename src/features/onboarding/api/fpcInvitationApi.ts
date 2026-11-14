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
      query: () => '/fpc-invitations',
      transformResponse: (response: ApiResponse<FpcInvitationDto[]>) => response.data,
      providesTags: [TAG_TYPES.FpcInvitation],
    }),

    getFpcInvitationById: builder.query<FpcInvitationDto, string>({
      query: (id) => `/fpc-invitations/${id}`,
      transformResponse: (response: ApiResponse<FpcInvitationDto>) => response.data,
      providesTags: (_result, _error, id) => [{ type: TAG_TYPES.FpcInvitation, id }],
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
          url: `/fpc-invitations/${encodeURIComponent(token)}/documents`,
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
        url: '/fpc-invitations/complete',
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
  useGetFpcInvitationByIdQuery,
  useValidateFpcInvitationQuery,
  useCreateFpcInvitationMutation,
  useRevokeFpcInvitationMutation,
  useUploadDocumentMutation,
  useCompleteFpcInvitationMutation,
} = fpcInvitationApi;

