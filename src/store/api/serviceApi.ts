// /src/store/api/serviceApi.ts
/**
 * Service Management API Endpoints
 * Case Status, etc.
 */

import { baseApi } from "@/store/api/baseApi";
import type { ApiResponse } from "@/types";
import type { CaseStatus } from "@/types/case";

export interface CaseStatusQueryParams {
  start?: number;
  length?: number;
}

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

  }),
});

export const {
  useGetCaseStatusesQuery,
} = serviceApi;
