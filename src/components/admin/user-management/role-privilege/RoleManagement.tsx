// /src/components/admin/user-management/role-privilege/RoleManagement.tsx
import React, { useCallback, useEffect, useState }
from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { CheckLineIcon, GroupIcon, LockIcon, PencilIcon, PieChartIcon, ShootingStarIcon } from "@/icons";
import { ToastContainer } from "@/components/crud/ToastContainer";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/useToast";
import {
  // RolePermissionsCreateData,
  // useCreateUserRolePermissionsMutation,
  useUpdateUserRolesPermissionsMutation,
  // useLazyGetUserRolesPermissionsByRoleIdQuery,
  // useGetUserRolesPermissionsByIdQuery,
  // useDeleteUserRolePermissionsMutation,
  // useUpdateUserRolePermissionsMutation,
} from "@/store/api/userApi";
import { AuthService } from "@/utils/authService";
import { SYSTEM_ROLE } from "@/utils/constants";
import type { PreviewConfig } from "@/types/enhanced-crud";
import type { Permission, Role, RoleAnalytics, RolePermission, RolesPermissionsUpdateData } from "@/types/role";
import MetricsView from "@/components/admin/MetricsView";
import PrivilegeMatrixContent from "@/components/admin/user-management/role-privilege/PrivilegeMatrixView";
import RoleCardContent from "@/components/admin/user-management/role-privilege/RoleCard";

// ===================================================================
// Utility Functions
// ===================================================================

// const buildRoleHierarchy = (roles: Role[]): RoleHierarchy[] => {
//   // const roleMap = new Map(roles.map(role => [role.id, role]));
//   const hierarchy: RoleHierarchy[] = [];
//   const buildTree = (role: Role, parentPermissions: string[] = []): RoleHierarchy => {
//     const inheritedPermissions = [...new Set([...parentPermissions, ...role.permissions])];
//     const children: RoleHierarchy[] = [];
//     roles.forEach(childRole => {
//       if (childRole.parentRole === role.id) {
//         children.push(buildTree(childRole, inheritedPermissions));
//       }
//     });
//     return {
//       role,
//       children,
//       inheritedPermissions
//     };
//   };
//   roles.forEach(role => {
//     if (!role.parentRole) {
//       hierarchy.push(buildTree(role));
//     }
//   });
//   return hierarchy;
// };

const RoleManagementComponent: React.FC<{
  role: Role[];
  rolesPerms: RolePermission[];
  perms: Permission[];
}> = ({ role, rolesPerms, perms }) => {
  const isSystemAdmin = AuthService.isSystemAdmin();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { toasts, addToast, removeToast } = useToast();

  // const [trigger] = useLazyGetUserRolesPermissionsByRoleIdQuery();
  // const [createRolePermissions] = useCreateUserRolePermissionsMutation();

  const [updateUserRolesPermissions] = useUpdateUserRolesPermissionsMutation();

  // const [updateUserRolesPermissionsResponse, setUpdateUserRolesPermissionsResponse] = useState<ApiResponse<RolePermission[]>>();

  const [roleAnalytics, setRoleAnalytics] = useState<RoleAnalytics>();

  // ===================================================================
  // Loading State
  // ===================================================================

  // const [loading, setLoading] = useState<LoadingStates>({
  //   roles: true,
  //   permissions: true,
  //   analytics: true,
  //   permissionUpdate: null,
  //   roleCreate: false,
  //   roleUpdate: false,
  //   roleDelete: false
  // });

  const [loading, setLoading] = useState(false);

  // ===================================================================
  // Mock Data
  // ===================================================================

  // const mockMetrics: RoleMetrics = {
  //   totalRoles: 6,
  //   activeRoles: 6,
  //   systemRoles: 2,
  //   customRoles: 4,
  //   avgPermissions: 11,
  //   mostUsed: "Agent"
  // };

  // const mockAnalytics: RoleAnalytics = {
  //   totalRoles: role.length,
  //   activeRoles: role.filter(r => r.userCount > 0).length,
  //   systemRoles: role.filter(r => r.isSystem).length,
  //   customRoles: role.filter(r => !r.isSystem).length,
  //   averagePermissions: Math.round(role.reduce((sum, r) => sum + r.permissions.length, 0) / role.length),
  //   mostUsedRole: roles.reduce((prev, current) => (prev.userCount > current.userCount) ? prev : current),
  //   mostUsedRole: "Agent",
  //   recentChanges: 3
  // };

  // ===================================================================
  // Real Functionality Data
  // ===================================================================

  const data: Role[] = role as Role[];

  const [roleList, setRoles] = useState<Role[]>(data);
  
  useEffect(() => {
    setRoles(data);
  }, [data]);

  useEffect(() => {
    // const mostUsedRole = (arr: { roleName: string }[]) => Object.entries(
    //   arr.reduce((acc, { roleName }) => ((acc[roleName] = (acc[roleName] || 0) + 1), acc), {} as Record<string, number>)
    // ).reduce((a, b) => (b[1] > a[1] ? b : a), ["", 0])[0];

    const maxPermissions = Math.max(...role.map(r => r.permissions?.length || 0));
    const roleWithMax = role.find(r => r.permissions?.length === maxPermissions);

    setRoleAnalytics({
      totalRoles: role.length,
      activeRoles: role.filter(r => r.active).length,
      systemRoles: role.filter(r => r.id === SYSTEM_ROLE).length,
      customRoles: role.filter(r => r.id !== SYSTEM_ROLE).length,
      averagePermissions: Math.round(role.reduce(sum => sum + perms.length, 0) / role.length),
      // mostUsedRole: mostUsedRole(role).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
      mostUsedRole: roleWithMax?.roleName.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || "0",
      recentChanges: 0
    });
  }, [perms.length, role]);

  // ===================================================================
  // CRUD Configuration
  // ===================================================================

  const config = {
    entityName: "Role",
    entityNamePlural: "Roles",
    apiEndpoints: {
      list: "/api/roles",
      create: "/api/roles",
      read: "/api/roles/:id",
      update: "/api/roles/:id",
      delete: "/api/roles/:id",
      bulkDelete: "/api/roles/bulk",
      export: "/api/roles/export"
    },
    columns: [],
    actions: [
      // {
      //   key: "view",
      //   label: "View",
      //   variant: "primary" as const,
      //   // icon: EyeIcon,
      //   onClick: (roleItem: Role) => navigate(`/role/${roleItem.id}`),
      //   condition: () => (permissions.hasPermission("role.view") || isSystemAdmin) as boolean
      // },
      // {
      //   key: "update",
      //   label: "Edit",
      //   variant: "warning" as const,
      //   // icon: PencilIcon,
      //   onClick: (roleItem: Role) => navigate(`/role/${roleItem.id}/edit`),
      //   condition: () => (permissions.hasPermission("role.update") || isSystemAdmin) as boolean
      // },
      // {
      //   key: "delete",
      //   label: "Delete",
      //   variant: "outline" as const,
      //   // icon: TrashBinIcon,
      //   onClick: (roleItem: Role) => {
      //     console.log("Delete role:", roleItem.id);
      //   },
      //   condition: (roleItem: Role) => (roleItem.id !== SYSTEM_ROLE) as boolean
      // }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  const previewConfig: PreviewConfig<Role> = {
    // title: () => "Role Information",
    title: (roleItem: Role) => {
      return (
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${roleItem.active
            ? "bg-green-500 dark:bg-green-400"
            : "bg-red-500 dark:bg-red-400"
          }`}></div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">{roleItem.roleName}</h2>
            {/* <p className="text-sm text-gray-500 dark:text-gray-400">Level {role.level} • {role.userCount} users</p> */}
          </div>
        </div>
      );
    },
    size: "xl",
    enableNavigation: true,
    tabs: [
      {
        key: "role",
        label: "Role",
        // icon: InfoIcon,
        render: (
          // userItem: UserEntity
          // userItem: UserProfile
        ) => {
          return (
            <></>
          )
        }
      }
    ],
    actions: [
      {
        key: "view",
        label: "View",
        // icon: EyeIcon,
        variant: "primary",
        onClick: (roleItem: Role, closePreview: () => void) => {
          closePreview();
          navigate(`/role/${roleItem.id}`);
        },
        condition: () => (permissions.hasPermission("role.view") || isSystemAdmin) as boolean
      },
      {
        key: "update",
        label: "Edit",
        // icon: PencilIcon,
        variant: "warning",
        onClick: (roleItem: Role, closePreview: () => void) => {
          closePreview();
          navigate(`/role/${roleItem.id}/edit`);
        },
        condition: () => (permissions.hasPermission("role.update") || isSystemAdmin) as boolean
      },
      {
        key: "delete",
        label: "Delete",
        // icon: CheckLineIcon,
        variant: "outline",
        onClick: (roleItem: Role, closePreview: () => void) => {
          console.log("Delete role:", roleItem.id);
          closePreview();
        },
        condition: (roleItem: Role) => (roleItem.id !== SYSTEM_ROLE) as boolean
      }
    ]
  };

  // ===================================================================
  // Advanced Filters
  // ===================================================================

  // const advancedFilters = [
  //   {
  //     key: "id",
  //     label: "Role",
  //     type: "select" as const,
  //     options: role.map(role => ({ value: role.id, label: role.roleName.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) })),
  //     placeholder: "Select role"
  //   }
  // ];

  // ===================================================================
  // Bulk Actions
  // ===================================================================

  // ===================================================================
  // Export Options
  // ===================================================================

  // ===================================================================
  // Custom Filter Function for Enhanced MultiSelect Support
  // ===================================================================

  const customCaseFilterFunction = (roleItem: Role, filters: unknown): boolean => {
    return Object.entries(filters as Record<string, unknown>).every(([key, value]) => {
      if (!value) {
        return true;
      }

      // Handle search
      if (key === "search" && typeof value === "string") {
        const searchTerm = value.toLowerCase();
        return roleItem.roleName.toLowerCase().includes(searchTerm)
      }

      // Handle multiselect arrays
      if (Array.isArray(value) && value.length > 0) {
        switch (key) {
          case "permissions":
            // Check if role has any of the selected permissions
            // return value.some(permission => roleItem.permissions.includes(permission));
            return false;
            
          default:
            return (value as string[]).includes(roleItem[key as keyof Role] as string);
        }
      }

      // Handle number ranges
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const range = value as { min?: number; max?: number };
        if ((range.min !== undefined || range.max !== undefined) && typeof roleItem[key as keyof Role] === "number") {
          const roleValue = roleItem[key as keyof Role] as unknown as number;
          if (range.min !== undefined && roleValue < range.min) return false;
          if (range.max !== undefined && roleValue > range.max) return false;
          return true;
        }
      }

      // Handle boolean
      if (typeof value === "boolean" && typeof roleItem[key as keyof Role] === "boolean") {
        return roleItem[key as keyof Role] === value;
      }

      // Handle regular values
      return roleItem[key as keyof Role] === value;
    });
  };

  // ===================================================================
  // Event Handlers
  // ===================================================================

  // const [selectedView, setSelectedView] = useState<"cards" | "matrix" | "hierarchy">("cards");
  // const [searchTerm, setSearchTerm] = useState("");
  // const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  // const [showRoleEditor, setShowRoleEditor] = useState(false);

  // const filteredRoles = useMemo(() => {
  //   return roleList.filter(role =>
  //     role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     role.description.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // }, [roleList, searchTerm]);

  // const roleHierarchy = useMemo(() => buildRoleHierarchy(roleList), [roleList]);

  const handlePermissionToggle = useCallback(async (roleId: string, permId: string) => {
    setRoles(prevRoles => prevRoles.map(role => {
      if (role.id === roleId) {
        const permissions = role?.permissions?.includes(permId)
          ? role.permissions.filter(p => p !== permId)
          : [...role.permissions || [], permId];
        return {
          ...role,
          permissions,
          lastModified: new Date().toISOString()
        };
      }
      return role;
    }));
  }, []);

  const handlePermissionSave = async () => {
    try {
      setLoading(true);
      const payload: RolesPermissionsUpdateData = {
        body: (roleList).map(rl => {
          return {
            roleId: rl.id,
            permissions: (rl.permissions || []).map(p => {
              return { permId: p, active: true };
            })
          };
        }
      )};
      const response = await updateUserRolesPermissions(payload).unwrap();

      // setUpdateUserRolesPermissionsResponse(response);

      if (response?.status) {
        addToast("success", `Roles Permissions Management: ${response?.desc || response?.msg || "Update successfully"}`);
      }
      else {
        throw new Error(response?.desc || response?.msg || "Unknown error");
      }

      // for (const [, rl] of roleList.entries()) {
      //   trigger(rl.id);
      //   const { data: rpsData } = await trigger(rl.id);
      //   const rps = rpsData as unknown as RolePermission[] || [];
      //   if (rps.length === 0) {
      //     const ps = (rl.permissions || []).map(p => {
      //       return { permId: p, active: true };
      //     });
      //     const payload: RolePermissionsCreateData = {
      //       roleId: rl.id,
      //       permissions: ps,
      //     };
      //     try {
      //       const response = await createRolePermissions(payload).unwrap();
      //       console.log("Created role permissions:", response);
      //     }
      //     catch (err) {
      //       console.error("Error creating role permissions:", err);
      //     }
      //   }
      // };
    }
    catch (error) {
      addToast("error", `Roles Permissions Management: ${error}`);
    }
    finally {
      setLoading(false);
    }
  };

  // const handlePermissionToggle = useCallback(( roleId: string, permId: string ) => {
  //   setRoles(prevRoles => prevRoles.map(role => {
  //     if (role.id === roleId) {
  //       const permissions = role?.permissions?.includes(permId)
  //         ? role.permissions.filter(p => p !== permId)
  //         : [...role.permissions || [], permId];
  //       return {
  //         ...role,
  //         permissions,
  //         lastModified: new Date().toISOString()
  //       };
  //     }
  //     return role;
  //   }));
  // }, []);

  // const handlePermissionToggle = useCallback(async (roleId: string, permId: string) => {
  //   const roles = role.find(r => r.id === roleId);
  //   if (!roles) {
  //     return;
  //   }
  //   const hasPermission = roles?.permissions?.includes(permId);
  //   const newPermissions = hasPermission
  //     ? roles?.permissions?.filter(p => p !== permId)
  //     : [...roles?.permissions || [], permId];
  //   // Optimistic update
  //   setRoles(prevRoles => prevRoles.map(role => 
  //     role.id === roleId 
  //       ? { ...role, permissions: newPermissions, lastModified: new Date().toISOString() }
  //       : role
  //   ));
  //   try {
  //     const result = await RoleManagementAPI.toggleRolePermission(roleId, permissionId, !hasPermission);
  //     if (result.success && result.data) {
  //       // Update with server response
  //       setRoles(prevRoles => prevRoles.map(r => 
  //         r.id === roleId ? result.data! : r
  //       ));
  //       showNotification(
  //         "success", 
  //         "Permission Updated", 
  //         `Permission ${hasPermission ? "removed from" : "granted to"} ${roles.roleName}`
  //       );
  //     }
  //     else {
  //       // Revert optimistic update
  //       setRoles(prevRoles => prevRoles.map(r => 
  //         r.id === roleId ? roles : r
  //       ));
  //       showNotification("error", "Update Failed", result.error || "Failed to update permission");
  //     }
  //     setRoles(prevRoles => prevRoles.map(r => 
  //       r.id === roleId ? roles : r
  //     ));
  //   }
  //   catch {
  //     // Revert optimistic update
  //     setRoles(prevRoles => prevRoles.map(r => 
  //       r.id === roleId ? roles : r
  //     ));
  //     showNotification("error", "Update Failed", "Network error occurred");
  //   }
  // }, [
  //   role,
  //   showNotification
  // ]);

  // const handleEdit = useCallback((role: Role) => {
  //   setSelectedRole(role);
  //   setShowRoleEditor(true);
  // }, []);

  // const handleClone = useCallback((role: Role) => {
  //   const newRole: Role = {
  //     ...role,
  //     id: `role_${Date.now()}`,
  //     name: `${role.name} (Copy)`,
  //     isSystem: false,
  //     userCount: 0,
  //     createdAt: new Date().toISOString(),
  //     lastModified: new Date().toISOString(),
  //     createdBy: "current_user@company.com"
  //   };
  //   setRoles(prevRoles => [...prevRoles, newRole]);
  // }, []);

  // const handleView = useCallback((role: Role) => {
  //   setSelectedRole(role);
  //   // Could open a detailed permissions modal
  //   console.log("View permissions for role:", role);
  // }, []);

  // Handle deletion and other actions
  const handleAction = (actionKey: string, roleItem: Role) => {
    console.log(`Action ${actionKey} triggered for role:`, roleItem.id);
    // Add custom role-specific action handling
  };

  // const handleAction = async (actionKey: string, roleItem: RolePermission) => {
  //   console.log(updateUserRolesPermissionsResponse);
  // };

  // Handle deletion
  const handleDelete = (roleId: string) => {
    console.log("Role deleted:", roleId);
    // Handle role delete
  };

  // const handleDelete = useCallback((role: Role) => {
  //   if (role.userCount > 0) {
  //     console.error("Cannot delete role with assigned users. Please reassign users first.");
  //     return;
  //   }
  //   if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
  //     setRoles(prevRoles => prevRoles.filter(r => r.id !== role.id));
  //   }
  // }, []);

  // ===================================================================
  // Custom Rendering
  // ===================================================================

  const renderCard = (roleItem: Role) => {
    const roleConfig = role.find(r => r.id === roleItem.id);
    return <RoleCardContent
      role={roleConfig as Role}
      // rolePermissions={rolesPerms as RolePermission[]}
      permission={perms as Permission[]}
      onEdit={() => navigate(`/role/${roleItem.id}/edit`)}
      onDelete={() => console.log("Delete role:", roleItem.id)}
      onClone={() => console.log("Clone role:", roleItem.id)}
      onViewPermissions={() => console.log("View permissions for role:", roleItem.id)}
    />
  };

  // const renderMatrix = (roleItem: Role[], permissionItem: Permission[], onPermissionToggle: (roleId: string, permissionId: string) => void) => {
  //   return <PermissionMatrixView
  //     roles={roleItem}
  //     permissions={permissionItem}
  //     onPermissionToggle={onPermissionToggle}
  //   />
  // };

  const renderMatrix = () => {
    return <PrivilegeMatrixContent
      roles={roleList}
      rolePermissions={rolesPerms as RolePermission[]}
      permissions={perms as Permission[]}
      onPermissionToggle={handlePermissionToggle}
      handlePermissionSave={handlePermissionSave}
      loading={loading}
    />
  };

  // ===================================================================
  // Render Component
  // ===================================================================

  const attrMetrics = [
    { key: "totalRoles", title: "Total Roles", icon: GroupIcon, color: "blue-light", className: "text-blue-light-600" },
    { key: "activeRoles", title: "Active Roles", icon: CheckLineIcon, color: "green", className: "text-green-600" },
    { key: "systemRoles", title: "System Roles", icon: LockIcon, color: "purple", className: "text-purple-600" },
    { key: "customRoles", title: "Custom Roles", icon: PencilIcon, color: "orange", className: "text-orange-600" },
    { key: "averagePermissions", title: "Avg Permissions", icon: PieChartIcon, color: "blue", className: "text-blue-600" },
    { key: "mostUsedRole", title: "Most Used", icon: ShootingStarIcon, color: "yellow", className: "text-yellow-600" },
  ];

  return (
    <>
      <MetricsView metrics={roleAnalytics} attrMetrics={attrMetrics} />

      <EnhancedCrudContainer
        // advancedFilters={advancedFilters}
        apiConfig={{
          baseUrl: "/api",
          endpoints: {
            list: "/roles",
            create: "/roles",
            read: "/roles/:id",
            update: "/roles/:id",
            delete: "/roles/:id",
            bulkDelete: "/roles/bulk",
            export: "/roles/export"
          }
        }}
        // bulkActions={bulkActions}
        config={config} 
        customFilterFunction={customCaseFilterFunction}
        data={role}
        // displayModes={["card", "matrix", "hierarchy"]}
        displayModes={["card", "matrix"]}
        // displayModes={["matrix"]}
        displayModeDefault="matrix"
        enableDebug={true} // Enable debug mode to troubleshoot
        // error={null}
        // exportOptions={exportOptions}
        features={{
          bulkActions: false,
          export: false,
          filtering: true,
          keyboardShortcuts: true,
          pagination: true,
          realTimeUpdates: false, // Disabled for demo
          search: false,
          sorting: true,
        }}
        // keyboardShortcuts={[]}
        // loading={false}
        module="role"
        previewConfig={previewConfig}
        // previewConfig={previewConfig as PreviewConfig<Role & { id: string }>}
        // searchFields={["name", "description"]}
        searchFields={["roleName"]}
        // customFilterFunction={() => true}
        // onCreate={() => navigate("/role/create")}
        onDelete={handleDelete}
        onItemAction={handleAction}
        // onItemClick={(item) => navigate(`/role/${item.id}`)}
        onRefresh={() => window.location.reload()}
        // onUpdate={() => {}}
        renderCard={renderCard}
        renderMatrix={renderMatrix}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default RoleManagementComponent;
