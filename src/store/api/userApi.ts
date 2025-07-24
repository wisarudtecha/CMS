// /src/store/api/userApi.ts
/**
 * User Management API Endpoints
 * Admin user management, roles, and permissions
 */

import { baseApi } from "@/store/api/baseApi";
import type { User, UserRole, Permission, ApiResponse } from "@/types";

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  permissions?: Permission[];
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  permissions?: Permission[];
  isActive?: boolean;
}

export interface UserQueryParams {
  start?: number;
  length?: number;
  role?: UserRole;
  department?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // User management
    getUsers: builder.query<ApiResponse<User[]>, UserQueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/users?${searchParams.toString()}`;
      },
      providesTags: ["User"],
    }),

    getUser: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation<ApiResponse<User>, UserCreateData>({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation<ApiResponse<User>, { id: string; data: UserUpdateData }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "User", id }],
    }),

    deleteUser: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    toggleUserStatus: builder.mutation<ApiResponse<User>, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: "PUT",
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "User", id }],
    }),

    // Role and permission management
    getUserRoles: builder.query<ApiResponse<UserRole[]>, void>({
      query: () => "/users/roles",
    }),

    getUserPermissions: builder.query<ApiResponse<Permission[]>, void>({
      query: () => "/users/permissions",
    }),

    updateUserRole: builder.mutation<ApiResponse<User>, { id: string; role: UserRole }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "User", id }],
    }),

    updateUserPermissions: builder.mutation<ApiResponse<User>, { id: string; permissions: Permission[] }>({
      query: ({ id, permissions }) => ({
        url: `/users/${id}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "User", id }],
    }),

    // Bulk operations
    bulkUpdateUsers: builder.mutation<ApiResponse<{ successful: string[]; failed: string[] }>, {
      userIds: string[];
      operation: "activate" | "deactivate" | "role_change" | "department_change";
      data: unknown;
    }>({
      query: (data) => ({
        url: "/users/bulk",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // User activity and analytics
    getUserActivity: builder.query<ApiResponse<unknown[]>, {
      userId?: string;
      timeRange: { start: string; end: string };
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: "/users/activity",
        method: "POST",
        body: params,
      }),
    }),

    getUserAnalytics: builder.query<ApiResponse<{
      totalUsers: number;
      activeUsers: number;
      newUsers: number;
      roleDistribution: Record<UserRole, number>;
      departmentDistribution: Record<string, number>;
    }>, { timeRange: { start: string; end: string } }>({
      query: (params) => ({
        url: "/users/analytics",
        method: "POST",
        body: params,
      }),
    }),

    // Department management
    getDepartments: builder.query<ApiResponse<string[]>, void>({
      query: () => "/departments",
    }),

    createDepartment: builder.mutation<ApiResponse<string>, { name: string }>({
      query: (data) => ({
        url: "/users/departments",
        method: "POST",
        body: data,
      }),
    }),

    // User impersonation (admin feature)
    impersonateUser: builder.mutation<ApiResponse<{ token: string; user: User }>, string>({
      query: (userId) => ({
        url: `/users/${userId}/impersonate`,
        method: "POST",
      }),
    }),

    stopImpersonation: builder.mutation<ApiResponse<{ token: string; user: User }>, void>({
      query: () => ({
        url: "/users/stop-impersonation",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useGetUserRolesQuery,
  useGetUserPermissionsQuery,
  useUpdateUserRoleMutation,
  useUpdateUserPermissionsMutation,
  useBulkUpdateUsersMutation,
  useGetUserActivityQuery,
  useGetUserAnalyticsQuery,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useImpersonateUserMutation,
  useStopImpersonationMutation,
} = userApi;
