// /src/store/api/workflowApi.ts
/**
 * Workflow Management API Endpoints
 * Complete workflow designer, execution, and template management
 */

import { baseApi } from "@/store/api/baseApi";
import type { 
  Workflow, 
  WorkflowStep,
  WorkflowTrigger,
  WorkflowVariable,
  // WorkflowTemplate,
  // WorkflowExecution,
  ApiResponse 
} from "@/types";

export interface WorkflowCreateData {
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  variables?: WorkflowVariable[];
  tags?: string[];
}

export interface WorkflowExecutionData {
  workflowId: string;
  contextData: Record<string, unknown>;
  triggerType: "manual" | "automatic";
  triggeredBy?: string;
}

export const workflowApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Workflow CRUD
    getWorkflows: builder.query<ApiResponse<Workflow[]>, { 
      page?: number;
      limit?: number;
      category?: string;
      status?: "active" | "inactive";
      search?: string;
    }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/workflows?${searchParams.toString()}`;
      },
      providesTags: ["Workflow"],
    }),

    getWorkflow: builder.query<Workflow, string>({
      query: (id) => `/workflows/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Workflow", id }],
    }),

    createWorkflow: builder.mutation<ApiResponse<Workflow>, WorkflowCreateData>({
      query: (data) => ({
        url: "/workflows",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Workflow"],
    }),

    updateWorkflow: builder.mutation<ApiResponse<Workflow>, { id: string; data: Partial<WorkflowCreateData> }>({
      query: ({ id, data }) => ({
        url: `/workflows/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Workflow", id }],
    }),

    deleteWorkflow: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/workflows/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Workflow"],
    }),

    // Workflow execution
    // executeWorkflow: builder.mutation<ApiResponse<WorkflowExecution>, WorkflowExecutionData>({
    //   query: (data) => ({
    //     url: "/workflows/execute",
    //     method: "POST",
    //     body: data,
    //   }),
    // }),

    // getWorkflowExecution: builder.query<WorkflowExecution, string>({
    //   query: (executionId) => `/workflows/executions/${executionId}`,
    // }),

    // getWorkflowExecutions: builder.query<ApiResponse<WorkflowExecution[]>, {
    //   workflowId?: string;
    //   status?: "pending" | "running" | "completed" | "failed";
    //   page?: number;
    //   limit?: number;
    // }>({
    //   query: (params) => {
    //     const searchParams = new URLSearchParams();
    //     Object.entries(params).forEach(([key, value]) => {
    //       if (value !== undefined) {
    //         searchParams.append(key, String(value));
    //       }
    //     });
    //     return `/workflows/executions?${searchParams.toString()}`;
    //   },
    // }),

    // Workflow templates
    // getWorkflowTemplates: builder.query<ApiResponse<WorkflowTemplate[]>, {
    //   category?: string;
    //   complexity?: "simple" | "intermediate" | "advanced";
    //   search?: string;
    // }>({
    //   query: (params) => {
    //     const searchParams = new URLSearchParams();
    //     Object.entries(params).forEach(([key, value]) => {
    //       if (value !== undefined) {
    //         searchParams.append(key, String(value));
    //       }
    //     });
    //     return `/workflows/templates?${searchParams.toString()}`;
    //   },
    // }),

    createWorkflowFromTemplate: builder.mutation<ApiResponse<Workflow>, {
      templateId: string;
      customizations?: Partial<WorkflowCreateData>;
    }>({
      query: (data) => ({
        url: "/workflows/from-template",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Workflow"],
    }),

    // Workflow validation
    validateWorkflow: builder.mutation<ApiResponse<{ isValid: boolean; errors: string[] }>, {
      steps: WorkflowStep[];
      triggers: WorkflowTrigger[];
    }>({
      query: (data) => ({
        url: "/workflows/validate",
        method: "POST",
        body: data,
      }),
    }),

    // Workflow analytics
    getWorkflowAnalytics: builder.query<ApiResponse<unknown>, {
      workflowId?: string;
      timeRange: { start: string; end: string };
    }>({
      query: (params) => ({
        url: "/workflows/analytics",
        method: "POST",
        body: params,
      }),
    }),

    getWorkflowMetrics: builder.query<ApiResponse<{
      totalExecutions: number;
      successRate: number;
      averageExecutionTime: number;
      bottlenecks: WorkflowStep[];
    }>, string>({
      query: (workflowId) => `/workflows/${workflowId}/metrics`,
    }),

    // Workflow versioning
    getWorkflowVersions: builder.query<ApiResponse<Workflow[]>, string>({
      query: (workflowId) => `/workflows/${workflowId}/versions`,
    }),

    createWorkflowVersion: builder.mutation<ApiResponse<Workflow>, {
      workflowId: string;
      changes: Partial<WorkflowCreateData>;
      comment?: string;
    }>({
      query: ({ workflowId, changes, comment }) => ({
        url: `/workflows/${workflowId}/versions`,
        method: "POST",
        body: { changes, comment },
      }),
      invalidatesTags: (_result, _error, { workflowId }) => [{ type: "Workflow", id: workflowId }],
    }),

    rollbackWorkflow: builder.mutation<ApiResponse<Workflow>, {
      workflowId: string;
      versionId: string;
    }>({
      query: ({ workflowId, versionId }) => ({
        url: `/workflows/${workflowId}/rollback/${versionId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { workflowId }) => [{ type: "Workflow", id: workflowId }],
    }),
  }),
});

export const {
  useGetWorkflowsQuery,
  useGetWorkflowQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  // useExecuteWorkflowMutation,
  // useGetWorkflowExecutionQuery,
  // useGetWorkflowExecutionsQuery,
  // useGetWorkflowTemplatesQuery,
  useCreateWorkflowFromTemplateMutation,
  useValidateWorkflowMutation,
  useGetWorkflowAnalyticsQuery,
  useGetWorkflowMetricsQuery,
  useGetWorkflowVersionsQuery,
  useCreateWorkflowVersionMutation,
  useRollbackWorkflowMutation,
} = workflowApi;
