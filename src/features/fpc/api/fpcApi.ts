import { baseApi } from '../../../app/api/baseApi';
import { TAG_TYPES } from '../../../app/api/tagTypes';

export interface FpcSummaryDto {
  id: string;
  code: string;
  cin: string;
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
      query: () => '/fpcs',
      transformResponse: (response: ApiResponse<FpcSummaryDto[]>) => response.data,
      providesTags: [TAG_TYPES.Fpc],
    }),

    getFpcById: builder.query<FpcSummaryDto, string>({
      query: (id) => `/fpcs/${id}`,
      transformResponse: (response: ApiResponse<FpcSummaryDto>) => response.data,
      providesTags: (_result, _error, id) => [{ type: TAG_TYPES.Fpc, id }],
    }),

    deleteFpc: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/fpcs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [TAG_TYPES.Fpc],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFpcsQuery,
  useGetFpcByIdQuery,
  useDeleteFpcMutation,
} = fpcApi;

