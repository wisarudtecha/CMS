// /src/store/api/organizationApi.ts
/**
 * Organization Management API Endpoints
 * Admin organization management
 */
import { baseApi } from "@/store/api/baseApi";
import type { ApiResponse } from "@/types";
import type { Department, Command, Station, Organization, OrganizationQueryParams } from "@/types/organization";

export const organizationApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getDepartments: builder.query<ApiResponse<Department[]>, OrganizationQueryParams>({
      query: params => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/departments?${searchParams.toString()}`;
      },
      // providesTags: ["Organization"],
    }),

    getCommands: builder.query<ApiResponse<Command[]>, OrganizationQueryParams>({
      query: params => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/commands?${searchParams.toString()}`;
      },
      // providesTags: ["Organization"],
    }),

    getStations: builder.query<ApiResponse<Station[]>, OrganizationQueryParams>({
      query: params => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/stations?${searchParams.toString()}`;
      },
      // providesTags: ["Organization"],
    }),

    getOrganizations: builder.query<ApiResponse<Organization[]>, null>({
      query: () => "/department_command_stations",
      // providesTags: ["Organization"],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetCommandsQuery,
  useGetStationsQuery,
  useGetOrganizationsQuery
} = organizationApi;
