// /src/components/case/CaseHistory.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AtSign,
  Building,
  ChartColumnStacked,
  CheckCircle,
  ClockArrowUp,
  Contact,
  Cpu,
  Mail,
  MapPin,
  MapPinHouse,
  Phone,
  Share2,
  Siren,
  Tag,
  Ticket,
  Truck,
  User
} from "lucide-react";
import { CalenderIcon, ChatIcon, TimeIcon, UserIcon } from "@/icons";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { CaseTimelineSteps } from "@/components/case/CaseTimelineSteps";
import { mapSopToOrderedProgress } from "@/components/case/sopStepTranForm";
import { source } from "@/components/case/constants/caseConstants";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { TableSkeleton } from "@/components/ui/loading/LoadingSystem";
import { ProgressTimeline } from "@/components/ui/progressTimeline/ProgressTimeline";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslation } from "@/hooks/useTranslation";
import { Area } from "@/store/api/area";
import { DepartmentCommandStationDataMerged, mergeDeptCommandStation, useGetCaseHistoryQuery } from "@/store/api/caseApi";
import { useGetCaseSopQuery } from "@/store/api/dispatch";
import { useGetUserByUserNameQuery } from "@/store/api/userApi";
import { AuthService } from "@/utils/authService";
import { CASE_CANNOT_DELETE, PRIORITY_LABELS, PRIORITY_CONFIG } from "@/utils/constants";
import { formatDate } from "@/utils/crud";
import type { CaseEntity, CaseHistory, CaseStatus, CaseTypeSubType } from "@/types/case";
import type { CaseSop, UnitWithSop } from "@/types/dispatch";
import type { PreviewConfig } from "@/types/enhanced-crud";
import ProgressStepPreviewUnit from "@/components/case/activityTimeline/officerActivityTimeline";
import ProgressSummary from "@/components/case/activityTimeline/sumaryUnitProgress";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FormViewer from "@/components/form/dynamic-form/FormViewValue";
import Badge from "@/components/ui/badge/Badge";
// import caseHistoryList from "@/mocks/caseHistoryList.json";

const CaseHistoryComponent: React.FC<{
  areas: Area[];
  caseHistories: CaseEntity[];
  caseStatuses: CaseStatus[];
  caseTypesSubTypes: CaseTypeSubType[];
}> = ({ areas, caseHistories, caseStatuses, caseTypesSubTypes }) => {
  const { t, language } = useTranslation();
  // const { data: userData, isLoading } = useGetUserByUserNameQuery({ username: officer.unit.username });
  const isSystemAdmin = AuthService.isSystemAdmin();
  const navigate = useNavigate();
  const permissions = usePermissions();
  
  const [crudOpen, ] = useState("block");
  const [selectedCaseForSop, setSelectedCaseForSop] = useState<string | null>(null);
  const [selectedCaseForHistory, setSelectedCaseForHistory] = useState<string | null>(null);
  const [selectedCaseForUnit, setSelectedCaseForUnit] = useState<string | null>(null);
  const [sopData, setSopData] = useState<CaseSop | null>(null);
  const [, setUnitData] = useState<UnitWithSop | null>(null);

  const { data: dispatchSOPsData } = useGetCaseSopQuery(
    { caseId: selectedCaseForSop ?? "" }, 
    { skip: !selectedCaseForSop }
  );
  
  const { data: caseHistoriesData } = useGetCaseHistoryQuery(
    { caseId: selectedCaseForHistory ?? ""  }, 
    { skip: !selectedCaseForHistory }
  );

  const { data: unitsData } = useGetUserByUserNameQuery(
    { username: selectedCaseForUnit ?? "" }, 
    { skip: !selectedCaseForUnit }
  );

  const isCancelAvailable = (data: CaseEntity) => {
    return (permissions.hasPermission("case.delete") || isSystemAdmin) as boolean && !CASE_CANNOT_DELETE.includes(data.statusId as typeof CASE_CANNOT_DELETE[number])
  }

  // ===================================================================
  // Case Status Properties
  // ===================================================================

  // const caseStatusesColorMap: Record<string, string> = {
  //   "#000000": "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
  //   "#F9C601": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-600",
  //   "#852B99": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 border border-purple-300 dark:border-purple-600",
  //   "#FF0080": "bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100 border border-pink-300 dark:border-pink-600",
  //   "#295F79": "bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-100 border border-cyan-300 dark:border-cyan-600",
  //   "#468847": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border border-green-300 dark:border-green-600",
  //   "#999999": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
  //   "#FF8000": "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100 border border-orange-300 dark:border-orange-600",
  //   "#FF0000": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-600",
  //   "#B94A48": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-600",
  //   null: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
  // };

  const generateStatusConfigs = (data: CaseStatus[]) => {
    const configs: Record<string, { color?: string; label: string, style: { background: string, border: string, color: string }}> = {};
    data.forEach(item => {
      configs[item.statusId] = {
        // color: caseStatusesColorMap[item.color as keyof typeof caseStatusesColorMap] || caseStatusesColorMap.null,
        label: item[language as keyof CaseStatus] as string || item?.th || item?.en,
        // style: `background:transparent;border:1px solid ${item.color};color:${item.color}`
        style: {
          background: "transparent",
          border: `1px solid ${item?.color || "#000000"}`,
          color: item?.color || "#000000"
        }
      };
    });
    // console.log("🚀 ~ generateStatusConfigs ~ configs:", configs);
    return configs;
  }

  const statusConfigs = generateStatusConfigs(caseStatuses);

  const getStatusConfig = (caseItem: CaseEntity) => {
    // console.log("🚀 ~ getStatusConfig ~ statusConfigs:", statusConfigs[caseItem.statusId]);
    return statusConfigs[caseItem.statusId as keyof typeof statusConfigs] || statusConfigs['S000'];
  };

  const caseStatusOptions = Array.isArray(caseStatuses) ? caseStatuses.map((caseStatus) => ({
    value: caseStatus?.statusId || "",
    label: caseStatus[language as keyof CaseStatus] as string || caseStatus?.th || caseStatus?.en
  })) : [];

  // ===================================================================
  // Case Priority Properties
  // ===================================================================

  const generatePriorityConfigs = () => {
    const langKey = language as keyof typeof PRIORITY_LABELS.high;
    return PRIORITY_CONFIG.flatMap(({ type, count, color, icon }) =>
      Array(count).fill(null).map(() => ({
        color,
        icon,
        label: PRIORITY_LABELS[type][langKey]
      }))
    );
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
    const found = typeSubTypeConfigs?.find(config => 
      config.sTypeId === caseItem.caseSTypeId
    ) || null;
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
    const sTypeCode = config.sTypeCode || "";
    const displayName = `${(language === "th" && config.th) || config.en || ""}-${(language === "th" && config.subTypeTh) || config.subTypeEn || ""}`;
    return sTypeCode && displayName && `${sTypeCode}-${displayName}` || <TableSkeleton rows={0} columns={1} />;
  };

  const caseTypesSubTypesOptions = Array.isArray(caseTypesSubTypes)
    ? caseTypesSubTypes
        .slice() // make a shallow copy to avoid mutating the original array
        .sort((a, b) => (a.sTypeCode || "").localeCompare(b.sTypeCode || ""))
        .map((caseTypeSubType) => ({
          value: caseTypeSubType?.sTypeId || "",
          label: `${caseTypeSubType.sTypeCode || "Unknown:Code"}-${
            caseTypeSubType[language as keyof CaseTypeSubType] as string || caseTypeSubType?.th || caseTypeSubType?.en || "Unknown:Type"
          }-${
            (language === "th" && caseTypeSubType?.subTypeTh) || caseTypeSubType?.subTypeEn || "Unknown:Name"
          }`,
        }))
    : [];

  // ===================================================================
  // Areas Properties
  // ===================================================================

  const generateAreaConfigs = (data: Area[]) => {
    return Array.isArray(data) ? data.map((area) => ({
      distId: area?.distId || "",
      district: (language === "th" && area?.districtTh) || area?.districtEn || "",
      province: (language === "th" && area?.provinceTh) || area?.provinceEn || "",
      country: (language === "th" && area?.countryTh) || area?.countryEn || "",
    })) : []
  }

  const areaConfigs = generateAreaConfigs(areas);

  const getAreaConfig = (caseItem: CaseEntity) => {
    const found = areaConfigs?.find(config => 
      config.distId === caseItem.distId
    ) || null;
    return found || {
      distId: "",
      district: "", 
      province: "", 
      country: ""
    };
  };

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
    title: caseTitle(c),
  }));

  // ===================================================================
  // CRUD Configuration
  // ===================================================================

  const config = {
    entityName: t("crud.case_history.name"),
    entityNamePlural: t("crud.case_history.name"),
    apiEndpoints: {
      list: "/api/case",
      create: "/api/case",
      read: "/api/case/:id",
      // update: "/api/case/:id",
      delete: "/api/case/:id",
      // bulkDelete: "/api/case/bulk",
      export: "/api/case/export"
    },
    columns: [
      {
        key: "caseNumber",
        label: t("crud.case_history.list.header.case"),
        sortable: true,
        render: (caseItem: CaseEntity) => (
          <div className="flex items-center gap-3">
            {/* <FolderIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /> */}
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {caseTitle(caseItem) || ""}
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
        label: t("crud.case_history.list.header.status"),
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
        label: t("crud.case_history.list.header.priority"),
        sortable: true,
        render: (caseItem: CaseEntity) => {
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
        label: t("crud.case_history.list.header.created_by"),
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
        label: t("crud.case_history.list.header.created_at"),
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
        options: caseStatusOptions,
        placeholder: t("crud.case_history.list.toolbar.filter.status")
      },
      {
        key: "priority",
        label: "Priority",
        type: "select" as const,
        options: [
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
        ],
        placeholder: t("crud.case_history.list.toolbar.filter.priority")
      }
    ],
    actions: [
      {
        key: "view",
        label: t("crud.common.read"),
        variant: "primary" as const,
        // icon: EyeIcon,
        onClick: () => {},
        condition: () => (permissions.hasPermission("case.view") || isSystemAdmin) as boolean
      },
      {
        key: "edit",
        label: t("crud.common.update"),
        variant: "warning" as const,
        // icon: PencilIcon,
        onClick: (caseItem: CaseEntity) => navigate(`/case/${caseItem.caseId}`),
        condition: () => (permissions.hasPermission("case.update") || isSystemAdmin) as boolean
      },
      {
        key: "delete",
        label: t("crud.case_history.list.body.actions.cancel"),
        variant: "outline" as const,
        // icon: TrashBinIcon,
        onClick: (caseItem: CaseEntity) => {
          console.log("Delete case:", caseItem.id);
        },
        condition: (caseItem: CaseEntity) => isCancelAvailable(caseItem) && (permissions.hasPermission("case.delete") || isSystemAdmin) as boolean
      }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  const PreviewTitle: React.FC<{ caseItem: CaseEntity }> = ({ caseItem }) => {
    return (
      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center">
          <TimeIcon className="w-4 h-4" /> {t("case.assignment.create_date")}: {formatDate(caseItem.createdAt)}
          <UserIcon className="w-4 h-4" /> {t("case.assignment.create_by")}: {caseItem.createdBy}
        </div>
        <div className="flex gap-2 items-center">
          <Badge className={`${getPriorityConfig(caseItem)?.color} border text-sm`}>
            {getPriorityConfig(caseItem)?.label}
          </Badge>
          <span
            className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-md border text-sm"
            style={getStatusConfig(caseItem)?.style}
          >
            {getStatusConfig(caseItem)?.label}
          </span>
        </div>
      </div>
    );
  };

  const getTimelineSteps = (
    // caseItem: CaseEntity
  ) => {
    // const sopData = (selectedCaseForSop === caseItem.caseId) ? dispatchSOPsData?.data as CaseSop : undefined;
    const timelineSteps = CaseTimelineSteps(sopData || undefined, caseStatuses);
    return timelineSteps;
  };

  const OverviewTab: React.FC<{ caseItem: CaseEntity }> = ({ caseItem }) => {
    useEffect(() => {
      setSelectedCaseForSop(caseItem.caseId);
    }, [caseItem.caseId]);

    useEffect(() => {
      setSelectedCaseForUnit(sopData?.unitLists?.length && sopData?.unitLists[0]?.username || null);
    }, []);

    useEffect(() => {
      setSopData((selectedCaseForSop === caseItem.caseId) ? dispatchSOPsData?.data as CaseSop : null);
    }, [caseItem.caseId]);

    useEffect(() => {
      setUnitData((sopData?.unitLists?.length && selectedCaseForUnit === sopData?.unitLists[0].username) ? unitsData?.data as unknown as UnitWithSop : null);
    }, [caseItem.caseId]);

    const dpcConfig = getAreaConfig(caseItem);
    const dpcDisplay = `${dpcConfig.district || ""}-${dpcConfig.province || ""}-${dpcConfig.country || ""}`;

    const progressSteps = useMemo(() => {
      return mapSopToOrderedProgress(sopData as CaseSop, language);
    }, []);
    const deptComStn = useMemo(() =>
      JSON.parse(localStorage.getItem("DeptCommandStations") ?? "[]") as DepartmentCommandStationDataMerged[], []
    );
    const userStation = deptComStn?.find(items => {
      return items.commId === unitsData?.data?.commId && items.stnId === unitsData?.data?.stnId && items.deptId === unitsData.data.deptId;
    }) || null;

    const contactMethod = source?.find(cm => cm.id === caseItem.source) || { name: "Unknown" };

    const timelineSteps = getTimelineSteps();

    return (
      <>
        <PermissionGate module="case" action="view_timeline">
          <div className="bg-white dark:bg-gray-900 text-white p-6 mb-6">
            {/* Progress Timeline and Progress Line */}
            {
              // getTimelineSteps(caseItem).length
              timelineSteps.length
              > 0 ? (
              <>
                <div className="hidden xl:block">
                  <ProgressTimeline
                    // steps={getTimelineSteps(caseItem)}
                    steps={timelineSteps}
                    orientation="horizontal"
                    size="md"
                    showTimestamps={true}
                    showDescriptions={false}
                    showSLA={true}
                  />
                </div>
                <div className="block xl:hidden">
                  <ProgressTimeline
                    // steps={getTimelineSteps(caseItem)}
                    steps={timelineSteps}
                    orientation="vertical"
                    size="sm"
                    showTimestamps={true}
                    showDescriptions={false}
                    showSLA={true}
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
                {t("case.display.case_information")}
              </h4>
              <div className="grid grid-cols-1 space-y-3">
                <div className="xl:flex items-left justify-left gap-2">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <Ticket className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("case.display.no")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {caseItem.caseId || ""}
                  </div>
                </div>
                <div className="xl:flex items-start justify-left gap-1">
                  <ChartColumnStacked className="xl:block hidden w-4 h-4 text-gray-900 dark:text-white" />
                  <div>
                    <div className="xl:flex items-center justify-left gap-1">
                      <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                        <ChartColumnStacked className="block xl:hidden w-4 h-4" />
                        <div className="text-sm font-medium">{t("case.display.types")}:</div>
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 text-sm">{caseTitle(caseItem) || ""}</div>
                    </div>
                    <div className="xl:flex items-center justify-left gap-1 text-sm">
                      {sopData?.formAnswer && <FormViewer formData={sopData.formAnswer} />}
                    </div>
                  </div>
                </div>
                <div className="xl:flex items-left justify-left gap-2">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <MapPinHouse className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("case.display.service_center")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {dpcDisplay || ""}
                  </div>
                </div>
                <div className="xl:flex items-left justify-left gap-2">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <Siren className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("case.display.iot_alert_date")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {formatDate(sopData?.startedDate as string) || ""}
                  </div>
                </div>
                <div className="xl:flex items-left justify-left gap-2">
                  <div className="flex items-center justify-left gap-1">
                    <ClockArrowUp className="w-4 h-4 text-gray-900 dark:text-white" />
                    <span className="text-red-500 dark:text-red-400 text-sm font-medium">{t("case.display.updateAt")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {formatDate(sopData?.updatedAt as string) || ""} {t("case.display.updateBy")} {caseItem.updatedBy || ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="xl:flex items-left justify-left gap-2 mb-4">
                <div className="flex items-center justify-left gap-1 font-medium text-blue-500 dark:text-blue-400">
                  <MapPin className="w-4 h-4" />
                  <h4>{t("case.display.area")}</h4>
                </div>
              </div>
              <div className="grid grid-cols-1 space-y-3">
                <div className="xl:flex items-left justify-left">
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {caseItem.caselocAddrDecs || caseItem.caselocAddr || ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="xl:flex items-left justify-left gap-2 mb-4">
                <div className="flex items-center justify-left gap-1 font-medium text-blue-500 dark:text-blue-400">
                  <Contact className="w-4 h-4" />
                  <h4>{t("case.display.contact")}</h4>
                </div>
              </div>
              <div className="grid grid-cols-1 space-y-3">
                <div className="xl:flex items-left justify-left">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium xl:mr-2">{t("case.display.phone_number")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {caseItem.phoneNo || ""}
                  </div>
                </div>
                <div className="xl:flex items-left justify-left">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium xl:mr-2">{t("case.display.contact_method")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {contactMethod?.name || ""}
                  </div>
                </div>
                <div className="xl:flex items-left justify-left">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <Cpu className="w-4 h-4" />
                    <span className="text-sm font-medium xl:mr-2">{t("case.display.iot_device")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {caseItem.deviceId || ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-500 dark:text-blue-400 mb-4">
                {t("case.display.detail")}
              </h4>
              <div className="grid grid-cols-1 space-y-3">
                <div className="xl:flex items-left justify-left">
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {caseItem.caseDetail || ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Unit Information */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-500 dark:text-blue-400 mb-4">
                {t("case.officer_detail.personal_title")}
              </h4>
              <div className="grid grid-cols-1 space-y-3">
                <div className="xl:flex items-left justify-left gap-2">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("case.officer_detail.fullname")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {unitsData?.data?.firstName || ""}{" "}{unitsData?.data?.lastName || ""}
                  </div>
                </div>
                <div className="xl:flex items-left justify-left gap-2">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <AtSign className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("case.officer_detail.username")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {unitsData?.data?.username || ""}
                  </div>
                </div>
                <div className="xl:flex items-left justify-left gap-2">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("case.officer_detail.mobile_number")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {unitsData?.data?.mobileNo || ""}
                  </div>
                </div>
                <div className="xl:flex items-left justify-left gap-2">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("case.officer_detail.email")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {unitsData?.data?.email || ""}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="xl:flex items-left justify-left gap-2 mb-4">
                <div className="flex items-center justify-left gap-1 font-medium text-blue-500 dark:text-blue-400">
                  <Truck className="w-4 h-4" />
                  {t("case.officer_detail.service_title")}
                </div>
              </div>
              <div className="grid grid-cols-1 space-y-3">
                <div className="xl:flex items-left justify-left gap-2">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("case.officer_detail.vehicle")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {sopData?.unitLists?.length && sopData?.unitLists[0]?.unitId || ""}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="xl:flex items-left justify-left gap-2 mb-4">
                <div className="flex items-center justify-left gap-1 font-medium text-blue-500 dark:text-blue-400">
                  <Truck className="w-4 h-4" />
                  {t("case.officer_detail.service_title")}
                </div>
              </div>
              <div className="grid grid-cols-1 space-y-3">
                <div className="xl:flex items-left justify-left gap-2">
                  <div className="flex items-center justify-left gap-1 text-gray-900 dark:text-white">
                    <Building className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("userform.orgInfo")}:</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    {userStation && mergeDeptCommandStation(userStation) || ""}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="xl:flex items-left justify-left gap-2 mb-4">
                <div className="flex items-center justify-left gap-1 font-medium text-blue-500 dark:text-blue-400">
                  <CheckCircle className="w-4 h-4" />
                  {t("case.officer_detail.service_progress_title")}
                </div>
              </div>
              <div className="grid grid-cols-1 space-y-3">
                <ProgressStepPreviewUnit progressSteps={progressSteps} />
                <ProgressSummary progressSteps={progressSteps} />
              </div>
            </div>
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
              {t("case.sop_card.comment")} ({caseHistories?.length || 0})
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
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("crud.common.empty_table")}</p>
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
    title: (caseItem: CaseEntity) => `${caseTitle(caseItem)}`,
    subtitle: (caseItem: CaseEntity) => <PreviewTitle caseItem={caseItem} />,
    // avatar: (caseItem: CaseEntity) => {
    //   const Icon = getPriorityConfig(caseItem).icon;
    //   return (
    //     <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${getPriorityConfig(caseItem).color}`}>
    //       <Icon className="w-6 h-6" />  
    //     </div>
    //   );
    // },
    enableNavigation: true,
    size: "xl",
    tabs: [
      {
        key: "overview",
        label: t("crud.case_history.list.preview.tab.header.overview"),
        // icon: InfoIcon,
        render: (caseItem: CaseEntity) => {
          return (<OverviewTab caseItem={caseItem} />)
        }
      },
      {
        key: "activity",
        label: t("crud.case_history.list.preview.tab.header.activity"),
        // icon: PieChartIcon,
        render: (caseItem: CaseEntity) => {
          return (<ActivityTab caseItem={caseItem} />)
        }
      }
    ],
    actions: [
      {
        key: "edit",
        label: t("crud.common.update"),
        // icon: PencilIcon,
        variant: "warning",
        onClick: (caseItem: CaseEntity, closePreview: () => void) => {
          closePreview();
          navigate(`/case/${caseItem.caseId}`);
        },
        condition: () => permissions.hasPermission("case.update")
      },
      {
        key: "cancel",
        label: t("crud.case_history.list.body.actions.cancel"),
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
      key: "caseSTypeId",
      label: t("crud.case_history.list.toolbar.advanced_filter.type.label"),
      type: "select" as const,
      options: caseTypesSubTypesOptions,
      placeholder: t("crud.case_history.list.toolbar.advanced_filter.type.placeholder"),
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
        // return typeSubTypeConfigs?.find(c => c.subTypeTh.toLowerCase().includes(searchTerm) || c.subTypeEn.toLowerCase().includes(searchTerm))
        //   || caseItem.caseDetail.toLowerCase().includes(searchTerm)
        //   || caseItem.caselocAddr.toLowerCase().includes(searchTerm)
        //   || caseItem.caselocAddrDecs.toLowerCase().includes(searchTerm);
        return typeSubTypeConfigs?.find(c => c?.subTypeTh?.toLowerCase()?.includes(searchTerm) || c?.subTypeEn?.toLowerCase()?.includes(searchTerm))
          || caseItem?.caseId?.toLowerCase()?.includes(searchTerm)
          || caseItem?.caseDetail?.toLowerCase()?.includes(searchTerm)
          || caseItem?.caselocAddr?.toLowerCase()?.includes(searchTerm)
          || caseItem?.caselocAddrDecs?.toLowerCase()?.includes(searchTerm)
          || caseItem?.deviceId?.toLowerCase()?.includes(searchTerm)
          || caseItem?.phoneNo?.toLowerCase()?.includes(searchTerm);
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
  };

  // Handle deletion
  const handleDelete = (caseId: string) => {
    console.log("Case canceled:", caseId);
    // Handle case cancel (update state, show notification, etc.)
    setTimeout(() => {
      window.location.replace(`/case/history`);
    }, 1000);
  };

  // Handle view toggle
  // const handleViewToggle = () => {
  //   setViewOpen((prev) => (prev === "hidden" ? "block" : "hidden"));
  //   setCrudOpen("block");
  // };

  // ===================================================================
  // Render Component
  // ===================================================================

  return (
    <>
      <div className={crudOpen}>
        <PageBreadcrumb pageTitle={t("navigation.sidebar.main.case_management.nested.case_history.header")} />

        <EnhancedCrudContainer
          advancedFilters={advancedFilters}
          apiConfig={{
            baseUrl: "/api",
            endpoints: {
              list: "/case",
              create: "/case",
              read: "/case/:id",
              // update: "/case/:id",
              delete: "/case/:id",
              // bulkDelete: "/case/bulk",
              export: "/case/export"
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
          previewConfig={previewConfig as PreviewConfig<CaseEntity & { id: string }>}
          searchFields={["caseId", "caseDetail", "createdBy", "createdAt"]}
          // customFilterFunction={() => true}
          onCreate={() => navigate("/case/creation")}
          onDelete={handleDelete}
          onItemAction={handleAction}
          // onItemClick={(item) => navigate(`/role/${item.id}`)}
          onRefresh={() => window.location.reload()}
          // onUpdate={() => {}}
          renderCard={renderCard}
        />
      </div>
    </>
  );
};

export default CaseHistoryComponent;
