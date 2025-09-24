// /src/components/admin/user-management/organization/OrganizationManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Folder, Plus, RefreshCw } from "lucide-react";
import { FolderIcon, ListIcon } from "@/icons";
import type { Department, Command, Station, Organization, OrganizationManagementProps } from "@/types/organization";
import OrganizationHierarchyView from "@/components/admin/user-management/organization/OrganizationHierarchyView";
import Input from "@/components/form/input/InputField";

const OrganizationManagementComponent: React.FC<OrganizationManagementProps> = ({ departments, commands, stations, organizations, className }) => {
  // State management
  const [department, setDepartment] = useState<Department[]>(departments || []);
  const [command, setCommand] = useState<Command[]>(commands || []);
  const [station, setStation] = useState<Station[]>(stations || []);
  const [, setOrganization] = useState<Organization[]>(organizations || []);
  const [searchQuery, setSearchQuery] = useState("");
  // const [filterCategory, ] = useState<string>("all");
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

    // const filtered = organization.filter(org => {
    //   // Search filter
    //   if (searchQuery) {
    //     const searchLower = searchQuery.toLowerCase();
    //     const matchesSearch = 
    //       org.deptTh.toLowerCase().includes(searchLower) ||
    //       org.deptEn.toLowerCase().includes(searchLower) ||
    //       org.commandTh.toLowerCase().includes(searchLower) ||
    //       org.commandEn.toLowerCase().includes(searchLower) ||
    //       org.stationTh.toLowerCase().includes(searchLower) ||
    //       org.stationEn.toLowerCase().includes(searchLower)
    //     if (!matchesSearch) {
    //       return false;
    //     }
    //   }
    //   // Active filter
    //   if (!showInactive && !org.stationActive) {
    //     return false;
    //   }
    //   return true;
    // });
    // return filtered;
  }, [
    department,
    command,
    station,
    // organization,
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
      // organizations={organization || []}
      showInactive={showInactive}
    />
  );

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
