// /src/store/api/userApi.ts
/**
 * User Management API Endpoints
 * Admin user management, roles, and permissions
 */

import { baseApi } from "@/store/api/baseApi";
import type { ApiResponse, User } from "@/types";
import type {
  Permission,
  // PermissionCreateData,
  PermissionQueryParams,
  Role,
  RolePermission,
  RolePermissionQueryParams,
  RolePermissionsCreateData,
  RolePermissionsUpdateData,
  RolesPermissionsUpdateData,
  RoleQueryParams,
} from "@/types/role";
import type {
  // UserCreateData,
  UserGroup,
  UserGroupQueryParams,
  UserQueryParams,
  // UserUpdateData
} from "@/types/user";

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

    // createUser: builder.mutation<ApiResponse<User>, UserCreateData>({
    //   query: (data) => ({
    //     url: "/users",
    //     method: "POST",
    //     body: data,
    //   }),
    //   invalidatesTags: ["User"],
    // }),

    // updateUser: builder.mutation<ApiResponse<User>, { id: string; data: UserUpdateData }>({
    //   query: ({ id, data }) => ({
    //     url: `/users/${id}`,
    //     method: "PUT",
    //     body: data,
    //   }),
    //   invalidatesTags: (_result, _error, { id }) => [{ type: "User", id }],
    // }),

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

    // ===================================================================
    // User Group
    // ===================================================================

    getUserGroup: builder.query<ApiResponse<UserGroup[]>, UserGroupQueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/user_groups/all?${searchParams.toString()}`;
      },
    }),

    // ===================================================================
    // Role
    // ===================================================================

    getUserRoles: builder.query<ApiResponse<Role[]>, RoleQueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/role?${searchParams.toString()}`;
      }
    }),

    // ===================================================================
    // Role and Permission Matching
    // ===================================================================

    // GET api/v1/role_permission
    getUserRolesPermissions: builder.query<ApiResponse<RolePermission[]>, RolePermissionQueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/role_permission?${searchParams.toString()}`;
      }
    }),

    // POST api/v1/role_permission/add
    createUserRolePermissions: builder.mutation<ApiResponse<RolePermission[]>, RolePermissionsCreateData>({
      query: (data) => ({
        url: "/role_permission/add",
        method: "POST",
        body: data
      })
    }),

    // PATCH api/v1/role_permission/multi
    updateUserRolesPermissions: builder.mutation<ApiResponse<RolePermission[]>, RolesPermissionsUpdateData>({
      query: (data) => ({
        url: `/role_permission/multi`,
        method: "PATCH",
        body: data
      })
    }),

    // GET api/v1/role_permission/roleId/{roleId}
    getUserRolesPermissionsByRoleId: builder.query<ApiResponse<RolePermission[]>, string>({
      query: (roleId) => `/role_permission/roleId/${roleId}`
    }),

    // GET api/v1/role_permission/{id}
    getUserRolesPermissionsById: builder.query<ApiResponse<RolePermission[]>, number>({
      query: (id) => `/role_permission/${id}`
    }),

    // DELETE api/v1/role_permission/{id}
    deleteUserRolePermissions: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/role_permission/${id}`,
        method: "DELETE"
      })
    }),

    // PATCH api/v1/role_permission/{roleId}
    updateUserRolePermissions: builder.mutation<ApiResponse<User>, { roleId: string; data: RolePermissionsUpdateData }>({
      query: ({ roleId, data }) => ({
        url: `/role_permission/${roleId}`,
        method: "PATCH",
        body: data
      })
    }),
    
    // ===================================================================
    // Permission
    // ===================================================================

    getUserPermissions: builder.query<ApiResponse<Permission[]>, PermissionQueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        return `/permission?${searchParams.toString()}`;
      }
    }),

    // updateUserRole: builder.mutation<ApiResponse<User>, { id: string; role: UserRole }>({
    //   query: ({ id, role }) => ({
    //     url: `/users/${id}/role`,
    //     method: "PUT",
    //     body: { role },
    //   }),
    //   invalidatesTags: (_result, _error, { id }) => [{ type: "User", id }],
    // }),

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

    // getUserAnalytics: builder.query<ApiResponse<{
    //   totalUsers: number;
    //   activeUsers: number;
    //   newUsers: number;
    //   roleDistribution: Record<UserRole, number>;
    //   departmentDistribution: Record<string, number>;
    // }>, { timeRange: { start: string; end: string } }>({
    //   query: (params) => ({
    //     url: "/users/analytics",
    //     method: "POST",
    //     body: params,
    //   }),
    // }),

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
  // useCreateUserMutation,
  // useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useGetUserGroupQuery,
  useGetUserRolesQuery,
  useGetUserRolesPermissionsQuery,
  useCreateUserRolePermissionsMutation,
  useUpdateUserRolesPermissionsMutation,
  useLazyGetUserRolesPermissionsByRoleIdQuery,
  useGetUserRolesPermissionsByIdQuery,
  useDeleteUserRolePermissionsMutation,
  useUpdateUserRolePermissionsMutation,
  useGetUserPermissionsQuery,
  // useUpdateUserRoleMutation,
  useUpdateUserPermissionsMutation,
  useBulkUpdateUsersMutation,
  useGetUserActivityQuery,
  // useGetUserAnalyticsQuery,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useImpersonateUserMutation,
  useStopImpersonationMutation,
} = userApi;
