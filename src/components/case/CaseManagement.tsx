// /src/components/case/CaseManagement.tsx
import React, { useMemo, useState } from "react";
import { Folder, Plus, RefreshCw } from "lucide-react";
import CaseAnalyticsContent from "@/components/case/CaseAnalytics";
import CaseHierarchyContent from "@/components/case/CaseHierarchyView";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
// import Tab from "@/components/ui/tab/Tab";
// import type { TabItem } from "@/components/ui/tab/Tab";
import type { CaseTypeManagementProps, EnhancedCaseSubType, EnhancedCaseType, TypeAnalytics } from "@/types/case";

// Mock data for demonstration
const mockCaseTypes: EnhancedCaseType[] = [
  {
    id: "1",
    typeId: "EMERGENCY",
    orgId: "org-1",
    en: "Emergency Response",
    th: "การตอบสนองฉุกเฉิน",
    active: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    icon: "🚨",
    color: "#ef4444",
    category: "critical",
    departmentRestrictions: ["emergency", "police"],
    escalationRules: [],
    customFields: [],
    templates: {
      description: "Emergency response case template",
      requiredFields: ["location", "severity", "responder"],
      attachmentTypes: ["image", "video", "document"]
    },
    level: 1,
    sortOrder: 1
  },
  {
    id: "2",
    typeId: "MAINTENANCE",
    orgId: "org-1",
    en: "Maintenance Request",
    th: "คำขอบำรุงรักษา",
    active: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-10T00:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    icon: "🔧",
    color: "#3b82f6",
    category: "operations",
    departmentRestrictions: ["maintenance", "facilities"],
    escalationRules: [],
    customFields: [],
    templates: {
      description: "Standard maintenance request template",
      requiredFields: ["equipment", "priority", "description"],
      attachmentTypes: ["image", "document"]
    },
    level: 1,
    sortOrder: 2
  }
];

const mockCaseSubTypes: EnhancedCaseSubType[] = [
  {
    id: "1",
    typeId: "EMERGENCY",
    sTypeId: "FIRE",
    sTypeCode: "FIRE-001",
    orgId: "org-1",
    en: "Fire Emergency",
    th: "เหตุฉุกเฉินไฟไหม้",
    wfId: "wf-fire-001",
    caseSla: "15",
    priority: "5",
    userSkillList: ["fire-fighting", "first-aid"],
    unitPropLists: ["fire-truck", "safety-equipment"],
    active: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    automationRules: [],
    skillRequirements: [
      { skillId: "fire-fighting", level: 4, required: true },
      { skillId: "first-aid", level: 3, required: true }
    ],
    resourceRequirements: [
      { resourceId: "fire-truck", quantity: 1, duration: 60 },
      { resourceId: "safety-equipment", quantity: 5, duration: 120 }
    ],
    approvalWorkflow: [],
    costCenters: ["emergency-dept"],
    estimatedDuration: 120,
    complexity: "critical"
  },
  {
    id: "2",
    typeId: "MAINTENANCE",
    sTypeId: "HVAC",
    sTypeCode: "HVAC-001",
    orgId: "org-1",
    en: "HVAC Maintenance",
    th: "บำรุงรักษาระบบปรับอากาศ",
    wfId: "wf-hvac-001",
    caseSla: "240",
    priority: "2",
    userSkillList: ["hvac-technician", "electrical"],
    unitPropLists: ["hvac-tools", "electrical-meter"],
    active: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-10T00:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    automationRules: [],
    skillRequirements: [
      { skillId: "hvac-technician", level: 3, required: true },
      { skillId: "electrical", level: 2, required: false }
    ],
    resourceRequirements: [
      { resourceId: "hvac-tools", quantity: 1, duration: 240 }
    ],
    approvalWorkflow: [
      { id: "1", role: "supervisor", required: true, order: 1 }
    ],
    costCenters: ["maintenance-dept"],
    estimatedDuration: 240,
    complexity: "medium"
  }
];

const mockAnalytics: Record<string, TypeAnalytics> = {
  "EMERGENCY": {
    usageCount: 245,
    averageResolutionTime: 45,
    slaCompliance: 98.5,
    resourceUtilization: 85,
    efficiency: 92,
    lastUsed: "2025-08-26T14:30:00Z"
  },
  "MAINTENANCE": {
    usageCount: 156,
    averageResolutionTime: 180,
    slaCompliance: 94.2,
    resourceUtilization: 72,
    efficiency: 88,
    lastUsed: "2025-08-25T09:15:00Z"
  }
};

const CaseManagementComponent: React.FC<CaseTypeManagementProps> = ({ className }) => {
  // State management
  const [caseTypes, setCaseTypes] = useState<EnhancedCaseType[]>(mockCaseTypes);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<"hierarchy" | "list" | "analytics">("hierarchy");
  const [isLoading, setIsLoading] = useState(false);

  // Modals and dialogs
  const [, setShowCreateTypeModal] = useState(false);

  // Filter and search logic
  const filteredTypes = useMemo(() => {
    const filtered = caseTypes.filter(type => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          type.en.toLowerCase().includes(searchLower) ||
          type.th.toLowerCase().includes(searchLower) ||
          type.typeId.toLowerCase().includes(searchLower);
        if (!matchesSearch) {
          return false;
        }
      }

      // Category filter
      if (filterCategory !== "all" && type.category !== filterCategory) {
        return false;
      }

      // Active filter
      if (!showInactive && !type.active) {
        return false;
      }

      return true;
    });

    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [caseTypes, searchQuery, filterCategory, showInactive]);

  const handleCreateType = () => {
    setShowCreateTypeModal(true);
  };

  // Render functions
  const renderTypeHierarchy = () => (
    <CaseHierarchyContent
      analytics={mockAnalytics}
      caseSubTypes={mockCaseSubTypes}
      filteredTypes={filteredTypes}
      showInactive={showInactive}
      setCaseTypes={setCaseTypes}
      setIsLoading={setIsLoading} />
  );

  const renderAnalytics = () => (
    <CaseAnalyticsContent analytics={mockAnalytics} filteredTypes={filteredTypes} />
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
      <div className={`mx-auto w-full ${className}`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mt-4 sm:mt-0 xl:flex space-y-2 xl:space-y-0 items-center space-x-3">
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg">
                <button
                  onClick={() => setViewMode("hierarchy")}
                  className={`px-3 py-2 text-sm rounded-l-lg ${
                    viewMode === "hierarchy"
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Hierarchy
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-3 text-sm ${
                    viewMode === "list"
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode("analytics")}
                  className={`px-4 py-3 text-sm rounded-r-lg ${
                    viewMode === "analytics"
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="xl:flex space-y-2 xl:space-y-0 items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Search types and sub-types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
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

            {/* Show Inactive Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={showInactive}
                onChange={(value) => setShowInactive(value)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-300 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 w-28">Show Inactive</span>
            </label>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-300" />
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {viewMode === "hierarchy" && renderTypeHierarchy()}
            {viewMode === "analytics" && renderAnalytics()}
            {viewMode === "list" && (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500 cursor-default">
                <p>List view implementation coming soon...</p>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!isLoading && filteredTypes.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
              No case types found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
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
    </div>
  );
};

export default CaseManagementComponent;
