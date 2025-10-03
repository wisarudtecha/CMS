// /src/components/admin/user-management/organization/OrganizationManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Folder, Plus, RefreshCw } from "lucide-react";
import {
  // CheckLineIcon,
  FolderIcon,
  ListIcon,
  // TimeIcon
} from "@/icons";
// import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
// import { usePermissions } from "@/hooks/usePermissions";
// import { AuthService } from "@/utils/authService";
// import type { PreviewConfig } from "@/types/enhanced-crud";
import type { Department, Command, Station, Organization, OrganizationManagementProps } from "@/types/organization";
import OrganizationHierarchyView from "@/components/admin/user-management/organization/OrganizationHierarchyView";
import Input from "@/components/form/input/InputField";

const OrganizationManagementComponent: React.FC<OrganizationManagementProps> = ({ departments, commands, stations, organizations, className }) => {
  // const isSystemAdmin = AuthService.isSystemAdmin();
  // const navigate = useNavigate();
  // const permissions = usePermissions();
  // State management
  const [department, setDepartment] = useState<Department[]>(departments || []);
  const [command, setCommand] = useState<Command[]>(commands || []);
  const [station, setStation] = useState<Station[]>(stations || []);
  // const [organization, setOrganization] = useState<Organization[]>(organizations || []);
  const [, setOrganization] = useState<Organization[]>(organizations || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, ] = useState(false);
  const [viewMode, setViewMode] = useState<"hierarchy" | "list">("hierarchy");
  const [isLoading, ] = useState(false);

  // Modals and dialogs
  const [, setShowCreateOrganizationModal] = useState(false);

  // Filter and search logic
  const filteredOrganizations = useMemo(() => {
    const filteredDepartment = department.filter(dept => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          dept.th.toLowerCase().includes(searchLower) ||
          dept.en.toLowerCase().includes(searchLower)
        if (!matchesSearch) {
          return false;
        }
      }
      // Active filter
      if (!showInactive && !dept.active) {
        return false;
      }
      return true;
    });

    const filteredCommand = command.filter(cmd => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          cmd.th.toLowerCase().includes(searchLower) ||
          cmd.en.toLowerCase().includes(searchLower)
        if (!matchesSearch) {
          return false;
        }
      }
      // Active filter
      if (!showInactive && !cmd.active) {
        return false;
      }
      return true;
    });

    const filteredStation = station.filter(stn => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          stn.th.toLowerCase().includes(searchLower) ||
          stn.en.toLowerCase().includes(searchLower)
        if (!matchesSearch) {
          return false;
        }
      }
      // Active filter
      if (!showInactive && !stn.active) {
        return false;
      }
      return true;
    });

    return filteredStation?.length > 0 ? filteredStation
      : filteredCommand?.length > 0 ? filteredCommand
      : filteredDepartment?.length > 0 ? filteredDepartment
      : [];
  }, [
    department,
    command,
    station,
    searchQuery,
    showInactive
  ]);

  const handleCreateOrganization = () => {
    setShowCreateOrganizationModal(true);
  };

  useEffect(() => {
    setDepartment(departments || []);
    setCommand(commands|| []);
    setStation(stations || []);
    setOrganization(organizations || []);
  }, [departments, commands, stations, organizations]);

  // Render functions
  const renderOrganizationHierarchy = () => (
    <OrganizationHierarchyView
      departments={department || []}
      commands={command || []}
      stations={station || []}
      showInactive={showInactive}
    />
  );

  // const data: (Organization & { id: string })[] = organization.map(o => ({
  //   ...o,
  //   id: typeof o.id === "string" ? o.id : o.id ?? "",
  // }));

  // ===================================================================
  // CRUD Configuration
  // ===================================================================

  // const statusConfig = (status: boolean) => {
  //   return status
  //     ? { color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100", icon: CheckLineIcon }
  //     : { color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100", icon: TimeIcon };
  // }

  // const config = {
  //   entityName: "Organization",
  //   entityNamePlural: "Organizations",
  //   apiEndpoints: {
  //     list: "/api/organization",
  //     create: "/api/organization",
  //     read: "/api/organization/:id",
  //     update: "/api/organization/:id",
  //     delete: "/api/organization/:id",
  //     // bulkDelete: "/api/organizations/bulk",
  //     // export: "/api/organizations/export"
  //   },
  //   columns: [
  //     {
  //       key: "station",
  //       label: "Station",
  //       sortable: true,
  //       render: (organizationItem: Organization) => {
  //         const status = statusConfig(organizationItem.stationActive || false);
  //         const Icon = status.icon;
  //         return (
  //           <>
  //             <div>{organizationItem.stationTh || organizationItem.stationEn || ""}</div>
  //             <div className={`flex items-center gap-1 px-2 py-1 rounded-full justify-center ${status.color}`}>
  //               <Icon className="w-4 h-4" />
  //               <span className="text-sm font-medium capitalize">{organizationItem.stationActive ? "Active" : "Inactive"}</span>
  //             </div>
  //           </>
  //         );
  //       }
  //     },
  //     {
  //       key: "command",
  //       label: "Command",
  //       sortable: true,
  //       render: (organizationItem: Organization) => {
  //         const status = statusConfig(organizationItem.commandActive || false);
  //         const Icon = status.icon;
  //         return (
  //           <>
  //             <div>{organizationItem.commandTh || organizationItem.commandEn || ""}</div>
  //             <div className={`flex items-center gap-1 px-2 py-1 rounded-full justify-center ${status.color}`}>
  //               <Icon className="w-4 h-4" />
  //               <span className="text-sm font-medium capitalize">{organizationItem.commandActive ? "Active" : "Inactive"}</span>
  //             </div>
  //           </>
  //         );
  //       }
  //     },
  //     {
  //       key: "department",
  //       label: "Department",
  //       sortable: true,
  //       render: (organizationItem: Organization) => {
  //         const status = statusConfig(organizationItem.deptActive || false);
  //         const Icon = status.icon;
  //         return (
  //           <>
  //             <div>{organizationItem.deptTh || organizationItem.deptEn || ""}</div>
  //             <div className={`flex items-center gap-1 px-2 py-1 rounded-full justify-center ${status.color}`}>
  //               <Icon className="w-4 h-4" />
  //               <span className="text-sm font-medium capitalize">{organizationItem.deptActive ? "Active" : "Inactive"}</span>
  //             </div>
  //           </>
  //         );
  //       }
  //     }
  //   ],
  //   actions: [
  //     {
  //       key: "view",
  //       label: "View",
  //       variant: "primary" as const,
  //       // icon: EyeIcon,
  //       onClick: (organizationItem: Organization) => navigate(`/organization/${organizationItem.id}`),
  //       condition: () => (permissions.hasPermission("organization.view") || isSystemAdmin) as boolean
  //     },
  //     {
  //       key: "update",
  //       label: "Edit",
  //       variant: "warning" as const,
  //       // icon: PencilIcon,
  //       onClick: (organizationItem: Organization) => navigate(`/organization/${organizationItem.id}/edit`),
  //       condition: () => (permissions.hasPermission("organization.update") || isSystemAdmin) as boolean
  //     },
  //     {
  //       key: "delete",
  //       label: "Delete",
  //       variant: "outline" as const,
  //       // icon: TrashBinIcon,
  //       onClick: (organizationItem: Organization) => {
  //         console.log("Delete organization:", organizationItem.id);
  //       },
  //       condition: () => (permissions.hasPermission("organization.delete") || isSystemAdmin) as boolean
  //     }
  //   ]
  // };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  // const previewConfig: PreviewConfig<Organization> = {
  //   title: () => "Organization Information",
  //   size: "xl",
  //   enableNavigation: true,
  //   tabs: [
  //     {
  //       key: "overview",
  //       label: "Overview",
  //       // icon: InfoIcon,
  //       render: (
  //         // organizationItem: Organization
  //       ) => {
  //         return (
  //           <></>
  //         )
  //       }
  //     }
  //   ],
  //   actions: [
  //     {
  //       key: "update",
  //       label: "Edit",
  //       // icon: PencilIcon,
  //       variant: "warning",
  //       onClick: (organizationItem: Organization, closePreview: () => void) => {
  //         closePreview();
  //         navigate(`/organization/${organizationItem.id}/edit`);
  //       },
  //       condition: () => (permissions.hasPermission("organization.update") || isSystemAdmin) as boolean
  //     },
  //     {
  //       key: "delete",
  //       label: "Delete",
  //       // icon: CheckLineIcon,
  //       variant: "outline",
  //       onClick: (organizationItem: Organization, closePreview: () => void) => {
  //         closePreview();
  //         console.log("Delete user:", organizationItem.id);
  //       },
  //       condition: () => (permissions.hasPermission("organization.delete") || isSystemAdmin) as boolean
  //     }
  //   ]
  // };

  // ===================================================================
  // Advanced Filters
  // ===================================================================

  // const advancedFilters = [
  //   {
  //     key: "department",
  //     label: "Department",
  //     type: "select" as const,
  //     options: department.map(dept => ({ value: String(dept.id), label: dept.th || dept.en })),
  //     placeholder: "Select department",
  //   },
  //   {
  //     key: "command",
  //     label: "Command",
  //     type: "select" as const,
  //     options: command.map(cmd => ({ value: String(cmd.id), label: cmd.th || cmd.en })),
  //     placeholder: "Select command",
  //   },
  //   {
  //     key: "station",
  //     label: "Station",
  //     type: "select" as const,
  //     options: station.map(stn => ({ value: String(stn.id), label: stn.th || stn.en })),
  //     placeholder: "Select station",
  //   }
  // ];

  // return (
  //   <>
  //     <EnhancedCrudContainer
  //       advancedFilters={advancedFilters}
  //       apiConfig={{
  //         baseUrl: "/api",
  //         endpoints: {
  //           create: "/organization",
  //           read: "/organization/:id",
  //           list: "/organization",
  //           update: "/organization/:id",
  //           delete: "/organization/:id",
  //           // bulkDelete: "/organization/bulk",
  //           // export: "/organization/export"
  //         }
  //       }}
  //       // bulkActions={bulkActions}
  //       config={config}
  //       data={data}
  //       displayModes={["hierarchy", "table", "card"]}
  //       enableDebug={true} // Enable debug mode to troubleshoot
  //       // error={null}
  //       // exportOptions={exportOptions}
  //       features={{
  //         bulkActions: false,
  //         export: false,
  //         filtering: true,
  //         keyboardShortcuts: true,
  //         pagination: true,
  //         realTimeUpdates: false, // Disabled for demo
  //         search: true,
  //         sorting: true,
  //       }}
  //       // keyboardShortcuts={[]}
  //       loading={!organization}
  //       module="organization"
  //       previewConfig={previewConfig}
  //       searchFields={["stationTh", "stationEn", "commandTh", "commandEn", "deptTh", "deptEn"]}
  //       // customFilterFunction={() => true}
  //       onCreate={() => navigate("/organization/create")}
  //       onDelete={handleDelete}
  //       onItemAction={handleAction}
  //       // onItemClick={(item) => navigate(`/organization/${item.id}`)}
  //       onRefresh={() => window.location.reload()}
  //       // onUpdate={() => {}}
  //       renderCard={renderCard as unknown as (item: { id: string }) => React.ReactNode}
  //     />
  //   </>
  // );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
      <div className={`mx-auto w-full ${className}`}>
        <div className={`mx-auto w-full ${className}`}>
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mt-4 sm:mt-0 xl:flex space-y-2 xl:space-y-0 items-center space-x-3">
                <div className="flex">
                  <button
                    onClick={() => setViewMode("hierarchy")}
                    className={`inline-flex items-center justify-center gap-2 rounded-l-lg transition h-11 px-5 py-3.5 text-md shadow-theme-xs ${
                      viewMode === "hierarchy"
                        ? "bg-brand-500 text-white dark:text-white hover:bg-brand-600 disabled:bg-brand-300"
                        : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                    }`}
                    title="Hierarchy"
                  >
                    <FolderIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`inline-flex items-center justify-center gap-2 rounded-r-lg transition h-11 px-5 py-3.5 text-md shadow-theme-xs ${
                      viewMode === "list"
                        ? "bg-brand-500 text-white dark:text-white hover:bg-brand-600 disabled:bg-brand-300"
                        : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                    }`}
                    title="List"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>   
                {/* Toolbar */}
                <div className="xl:flex space-y-2 xl:space-y-0 items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Input
                      placeholder="Search department or command or station..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-300" />
            </div>
          )}
          {/* Content */}
          {!isLoading && filteredOrganizations?.length !== 0 && (
            <>
              {viewMode === "hierarchy" && renderOrganizationHierarchy()}
              {viewMode === "list" && (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 cursor-default">
                  <p>List view implementation coming soon...</p>
                </div>
              )}
            </>
          )}
          {/* Empty state */}
          {!isLoading && filteredOrganizations?.length === 0 && (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2 cursor-default">
                No organization found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 cursor-default">
                {searchQuery ? "Try adjusting your search criteria" : "Get started by creating your first organization"}
              </p>
              <button
                onClick={handleCreateOrganization}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-300 text-white dark:text-gray-900 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-200 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Organization</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationManagementComponent;
