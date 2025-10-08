import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";
// import { FormFieldWithNode } from "@/components/interface/FormField";
import { Commands, CaseSop, CaseSopParams, dispatchInterface, CancelCase, CancelUnit, Unit } from "@/types/dispatch";
import { Station } from "@/types/organization";
import { Department } from "@/types/user";
import { PaginationParams } from "./custommerApi";


export const dispantchApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getCommands: builder.query<ApiResponse<Commands[]>, PaginationParams>({
            query: (params) => ({
                url: "/commands",
                params,
            }),
            providesTags: ["Dispatch"],
        }),

        getDepartment: builder.query<ApiResponse<Department[]>, PaginationParams>({
            query: (params) => ({
                url: "/departments",
                params,
            }),
            providesTags: ["Dispatch"],
        }),

        getStations: builder.query<ApiResponse<Station[]>, PaginationParams>({
            query: (params) => ({
                url: "/stations",
                params,
            }),
            providesTags: ["Dispatch"],
        }),

        getCaseSop: builder.query<ApiResponse<CaseSop>, CaseSopParams>({
            query: (params) => ({
                url: `/dispatch/${params.caseId}/SOP`,
            }),
            providesTags: ["Dispatch"],
        }),

        getUnit: builder.query<ApiResponse<Unit[]>, { caseId: string }>({
            query: (params) => ({
                url: `/dispatch/${params.caseId}/units`,
            }),
            providesTags: ["Dispatch"],
        }),

        postDispacth: builder.query<ApiResponse<null>, dispatchInterface>({
            query: (params) => ({
                url: `/dispatch/event`,
                method: "POST",
                body: params
            }),
            providesTags: ["Dispatch"],
        }),

        postDispacthMutation: builder.mutation<ApiResponse<null>, dispatchInterface>({
            query: (params) => ({
                url: `/dispatch/event`,
                method: "POST",
                body: params
            }),
        }),

        getSopUnitMutation: builder.mutation<ApiResponse<null>, { caseId: string, unitId: string }>({
            query: (params) => ({
                url: `/dispatch/${params.caseId}/SOP/unit/${params.unitId}`,
                method: "GET",
                body: params
            }),
        }),

        getSopUnit: builder.query<ApiResponse<CaseSop>, { caseId: string, unitId: string }>({
            query: (params) => ({
                url: `/dispatch/${params.caseId}/SOP/unit/${params.unitId}`,
                method: "GET",
            }),
        }),

        postCancelCaseMutation: builder.mutation<ApiResponse<null>, CancelCase>({
            query: (params) => ({
                url: `/dispatch/cancel/case`,
                method: "POST",
                body: params
            }),
        }),

        postCancelUnitMutation: builder.mutation<ApiResponse<null>, CancelUnit>({
            query: (params) => ({
                url: `/dispatch/cancel/unit`,
                method: "POST",
                body: params
            }),
        }),
    }),
});

export const {
    useGetCommandsQuery,
    useGetDepartmentQuery,
    useGetStationsQuery,
    useGetCaseSopQuery,
    useGetUnitQuery,
    usePostDispacthQuery,
    usePostDispacthMutationMutation,
    useGetSopUnitMutationMutation,
    useGetSopUnitQuery,
    useLazyGetSopUnitQuery,
    usePostCancelCaseMutationMutation,
    usePostCancelUnitMutationMutation
} = dispantchApi;



