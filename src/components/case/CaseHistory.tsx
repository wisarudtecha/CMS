// /src/components/case/CaseHistory.tsx
import React, {
  useEffect,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { AlertHexaIcon, CalenderIcon, ChatIcon, CheckCircleIcon, TimeIcon, UserIcon } from "@/icons";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { CaseTimelineSteps } from "@/components/case/CaseTimelineSteps";
import { TableSkeleton } from "@/components/ui/loading/LoadingSystem";
import { ProgressTimeline } from "@/components/ui/progressTimeline/ProgressTimeline";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetCaseHistoryQuery } from "@/store/api/caseApi";
import { useGetCaseSopQuery } from "@/store/api/dispatch";
import { AuthService } from "@/utils/authService";
import { CASE_CANNOT_DELETE } from "@/utils/constants";
import { formatDate } from "@/utils/crud";
import type { CaseSop } from "@/store/api/dispatch"; 
import type { CaseEntity, CaseHistory, CaseStatus, CaseTypeSubType } from "@/types/case";
import type { PreviewConfig } from "@/types/enhanced-crud";
import CaseDetailView from "@/components/case/CaseDetailView";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
// import caseHistoryList from "@/mocks/caseHistoryList.json";

const CaseHistoryComponent: React.FC<{
  caseHistories: CaseEntity[];
  caseStatuses: CaseStatus[];
  caseTypesSubTypes: CaseTypeSubType[];
}> = ({ caseHistories, caseStatuses, caseTypesSubTypes }) => {
  const isSystemAdmin = AuthService.isSystemAdmin();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [caseData, setCaseData] = useState<CaseEntity | null>(null);
  const [crudOpen, setCrudOpen] = useState("block");
  const [viewOpen, setViewOpen] = useState("hidden");

  const [selectedCaseForSop, setSelectedCaseForSop] = useState<string | null>(null);
  const [selectedCaseForHistory, setSelectedCaseForHistory] = useState<string | null>(null);

  const { data: dispatchSOPsData } = useGetCaseSopQuery(
    { caseId: selectedCaseForSop ?? "" }, 
    { skip: !selectedCaseForSop }
  );
  
  const { data: caseHistoriesData } = useGetCaseHistoryQuery(
    { caseId: selectedCaseForHistory ?? ""  }, 
    { skip: !selectedCaseForHistory }
  );

  const isCancelAvailable = (data: CaseEntity) => {
    return (permissions.hasPermission("case.delete") || isSystemAdmin) as boolean && !CASE_CANNOT_DELETE.includes(data.statusId as typeof CASE_CANNOT_DELETE[number])
  }

  // ===================================================================
  // Case Status Properties
  // ===================================================================

  const caseStatusesColorMap: Record<string, string> = {
    "#000000": "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
    "#F9C601": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-600",
    "#852B99": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 border border-purple-300 dark:border-purple-600",
    "#FF0080": "bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100 border border-pink-300 dark:border-pink-600",
    "#295F79": "bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-100 border border-cyan-300 dark:border-cyan-600",
    "#468847": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border border-green-300 dark:border-green-600",
    "#999999": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
    "#FF8000": "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100 border border-orange-300 dark:border-orange-600",
    "#FF0000": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-600",
    "#B94A48": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-600",
    null: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
  };

  const generateStatusConfigs = (data: CaseStatus[]) => {
    const configs: Record<string, { color: string; label: string }> = {};
    data.forEach(item => {
      configs[item.statusId] = {
        color: caseStatusesColorMap[item.color as keyof typeof caseStatusesColorMap] || caseStatusesColorMap.null,
        label: item.th || item.en
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
    label: caseStatus?.th || caseStatus?.en || ""
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
      sTypeCode: caseTypeSubType?.sTypeCode || "",
      sTypeId: caseTypeSubType?.sTypeId || ""
    })) : []
  }

  const typeSubTypeConfigs = generateTypeSubTypeConfigs(caseTypesSubTypes);

  const getTypeSubTypeConfig = (caseItem: CaseEntity) => {
    const found = typeSubTypeConfigs.find(config => 
      config.sTypeId === caseItem.caseSTypeId
    );
    return found || { 
      en: "", 
      th: "", 
      subTypeEn: "", 
      subTypeTh: "", 
      sTypeCode: "" 
    };
  };

  const caseTitle = (data: CaseEntity) => {
    const config = getTypeSubTypeConfig(data);
    // const sTypeCode = config.sTypeCode || "Loading...";
    const sTypeCode = config.sTypeCode || "";
    // const displayName = config.subTypeTh || config.subTypeEn || data.caseId || "Loading...";
    const displayName = config.subTypeTh || config.subTypeEn || data.caseId || "";
    // return `${sTypeCode}-${displayName}`;
    return sTypeCode && displayName && `${sTypeCode}-${displayName}` || <TableSkeleton rows={0} columns={1} />;
  };

  // const caseTypesSubTypesOptions = Array.isArray(caseTypesSubTypes) ? caseTypesSubTypes.map((caseTypeSubType) => ({
  //   value: caseTypeSubType?.sTypeId || "",
  //   label: `${caseTypeSubType.sTypeCode || "Unknown:Code"}-${caseTypeSubType?.subTypeTh || caseTypeSubType?.subTypeEn || "Unknown:Name"} (${caseTypeSubType?.th || caseTypeSubType?.en || "Unknown:Type"})`
  // })) : [];

  const caseTypesSubTypesOptions = Array.isArray(caseTypesSubTypes)
    ? caseTypesSubTypes
        .slice() // make a shallow copy to avoid mutating the original array
        .sort((a, b) => (a.sTypeCode || "").localeCompare(b.sTypeCode || ""))
        .map((caseTypeSubType) => ({
          value: caseTypeSubType?.sTypeId || "",
          label: `${caseTypeSubType.sTypeCode || "Unknown:Code"} - ${
            caseTypeSubType?.subTypeTh ||
            caseTypeSubType?.subTypeEn ||
            "Unknown:Name"
          } (${caseTypeSubType?.th || caseTypeSubType?.en || "Unknown:Type"})`,
        }))
    : [];

  // ===================================================================
  // Case History Mock Data
  // ===================================================================

  // const data: CaseEntity[] = caseHistoryList as unknown as CaseEntity[];

  // ===================================================================
  // Case History Real Functionality Data
  // ===================================================================

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
      // update: "/api/cases/:id",
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
                {caseItem.caseDetail || ""}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {caseItem.caselocAddr || ""}
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
            <Badge className={`${getStatusConfig(caseItem)?.color} text-sm`}>
              {getStatusConfig(caseItem)?.label}
            </Badge>
          );
        }
      },
      {
        key: "priority",
        label: "Priority",
        sortable: true,
        render: (caseItem: CaseEntity) => {
          // const Icon = getPriorityConfig(caseItem).icon;
          return (
            <div className={`flex gap-1 items-center ${getPriorityConfig(caseItem).color}`}>
              {/* <Icon className="w-4 h-4" /> */}
              <span className="capitalize font-medium text-sm">{getPriorityConfig(caseItem).label}</span>
            </div>
          );
        }
      },
      {
        key: "createdBy",
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
        onClick: () => {},
        condition: () => (permissions.hasPermission("case.view") || isSystemAdmin) as boolean
      },
      {
        key: "edit",
        label: "Edit",
        variant: "warning" as const,
        // icon: PencilIcon,
        onClick: () => {},
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
    const sopData = (selectedCaseForSop === caseItem.caseId) ? dispatchSOPsData?.data as CaseSop : undefined;
    const timelineSteps = CaseTimelineSteps(sopData);
    return timelineSteps;
  };

  const OverviewTab: React.FC<{ caseItem: CaseEntity }> = ({ caseItem }) => {
    useEffect(() => {
      setSelectedCaseForSop(caseItem.caseId);
    }, [caseItem.caseId]);

    return (
      <>
        <PermissionGate module="case" action="view_timeline">
          <div className="bg-white dark:bg-gray-900 text-white p-6 mb-6">
            {/* Progress Timeline and Progress Line */}
            {getTimelineSteps(caseItem).length > 0 ? (
              <>
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
              </>
            ) : ""}
          </div>
        </PermissionGate>

        {/* Content */}
        <div>
          <div className="grid grid-cols-1 gap-6">
            {/* Case Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-500 dark:text-blue-400 mb-4">
                Case Information
              </h4>
              <div className="grid grid-cols-1 space-y-3">
                <div className="xl:flex items-left justify-left">
                  <span className="text-gray-900 dark:text-white text-sm font-medium xl:mr-2">Created At:</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm mr-2">
                    {formatDate(caseItem.createdAt) || ""}
                  </span>
                  <span className="text-gray-900 dark:text-white text-sm font-medium xl:mr-2">By:</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    {caseItem.createdBy || ""}
                  </span>
                </div>
                <div className="xl:flex items-left justify-left">
                  <span className="text-gray-900 dark:text-white text-sm font-medium xl:mr-2">Detail:</span>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {caseItem.caseDetail || ""}
                  </div>
                </div>
                <div className="xl:flex items-left justify-left">
                  <span className="text-gray-900 dark:text-white text-sm font-medium xl:mr-2">Location:</span>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {caseItem.caselocAddrDecs || caseItem.caselocAddr || ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer / Device Information */}
            {caseItem.deviceId && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-500 dark:text-blue-400 mb-4">
                  Device Information
                </h4>
                <div className="grid grid-cols-1 space-y-3">
                  <div className="xl:flex items-left justify-left">
                    <span className="text-gray-900 dark:text-white text-sm font-medium xl:mr-2">Device ID:</span>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {caseItem.deviceId || ""}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer / Device Information */}
            {caseItem.phoneNo && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-500 dark:text-blue-400 mb-4">
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 space-y-3">
                  <div className="xl:flex items-left justify-left">
                    <span className="text-gray-900 dark:text-white text-sm font-medium xl:mr-2">Phone No.:</span>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {caseItem.phoneNo || ""}
                    </div>
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
    );
  };

  const ActivityTab: React.FC<{ caseItem: CaseEntity }> = ({ caseItem }) => {
    useEffect(() => {
      setSelectedCaseForHistory(caseItem.caseId);
    }, [caseItem.caseId]);

    return (<CaseHistoryActivity caseItem={caseItem} />)
  };

  const CaseHistoryActivity: React.FC<{ caseItem: CaseEntity }> = ({ caseItem }) => {
    const caseHistories = (selectedCaseForHistory === caseItem.caseId) 
      ? caseHistoriesData?.data as unknown as CaseHistory[] || []
      : [];

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <ChatIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Comments ({caseHistories?.length || 0})
            </h4>
          </div>
          
          {caseHistories?.length > 0 ? (
            <div className="space-y-3">
              {caseHistories.map((comment: CaseHistory) => (
                <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.username || comment.createdBy || ""}
                    </span>
                    <div className="flex items-center gap-2">
                      {/*
                      {comment.isInternal && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded text-xs">
                          Internal
                        </span>
                      )}
                      */}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt) || ""}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {comment.fullMsg || ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
          )}
        </div>

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
    );
  }

  const previewConfig: PreviewConfig<CaseEntity> = {
    title: (caseItem: CaseEntity) => `${caseTitle(caseItem)} (${getTypeSubTypeConfig(caseItem).th || getTypeSubTypeConfig(caseItem).en || ""})`,
    subtitle: (caseItem: CaseEntity) => {
      return (
        <>
          <span className="mr-2">{caseItem.caseId || ""}</span>
          <Badge className={`${getStatusConfig(caseItem)?.color} text-sm mr-2`}>{getStatusConfig(caseItem)?.label || ""}</Badge>
          <span className={`${getPriorityConfig(caseItem).color} text-sm`}>{getPriorityConfig(caseItem).label || ""}</span>
        </>
      );
    },
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
        render: (caseItem: CaseEntity) => {
          return (<OverviewTab caseItem={caseItem} />)
        }
      },
      {
        key: "activity",
        label: "Activity",
        // icon: PieChartIcon,
        render: (caseItem: CaseEntity) => {
          return (<ActivityTab caseItem={caseItem} />)

          // return (
          //   <div className="space-y-6">
          //     <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          //       <div className="flex items-center gap-2 mb-4">
          //         <ChatIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          //         <h4 className="font-medium text-gray-900 dark:text-white">
          //           Comments ({caseItem.comments.length})
          //         </h4>
          //       </div>
                
          //       {caseItem.comments.length > 0 ? (
          //         <div className="space-y-3">
          //           {caseItem.comments.map(comment => (
          //             <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
          //               <div className="flex items-center justify-between mb-1">
          //                 <span className="text-sm font-medium text-gray-900 dark:text-white">
          //                   {comment.author}
          //                 </span>
          //                 <div className="flex items-center gap-2">
          //                   {comment.isInternal && (
          //                     <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded text-xs">
          //                       Internal
          //                     </span>
          //                   )}
          //                   <span className="text-xs text-gray-500 dark:text-gray-400">
          //                     {formatDate(comment.createdAt)}
          //                   </span>
          //                 </div>
          //               </div>
          //               <p className="text-sm text-gray-600 dark:text-gray-300">
          //                 {comment.content}
          //               </p>
          //             </div>
          //           ))}
          //         </div>
          //       ) : (
          //         <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
          //       )}
          //     </div>

          //     {caseItem.estimatedHours && caseItem.actualHours && (
          //       <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          //         <h4 className="font-medium text-gray-900 dark:text-white mb-4">Time Tracking</h4>
          //         <div className="grid grid-cols-2 gap-4">
          //           <div>
          //             <div className="text-2xl font-bold text-gray-900 dark:text-white">
          //               {caseItem.estimatedHours || 0}h
          //             </div>
          //             <div className="text-sm text-gray-500 dark:text-gray-400">Estimated</div>
          //           </div>
          //           <div>
          //             <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          //               {caseItem.actualHours || 0}h
          //             </div>
          //             <div className="text-sm text-gray-500 dark:text-gray-400">Actual</div>
          //           </div>
          //         </div>

          //         <div className="mt-4">
          //           <div className="flex justify-between text-sm mb-1">
          //             <span className="text-gray-900 dark:text-white">Progress</span>
          //             <span className="text-gray-900 dark:text-white">{Math.round((caseItem.actualHours / caseItem.estimatedHours) * 100)}%</span>
          //           </div>
          //           <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          //             <div 
          //               className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          //               style={{ width: `${Math.min((caseItem.actualHours / caseItem.estimatedHours) * 100, 100)}%` }}
          //             />
          //           </div>
          //         </div>
          //       </div>
          //     )}
          //   </div>
          // )
        }
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
          // navigate(`/cases/${caseItem.id}/edit`);
          handleAction("edit", caseItem);
        },
        condition: () => permissions.hasPermission("case.update")
      },
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
    // {
    //   key: "status",
    //   label: "Status",
    //   type: "select" as const,
    //   options: caseStatusOptions
    // },
    // {
    //   key: "priority",
    //   label: "Priority",
    //   type: "select" as const,
    //   options: [
    //     { value: "low", label: "Low" },
    //     { value: "medium", label: "Medium" },
    //     { value: "high", label: "High" },
    //   ]
    // },
    {
      key: "caseSTypeId",
      label: "Type",
      type: "select" as const,
      options: caseTypesSubTypesOptions
    }
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
      confirmationMessage: (items: CaseEntity[]) => `Are you sure you want to close ${items.length} cases? This action will update their status to closed.`
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
  // Custom Filter Function for Enhanced MultiSelect Support
  // ===================================================================

  const customCaseFilterFunction = (caseItem: CaseEntity, filters: unknown): boolean => {
    return Object.entries(filters as Record<string, unknown>).every(([key, value]) => {
      if (!value) {
        return true;
      }

      // Handle sub-type values
      if (key === "caseSTypeId" && typeof value === "string") {
        return value.includes(caseItem.caseSTypeId);
      }

      // Handle status values
      if (key === "status" && typeof value === "string") {
        return value.includes(caseItem.statusId);
      }

      // Handle priority values
      if (key === "priority" && typeof value === "string") {
        const priority = { high: [0,1,2,3], medium: [4,5,6], low: [7,8,9] };
        return priority[value as keyof typeof priority].includes(caseItem.priority);
      }

      // Handle search
      if (key === "search" && typeof value === "string") {
        const searchTerm = value.toLowerCase();
        return typeSubTypeConfigs.find(c => c.subTypeTh.toLowerCase().includes(searchTerm) || c.subTypeEn.toLowerCase().includes(searchTerm))
          || caseItem.caseDetail.toLowerCase().includes(searchTerm)
          || caseItem.caselocAddr.toLowerCase().includes(searchTerm)
          || caseItem.caselocAddrDecs.toLowerCase().includes(searchTerm);
      }

      // Handle regular values
      return caseItem[key as keyof CaseEntity] === value;
    });
  };

  // ===================================================================
  // Custom Card Rendering
  // ===================================================================

  const renderCard = (caseItem: CaseEntity) => {
    return (
      <>
        <div className="xl:flex items-start justify-between mb-2">
          <div className="xl:flex items-center gap-3 min-w-0 xl:flex-1">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {caseTitle(caseItem)}
              </h3>
            </div>
          </div>
        </div>

        <div className="xl:flex gap-1 flex-shrink-0 mb-4">
          <Badge className={`${getStatusConfig(caseItem)?.color} text-sm`}>
            {getStatusConfig(caseItem)?.label}
          </Badge>
          <span className={`py-1 text-sm font-medium ${getPriorityConfig(caseItem)?.color} ml-2`}>
            {getPriorityConfig(caseItem)?.label}
          </span>
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
            <span>{caseItem.createdBy}</span>
          </div>
          <div className="xl:flex items-center gap-1">
            <CalenderIcon className="w-4 h-4 hidden xl:block" />
            <span>{formatDate(caseItem.createdAt as string)}</span>
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
    if (actionKey === "view" || actionKey === "edit") {
      setCaseData(caseItem);
      setViewOpen("block");
      setCrudOpen("hidden");
    }
  };

  // Handle deletion
  const handleDelete = (caseId: string) => {
    console.log("Case canceled:", caseId);
    // Handle case cancel (update state, show notification, etc.)
  };

  // Handle view toggle
  const handleViewToggle = () => {
    setViewOpen((prev) => (prev === "hidden" ? "block" : "hidden"));
    setCrudOpen("block");
  };

  // ===================================================================
  // Render Component
  // ===================================================================

  return (
    <>
      <div className={crudOpen}>
        <PageBreadcrumb pageTitle="Case History" />

        <EnhancedCrudContainer
          advancedFilters={advancedFilters}
          apiConfig={{
            baseUrl: "/api",
            endpoints: {
              list: "/cases",
              create: "/cases",
              read: "/cases/:id",
              // update: "/cases/:id",
              delete: "/cases/:id",
              bulkDelete: "/cases/bulk",
              export: "/cases/export"
            }
          }}
          bulkActions={bulkActions}
          config={config}
          customFilterFunction={customCaseFilterFunction}
          data={data}
          displayModes={["card", "table"]}
          displayModeDefault="table"
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
      </div>

      <div className={viewOpen}>
        <CaseDetailView onBack={handleViewToggle} caseData={caseData as CaseEntity} />
      </div>
    </>
  );
};

export default CaseHistoryComponent;
