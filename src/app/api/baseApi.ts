import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import { ALL_TAG_TYPES } from './tagTypes';

/**
 * Root RTK Query API slice with code-splitting support via injectEndpoints
 */
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ALL_TAG_TYPES,
  endpoints: () => ({}), // Feature endpoints injected via injectEndpoints
});

