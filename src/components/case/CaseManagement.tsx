// /src/components/case/CaseManagement.tsx
import React, { useMemo, useState } from "react";
import CaseAnalyticsContent from "@/components/case/CaseAnalytics";
import CaseTypesAndSubTypes from "@/components/case/CaseTypesAndSubTypes";
import Tab from "@/components/ui/tab/Tab";
import type { TabItem } from "@/components/ui/tab/Tab";
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
  const [caseTypes, ] = useState<EnhancedCaseType[]>(mockCaseTypes);
  const [searchQuery, ] = useState("");
  const [filterCategory, ] = useState<string>("all");
  const [showInactive, ] = useState(false);

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

  const tabItem: TabItem[] = [
    {
      id: "typesAndSubTypes",
      label: "Types & Sub-Types",
      content: <CaseTypesAndSubTypes analytics={mockAnalytics} caseSubTypes={mockCaseSubTypes} caseTypes={mockCaseTypes} />
    },
    {
      id: "analytics",
      label: "Analytics",
      content: <CaseAnalyticsContent analytics={mockAnalytics} filteredTypes={filteredTypes} />
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
      <div className={`mx-auto w-full ${className}`}>
        <Tab items={tabItem} variant="underline" />
      </div>
    </div>
  );
};

export default CaseManagementComponent;
