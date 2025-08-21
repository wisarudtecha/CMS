import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";
import { Device } from "@/types/deviceIoT";
import { PaginationParams } from "./custommerApi";




export const deviceIoTApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        
        getDeviceIoT: builder.query<ApiResponse<Device[]>, PaginationParams>({
            query: (params) => ({
                url: "/devices",
                params,
            }),
            providesTags: ["Device Iot"],
        }),






    }),
});
export const {
    useGetDeviceIoTQuery,
} = deviceIoTApi;
