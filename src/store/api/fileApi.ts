// /src/store/api/fileApi.ts
/**
 * File Management API Endpoints
 * File upload, download, and management
 */

import { baseApi } from "@/store/api/baseApi";
import type { ApiResponse } from "@/types";

export interface FileUploadResponse {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export const fileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<ApiResponse<FileUploadResponse>, {
      file: File;
      category?: string;
      isPublic?: boolean;
    }>({
      query: ({ file, category, isPublic = false }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (category) formData.append("category", category);
        formData.append("isPublic", isPublic.toString());
        
        return {
          url: "/files/upload",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["File"],
    }),

    uploadMultipleFiles: builder.mutation<ApiResponse<FileUploadResponse[]>, {
      files: File[];
      category?: string;
      isPublic?: boolean;
    }>({
      query: ({ files, category, isPublic = false }) => {
        const formData = new FormData();
        files.forEach(file => formData.append("files", file));
        if (category) formData.append("category", category);
        formData.append("isPublic", isPublic.toString());
        
        return {
          url: "/files/upload-multiple",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["File"],
    }),

    deleteFile: builder.mutation<ApiResponse<void>, string>({
      query: (fileId) => ({
        url: `/files/${fileId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["File"],
    }),

    getFileInfo: builder.query<FileUploadResponse, string>({
      query: (fileId) => `/files/${fileId}`,
      providesTags: (_result, _error, id) => [{ type: "File", id }],
    }),

    generateDownloadUrl: builder.mutation<{ url: string; expiresAt: string }, {
      fileId: string;
      expiresIn?: number; // seconds
    }>({
      query: ({ fileId, expiresIn = 3600 }) => ({
        url: `/files/${fileId}/download-url`,
        method: "POST",
        body: { expiresIn },
      }),
    }),
  }),
});

export const {
  useUploadFileMutation,
  useUploadMultipleFilesMutation,
  useDeleteFileMutation,
  useGetFileInfoQuery,
  useGenerateDownloadUrlMutation,
} = fileApi;
