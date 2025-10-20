import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";
import { deleteFileInput, UploadFileInput, UploadFileRes } from "@/types/file";


export const fileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        postUploadFile: builder.query<ApiResponse<UploadFileRes>, UploadFileInput>({
            query: (params) => ({
                url: "/upload/case",
                params,
                method: "POST"
            }),
            providesTags: ["Files"],
        }),

        deleteFile: builder.query<ApiResponse<UploadFileRes>, deleteFileInput>({
            query: (params) => ({
                url: "/delete/",
                body: params,
                method: "DELETE"
            }),
            providesTags: ["Files"],
        }),

        postUploadFileMutation: builder.mutation<ApiResponse<UploadFileRes>, UploadFileInput>({
            query: (params) => {
                const formData = new FormData();
                formData.append('file', params.file);
                if (params.caseId) {
                    formData.append('caseId', params.caseId);
                }
                return {
                    url: `/upload/${params.path}`,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Files"],
        }),

        deleteFileMutation: builder.mutation<ApiResponse<UploadFileRes>, deleteFileInput>({
            query: (params) => ({
                url: `/delete/`,
                body: params,
                method: "DELETE"
            }),
            invalidatesTags: ["Files"],
        }),


    }),
});

export const {
    useDeleteFileQuery,
    useDeleteFileMutationMutation,
    usePostUploadFileMutationMutation,
    usePostUploadFileQuery,
} = fileApi;



