// /src/components/admin/user-management/user/v1/UserManagement.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { CheckLineIcon, ChevronUpIcon, CloseIcon, TimeIcon, UserIcon } from "@/icons";
import { useGetDepartmentsQuery, useGetUsersQuery } from "@/store/api/userApi";
import { formatLastLogin } from "@/utils/crud";
import { isValidImageUrl } from "@/utils/resourceValidators"
import type { PreviewConfig } from "@/types/enhanced-crud";
import type {
  Role,
  UserMetrics,
  Department,
  UserProfile
} from "@/types/user";
import AuditTrailViewer from "@/components/admin/user-management/audit-log/AuditTrailViewer";
import MetricsView from "@/components/admin/MetricsView";
import UserCardContent from "@/components/admin/user-management/user/UserCard";
import roleList from "@/mocks/roleList.json";

const UserManagementComponent: React.FC = () => {
  const navigate = useNavigate();

  // ===================================================================
  // Mock Data
  // ===================================================================

  const mockMetrics: UserMetrics = {
    totalUsers: 4,
    activeUsers: 2,
    newThisMonth: 1,
    suspendedUsers: 1,
    lastMonthGrowth: 0.5
  };

  const roles: Role[] = roleList as unknown as Role[];

  // ===================================================================
  // API Data
  // ===================================================================

  const { data: departmentsData } = useGetDepartmentsQuery();
  const departments = departmentsData?.data as unknown as Department[] || [];
  
  const { data: usersData } = useGetUsersQuery({
    start: 0,
    length: 10
  });
  const data: (UserProfile & { id: string })[] = (usersData?.data as unknown as UserProfile[] || [])?.map(u => ({
    ...u,
    id: typeof u.id === "string" ? u.id : u.id?.toString?.() ?? u.id?.toString?.() ?? "",
  }));

  // ===================================================================
  // CRUD Configuration
  // ===================================================================

  const config = {
    entityName: "User",
    entityNamePlural: "Users",
    apiEndpoints: {
      list: "/api/users",
      create: "/api/users",
      read: "/api/users/:id",
      update: "/api/users/:id",
      delete: "/api/users/:id",
      bulkDelete: "/api/users/bulk",
      export: "/api/users/export"
    },
    columns: [
      {
        key: "user",
        label: "User",
        sortable: true,
        render: (
          userItem: UserProfile
        ) => {
          return (
            <div className={`flex items-center gap-3`}>
              {userItem.photo && isValidImageUrl(userItem.photo as string) ? (
                <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                  <img src={userItem.photo} alt={userItem.displayName} />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                  <span className="w-20 text-center">{userItem.firstName[0]}{userItem.lastName[0]}</span>
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {userItem.firstName.trim()} {userItem.middleName?.trim()} {userItem.lastName.trim()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {userItem.email}
                </div>
              </div>
            </div>
          )
        }
      },
      {
        key: "role",
        label: "Role",
        sortable: true,
        render: (
          userItem: UserProfile
        ) => {
          const roleConfig = roles.find(r => r.id === userItem.roleId);
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium mr-2 xl:mr-0 text-white`}
            >
              {roleConfig?.roleName || "Guest"}
            </span>
          );
        }
      },
      {
        key: "department",
        label: "Department",
        sortable: true,
        render: (
          userItem: UserProfile
        ) => {
          const department = departments.find(d => d.deptId === userItem.deptId);
          return (<span className={`text-gray-900 dark:text-white`}>{department?.th}</span>);
        }
      },
      {
        key: "jobTitle",
        label: "Job Title",
        sortable: true,
        render: (
          userItem: UserProfile
        ) => {
          return (<span className={`text-gray-900 dark:text-white`}>{userItem.roleId}</span>);
        }
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (
          userItem: UserProfile
        ) => {
          const statusConfig = userItem.active
            ? { color: "text-green-600 dark:text-green-400", icon: CheckLineIcon }
            : { color: "text-yellow-600 dark:text-yellow-400", icon: TimeIcon };
          const Icon = statusConfig.icon;
          return (
            <div className={`flex items-center gap-1 ${statusConfig.color}`}>
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium capitalize">{userItem.active ? "Active" : "Inactive"}</span>
            </div>
          );
        }
      },
      {
        key: "lastLogin",
        label: "Last Login",
        sortable: true,
        render: (
          userItem: UserProfile
        ) => (
          <span className={`text-sm text-gray-500 dark:text-gray-400`}>
            {formatLastLogin(userItem.lastLogin)}
          </span>
        )
      }
    ],
    actions: [
      {
        key: "view",
        label: "View",
        variant: "primary" as const,
        onClick: (
          userItem: UserProfile
        ) =>
          navigate(`/user/${userItem.id}`)
      },
      {
        key: "edit",
        label: "Edit",
        variant: "warning" as const,
        onClick: (
          userItem: UserProfile
        ) =>
          navigate(`/user/edit/${userItem.id}`)
      },
      {
        key: "delete",
        label: "Delete",
        variant: "error" as const,
        onClick: (
          userItem: UserProfile
        ) => {
          console.log("Delete user:", userItem.id);
        }
      }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  const previewConfig: PreviewConfig<
    UserProfile
  > = {
    title: () => "User Information",
    size: "xl",
    enableNavigation: true,
    tabs: [
      {
        key: "profile",
        label: "Profile",
        render: (
        ) => {
          return (
            // Content
            <>
              
            </>
          )
        }
      },
      {
        key: "activity",
        label: "Activity",
        render: (
          userItem: UserProfile
        ) => (
          <pre>{JSON.stringify(userItem, null, 2)}</pre>
        )
      },
      {
        key: "auditLog",
        label: "Audit Log",
        render: () => (
          <AuditTrailViewer isOpen={true} />
        )
      }
    ],
    actions: [
      {
        key: "view",
        label: "View",
        variant: "primary",
        onClick: (
          userItem: UserProfile,
          closePreview: () => void
        ) => {
          closePreview();
          navigate(`/user/${userItem.id}`);
        }
      },
      {
        key: "edit",
        label: "Edit",
        variant: "warning",
        onClick: (
          userItem: UserProfile,
          closePreview: () => void
        ) => {
          closePreview();
          navigate(`/user/${userItem.id}/edit`);
        }
      },
      {
        key: "delete",
        label: "Delete",
        variant: "error",
        onClick: (
          userItem: UserProfile,
          closePreview: () => void
        ) => {
          console.log("Delete user:", userItem.id);
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
      key: "roleId",
      label: "Role",
      type: "select" as const,
      options: roles.map(role => ({ value: role.id, label: role.roleName }))
    },
    {
      key: "department",
      label: "Department",
      type: "select" as const,
      options: [
        { value: "IT", label: "IT" },
        { value: "Support", label: "Support" },
        { value: "Operations", label: "Operations" }
      ]
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "suspended", label: "Suspended" }
      ]
    },
    {
      key: "lastLogin",
      label: "Last Login",
      type: "date-range" as const
    }
  ];

  // ===================================================================
  // Bulk Actions
  // ===================================================================

  const bulkActions = [
    {
      key: "bulk-activate",
      label: "Activate",
      variant: "success" as const,
      onClick: async (
        items: { id: string }[]
      ) => {
        console.log("Bulk activate user:", items.map(c => c.id));
      }
    },
    {
      key: "bulk-deactivate",
      label: "Deactivate",
      variant: "warning" as const,
      onClick: async (
        items: { id: string }[]
      ) => {
        console.log("Bulk deactivate user:", items.map(c => c.id));
      }
    },
    {
      key: "bulk-suspend",
      label: "Suspend",
      variant: "error" as const,
      onClick: async (
        items: { id: string }[]
      ) => {
        console.log("Bulk suspend user:", items.map(c => c.id));
      }
    },
    {
      key: "bulk-export",
      label: "Export",
      variant: "light" as const,
      onClick: async (
        items: { id: string }[]
      ) => {
        console.log("Bulk export user:", items.map(c => c.id));
      }
    }
  ];

  // ===================================================================
  // Export Options
  // ===================================================================

  const exportOptions = [
    {
      key: "csv-summary",
      label: "Summary Report (CSV)",
      format: "csv" as const,
      columns: ["firstname", "lastname"]
    },
    {
      key: "csv-detailed",
      label: "Detailed Report (CSV)",
      format: "csv" as const,
      columns: ["firstname", "lastname", "address", "createdAt"]
    },
    {
      key: "json-full",
      label: "Complete Data (JSON)",
      format: "json" as const
    }
  ];

  // ===================================================================
  // Custom Card Rendering
  // ===================================================================

  const renderCard = (userItem: UserProfile) => {
    const roleConfig = roles.find(r => r.id === userItem.roleId);
    return <UserCardContent user={userItem as UserProfile} role={roleConfig as Role} />;
  };

  // ===================================================================
  // Event Handlers
  // ===================================================================

  // Handle deletion and other actions
  const handleAction = (
    actionKey: string,
    userItem: UserProfile
  ) => {
    console.log(`Action ${actionKey} triggered for user:`, userItem.id);
    // Add custom user-specific action handling
  };

  // Handle deletion
  const handleDelete = (caseId: string) => {
    console.log("User deleted:", caseId);
    // Handle user delete
  };

  // ===================================================================
  // Render Component
  // ===================================================================

  const attrMetrics = [
    { key: "totalUsers", title: "Total Users", icon: UserIcon, color: "blue", className: "text-blue-600" },
    { key: "activeUsers", title: "Active Users", icon: CheckLineIcon, color: "green", className: "text-green-600" },
    { key: "newThisMonth", title: "New This Month", icon: ChevronUpIcon, color: "purple", className: "text-purple-600", trend: mockMetrics.lastMonthGrowth },
    { key: "suspendedUsers", title: "Suspended Users", icon: CloseIcon, color: "red", className: "text-red-600" },
  ];

  return (
    <>
      <MetricsView metrics={mockMetrics} attrMetrics={attrMetrics} />

      <EnhancedCrudContainer
        advancedFilters={advancedFilters}
        apiConfig={{
          baseUrl: "/api",
          endpoints: {
            list: "/users",
            create: "/users",
            read: "/users/:id",
            update: "/users/:id",
            delete: "/users/:id",
            bulkDelete: "/users/bulk",
            export: "/users/export"
          }
        }}
        bulkActions={bulkActions}
        config={config}
        data={data}
        displayModes={["card", "table"]}
        enableDebug={true} // Enable debug mode to troubleshoot
        exportOptions={exportOptions}
        features={{
          search: true,
          sorting: true,
          filtering: true,
          pagination: true,
          bulkActions: true,
          export: true,
          realTimeUpdates: false, // Disabled for demo
          keyboardShortcuts: true
        }}
        loading={!usersData || !data || !usersData}
        previewConfig={previewConfig as PreviewConfig<UserProfile & { id: string }>}
        searchFields={["firstName", "lastName", "email"]}
        onCreate={() => navigate("/user/create")}
        onDelete={handleDelete}
        onItemAction={handleAction as unknown as (action: string, item: { id: string }) => void}
        onRefresh={() => window.location.reload()}
        renderCard={renderCard as unknown as (item: { id: string }) => React.ReactNode}
      />
    </>
  );
};

export default UserManagementComponent;
