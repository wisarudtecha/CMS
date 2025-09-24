// /src/components/admin/system-configuration/service/ServiceTypeAndSubType.tsx
import React, { useEffect, useState } from "react";
import { Folder, Plus, RefreshCw } from "lucide-react";
import { FolderIcon, ListIcon } from "@/icons";
import ServiceHierarchyView from "@/components/admin/system-configuration/service/ServiceHierarchyView";
// import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
// import Select from "@/components/form/Select";
import type {
  CaseTypeManagementProps,
  EnhancedCaseSubType,
  // EnhancedCaseType
} from "@/types/case";

const ServiceTypeAndSubTypeComponent: React.FC<CaseTypeManagementProps> = ({
  // analytics,
  caseSubTypes,
  // caseTypes,
  className,
  filteredTypes,
  searchQuery,
  setSearchQuery
}) => {
  // State management
  const [caseSubType, setCaseSubType] = useState<EnhancedCaseSubType[]>(caseSubTypes || []);
  // const [, setCaseType] = useState<EnhancedCaseType[]>(caseTypes || []);
  // const [searchQuery, setSearchQuery] = useState("");
  // const [filterCategory, setFilterCategory] = useState<string>("all");
  // const [showInactive, setShowInactive] = useState(false);
  const [showInactive, ] = useState(false);
  const [viewMode, setViewMode] = useState<"hierarchy" | "list">("hierarchy");
  // const [viewMode, setViewMode] = useState<"hierarchy" | "list" | "analytics">("hierarchy");
  // const [isLoading, setIsLoading] = useState(false);
  const [isLoading, ] = useState(false);

  // Modals and dialogs
  const [, setShowCreateTypeModal] = useState(false);

  const handleCreateType = () => {
    setShowCreateTypeModal(true);
  };

  useEffect(() => {
    setCaseSubType(caseSubTypes || []);
  }, [caseSubTypes]);

  // Render functions
  const renderTypeHierarchy = () => (
    <ServiceHierarchyView
      // analytics={analytics || {}}
      caseSubTypes={caseSubType || []}
      caseTypes={filteredTypes || []}
      // filteredTypes={filteredTypes || []}
      showInactive={showInactive}
      // setCaseTypes={setCaseType}
      // setIsLoading={setIsLoading}
    />
  );

  return (
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
                  placeholder="Search types and sub-types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Category Filter */}
              {/*
              <Select
                value={filterCategory}
                onChange={(value) => setFilterCategory(value)}
                options={[
                  { value: "all", label: "All Categories" },
                  { value: "critical", label: "Critical" },
                  { value: "operations", label: "Operations" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "support", label: "Support" },
                ]}
                className="cursor-pointer"
              />
              */}

              {/* Show Inactive Toggle */}
              {/*
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={showInactive}
                  onChange={(value) => setShowInactive(value)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-300 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 w-28">Show Inactive</span>
              </label>
              */}
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
      {!isLoading && filteredTypes?.length !== 0 && (
        <>
          {viewMode === "hierarchy" && renderTypeHierarchy()}
          {viewMode === "list" && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 cursor-default">
              <p>List view implementation coming soon...</p>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!isLoading && filteredTypes?.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2 cursor-default">
            No case types found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 cursor-default">
            {searchQuery ? "Try adjusting your search criteria" : "Get started by creating your first case type"}
          </p>
          <button
            onClick={handleCreateType}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-300 text-white dark:text-gray-900 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-200 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Case Type</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceTypeAndSubTypeComponent;
