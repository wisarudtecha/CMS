// /src/components/admin/UserManagement.tsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { CheckLineIcon, ChevronUpIcon, CloseIcon, TimeIcon, UserIcon } from "@/icons";
import { UserCard } from "@/components/admin/UserCard";
import { formatLastLogin } from "@/utils/crud";
import { mapUsersWithRoles } from "@/utils/mapUsersWithRoles";
import type { PreviewConfig } from "@/types/enhanced-crud";
import type { UserEntity, Role, UserMetrics, UserMeta, UserAddress } from "@/types/user";
import AuditTrailViewer from "@/components/admin/AuditTrailViewer";
import MetricsView from "@/components/admin/MetricsView";
import UserAddressCard from "@/components/UserProfile/UserAddressCard";
import UserInfoCard from "@/components/UserProfile/UserInfoCard";
import UserMetaCard from "@/components/UserProfile/UserMetaCard";
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

  const roles: Role[] = roleList as Role[];
  
  const data: UserEntity[] = useMemo(() => mapUsersWithRoles(), []);

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
        render: (userItem: UserEntity) => (
          <div className={`flex items-center gap-3 ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}>
            {userItem.meta?.avatar ? (
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <img src={userItem.meta?.avatar} alt="user" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {userItem.firstName[0]}{userItem.lastName[0]}
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {userItem.firstName} {userItem.lastName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {userItem.email}
              </div>
            </div>
          </div>
        )
      },
      {
        key: "role",
        label: "Role",
        sortable: true,
        render: (userItem: UserEntity) => {
          const roleConfig = roles.find(r => r.id === userItem.roleId);
          return (
            // <Badge className={`${roleConfig?.color} text-white`}>
            //   {roleConfig?.name || "Guest"}
            // </Badge>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig?.color} mr-2 xl:mr-0 text-white ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}
            >
              {roleConfig?.name || "Guest"}
            </span>
          );
        }
      },
      {
        key: "department",
        label: "Department",
        sortable: true,
        render: (userItem: UserEntity) => {
          return (<span className={`text-gray-900 dark:text-white ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}>{userItem.department}</span>);
        }
      },
      {
        key: "jobTitle",
        label: "Job Title",
        sortable: true,
        render: (userItem: UserEntity) => {
          return (<span className={`text-gray-900 dark:text-white ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}>{userItem.jobTitle}</span>);
        }
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (userItem: UserEntity) => {
          const statusConfig = {
            "active": { color: "text-green-600 dark:text-green-400", icon: CheckLineIcon },
            "inactive": { color: "text-yellow-600 dark:text-yellow-400", icon: TimeIcon },
            "suspended": { color: "text-red-600 dark:text-red-400", icon: CloseIcon }
          }[userItem.status];
          const Icon = statusConfig.icon;
          return (
            <div className={`flex items-center gap-1 ${statusConfig.color} ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}>
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium capitalize">{userItem.status}</span>
            </div>
          );
        }
      },
      {
        key: "lastLogin",
        label: "Last Login",
        sortable: true,
        render: (userItem: UserEntity) => (
          <span className={`text-sm text-gray-500 dark:text-gray-400 ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}>
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
        // icon: EyeIcon,
        onClick: (userItem: UserEntity) => navigate(`/user/${userItem.id}`)
      },
      {
        key: "edit",
        label: "Edit",
        variant: "warning" as const,
        // icon: PencilIcon,
        onClick: (userItem: UserEntity) => navigate(`/user/edit${userItem.id}`)
      },
      {
        key: "delete",
        label: "Delete",
        variant: "error" as const,
        // icon: TrashBinIcon,
        onClick: (userItem: UserEntity) => {
          console.log("Delete user:", userItem.id);
        }
      }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  const previewConfig: PreviewConfig<UserEntity> = {
    title: () => "User Information",
    size: "xl",
    enableNavigation: true,
    tabs: [
      {
        key: "profile",
        label: "Profile",
        // icon: InfoIcon,
        render: (userItem: UserEntity) => {
          return (
            // Content
            <>
              <UserMetaCard meta={userItem?.meta as UserMeta} />
              <UserInfoCard info={userItem as UserEntity} editable={false} />
              <UserAddressCard address={userItem?.address as UserAddress} editable={false} />
            </>
          )
        }
      },
      {
        key: "activity",
        label: "Activity",
        // icon: PieChartIcon,
        render: (userItem: UserEntity) => (
          <pre>{JSON.stringify(userItem, null, 2)}</pre>
        )
      },
      {
        key: "auditLog",
        label: "Audit Log",
        // icon: FileIcon,
        render: () => (
          // <pre>{JSON.stringify(userItem, null, 2)}</pre>
          <AuditTrailViewer isOpen={true} />
        )
      }
    ],
    actions: [
      {
        key: "view",
        label: "View",
        // icon: EyeIcon,
        variant: "primary",
        onClick: (userItem: UserEntity, closePreview: () => void) => {
          closePreview();
          navigate(`/user/${userItem.id}`);
        }
      },
      {
        key: "edit",
        label: "Edit",
        // icon: PencilIcon,
        variant: "warning",
        onClick: (userItem: UserEntity, closePreview: () => void) => {
          closePreview();
          navigate(`/user/${userItem.id}/edit`);
        }
      },
      {
        key: "delete",
        label: "Delete",
        // icon: CheckLineIcon,
        variant: "error",
        onClick: (userItem: UserEntity, closePreview: () => void) => {
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
      options: roles.map(role => ({ value: role.id, label: role.name }))
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
      onClick: async (items: UserEntity[]) => {
        console.log("Bulk activate user:", items.map(c => c.id));
      }
    },
    {
      key: "bulk-deactivate",
      label: "Deactivate",
      variant: "warning" as const,
      onClick: async (items: UserEntity[]) => {
        console.log("Bulk deactivate user:", items.map(c => c.id));
      }
    },
    {
      key: "bulk-suspend",
      label: "Suspend",
      variant: "error" as const,
      onClick: async (items: UserEntity[]) => {
        console.log("Bulk suspend user:", items.map(c => c.id));
      }
    },
    {
      key: "bulk-export",
      label: "Export",
      variant: "light" as const,
      onClick: async (items: UserEntity[]) => {
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

  const renderCard = (userItem: UserEntity) => {
    const roleConfig = roles.find(r => r.id === userItem.roleId);
    return <UserCard user={userItem as UserEntity} role={roleConfig as Role} />
  };

  // ===================================================================
  // Event Handlers
  // ===================================================================

  // Handle deletion and other actions
  const handleAction = (actionKey: string, userItem: UserEntity) => {
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
        // error={null}
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
        // keyboardShortcuts={[]}
        // loading={false}
        previewConfig={previewConfig}
        searchFields={["firstName", "lastName", "email", "department", "jobTitle"]}
        // customFilterFunction={() => true}
        onCreate={() => navigate("/user/create")}
        onDelete={handleDelete}
        onItemAction={handleAction}
        // onItemClick={(item) => navigate(`/role/${item.id}`)}
        onRefresh={() => window.location.reload()}
        // onUpdate={() => {}}
        renderCard={renderCard}
      />
    </>
  );
};

export default UserManagementComponent;
