// /src/store/api/unitApi.ts
/**
 * Unit Management API Endpoints
 * Admin unit management
 */
import { baseApi } from "@/store/api/baseApi";
import type { ApiResponse } from "@/types";
import type { Unit, UnitQueryParams, UnitStatus, UnitUpdateData, Properties, PropertiesQueryParams } from "@/types/unit";

export const unitApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    createUnits: builder.mutation<ApiResponse<Unit>, UnitUpdateData>({
      query: data => ({
        url: "/mdm/units",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    deleteUnits: builder.mutation<ApiResponse<void>, number>({
      query: id => ({
        url: `/mdm/units/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Unit"],
    }),

    getUnitsById: builder.query<ApiResponse<Unit[]>, number>({
      query: id => `/mdm/units/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Unit", id }],
    }),

    getUnits: builder.query<ApiResponse<Unit[]>, UnitQueryParams>({
      query: params => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/mdm/units?${searchParams.toString()}`;
      },
      providesTags: ["Unit"],
    }),

    updateUnits: builder.mutation<ApiResponse<Unit>, { id: number; data: UnitUpdateData }>({
      query: ({ id, data }) => ({
        url: `/mdm/units/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Unit", id }],
    }),

    getUnitStatus: builder.query<ApiResponse<UnitStatus>, { start: number; length: number }>({
      query: ({ start, length }) => ({
        url: `/mdm/status`,
        method: "GET",
        params: { start, length },
      }),
      providesTags: ["Unit"],
    }),

    getProperties: builder.query<ApiResponse<Properties[]>, PropertiesQueryParams>({
      query: params => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/mdm/properties?${searchParams.toString()}`;
      },
      providesTags: ["Unit"],
    }),
  }),
});

export const {
  useCreateUnitsMutation,
  useDeleteUnitsMutation,
  useGetUnitsByIdQuery,
  useGetUnitsQuery,
  useUpdateUnitsMutation,
  useGetUnitStatusQuery,
  useGetPropertiesQuery,
} = unitApi;
