import { baseApi } from '../../../app/api/baseApi';
import { TAG_TYPES } from '../../../app/api/tagTypes';
import type { PagedResult } from '../../../shared/types/pagination.types';
import type { GetFpcsPagedArgs } from '../../../shared/types/api.types';
import { FPC_ENDPOINTS } from '../../../shared/api/endpoints/fpc.endpoints';

export type { GetFpcsPagedArgs };

export interface FpcSummaryDto {
  id: string;
  code: string;
  cin?: string | null;
  name: string;
  district: string;
  state: string;
  location: string;
  farmersCount: number;
  shareholdersCount: number;
  status: 'Active' | 'Onboarding' | 'Overdue' | 'Inactive' | 'Compliance';
  statusLabel: string;
  isActive: boolean;
  createdAtUtc: string;
  registrationProgressPercentage?: number;
  completedStepsCount?: number;
  canApprove?: boolean;
  canReject?: boolean;
  approvalEligibilityReason?: string | null;
  rejectionEligibilityReason?: string | null;
}

export interface FpcDocumentDto {
  id: string;
  documentType: string;
  /** Present only on director identity documents. */
  directorKey?: string | null;
  fileName: string;
  expiryDate?: string | null;
  storagePath?: string | null;
  contentType?: string | null;
  fileSizeBytes?: number | null;
  uploadStatus?: 'Pending' | 'Attached' | 'LegacyMissingFile' | 'Superseded' | 'SoftDeleted' | null;
  documentSlotKey?: string | null;
  versionNumber?: number | null;
  isLatest?: boolean | null;
  amendmentNotes?: string | null;
  effectiveDate?: string | null;
  supersededAtUtc?: string | null;
  uploadedAtUtc?: string | null;
}

export interface FpcDocumentVersionItemDto {
  id: string;
  documentSlotKey: string;
  documentType: string;
  directorKey?: string | null;
  versionNumber: number;
  isLatest: boolean;
  uploadStatus: string;
  fileName: string;
  amendmentNotes?: string | null;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  uploadedAtUtc: string;
  supersededAtUtc?: string | null;
  uploaderName?: string | null;
  fileSizeBytes?: number | null;
}

export interface LegacyDocumentAttachmentDto {
  id: string;
  documentType: string;
  directorKey?: string | null;
  fileName: string;
  storagePath?: string | null;
  uploadStatus?: string | null;
  uploadedAtUtc: string;
  expiryDate?: string | null;
  isPreservedLegacy: boolean;
  notice: string;
}

export interface FpcDocumentHistoryResponseDto {
  fpcId: string;
  documentSlotKey: string;
  documentType: string;
  directorKey?: string | null;
  totalVersions: number;
  latestActiveVersionNumber?: number | null;
  hasLegacyDocument: boolean;
  legacyDocument?: LegacyDocumentAttachmentDto | null;
  versions: FpcDocumentVersionItemDto[];
}

export interface UploadFpcDocumentVersionRequest {
  fpcId: string;
  formData: FormData;
  idempotencyKey?: string;
}

export interface SoftDeleteDocumentVersionRequest {
  fpcId: string;
  documentId: string;
  reason: string;
}

export interface FpcDetailsDto {
  id: string;
  code: string;
  cin?: string | null;
  name: string;
  pan?: string | null;
  tan?: string | null;
  gstin?: string | null;
  registrationDate?: string | null;
  state: string;
  district: string;
  pincode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  primaryEmail: string;
  primaryMobile: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  location: string;
  farmersCount: number;
  shareholdersCount: number;
  totalEquitySharesAllotted?: number | null;
  status: 'Active' | 'Onboarding' | 'Overdue' | 'Inactive' | 'Compliance';
  statusLabel: string;
  isActive: boolean;
  createdAtUtc: string;
  lastModifiedAtUtc?: string | null;
  documents?: FpcDocumentDto[] | null;
  registrationDataJson?: string | null;
  registrationProgressPercentage?: number;
  completedStepsCount?: number;
  canApprove?: boolean;
  canReject?: boolean;
  approvalEligibilityReason?: string | null;
  rejectionEligibilityReason?: string | null;
}

export interface SaveFpcRegistrationDraftRequest {
  id: string;
  registrationDataJson: string;
  lastCompletedStep?: number;
  baseLastModifiedAtUtc?: string;
}

export interface SubmitFpcRegistrationRequest {
  id: string;
  remarks?: string;
}

export interface ApproveFpcRequest {
  id: string;
  remarks?: string;
}

export interface RejectFpcRequest {
  id: string;
  reason: string;
}

export interface UploadFpcDocumentRequest {
  fpcId: string;
  formData: FormData;
}

export interface UploadedFpcDocumentDto {
  documentId: string;
  documentType: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  expiryDate?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string | null;
  timestampUtc: string;
  correlationId: string;
}

export const fpcApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFpcs: builder.query<FpcSummaryDto[], void>({
      query: () => FPC_ENDPOINTS.ROOT,
      transformResponse: (response: ApiResponse<FpcSummaryDto[]>) => response.data,
      providesTags: [TAG_TYPES.Fpc],
      keepUnusedDataFor: 300,
    }),

    getFpcsPaged: builder.query<PagedResult<FpcSummaryDto>, GetFpcsPagedArgs | void>({
      query: (args) => FPC_ENDPOINTS.PAGED(args),
      transformResponse: (response: ApiResponse<PagedResult<FpcSummaryDto>>) => response.data,
      providesTags: [TAG_TYPES.Fpc],
      keepUnusedDataFor: 300,
    }),

    getFpcById: builder.query<FpcSummaryDto, string>({
      query: (id) => FPC_ENDPOINTS.BY_ID(id),
      transformResponse: (response: ApiResponse<FpcSummaryDto>) => response.data,
      providesTags: (_result, _error, id) => [{ type: TAG_TYPES.Fpc, id }],
      keepUnusedDataFor: 300,
    }),

    getFpcDetails: builder.query<FpcDetailsDto, string>({
      query: (id) => FPC_ENDPOINTS.DETAILS(id),
      transformResponse: (response: ApiResponse<FpcDetailsDto>) => response.data,
      providesTags: (_result, _error, id) => [{ type: TAG_TYPES.Fpc, id }],
      keepUnusedDataFor: 300,
    }),

    /**
     * Streams a stored document through the API as a blob. The backend proxies the
     * storage provider, so no storage URL is ever exposed to the browser.
     */
    getFpcDocumentContent: builder.query<
      Blob,
      { fpcId: string; documentId: string; download?: boolean }
    >({
      query: ({ fpcId, documentId, download }) => ({
        url: FPC_ENDPOINTS.DOCUMENT_CONTENT(fpcId, documentId, download),
        responseHandler: (response) => response.blob(),
      }),
      keepUnusedDataFor: 5,
    }),

    deleteFpc: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: FPC_ENDPOINTS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: [TAG_TYPES.Fpc],
    }),

    saveFpcDraft: builder.mutation<ApiResponse<FpcDetailsDto>, SaveFpcRegistrationDraftRequest>({
      query: ({ id, ...body }) => ({
        url: FPC_ENDPOINTS.DRAFT(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: TAG_TYPES.Fpc, id }, TAG_TYPES.Fpc],
    }),

    submitFpcRegistration: builder.mutation<ApiResponse<FpcDetailsDto>, SubmitFpcRegistrationRequest>({
      query: ({ id, ...body }) => ({
        url: FPC_ENDPOINTS.SUBMIT_REGISTRATION(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: TAG_TYPES.Fpc, id }, TAG_TYPES.Fpc],
    }),

    approveFpc: builder.mutation<ApiResponse<FpcDetailsDto>, ApproveFpcRequest>({
      query: ({ id, ...body }) => ({
        url: FPC_ENDPOINTS.APPROVE(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: TAG_TYPES.Fpc, id }, TAG_TYPES.Fpc],
    }),

    rejectFpc: builder.mutation<ApiResponse<FpcDetailsDto>, RejectFpcRequest>({
      query: ({ id, ...body }) => ({
        url: FPC_ENDPOINTS.REJECT(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: TAG_TYPES.Fpc, id }, TAG_TYPES.Fpc],
    }),

    uploadFpcDocument: builder.mutation<ApiResponse<UploadedFpcDocumentDto>, UploadFpcDocumentRequest>({
      query: ({ fpcId, formData }) => ({
        url: FPC_ENDPOINTS.DOCUMENTS(fpcId),
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _error, { fpcId }) => [
        { type: TAG_TYPES.Fpc, id: fpcId },
        TAG_TYPES.Fpc,
        'Auth',
      ],
    }),

    getFpcDocumentHistory: builder.query<
      FpcDocumentHistoryResponseDto,
      { fpcId: string; documentSlotKey: string }
    >({
      query: ({ fpcId, documentSlotKey }) =>
        FPC_ENDPOINTS.DOCUMENT_HISTORY(fpcId, documentSlotKey),
      transformResponse: (response: ApiResponse<FpcDocumentHistoryResponseDto>) =>
        response.data,
      providesTags: (_result, _error, { fpcId, documentSlotKey }) => [
        { type: TAG_TYPES.Fpc, id: `${fpcId}-${documentSlotKey}` },
      ],
      keepUnusedDataFor: 300,
    }),

    uploadFpcDocumentVersion: builder.mutation<
      ApiResponse<UploadedFpcDocumentDto>,
      UploadFpcDocumentVersionRequest
    >({
      query: ({ fpcId, formData, idempotencyKey }) => ({
        url: FPC_ENDPOINTS.DOCUMENT_VERSIONS(fpcId),
        method: 'POST',
        body: formData,
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      }),
      invalidatesTags: (_result, _error, { fpcId }) => [
        { type: TAG_TYPES.Fpc, id: fpcId },
        TAG_TYPES.Fpc,
      ],
    }),

    deleteFpcDocumentVersion: builder.mutation<
      ApiResponse<UploadedFpcDocumentDto | null>,
      SoftDeleteDocumentVersionRequest
    >({
      query: ({ fpcId, documentId, reason }) => ({
        url: FPC_ENDPOINTS.DOCUMENT_BY_ID(fpcId, documentId),
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { fpcId }) => [
        { type: TAG_TYPES.Fpc, id: fpcId },
        TAG_TYPES.Fpc,
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFpcsQuery,
  useGetFpcsPagedQuery,
  useGetFpcByIdQuery,
  useGetFpcDetailsQuery,
  useLazyGetFpcDocumentContentQuery,
  useDeleteFpcMutation,
  useSaveFpcDraftMutation,
  useSubmitFpcRegistrationMutation,
  useApproveFpcMutation,
  useRejectFpcMutation,
  useUploadFpcDocumentMutation,
  useGetFpcDocumentHistoryQuery,
  useLazyGetFpcDocumentHistoryQuery,
  useUploadFpcDocumentVersionMutation,
  useDeleteFpcDocumentVersionMutation,
} = fpcApi;

