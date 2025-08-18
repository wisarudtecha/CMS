// /src/store/api/serviceApi.ts
/**
 * Service Management API Endpoints
 * Case Status, etc.
 */

import { baseApi } from "@/store/api/baseApi";
import type { ApiResponse } from "@/types";
import type { CaseStatus, CaseStatusQueryParams, CaseTypeSubType } from "@/types/case";

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Case Status Management
    getCaseStatuses: builder.query<ApiResponse<CaseStatus[]>, CaseStatusQueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/case_status?${searchParams.toString()}`;
      },
      providesTags: ["Cases"],
    }),

    // Case Type and Sub-Type Management
    getCaseTypesSubTypes: builder.query<ApiResponse<CaseTypeSubType[]>, null>({
      query: () => {
        return "/casetypes_with_subtype";
      },
      providesTags: ["Cases"],
    }),

  }),
});

export const {
  useGetCaseStatusesQuery,
  useGetCaseTypesSubTypesQuery,
} = serviceApi;
