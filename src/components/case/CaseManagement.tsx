// /src/components/case/CaseManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import CaseAnalyticsContent from "@/components/case/CaseAnalytics";
import CaseTypesAndSubTypes from "@/components/case/CaseTypesAndSubTypes";
import Tab from "@/components/ui/tab/Tab";
import type { TabItem } from "@/components/ui/tab/Tab";
import type { CaseTypeManagementProps, EnhancedCaseSubType, EnhancedCaseType, TypeAnalytics } from "@/types/case";

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

const CaseManagementComponent: React.FC<CaseTypeManagementProps> = ({ caseSubTypes, caseTypes, className }) => {
  // State management
  const [caseSubType, setCaseSubType] = useState<EnhancedCaseSubType[]>(caseSubTypes || []);
  const [caseType, setCaseType] = useState<EnhancedCaseType[]>(caseTypes || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, ] = useState<string>("all");
  const [showInactive, ] = useState(false);

  // Filter and search logic
  const filteredTypes = useMemo(() => {
    const filtered = caseType.filter(type => {
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

    return filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [caseType, searchQuery, filterCategory, showInactive]);

  const tabItem: TabItem[] = [
    {
      id: "typesAndSubTypes",
      label: "Types & Sub-Types",
      content: <CaseTypesAndSubTypes
        analytics={mockAnalytics}
        caseSubTypes={caseSubType}
        caseTypes={caseType}
        filteredTypes={filteredTypes}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    },
    {
      id: "analytics",
      label: "Analytics",
      content: <CaseAnalyticsContent analytics={mockAnalytics} filteredTypes={filteredTypes} />
    },
  ];

  useEffect(() => {
    setCaseSubType(caseSubTypes || []);
  }, [caseSubTypes]);

  useEffect(() => {
    setCaseType(caseTypes || []);
  }, [caseTypes]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
      <div className={`mx-auto w-full ${className}`}>
        <Tab items={tabItem} variant="underline" />
      </div>
    </div>
  );
};

export default CaseManagementComponent;
