// /src/components/admin/user-management/user/UserManagement.tsx
import 
  React
  // ,
  // {
  //   useEffect,
  //   useState
  // }
from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { CheckLineIcon, ChevronUpIcon, CloseIcon, TimeIcon, UserIcon } from "@/icons";
import { usePermissions } from "@/hooks/usePermissions";
import { AuthService } from "@/utils/authService";
import { formatLastLogin } from "@/utils/crud";
import { isValidImageUrl } from "@/utils/resourceValidators";
// import type { CrudConfig } from "@/types/crud";
import type { PreviewConfig } from "@/types/enhanced-crud";
import type { Role } from "@/types/role";
import type {
  // Address,
  Department,
  // Meta,
  UserMetrics,
  UserProfile
} from "@/types/user";
import AuditTrailViewer from "@/components/admin/user-management/audit-log/AuditTrailViewer";
import MetricsView from "@/components/admin/MetricsView";
import UserCardContent from "@/components/admin/user-management/user/UserCard";
import UserInfoCard from "@/components/UserProfile/UserInfoCard";
import UserMetaCard from "@/components/UserProfile/UserMetaCard";
import UserOrganizationCard from "@/components/UserProfile/UserOrganizationCard";

const UserManagementComponent: React.FC<{
  usr: UserProfile[];
  dept: Department[];
  role: Role[];
}> = ({ usr, dept, role }) => {
  const isSystemAdmin = AuthService.isSystemAdmin();
  const navigate = useNavigate();
  const permissions = usePermissions();

  // const [filterValues, setFilterValues] = useState<FilterConfig>({});
  // const [filteredData, setFilteredData] = useState<UserProfile[]>(usr);
  // const [searchTerm, setSearchTerm] = useState("");

  // ===================================================================
  // Mock Data
  // ===================================================================

  // ===================================================================
  // Real Functionality Data
  // ===================================================================

  const countUsersByMonth = (users: UserProfile[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const lastMonthDate = new Date(thisYear, thisMonth - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastYear = lastMonthDate.getFullYear();

    let thisMonthCount = 0;
    let lastMonthCount = 0;

    users.forEach((user) => {
      const createdDate = new Date(user.createdAt);
      const month = createdDate.getMonth();
      const year = createdDate.getFullYear();

      if (year === thisYear && month === thisMonth) {
        thisMonthCount++;
      }
      else if (year === lastYear && month === lastMonth) {
        lastMonthCount++;
      }
    });

    return {
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      difference: thisMonthCount - lastMonthCount,
      growthRate: lastMonthCount === 0 ? null : ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100,
    };
  };

  const mockMetrics: UserMetrics = {
    totalUsers: usr.length || 0,
    activeUsers: usr.filter(u => u.active).length || 0,
    newThisMonth: countUsersByMonth(usr)?.thisMonth || 0,
    suspendedUsers: usr.filter(u => !u.active).length || 0,
    lastMonthGrowth: countUsersByMonth(usr)?.lastMonth || 0
  };

  const data: (UserProfile & { id: string })[] = usr.map(u => ({
    ...u,
    id: typeof u.id === "string" ? u.id : u.id?.toString?.() ?? u.id?.toString?.() ?? "",
  }));

  // ===================================================================
  // CRUD Configuration
  // ===================================================================

  // const IsValidImage = ({ photo }: { photo: string; }) => {
  //   const [isValidImage, setIsValidImage] = useState<boolean | null>(null);
  //   useEffect(() => {
  //     let isMounted = true;
  //     if (photo) {
  //       isImageAvailable(photo).then((result) => {
  //         if (isMounted) {
  //           setIsValidImage(result);
  //         }
  //       });
  //     }
  //     return () => {
  //       isMounted = false;
  //     };
  //   }, [photo]);
  //   if (!photo || !isValidImage) {
  //     return null;
  //   }
  //   return isValidImage;
  // };

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
        render: (userItem: UserProfile) => {
          return (
            <div
              className={`flex items-center gap-3`}
              // className={`flex items-center gap-3 ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}
            >
              {userItem.photo && isValidImageUrl(userItem.photo as string) ? (
                <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                  <img src={userItem.photo} alt={userItem.displayName} />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                  <span className="w-20 text-center capitalize">{userItem.firstName[0]}{userItem.lastName[0]}</span>
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
        render: (userItem: UserProfile) => {
          const roleConfig = role.find(r => r.id === userItem.roleId);
          return (
            // <Badge className={`text-white capitalize ${roleConfig?.color} ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}>
            //   {roleConfig?.roleName || ""}
            // </Badge>
            <span
              // className={`px-2 py-1 rounded-full text-xs font-medium mr-2 xl:mr-0 text-white capitalize ${roleConfig?.color} ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}
              className={`px-2 py-1 rounded-full text-xs font-medium mr-2 xl:mr-0 text-gray-900 dark:text-white capitalize`}
            >
              {roleConfig?.roleName.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || "Guest"}
            </span>
          );
        }
      },
      {
        key: "department",
        label: "Department",
        sortable: true,
        render: (userItem: UserProfile) => {
          const department = dept.find(d => d.deptId === userItem.deptId);
          return (
            <span
              // className={`text-gray-900 dark:text-white ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}
              className={`text-gray-900 dark:text-white`}
            >
              {department?.th}
            </span>
          );
        }
      },
      // {
      //   key: "jobTitle",
      //   label: "Job Title",
      //   sortable: true,
      //   render: (userItem: UserProfile) => {
      //     return (
      //       <span
      //         // className={`text-gray-900 dark:text-white ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}
      //         className={`text-gray-900 dark:text-white`}
      //       >
      //         {userItem.roleId}
      //       </span>
      //     );
      //   }
      // },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (userItem: UserProfile) => {
          const statusConfig = userItem.active
            ? { color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100", icon: CheckLineIcon }
            : { color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100", icon: TimeIcon };
          const Icon = statusConfig.icon;
          return (
            <div
              // className={`flex items-center gap-1 ${statusConfig.color} ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}
              className={`flex items-center gap-1 px-2 py-1 rounded-full justify-center ${statusConfig.color}`}
            >
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
        render: (userItem: UserProfile) => (
          <span
            // className={`text-sm text-gray-500 dark:text-gray-400 ${userItem.status === "suspended" ? "opacity-50 dark:opacity-60" : ""}`}
            className={`text-sm text-gray-500 dark:text-gray-400`}
          >
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
        onClick: (userItem: UserProfile) => navigate(`/user/${userItem.id}`),
        condition: () => (permissions.hasPermission("user.view") || isSystemAdmin) as boolean
      },
      {
        key: "update",
        label: "Edit",
        variant: "warning" as const,
        // icon: PencilIcon,
        onClick: (userItem: UserProfile) => navigate(`/user/edit/${userItem.id}`),
        condition: () => (permissions.hasPermission("user.update") || isSystemAdmin) as boolean
      },
      {
        key: "delete",
        label: "Delete",
        variant: "outline" as const,
        // icon: TrashBinIcon,
        onClick: (userItem: UserProfile) => {
          console.log("Delete user:", userItem.id);
        },
        condition: () => (permissions.hasPermission("user.delete") || isSystemAdmin) as boolean
      }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  const previewConfig: PreviewConfig<
    // UserEntity
    UserProfile
  > = {
    title: () => "User Information",
    size: "xl",
    enableNavigation: true,
    tabs: [
      {
        key: "profile",
        label: "Profile",
        // icon: InfoIcon,
        render: (
          // userItem: UserProfile
        ) => {
          // const roleConfig: Role = role?.find(r => r.id === userItem.roleId) as Role;
          // const rawAddress: string = userItem?.address || "";
          // const location: Address = isValidJsonString(rawAddress) ? JSON.parse(rawAddress) : {};
          // const meta: Meta = {
          //   ...userItem || {},
          //   photo: userItem?.photo || "",
          //   roleName: roleConfig?.roleName || "",
          //   province: location?.province || "",
          //   country: location?.country || "",
          // };
          // const info: UserProfile = userItem || {};
          // const address: string = location ? formatAddress(location) : "";
          return (
            <>
              <UserMetaCard />
              <UserInfoCard />
              <UserOrganizationCard />
            </>
          )
        }
      },
      {
        key: "activity",
        label: "Activity",
        // icon: PieChartIcon,
        render: (userItem: UserProfile) => (
          <pre>{JSON.stringify(userItem, null, 2)}</pre>
        )
      },
      {
        key: "auditLog",
        label: "Audit Log",
        // icon: FileIcon,
        render: () => (
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
        onClick: (userItem: UserProfile, closePreview: () => void) => {
          closePreview();
          navigate(`/user/${userItem.id}`);
        },
        condition: () => (permissions.hasPermission("user.view") || isSystemAdmin) as boolean
      },
      {
        key: "update",
        label: "Edit",
        // icon: PencilIcon,
        variant: "warning",
        onClick: (userItem: UserProfile, closePreview: () => void) => {
          closePreview();
          navigate(`/user/edit/${userItem.id}`);
        },
        condition: () => (permissions.hasPermission("user.update") || isSystemAdmin) as boolean
      },
      {
        key: "delete",
        label: "Delete",
        // icon: CheckLineIcon,
        variant: "outline",
        onClick: (userItem: UserProfile, closePreview: () => void) => {
          closePreview();
          console.log("Delete user:", userItem.id);
        },
        condition: () => (permissions.hasPermission("user.delete") || isSystemAdmin) as boolean
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
      options: role.map(role => ({ value: role.id, label: role.roleName.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) })),
      placeholder: "Select role",
    },
    {
      key: "department",
      label: "Department",
      type: "select" as const,
      options: dept.map(department => ({ value: department.id, label: department.th || department.en })),
      placeholder: "Select department",
    },
    // {
    //   key: "active",
    //   label: "Status",
    //   type: "checkbox" as const,
    //   placeholder: "Show only active users",
    // },
    // {
    //   key: "status",
    //   label: "Status",
    //   type: "boolean" as const,
    //   options: [
    //     { value: "active", label: "Active" },
    //     { value: "inactive", label: "Inactive" },
    //     { value: "suspended", label: "Suspended" }
    //   ]
    // },
    // {
    //   key: "lastLogin",
    //   label: "Last Login",
    //   type: "date-range" as const
    // }
  ];

  // ===================================================================
  // Bulk Actions
  // ===================================================================

  // const bulkActions = [
  //   {
  //     key: "bulk-activate",
  //     label: "Activate",
  //     variant: "success" as const,
  //     onClick: async (items: { id: string }[]) => {
  //       console.log("Bulk activate user:", items.map(c => c.id));
  //     }
  //   },
  //   {
  //     key: "bulk-deactivate",
  //     label: "Deactivate",
  //     variant: "warning" as const,
  //     onClick: async (items: { id: string }[]) => {
  //       console.log("Bulk deactivate user:", items.map(c => c.id));
  //     }
  //   },
  //   // {
  //   //   key: "bulk-suspend",
  //   //   label: "Suspend",
  //   //   variant: "error" as const,
  //   //   onClick: async (items: { id: string }[]) => {
  //   //     console.log("Bulk suspend user:", items.map(c => c.id));
  //   //   }
  //   // },
  //   {
  //     key: "bulk-export",
  //     label: "Export",
  //     variant: "light" as const,
  //     onClick: async (items: { id: string }[]) => {
  //       console.log("Bulk export user:", items.map(c => c.id));
  //     }
  //   }
  // ];

  // ===================================================================
  // Export Options
  // ===================================================================

  // const exportOptions = [
  //   {
  //     key: "csv-summary",
  //     label: "Summary Report (CSV)",
  //     format: "csv" as const,
  //     columns: ["firstname", "lastname"]
  //   },
  //   {
  //     key: "csv-detailed",
  //     label: "Detailed Report (CSV)",
  //     format: "csv" as const,
  //     columns: ["firstname", "lastname", "address", "createdAt"]
  //   },
  //   {
  //     key: "json-full",
  //     label: "Complete Data (JSON)",
  //     format: "json" as const
  //   }
  // ];

  // ===================================================================
  // Custom Card Rendering
  // ===================================================================

  const renderCard = (userItem: UserProfile) => {
    const roleData = role.find(r => r.id === userItem.roleId);
    return <UserCardContent user={userItem as UserProfile} role={roleData as Role} />;
  };

  // ===================================================================
  // Event Handlers
  // ===================================================================

  // Handle deletion and other actions
  const handleAction = (actionKey: string, userItem: UserProfile) => {
    // Add custom user-specific action handling
    console.log(`Action ${actionKey} triggered for user:`, userItem.id);
    
  };

  // Handle deletion
  const handleDelete = (caseId: string) => {
    // Handle user delete
    console.log("User deleted:", caseId);
  };

  // Filter Logic Implementation
  // const applyFilters = useCallback(() => {
  //   let filtered = [...usr];
  //   // Apply search filter
  //   if (searchTerm.trim()) {
  //     const search = searchTerm.toLowerCase().trim();
  //     filtered = filtered.filter(user => 
  //       `${user.firstName} ${user.lastName}`.toLowerCase().includes(search) ||
  //       user.username.toLowerCase().includes(search)
  //     );
  //   }
  //   // Apply advanced filters
  //   Object.entries(filterValues).forEach(([key, value]) => {
  //     if (!value || (Array.isArray(value) && value.length === 0)) return;
  //     switch (key) {
  //       case "search":
  //         if (typeof value === 'string' && value.trim()) {
  //           const searchTerm = value.toLowerCase().trim();
  //           filtered = filtered.filter(user => 
  //             `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm) ||
  //             user.email.toLowerCase().includes(searchTerm)
  //           );
  //         }
  //         break;
  //       case "deptId":
  //         if (typeof value === 'string') {
  //           filtered = filtered.filter(user => user.deptId === value);
  //         }
  //         break;
  //       case "roleId":
  //         if (typeof value === 'string') {
  //           filtered = filtered.filter(user => user.roleId === value);
  //         }
  //         break;
  //       case "active":
  //         if (typeof value === 'boolean') {
  //           filtered = filtered.filter(user => user.active === value);
  //         }
  //         break;
  //       default:
  //         break;
  //     }
  //   });
  //   setFilteredData(filtered);
  // }, [searchTerm, filterValues]);
  // useEffect(() => {
  //   applyFilters();
  // }, [applyFilters]);

  // ===================================================================
  // Render Component
  // ===================================================================

  const attrMetrics = [
    { key: "totalUsers", title: "Total Users", icon: UserIcon, color: "blue", className: "text-blue-600" },
    { key: "activeUsers", title: "Active Users", icon: CheckLineIcon, color: "green", className: "text-green-600" },
    { key: "suspendedUsers", title: "Inactive Users", icon: CloseIcon, color: "red", className: "text-red-600" },
    { key: "newThisMonth", title: "New This Month", icon: ChevronUpIcon, color: "purple", className: "text-purple-600", trend: mockMetrics.lastMonthGrowth },
  ];

  return (
    <>
      <MetricsView metrics={mockMetrics} attrMetrics={attrMetrics} />

      <EnhancedCrudContainer
        advancedFilters={advancedFilters}
        apiConfig={{
          baseUrl: "/api",
          endpoints: {
            create: "/users",
            read: "/users/:id",
            list: "/users",
            update: "/users/:id",
            delete: "/users/:id",
            bulkDelete: "/users/bulk",
            export: "/users/export"
          }
        }}
        // bulkActions={bulkActions}
        // config={config as unknown as CrudConfig<{ id: string; }>}
        config={config}
        // data={usr as unknown as { id: string }[]}
        data={data}
        displayModes={["card", "table"]}
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
          search: true,
          sorting: true,
        }}
        // keyboardShortcuts={[]}
        loading={!usr}
        module="user"
        // previewConfig={previewConfig as unknown as PreviewConfig<{ id: string }>}
        previewConfig={previewConfig as PreviewConfig<UserProfile & { id: string }>}
        searchFields={["firstName", "lastName", "email"]}
        // customFilterFunction={() => true}
        onCreate={() => navigate("/user/create")}
        onDelete={handleDelete}
        onItemAction={handleAction as unknown as (action: string, item: { id: string }) => void}
        // onItemClick={(item) => navigate(`/user/${item.id}`)}
        onRefresh={() => window.location.reload()}
        // onUpdate={() => {}}
        renderCard={renderCard as unknown as (item: { id: string }) => React.ReactNode}
      />
    </>
  );
};

export default UserManagementComponent;
