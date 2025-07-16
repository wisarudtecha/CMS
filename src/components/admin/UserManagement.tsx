// /src/components/admin/UserManagement.tsx
import
  React,
  {
    // useState,
    useMemo,
    // useCallback 
  }
from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import {
  CheckLineIcon,
  CloseIcon,
  TimeIcon
} from "@/icons";
import {
  // formatDate,
  formatLastLogin 
} from "@/utils/crud";
import { PreviewConfig } from "@/types/enhanced-crud"
import {
  UserEntity,
  Role,
  // TemporaryRole,
  // UserMetrics,
  // FilterConfig,
  UserMeta,
  UserAddress
} from "@/types/user";
// import Badge from "@/components/ui/badge/Badge";
// import Button from "@/components/ui/button/Button";
import roleList from "@/mocks/roleList.json";
// import userList from "@/mocks/userList.json";
import { mapUsersWithRoles } from "@/utils/mapUsersWithRoles";
// import UserMetricsCard from "@/components/admin/UserMetricsCard";
import UserMetaCard from "@/components/UserProfile/UserMetaCard";
import UserInfoCard from "@/components/UserProfile/UserInfoCard";
import UserAddressCard from "@/components/UserProfile/UserAddressCard";

// Main Component
const UserManagementComponent: React.FC = () => {
  const navigate = useNavigate();

  // Mock Role Data
  const roles: Role[] = roleList as Role[];
  
  // Mock User Data
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
          <div className="flex items-center gap-3">
            {/* <FolderIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /> */}
            {userItem.meta?.avatar ? (
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <img src={userItem.meta?.avatar} alt="user" />
              </div>
            ) : (
              <div className="w-5 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig?.color} mr-2 xl:mr-0 text-white`}>
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
          return userItem.department;
        }
      },
      {
        key: "jobTitle",
        label: "Job Title",
        sortable: true,
        render: (userItem: UserEntity) => {
          return userItem.jobTitle;
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
            <div className={`flex items-center gap-1 ${statusConfig.color}`}>
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
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatLastLogin(userItem.lastLogin)}
          </span>
        )
      }
    ],
    filters: [
      {
        key: "role",
        label: "Role",
        type: "select" as const,
        options: roles.map(role => ({ value: role.name, label: role.name }))
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
        render: (userItem: UserEntity) => (
          // Content
          <>
            <UserMetaCard meta={userItem?.meta as UserMeta} />
            <UserInfoCard info={userItem as UserEntity} editable={false} />
            <UserAddressCard address={userItem?.address as UserAddress} editable={false} />
          </>
        )
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
        render: (userItem: UserEntity) => (
          <pre>{JSON.stringify(userItem, null, 2)}</pre>
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
          console.log("Closing case:", userItem.id);
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
      key: "category",
      label: "Category",
      type: "select" as const,
      options: [
        { value: "Technical Support", label: "Technical Support" },
        { value: "Feature Request", label: "Feature Request" },
        { value: "Security", label: "Security" },
        { value: "Bug Report", label: "Bug Report" }
      ]
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      type: "select" as const,
      options: [
        { value: "John Smith", label: "John Smith" },
        { value: "Alice Johnson", label: "Alice Johnson" },
        { value: "Mike Davis", label: "Mike Davis" },
        { value: "Security Team", label: "Security Team" }
      ]
    },
    {
      key: "createdAt",
      label: "Created Date",
      type: "date-range" as const
    },
    {
      key: "estimatedHours",
      label: "Estimated Hours",
      type: "number-range" as const,
      min: 0,
      max: 100
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
    // const statusConfig = {
    //   "open": { icon: FolderIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800", label: "Open" },
    //   "in-progress": { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800", label: "In Progress" },
    //   "resolved": { icon: CheckCircleIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800", label: "Resolved" },
    //   "closed": { icon: CheckCircleIcon, color: "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800", label: "Closed" },
    //   "escalated": { icon: AlertHexaIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800", label: "Escalated" }
    // }[userItem.status];

    // const priorityConfig = {
    //   "low": { color: "text-green-600", label: "Low" },
    //   "medium": { color: "text-yellow-600", label: "Medium" },
    //   "high": { color: "text-orange-600", label: "High" },
    //   "critical": { color: "text-red-600", label: "Critical" }
    // }[userItem.priority];

    // const Icon = statusConfig.icon;

    const roleConfig = roles.find(r => r.id === userItem.roleId);

    const statusConfig = {
      "active": { color: "text-green-600 dark:text-green-400", icon: CheckLineIcon },
      "inactive": { color: "text-yellow-600 dark:text-yellow-400", icon: TimeIcon },
      "suspended": { color: "text-red-600 dark:text-red-400", icon: CloseIcon }
    }[userItem.status];
    const Icon = statusConfig.icon;

    return (
      <>
        <div className="xl:flex items-start justify-between mb-4">
          <div className="xl:flex items-center gap-3 min-w-0 xl:flex-1">
            {/* <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 hidden xl:block" /> */}
            {userItem.meta?.avatar ? (
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <img src={userItem.meta?.avatar} alt="user" />
              </div>
            ) : (
              <div className="w-5 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {userItem.firstName[0]}{userItem.lastName[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {userItem.firstName} {userItem.lastName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {userItem.email}
              </p>
            </div>
          </div>
          <div className="xl:flex flex-col gap-1 items-end flex-shrink-0">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig?.color} mr-2 xl:mr-0 text-white`}>
              {roleConfig?.name || "Guest"}
            </span>
            <span className={`text-xs font-medium ${statusConfig.color}`}>
              <Icon className="w-4 h-4 inline mr-1" />
              {userItem.status}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="xl:flex items-center justify-between">
          <div className="xl:flex items-center gap-4 text-xs ">
            <div className="xl:flex items-center gap-1 min-h-4">
              <span>{userItem.jobTitle}</span>
            </div>
          </div>
          
          {userItem.lastLogin && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                Last Login {formatLastLogin(userItem.lastLogin)}
              </span>
            </div>
          )}
        </div>
      </>
    );
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

  return (
    <>
      <EnhancedCrudContainer
        data={data}
        config={config}
        previewConfig={previewConfig}
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
        onCreate={() => navigate("/user/create")}
        onRefresh={() => window.location.reload()}
        onDelete={handleDelete}
        onItemAction={handleAction}
        renderCard={renderCard}
        searchFields={["firstName", "lastName", "email", "department", "jobTitle"]}
        bulkActions={bulkActions}
        exportOptions={exportOptions}
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
        enableDebug={true} // Enable debug mode to troubleshoot
      />
    </>
  );
};

export default UserManagementComponent;
