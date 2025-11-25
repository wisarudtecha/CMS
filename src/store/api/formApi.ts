import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";
import { FormField, FormLinkWf, FormManager, IndividualFormField } from "@/components/interface/FormField";

export interface UpdataStatusResponse {
    status: string;
    msg: string;
    desc: string;
}

export interface UpdataFormResponse {
    status: string;
    msg: string;
    desc: string;
    data: any;
}
export const formApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Ticket CRUD operations

        getForm: builder.query<ApiResponse<{
            formId :string,
            formName : string,
            versions: string,
            publish :boolean
        }>, { //
            publish: boolean;
        }>({
            query: ({ publish }) => ({ //
                url: `/forms`,
                method: "GET",
                params: { publish }
            }),
            providesTags: ["Form and Workflow"],
        }),

        getFormMutation: builder.mutation<ApiResponse<{
            formId :string,
            formName : string,
            versions: string,
            publish :boolean
        }>, { //
            publish: boolean;
        }>({
            query: ({ publish }) => ({ //
                url: `/forms`,
                method: "GET",
                params: { publish }
            }),
            invalidatesTags: ["Form and Workflow"],
        }),
        
        
        getAllForms: builder.query<ApiResponse<FormManager[]>, { start: Number, length: number, search: string }>({
            query: (params) => ({
                url: "/forms/getAllForms",
                params: params
            }),
            providesTags: ["Form and Workflow"],
            keepUnusedDataFor: 0,
        }),

        getFormLinkWfMutation: builder.mutation<ApiResponse<FormLinkWf[]>, { formId: string }>({
            query: (params) => ({
                url: "/forms/GetFormlinkWf",
                params: params
            }),

            invalidatesTags: ["Form and Workflow"],
        }),

        getFormLinkWf: builder.query<ApiResponse<FormLinkWf[]>, { formId: string }>({
            query: (params) => ({
                url: "/forms/GetFormlinkWf",
                params: params
            }),
            providesTags: ["Form and Workflow"],
        }),

        getFormByFormId: builder.mutation<ApiResponse<FormManager>, { //
            version: string;
            formId: string;
        }>({
            query: ({ formId, version }) => ({ //
                url: `/forms/${formId}`,
                method: "GET",
                params: { version }
            }),
            invalidatesTags: ["Form and Workflow"],
        }),

        getFormByFormIdQuery: builder.query<ApiResponse<FormManager>, { //
            version: string;
            formId: string;
        }>({
            query: ({ formId, version }) => ({ //
                url: `/forms/${formId}`,
                method: "GET",
                params: { version }
            }),
            providesTags: ["Form and Workflow"],
        }),

        updateStatus: builder.mutation<ApiResponse<UpdataStatusResponse>, { //
            active: boolean;
            formId: string;
        }>({
            query: ({ formId, active }) => ({ //
                url: "/forms/active",
                method: "PATCH",
                body: { formId, active },
            }),
            invalidatesTags: ["Form and Workflow"],
        }),

        updateForm: builder.mutation<UpdataFormResponse, { //
            formId: string;
            active: boolean;
            formColSpan: number;
            formFieldJson: IndividualFormField[];
            formName: string;
            locks: boolean;
            publish: boolean;
        }>({
            query: ({ formId, active, formColSpan, formFieldJson, formName, locks, publish }) => ({ //
                url: `/forms/${formId}`,
                method: "PATCH",
                body: {
                    active,
                    formColSpan,
                    formFieldJson,
                    formName,
                    locks,
                    publish
                },
            }),
            invalidatesTags: ["Form and Workflow"],
        }),

        createForm: builder.mutation<UpdataFormResponse, { //
            active: boolean;
            formColSpan: number;
            formFieldJson: IndividualFormField[];
            formName: string;
            locks: boolean;
            publish: boolean;
        }>({
            query: ({ active, formColSpan, formFieldJson, formName, locks, publish }) => ({ //
                url: `/forms`,
                method: "POST",
                body: {
                    active,
                    formColSpan,
                    formFieldJson,
                    formName,
                    locks,
                    publish
                },
            }),
            invalidatesTags: ["Form and Workflow"],
        }),

        deleteForm: builder.mutation<UpdataFormResponse, { //
            id: string;
        }>({
            query: ({ id }) => ({
                url: `/forms/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Form and Workflow"],
        }),

        postSubTypeForm: builder.mutation<ApiResponse<FormField>, string>({
            query: (subType) => ({
                url: "/forms/casesubtype",
                method: "POST",
                body: {
                    caseSubType: subType
                },
            }),
            invalidatesTags: ["Form and Workflow"],
        }),

        getTypeSubType: builder.query<ApiResponse<FormField>, string>({
            query: (subType) => ({
                url: "/forms/casesubtype",
                method: "POST", // or GET if it should be a GET request
                body: {
                    caseSubType: subType
                },
            }),
            providesTags: ["Form and Workflow"],
        }),

        publishForm: builder.query<ApiResponse<null>, { //
            formId: string;
            publish: boolean;
        }>({
            query: (params) => ({ //
                url: `/forms/publish`,
                method: "PATCH",
                body: params,
            }),
            providesTags: ["Form and Workflow"],
        }),

        changeFormVersion: builder.query<ApiResponse<null>, { //
            formId: string;
            version: string;
        }>({
            query: (params) => ({ //
                url: `/forms/version`,
                method: "PATCH",
                body: params,
            }),
            providesTags: ["Form and Workflow"],
        }),

        changeFormVersionMutation: builder.mutation<ApiResponse<null>, {
            formId: string;
            version: string;
        }>({
            query: (params) => ({
                url: `/forms/version`,
                method: "PATCH",
                body: params,
            }),
            invalidatesTags: ["Form and Workflow"],
        }),

        publishFormMutation: builder.mutation<ApiResponse<null>, { //
            formId: string;
            publish: boolean;
        }>({
            query: (params) => ({ //
                url: `/forms/publish`,
                method: "PATCH",
                body: params,
            }),
            invalidatesTags: ["Form and Workflow"],
        }),

        // getTicket: builder.query<FormField, string>({
        //   query: (id) => `/tickets/${id}`,
        //   providesTags: (_result, _error, id) => [{ type: "Ticket", id }],
        // }),

        // createTicket: builder.mutation<ApiResponse<FormField>, TicketCreateData>({
        //   query: (data) => ({
        //     url: "/tickets",
        //     method: "POST",
        //     body: data,
        //   }),
        //   invalidatesTags: ["Ticket"],
        // }),

        // updateTicket: builder.mutation<ApiResponse<Ticket>, { id: string; data: TicketUpdateData }>({
        //   query: ({ id, data }) => ({
        //     url: `/tickets/${id}`,
        //     method: "PUT",
        //     body: data,
        //   }),
        //   invalidatesTags: (_result, _error, { id }) => [{ type: "Ticket", id }],
        // }),

        // deleteTicket: builder.mutation<ApiResponse<void>, string>({
        //   query: (id) => ({
        //     url: `/tickets/${id}`,
        //     method: "DELETE",
        //   }),
        //   invalidatesTags: ["Ticket"],
        // }),

        // // Ticket status management
        // updateTicketStatus: builder.mutation<ApiResponse<Ticket>, { id: string; status: TicketStatus; comment?: string }>({
        //   query: ({ id, status, comment }) => ({
        //     url: `/tickets/${id}/status`,
        //     method: "PUT",
        //     body: { status, comment },
        //   }),
        //   invalidatesTags: (_result, _error, { id }) => [{ type: "Ticket", id }, "Timeline"],
        // }),

        // Ticket assignment
        // assignTicket: builder.mutation<ApiResponse<Ticket>, TicketAssignment>({
        //   query: ({ ticketId, assigneeId, comment }) => ({
        //     url: `/tickets/${ticketId}/assign`,
        //     method: "PUT",
        //     body: { assigneeId, comment },
        //   }),
        //   invalidatesTags: (_result, _error, { ticketId }) => [{ type: "Ticket", id: ticketId }],
        // }),

        // transferTicket: builder.mutation<ApiResponse<Ticket>, { id: string; departmentId: string; reason: string }>({
        //   query: ({ id, departmentId, reason }) => ({
        //     url: `/tickets/${id}/transfer`,
        //     method: "PUT",
        //     body: { departmentId, reason },
        //   }),
        //   invalidatesTags: (_result, _error, { id }) => [{ type: "Ticket", id }],
        // }),

        // // Comments system
        // getTicketComments: builder.query<ApiResponse<Comment[]>, { ticketId: string; page?: number; limit?: number }>({
        //   query: ({ ticketId, page = 1, limit = 20 }) => 
        //     `/tickets/${ticketId}/comments?page=${page}&limit=${limit}`,
        //   providesTags: ["Comment"],
        // }),

        // addComment: builder.mutation<ApiResponse<Comment>, { ticketId: string; content: string; isInternal?: boolean; attachments?: File[] }>({
        //   query: ({ ticketId, content, isInternal = false, attachments }) => ({
        //     url: `/tickets/${ticketId}/comments`,
        //     method: "POST",
        //     body: { content, isInternal, attachments },
        //   }),
        //   invalidatesTags: ["Comment", "Timeline"],
        // }),

        // updateComment: builder.mutation<ApiResponse<Comment>, { commentId: string; content: string }>({
        //   query: ({ commentId, content }) => ({
        //     url: `/comments/${commentId}`,
        //     method: "PUT",
        //     body: { content },
        //   }),
        //   invalidatesTags: ["Comment"],
        // }),

        // deleteComment: builder.mutation<ApiResponse<void>, string>({
        //   query: (commentId) => ({
        //     url: `/comments/${commentId}`,
        //     method: "DELETE",
        //   }),
        //   invalidatesTags: ["Comment"],
        // }),

        // // File attachments
        // uploadAttachment: builder.mutation<ApiResponse<Attachment>, { ticketId: string; file: File }>({
        //   query: ({ ticketId, file }) => {
        //     const formData = new FormData();
        //     formData.append("file", file);
        //     return {
        //       url: `/tickets/${ticketId}/attachments`,
        //       method: "POST",
        //       body: formData,
        //     };
        //   },
        //   invalidatesTags: (_result, _error, { ticketId }) => [{ type: "Ticket", id: ticketId }],
        // }),

        // deleteAttachment: builder.mutation<ApiResponse<void>, { ticketId: string; attachmentId: string }>({
        //   query: ({ ticketId, attachmentId }) => ({
        //     url: `/tickets/${ticketId}/attachments/${attachmentId}`,
        //     method: "DELETE",
        //   }),
        //   invalidatesTags: (_result, _error, { ticketId }) => [{ type: "Ticket", id: ticketId }],
        // }),

        // // Timeline and history
        // getTicketTimeline: builder.query<ApiResponse<TimelineEvent[]>, { ticketId: string; page?: number; limit?: number }>({
        //   query: ({ ticketId, page = 1, limit = 50 }) => 
        //     `/tickets/${ticketId}/timeline?page=${page}&limit=${limit}`,
        //   providesTags: ["Timeline"],
        // }),

        // // Bulk operations
        // bulkUpdateTickets: builder.mutation<ApiResponse<{ successful: string[]; failed: string[] }>, BulkOperationData>({
        //   query: (data) => ({
        //     url: "/tickets/bulk",
        //     method: "PUT",
        //     body: data,
        //   }),
        //   invalidatesTags: ["Ticket"],
        // }),

        // // Analytics and reports
        // getTicketAnalytics: builder.query<ApiResponse<unknown>, { 
        //   timeRange: { start: string; end: string };
        //   groupBy?: string[];
        //   filters?: Filter[];
        // }>({
        //   query: (params) => ({
        //     url: "/tickets/analytics",
        //     method: "POST",
        //     body: params,
        //   }),
        // }),

        // exportTickets: builder.mutation<Blob, { 
        //   format: "csv" | "excel" | "pdf";
        //   filters?: TicketQueryParams;
        //   fields?: string[];
        // }>({
        //   query: (params) => ({
        //     url: "/tickets/export",
        //     method: "POST",
        //     body: params,
        //     responseHandler: (response) => response.blob(),
        //   }),
        // }),

        // // Search and filtering
        // searchTickets: builder.query<ApiResponse<Ticket[]>, { 
        //   query: string;
        //   filters?: Filter[];
        //   limit?: number;
        // }>({
        //   query: ({ query, filters, limit = 10 }) => ({
        //     url: "/tickets/search",
        //     method: "POST",
        //     body: { query, filters, limit },
        //   }),
        // }),

        // getSavedSearches: builder.query<ApiResponse<unknown[]>, void>({
        //   query: () => "/tickets/saved-searches",
        // }),

        // saveSearch: builder.mutation<ApiResponse<unknown>, { name: string; query: TicketQueryParams }>({
        //   query: (data) => ({
        //     url: "/tickets/saved-searches",
        //     method: "POST",
        //     body: data,
        //   }),
        // }),
    }),
});
export const {
    useGetAllFormsQuery,
    useUpdateStatusMutation,
    useUpdateFormMutation,
    useCreateFormMutation,
    usePostSubTypeFormMutation,
    useGetTypeSubTypeQuery,
    useLazyGetTypeSubTypeQuery,
    useDeleteFormMutation,
    useLazyPublishFormQuery,
    usePrefetch,
    usePublishFormMutationMutation,
    usePublishFormQuery,
    useGetFormByFormIdMutation,
    useGetFormLinkWfMutationMutation,
    useGetFormLinkWfQuery,
    useLazyGetAllFormsQuery,
    useLazyGetFormLinkWfQuery,
    useGetFormByFormIdQueryQuery,
    useLazyGetFormByFormIdQueryQuery,
    useChangeFormVersionMutationMutation,
    useChangeFormVersionQuery,
    useLazyChangeFormVersionQuery
} = formApi;

