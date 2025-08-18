// /src/components/case/CaseHistory.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { AlertHexaIcon, CalenderIcon, ChatIcon, CheckCircleIcon, TimeIcon, UserIcon } from "@/icons";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { CaseTimelineSteps } from "@/components/case/CaseTimelineSteps";
import { ProgressTimeline } from "@/components/ui/progressTimeline/ProgressTimeline";
import { usePermissions } from "@/hooks/usePermissions";
import { AuthService } from "@/utils/authService";
import { CASE_CANNOT_DELETE } from "@/utils/constants";
import { formatDate } from "@/utils/crud";
import type { CaseEntity, CaseStatus, CaseTypeSubType } from "@/types/case";
import type { PreviewConfig } from "@/types/enhanced-crud";
import Badge from "@/components/ui/badge/Badge";
// import Button from "@/components/ui/button/Button";
// import caseHistoryList from "@/mocks/caseHistoryList.json";

const CaseHistoryComponent: React.FC<{
  caseHistories: CaseEntity[];
  caseStatuses: CaseStatus[];
  caseTypesSubTypes: CaseTypeSubType[];
}> = ({ caseHistories, caseStatuses, caseTypesSubTypes }) => {
  const isSystemAdmin = AuthService.isSystemAdmin();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const isCancelAvailable = (data: CaseEntity) => {
    return (permissions.hasPermission("case.delete") || isSystemAdmin) as boolean && !CASE_CANNOT_DELETE.includes(data.statusId as typeof CASE_CANNOT_DELETE[number])
  }

  // ===================================================================
  // Case Status Properties
  // ===================================================================

  const caseStatusesColorMap: Record<string, string> = {
    "#000000": "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    "#F9C601": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
    "#852B99": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
    "#FF0080": "bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100",
    "#295F79": "bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-100",
    "#468847": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    "#999999": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    "#FF8000": "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100",
    "#FF0000": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
    "#B94A48": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
    null: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
  };

  const generateStatusConfigs = (data: CaseStatus[]) => {
    const configs: Record<string, { color: string; label: string }> = {};
    data.forEach(item => {
      configs[item.statusId] = {
        color: caseStatusesColorMap[item.color as keyof typeof caseStatusesColorMap] || caseStatusesColorMap.null,
        label: item.en
      };
    });
    return configs;
  }

  const statusConfigs = generateStatusConfigs(caseStatuses);

  const getStatusConfig = (caseItem: CaseEntity) => {
    return statusConfigs[caseItem.statusId as keyof typeof statusConfigs] || statusConfigs['S000'];
  };

  const caseStatusOptions = Array.isArray(caseStatuses) ? caseStatuses.map((caseStatus) => ({
    value: caseStatus?.statusId || "",
    label: caseStatus?.en || caseStatus?.th || ""
  })) : [];

  // ===================================================================
  // Case Priority Properties
  // ===================================================================

  const generatePriorityConfigs = () => {
    return [
      { color: "text-red-600 dark:text-red-300", icon: AlertHexaIcon, label: "High" },
      { color: "text-red-600 dark:text-red-300", icon: AlertHexaIcon, label: "High" },
      { color: "text-red-600 dark:text-red-300", icon: AlertHexaIcon, label: "High" },
      { color: "text-red-600 dark:text-red-300", icon: AlertHexaIcon, label: "High" },
      { color: "text-yellow-600 dark:text-yellow-300", icon: TimeIcon, label: "Medium" },
      { color: "text-yellow-600 dark:text-yellow-300", icon: TimeIcon, label: "Medium" },
      { color: "text-yellow-600 dark:text-yellow-300", icon: TimeIcon, label: "Medium" },
      { color: "text-green-600 dark:text-green-300", icon: CheckCircleIcon, label: "Low" },
      { color: "text-green-600 dark:text-green-300", icon: CheckCircleIcon, label: "Low" },
      { color: "text-green-600 dark:text-green-300", icon: CheckCircleIcon, label: "Low" },
    ];
  }

  const priorityConfigs = generatePriorityConfigs();

  const getPriorityConfig = (caseItem: CaseEntity) => {
    return priorityConfigs[caseItem.priority as number] || priorityConfigs[9];
  };

  // ===================================================================
  // Case Type Sub-Type Properties
  // ===================================================================

  const generateTypeSubTypeConfigs = (data: CaseTypeSubType[]) => {
    return Array.isArray(data) ? data.map((caseTypeSubType) => ({
      en: caseTypeSubType?.en || "",
      th: caseTypeSubType?.th || "",
      subTypeEn: caseTypeSubType?.subTypeEn || "",
      subTypeTh: caseTypeSubType?.subTypeTh || "",
      sTypeCode: caseTypeSubType?.sTypeCode || ""
    })) : []
  }

  const typeSubTypeConfigs = generateTypeSubTypeConfigs(caseTypesSubTypes);

  const getTypeSubTypeConfig = (caseItem: CaseEntity) => {
    return typeSubTypeConfigs.find(config => config.sTypeCode === caseItem.caseSTypeId) || { en: "", th: "", subTypeEn: "", subTypeTh: "", sTypeCode : "" };
  };

  const caseTitle = (data: CaseEntity) => {
    const fullCaseTitle = `${getTypeSubTypeConfig(data).sTypeCode}-${getTypeSubTypeConfig(data).th || getTypeSubTypeConfig(data).en}`;
    console.log(fullCaseTitle);
    return fullCaseTitle;
  };

  // ===================================================================
  // Case History Mock Data
  // ===================================================================

  // const data: CaseEntity[] = caseHistoryList as unknown as CaseEntity[];

  // ===================================================================
  // Case History Real Functionality Data
  // ===================================================================

  // const data: CaseEntity[] = caseHistories as unknown as CaseEntity[];
  const data: (CaseEntity & { id: string })[] = caseHistories.map(c => ({
    ...c,
    id: typeof c.id === "string" ? c.id : c.caseId?.toString?.() ?? c.id?.toString?.() ?? "",
  }));

  // ===================================================================
  // CRUD Configuration
  // ===================================================================

  const config = {
    entityName: "Case",
    entityNamePlural: "Cases",
    apiEndpoints: {
      list: "/api/cases",
      create: "/api/cases",
      read: "/api/cases/:id",
      update: "/api/cases/:id",
      delete: "/api/cases/:id",
      bulkDelete: "/api/cases/bulk",
      export: "/api/cases/export"
    },
    columns: [
      {
        key: "caseNumber",
        label: "Case #",
        sortable: true,
        render: (caseItem: CaseEntity) => (
          <div className="flex items-center gap-3">
            {/* <FolderIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /> */}
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {caseTitle(caseItem)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs">
                {caseItem.caseDetail}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {caseItem.caselocAddr}
              </div>
            </div>
          </div>
        )
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (caseItem: CaseEntity) => {
          return (
            <Badge className={`${getStatusConfig(caseItem).color} text-xs`}>
              {getStatusConfig(caseItem).label}
            </Badge>
          );
        }
      },
      {
        key: "priority",
        label: "Priority",
        sortable: true,
        render: (caseItem: CaseEntity) => {
          const Icon = getPriorityConfig(caseItem).icon;
          return (
            <div className={`flex gap-1 items-center ${getPriorityConfig(caseItem).color}`}>
              <Icon className="w-4 h-4" />
              <span className="capitalize font-medium text-sm">{caseItem.priority}</span>
            </div>
          );
        }
      },
      {
        key: "reporter",
        label: "Created By",
        sortable: true,
        render: (caseItem: CaseEntity) => (
          <div className="flex gap-1 items-center">
            <UserIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900 dark:text-white">{caseItem.usercreate}</span>
          </div>
        )
      },
      {
        key: "createdAt",
        label: "Created At",
        sortable: true,
        render: (caseItem: CaseEntity) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(caseItem.createdAt as string)}
          </span>
        )
      }
    ],
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select" as const,
        options: caseStatusOptions
      },
      {
        key: "priority",
        label: "Priority",
        type: "select" as const,
        options: [
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
        ]
      }
    ],
    actions: [
      {
        key: "view",
        label: "View",
        variant: "primary" as const,
        // icon: EyeIcon,
        onClick: (caseItem: CaseEntity) => navigate(`/case/assignment${caseItem.id}`),
        condition: () => (permissions.hasPermission("case.view") || isSystemAdmin) as boolean
      },
      {
        key: "edit",
        label: "Edit",
        variant: "warning" as const,
        // icon: PencilIcon,
        onClick: (caseItem: CaseEntity) => navigate(`/case/assignment${caseItem.id}`),
        condition: () => (permissions.hasPermission("case.update") || isSystemAdmin) as boolean
      },
      {
        key: "delete",
        label: "Cancel",
        variant: "outline" as const,
        // icon: TrashBinIcon,
        onClick: (caseItem: CaseEntity) => {
          console.log("Delete case:", caseItem.id);
        },
        condition: (caseItem: CaseEntity) => isCancelAvailable(caseItem)
      }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  const getTimelineSteps = (caseItem: CaseEntity) => {
    const timelineSteps = CaseTimelineSteps(
      caseItem.statusId,
      caseItem.createdAt as string,
      // caseItem.resolvedAt
    );
    return timelineSteps;
  };

  const previewConfig: PreviewConfig<CaseEntity> = {
    // title: (caseItem: CaseEntity) => `${caseItem.caseNumber}: ${caseItem.title}`,
    title: (caseItem: CaseEntity) => `${caseTitle(caseItem)}`,
    // subtitle: (caseItem: CaseEntity) => `${caseItem.category} • Assigned to ${caseItem.assignedTo}`,
    subtitle: (caseItem: CaseEntity) => `${caseItem.caselocAddr}`,
    avatar: (caseItem: CaseEntity) => {
      const Icon = getPriorityConfig(caseItem).icon;
      return (
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${getPriorityConfig(caseItem).color}`}>
          <Icon className="w-6 h-6" />
        </div>
      );
    },
    enableNavigation: true,
    size: "xl",
    tabs: [
      {
        key: "overview",
        label: "Overview",
        // icon: InfoIcon,
        render: (caseItem: CaseEntity) => (
          <>
            <PermissionGate module="case" action="view_timeline">
              <div className="bg-white dark:bg-gray-900 text-white p-6 mb-6">
                {/* Progress Timeline and Progress Line */}
                <div className="hidden xl:block">
                  <ProgressTimeline
                    steps={getTimelineSteps(caseItem)}
                    orientation="horizontal"
                    size="md"
                    showTimestamps={false}
                    showDescriptions={false}
                  />
                </div>
                <div className="block xl:hidden">
                  <ProgressTimeline
                    steps={getTimelineSteps(caseItem)}
                    orientation="vertical"
                    size="sm"
                    showTimestamps={false}
                    showDescriptions={false}
                    className="mb-2"
                  />
                </div>
              </div>
            </PermissionGate>

            {/* Content */}
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Information */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-500 dark:text-blue-400 mb-4">
                    Service Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-900 dark:text-white text-sm">Service Type:</span>
                      <div className="text-gray-600 dark:text-gray-300 text-sm">
                        {getTypeSubTypeConfig(caseItem).subTypeTh || getTypeSubTypeConfig(caseItem).subTypeEn}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-900 dark:text-white text-sm">Priority:</span>
                      <div className="mt-1">
                        <Badge className={`${getPriorityConfig(caseItem).color} text-xs`}>
                          {getPriorityConfig(caseItem).label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-900 dark:text-white text-sm">Status:</span>
                      <div className="mt-1">
                        <Badge className={`${getStatusConfig(caseItem).color} text-xs`}>
                          {getStatusConfig(caseItem).label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {caseItem.caselocAddr && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-500 dark:text-blue-400 mb-4">
                      Location
                    </h4>
                    <div className="flex items-start gap-2">
                      {/* <MapPinIcon className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" /> */}
                      <div className="text-gray-600 dark:text-gray-300 text-sm">
                        {caseItem.caselocAddr || "No location specified"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Information */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-500 dark:text-blue-400 mb-4">
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">{caseItem.usercreate}</span>
                    </div>
                    {caseItem.deviceId ? (
                      <div className="flex items-center gap-2">
                        {/* <PhoneIcon className="w-4 h-4 text-gray-400" /> */}
                        <span className="text-blue-400">{caseItem.deviceId}</span>
                      </div>
                    ) : caseItem.phoneNo ? (
                      <div className="flex items-center gap-2">
                        {/* <PhoneIcon className="w-4 h-4 text-gray-400" /> */}
                        <span className="text-blue-400">{caseItem.phoneNo}</span>
                      </div>
                    ) : ("")}
                  </div>
                </div>

                {/* Service Details */}
                {(caseItem.caseDetail || caseItem.caselocAddr) && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-500 dark:text-blue-400 mb-4">
                      Service Details
                    </h4>
                    <div className="flex items-start gap-2">
                      <div className="text-gray-600 dark:text-gray-300 text-sm">
                        {caseItem.caseDetail || caseItem.caselocAddrDecs || "No additional details provided"}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              {/*
              {caseItem.attachments.length && (
                <div className="mt-6">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <h4 className="font-medium text-blue-500 dark:text-blue-400">
                        Attachments ({caseItem.attachments.length})
                      </h4>
                    </div>
                    
                    {caseItem.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {caseItem.attachments.map(attachment => (
                          <div key={attachment.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3">
                              <FileIcon className="w-4 h-4 text-gray-500" />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {attachment.filename}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {(attachment.size / 1024).toFixed(1)} KB • {attachment.uploadedBy}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No attachments</p>
                    )}
                  </div>
                </div>
              )}
              */}
            </div>
          </>
        )
      },
      // {
      //   key: "details",
      //   label: "Details",
      //   // icon: PencilIcon,
      //   fields: [
      //     {
      //       key: "estimatedHours",
      //       label: "Estimated Hours",
      //       type: "number" as const
      //     },
      //     {
      //       key: "actualHours",
      //       label: "Actual Hours",
      //       type: "number" as const
      //     },
      //     {
      //       key: "customFields",
      //       label: "Custom Fields",
      //       type: "json" as const
      //     }
      //   ]
      // },
      {
        key: "activity",
        label: "Activity",
        // icon: PieChartIcon,
        render: (
          // caseItem: CaseEntity
        ) => (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <ChatIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {/* Comments ({caseItem.comments.length}) */}
                </h4>
              </div>
              
              {/*
              {caseItem.comments.length > 0 ? (
                <div className="space-y-3">
                  {caseItem.comments.map(comment => (
                    <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.author}
                        </span>
                        <div className="flex items-center gap-2">
                          {comment.isInternal && (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded text-xs">
                              Internal
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
              )}
              */}
            </div>

            {/* Time Tracking */}
            {/*
            {caseItem.estimatedHours && caseItem.actualHours && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Time Tracking</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {caseItem.estimatedHours || 0}h
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Estimated</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {caseItem.actualHours || 0}h
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Actual</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-900 dark:text-white">Progress</span>
                    <span className="text-gray-900 dark:text-white">{Math.round((caseItem.actualHours / caseItem.estimatedHours) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((caseItem.actualHours / caseItem.estimatedHours) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            */}
          </div>
        )
      }
    ],
    actions: [
      {
        key: "edit",
        label: "Edit Case",
        // icon: PencilIcon,
        variant: "warning",
        onClick: (caseItem: CaseEntity, closePreview: () => void) => {
          closePreview();
          navigate(`/cases/${caseItem.id}/edit`);
        },
        condition: () => permissions.hasPermission("case.update")
      },
      // {
      //   key: "assign",
      //   label: "Assign",
      //   // icon: UserIcon,
      //   variant: "error",
      //   onClick: (caseItem: CaseEntity, closePreview: () => void) => {
      //     console.log("Assigning case:", caseItem.id);
      //     // Would open assignment modal
      //     closePreview();
      //   },
      //   condition: () => permissions.hasPermission("case.assign")
      // },
      // {
      //   key: "close",
      //   label: "Close Case",
      //   // icon: CheckCircleIcon,
      //   variant: "success",
      //   onClick: (caseItem: CaseEntity, closePreview: () => void) => {
      //     console.log("Closing case:", caseItem.id);
      //     closePreview();
      //   },
      //   condition: (caseItem: CaseEntity) => caseItem.status !== "closed" && caseItem.status !== "resolved" && permissions.hasPermission("case.close")
      // },
      {
        key: "cancel",
        label: "Cancel Case",
        // icon: TimeIcon,
        variant: "outline",
        onClick: (caseItem: CaseEntity, closePreview: () => void) => {
          console.log("Canceling case:", caseItem.id);
          closePreview();
        },
        condition: (caseItem: CaseEntity) => isCancelAvailable(caseItem)
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
    // {
    //   key: "assignedTo",
    //   label: "Assigned To",
    //   type: "select" as const,
    //   options: [
    //     { value: "John Smith", label: "John Smith" },
    //     { value: "Alice Johnson", label: "Alice Johnson" },
    //     { value: "Mike Davis", label: "Mike Davis" },
    //     { value: "Security Team", label: "Security Team" }
    //   ]
    // },
    // {
    //   key: "createdAt",
    //   label: "Created Date",
    //   type: "date-range" as const
    // },
    // {
    //   key: "estimatedHours",
    //   label: "Estimated Hours",
    //   type: "number-range" as const,
    //   min: 0,
    //   max: 100
    // }
  ];

  // ===================================================================
  // Bulk Actions
  // ===================================================================

  const bulkActions = [
    {
      key: "bulk-assign",
      label: "Bulk Assign",
      variant: "primary" as const,
      onClick: async (items: CaseEntity[]) => {
        console.log("Bulk assigning cases:", items.map(c => c.id));
        // Would open assignment modal
      }
    },
    {
      key: "bulk-close",
      label: "Bulk Close",
      variant: "warning" as const,
      onClick: async (items: CaseEntity[]) => {
        console.log("Bulk closing cases:", items.map(c => c.id));
      },
      // condition: (items: CaseEntity[]) => items.some(c => c.status !== "closed"),
      confirmationRequired: true,
      confirmationMessage: (items: CaseEntity[]) => 
        `Are you sure you want to close ${items.length} cases? This action will update their status to closed.`
    },
    {
      key: "bulk-priority",
      label: "Change Priority",
      variant: "primary" as const,
      onClick: async (items: CaseEntity[]) => {
        console.log("Changing priority for cases:", items.map(c => c.id));
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
      columns: ["caseNumber", "title", "status", "priority", "assignedTo", "createdAt"]
    },
    {
      key: "csv-detailed",
      label: "Detailed Report (CSV)",
      format: "csv" as const,
      columns: ["caseNumber", "title", "caseDetail", "status", "priority", "category", "assignedTo", "usercreate", "createdAt", "dueDate"]
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

  const renderCard = (caseItem: CaseEntity) => {
    // const statusConfig = {
    //   "open": { icon: FolderIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800", label: "Open" },
    //   "in-progress": { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800", label: "In Progress" },
    //   "resolved": { icon: CheckCircleIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800", label: "Resolved" },
    //   "closed": { icon: CheckCircleIcon, color: "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800", label: "Closed" },
    //   "escalated": { icon: AlertHexaIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800", label: "Escalated" }
    // }[caseItem.status];

    // const priorityConfig = {
    //   "low": { color: "text-green-600", label: "Low" },
    //   "medium": { color: "text-yellow-600", label: "Medium" },
    //   "high": { color: "text-orange-600", label: "High" },
    //   "critical": { color: "text-red-600", label: "Critical" }
    // }[caseItem.priority];

    // const Icon = statusConfig.icon;

    return (
      <>
        <div className="xl:flex items-start justify-between mb-2">
          <div className="xl:flex items-center gap-3 min-w-0 xl:flex-1">
            {/* <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 hidden xl:block" /> */}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {/* {caseItem.caseNumber} */}
              </h3>
              {/*
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {caseItem.title}
              </p>
              */}
            </div>
          </div>
        </div>

        <div className="xl:flex gap-1 flex-shrink-0 mb-4">
          {/*
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} mr-2 xl:mr-0`}>
            {statusConfig.label}
          </span>
          */}
          <Badge className={`${getStatusConfig(caseItem)?.color} text-xs`}>
            {getStatusConfig(caseItem)?.label}
          </Badge>
          {/*
          <span className={`py-1 text-xs font-medium ${priorityConfig.color} ml-2`}>
            {priorityConfig.label}
          </span>
          */}
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2">
          {caseItem.caseDetail}
        </p>

        {/* Additional Info */}
        <div className="xl:flex items-center justify-between mb-4">
          <div className="xl:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="xl:flex items-center gap-1 min-h-4">
              {/* <MapPinIcon className="w-3 h-3" /> */}
              <span>{caseItem.caselocAddr || ""}</span>
            </div>
          </div>
          
          {/*
          {caseItem.dueDate && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-orange-600 dark:text-orange-400">
                Due {formatDate(caseItem.dueDate)}
              </span>
            </div>
          )}
          */}
        </div>
        
        <div className="xl:flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="xl:flex items-center gap-1">
            <UserIcon className="w-4 h-4 hidden xl:block" />
            {/* <span>{caseItem.assignedTo}</span> */}
            <span>{caseItem.usercreate}</span>
          </div>
          <div className="xl:flex items-center gap-1">
            <CalenderIcon className="w-4 h-4 hidden xl:block" />
            {/* <span>{formatDate(caseItem.createdAt)}</span> */}
          </div>
        </div>
      </>
    );
  };

  // ===================================================================
  // Event Handlers
  // ===================================================================

  // Handle deletion and other actions
  const handleAction = (actionKey: string, caseItem: CaseEntity) => {
    console.log(`Action ${actionKey} triggered for case:`, caseItem.id);
    // Add custom case-specific action handling
  };

  // Handle deletion
  const handleDelete = (caseId: string) => {
    console.log("Case canceled:", caseId);
    // Handle case cancel (update state, show notification, etc.)
  };

  // ===================================================================
  // Render Component
  // ===================================================================

  return (
    <>
      <EnhancedCrudContainer
        advancedFilters={advancedFilters}
        apiConfig={{
          baseUrl: "/api",
          endpoints: {
            list: "/cases",
            create: "/cases",
            read: "/cases/:id",
            update: "/cases/:id",
            delete: "/cases/:id",
            bulkDelete: "/cases/bulk",
            export: "/cases/export"
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
          bulkActions: false,
          export: false,
          realTimeUpdates: false, // Disabled for demo
          keyboardShortcuts: true
        }}
        // keyboardShortcuts={[]}
        // loading={false}
        module="case"
        // previewConfig={previewConfig}
        previewConfig={previewConfig as PreviewConfig<CaseEntity & { id: string }>}
        searchFields={["caseId", "caseDetail", "createdBy", "createdAt"]}
        // customFilterFunction={() => true}
        onCreate={() => navigate("/case/creation")}
        onDelete={handleDelete}
        onItemAction={handleAction}
        // onItemAction={handleAction as (action: string, item: { id: string }) => void}
        // onItemClick={(item) => navigate(`/role/${item.id}`)}
        onRefresh={() => window.location.reload()}
        // onUpdate={() => {}}
        renderCard={renderCard}
      />
    </>
  );
};

export default CaseHistoryComponent;
