import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";
export interface Commands {
    id: string;
    deptId: string;
    orgId: string;
    commId: string;
    en: string;
    th: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface Department {
    id: string;
    deptId: string;
    orgId: string;
    en: string;
    th: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}


export interface Station {
    id: string;
    orgId: string;
    deptId: string;
    commId: string;
    stnId: string;
    en: string;
    th: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface ServiceCenter {
    department: Department
    station:Station
    command:Commands
    name:string
}


interface PaginationParams {
    start?: number;
    length?: number;
}

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
    }),
});

export const {
    useGetCommandsQuery,
    useGetDepartmentQuery,
    useGetStationsQuery, 
} = dispantchApi;

