// /src/components/admin/RoleManagement.tsx
import React, {
  useCallback,
  // useMemo,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { CheckLineIcon, GroupIcon, LockIcon, PencilIcon, PieChartIcon, ShootingStarIcon } from "@/icons";
import { PermissionMatrixView } from "@/components/admin/PermissionMatrixView";
import { RoleCard } from "@/components/admin/RoleCard";
import type { PreviewConfig } from "@/types/enhanced-crud";
import type {
  Permission,
  Role,
  RoleAnalytics,
  // RoleHierarchy
} from "@/types/role";
import MetricsView from "@/components/admin/MetricsView";
import allPermissions from "@/mocks/allPermissions.json";
import roles from "@/mocks/roles.json";

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

const RoleManagementComponent: React.FC = () => {
  const navigate = useNavigate();

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

  const mockAnalytics: RoleAnalytics = {
    totalRoles: roles.length,
    activeRoles: roles.filter(r => r.userCount > 0).length,
    systemRoles: roles.filter(r => r.isSystem).length,
    customRoles: roles.filter(r => !r.isSystem).length,
    averagePermissions: Math.round(roles.reduce((sum, role) => sum + role.permissions.length, 0) / roles.length),
    // mostUsedRole: roles.reduce((prev, current) => (prev.userCount > current.userCount) ? prev : current),
    mostUsedRole: "Agent",
    // recentChanges: 3
  };

  const data: Role[] = roles as Role[];

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
      // bulkDelete: "/api/roles/bulk",
      export: "/api/roles/export"
    },
    columns: [
      {
        key: "id",
        label: "ID"
      },
      {
        key: "name",
        label: "Name"
      },
      {
        key: "description",
        label: "Description"
      },
      {
        key: "level",
        label: "Level"
      },
      {
        key: "color",
        label: "Color"
      },
      {
        key: "permission",
        label: "Permission",
      },
      {
        key: "isSystem",
        label: "Is System",
      },
      {
        key: "isTemplate",
        label: "Is Template",
      }
    ],
    actions: [
      {
        key: "view",
        label: "View",
        variant: "primary" as const,
        // icon: EyeIcon,
        onClick: (roleItem: Role) => navigate(`/role/${roleItem.id}`)
      },
      {
        key: "edit",
        label: "Edit",
        variant: "warning" as const,
        // icon: PencilIcon,
        onClick: (roleItem: Role) => navigate(`/role/${roleItem.id}/edit`)
      },
      {
        key: "delete",
        label: "Delete",
        variant: "error" as const,
        // icon: TrashBinIcon,
        onClick: (roleItem: Role) => {
          console.log("Delete role:", roleItem.id);
        }
      }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  const previewConfig: PreviewConfig<Role> = {
    title: () => "Role Information",
    size: "xl",
    enableNavigation: true,
    tabs: [],
    actions: [
      {
        key: "view",
        label: "View",
        // icon: EyeIcon,
        variant: "primary",
        onClick: (roleItem: Role, closePreview: () => void) => {
          closePreview();
          navigate(`/role/${roleItem.id}`);
        }
      },
      {
        key: "edit",
        label: "Edit",
        // icon: PencilIcon,
        variant: "warning",
        onClick: (roleItem: Role, closePreview: () => void) => {
          closePreview();
          navigate(`/role/${roleItem.id}/edit`);
        }
      },
      {
        key: "delete",
        label: "Delete",
        // icon: CheckLineIcon,
        variant: "error",
        onClick: (roleItem: Role, closePreview: () => void) => {
          console.log("Delete role:", roleItem.id);
          closePreview();
        }
      }
    ]
  };

  // ===================================================================
  // Advanced Filters
  // ===================================================================

  const advancedFilters = [
    {
      key: "id",
      label: "Role",
      type: "select" as const,
      options: roles.map(role => ({ value: role.id, label: role.name })),
      placeholder: "Select role"
    },
    {
      key: "permissions",
      label: "Permissions",
      type: "select" as const,
      options: allPermissions.map(p => ({ value: p.id, label: `${p.name} - ${p.description}` })),
      multiple: true,
      placeholder: "Select one or more permissions",
      searchable: true,
      clearable: true
    }
  ];

  // ===================================================================
  // Bulk Actions
  // ===================================================================

  // ...

  // ===================================================================
  // Export Options
  // ===================================================================

  const exportOptions = [
    {
      key: "csv-summary",
      label: "Summary Report (CSV)",
      format: "csv" as const,
      columns: ["name", "description"]
    },
    {
      key: "csv-detailed",
      label: "Detailed Report (CSV)",
      format: "csv" as const,
      columns: ["name", "description", "permissions"]
    },
    {
      key: "json-full",
      label: "Complete Data (JSON)",
      format: "json" as const
    }
  ];

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
        return roleItem.name.toLowerCase().includes(searchTerm) ||
               roleItem.description.toLowerCase().includes(searchTerm)
      }

      // Handle multiselect arrays
      if (Array.isArray(value) && value.length > 0) {
        switch (key) {
          case "permissions":
            // Check if role has any of the selected permissions
            return value.some(permission => roleItem.permissions.includes(permission));
            
          default:
            return (value as string[]).includes(roleItem[key as keyof Role] as string);
        }
      }

      // Handle number ranges
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const range = value as { min?: number; max?: number };
        if ((range.min !== undefined || range.max !== undefined) && typeof roleItem[key as keyof Role] === "number") {
          const roleValue = roleItem[key as keyof Role] as number;
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

  const [roleList, setRoles] = useState<Role[]>(roles);
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

  const handlePermissionToggle = useCallback((roleId: string, permissionId: string) => {
    setRoles(prevRoles => prevRoles.map(role => {
      if (role.id === roleId) {
        const permissions = role.permissions.includes(permissionId)
          ? role.permissions.filter(p => p !== permissionId)
          : [...role.permissions, permissionId];
        
        return {
          ...role,
          permissions,
          lastModified: new Date().toISOString()
        };
      }
      return role;
    }));
  }, []);

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
  // Custom Card Rendering
  // ===================================================================

  const renderCard = (roleItem: Role) => {
    const roleConfig = roles.find(r => r.id === roleItem.id);
    return <RoleCard
      role={roleConfig as Role}
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
    return <PermissionMatrixView
      // roles={data}
      roles={roleList}
      permissions={allPermissions as Permission[]}
      onPermissionToggle={handlePermissionToggle}
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
      <MetricsView metrics={mockAnalytics} attrMetrics={attrMetrics} />

      <EnhancedCrudContainer
        advancedFilters={advancedFilters}
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
        data={data}
        // displayModes={["card", "matrix", "hierarchy"]}
        displayModes={["card", "matrix"]}
        enableDebug={true} // Enable debug mode to troubleshoot
        // error={null}
        exportOptions={exportOptions}
        features={{
          bulkActions: false,
          export: true,
          filtering: true,
          keyboardShortcuts: true,
          pagination: true,
          realTimeUpdates: false, // Disabled for demo
          search: true,
          sorting: true,
        }}
        // keyboardShortcuts={[]}
        // loading={false}
        previewConfig={previewConfig}
        searchFields={["name", "description"]}
        // customFilterFunction={() => true}
        onCreate={() => navigate("/role/create")}
        onDelete={handleDelete}
        onItemAction={handleAction}
        // onItemClick={(item) => navigate(`/role/${item.id}`)}
        onRefresh={() => window.location.reload()}
        // onUpdate={() => {}}
        renderCard={renderCard}
        renderMatrix={renderMatrix}
      />
    </>
  );
};

export default RoleManagementComponent;
