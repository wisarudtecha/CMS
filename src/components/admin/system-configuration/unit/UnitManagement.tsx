// /src/components/admin/system-configuration/unit/UnitManagement.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { CircleCheck, CircleX, MapPinCheck, MapPinX } from "lucide-react";
// import { CheckLineIcon, ListIcon, PieChartIcon, TimeIcon } from "@/icons";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslation } from "@/hooks/useTranslation";
import { AuthService } from "@/utils/authService";
import type { PreviewConfig } from "@/types/enhanced-crud";
import type {
  Unit,
  // UnitMetrics
} from "@/types/unit";
// import MetricsView from "@/components/admin/MetricsView";
import UnitCardContent from "@/components/admin/system-configuration/unit/UnitCard";
import Badge from "@/components/ui/badge/Badge";

const UnitLocation: React.FC<{
  isOutArea: boolean;
  isLogin: boolean;
}> = ({
  isOutArea,
  isLogin
}) => {
  const isOutAreaIcon = isOutArea ? <MapPinX className="w-4 h-4" /> : <MapPinCheck className="w-4 h-4" />;
  const isOutAreaLabel = isOutArea ? " Out of Area " : " In Area ";
  const isOnlineIcon = isLogin ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />;
  const isOnlineLabel = isLogin ? " Online " : " Offline ";
  return (
    <div className="xl:flex items-center justify-start gap-2 text-gray-900 dark:text-white text-sm">
      <span className="flex items-center justify-start gap-1">{isOutAreaIcon} {isOutAreaLabel}</span>
      <span className="flex items-center justify-start gap-1">{isOnlineIcon} {isOnlineLabel}</span>
    </div>
  );
}

const UnitStatus: React.FC<{ status: "active" | "inactive" | "online" | "offline" }> = ({ status }) => {
  return (
    <Badge className={`capitalize text-sm ${status === "active" || status === "online"
      ? "bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-200"
      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
    }`}>
      {status}
    </Badge>
  );
}

const UnitManagementComponent: React.FC<{ unit: Unit[] }> = ({ unit }) => {
  const { t } = useTranslation();

  const isSystemAdmin = AuthService.isSystemAdmin();
  const navigate = useNavigate();
  const permissions = usePermissions();

  // ===================================================================
  // Real Functionality Data
  // ===================================================================

  // const mockMetrics: UnitMetrics = {
  //   activeUnits: 0,
  //   avgResponse: 0,
  //   slaCompliance: 0,
  //   totalCases: 0
  // };

  const data: (Unit & { id: string })[] = unit.map(u => ({
    ...u,
    id: typeof u.id === "string" ? u.id : u.id?.toString?.() ?? u.id?.toString?.() ?? "",
  }));

  // ===================================================================
  // CRUD Configuration
  // ===================================================================

  const config = {
    entityName: t("crud.unit.name"),
    entityNamePlural: t("crud.unit.name"),
    apiEndpoints: {
      list: "/api/mdm/units",
      create: "/api/mdm/units",
      read: "/api/mdm/units/:id",
      update: "/api/mdm/units/:id",
      delete: "/api/mdm/units/:id",
      // bulkDelete: "/api/mdm/units/bulk",
      // export: "/api/mdm/units/export"
    },
    columns: [
      {
        key: "unitName",
        label: t("crud.unit.list.header.unit"),
        sortable: true,
        render: (unitItem: Unit) => {
          return (
            <div className={`flex items-center gap-3`}>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {unitItem?.unitName.trim()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {unitItem?.unitId && unitItem?.unitId.trim()}{unitItem?.plateNo && ` • ${unitItem?.plateNo.trim()}`}
                </div>
              </div>
            </div>
          )
        }
      },
      {
        key: "active",
        label: t("crud.unit.list.header.status"),
        sortable: true,
        render: (unitItem: Unit) => <UnitStatus status={unitItem.active ? "active" : "inactive"} />
      },
      {
        key: "location",
        label: t("crud.unit.list.header.location"),
        sortable: true,
        render: (unitItem: Unit) => <UnitLocation isOutArea={unitItem?.isOutArea} isLogin={unitItem?.isLogin} />
      }
    ],
    actions: [
      {
        key: "view",
        label: t("crud.common.read"),
        variant: "primary" as const,
        // icon: EyeIcon,
        onClick: (unitItem: Unit) => navigate(`/unit/${unitItem.id}`),
        condition: () => (permissions.hasPermission("unit.view") || isSystemAdmin) as boolean
      },
      {
        key: "update",
        label: t("crud.common.update"),
        variant: "warning" as const,
        // icon: PencilIcon,
        onClick: (unitItem: Unit) => navigate(`/unit/${unitItem.id}/edit`),
        condition: () => (permissions.hasPermission("unit.update") || isSystemAdmin) as boolean
      },
      {
        key: "delete",
        label: t("crud.common.delete"),
        variant: "outline" as const,
        // icon: TrashBinIcon,
        onClick: (unitItem: Unit) => {
          console.log("Delete unit:", unitItem.id);
        },
        condition: () => (permissions.hasPermission("unit.delete") || isSystemAdmin) as boolean
      }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  const previewConfig: PreviewConfig<Unit> = {
    title: () => "Unit Information",
    size: "xl",
    enableNavigation: true,
    tabs: [
      {
        key: "basicInfo",
        label: "Basic Info",
        // icon: InfoIcon,
        render: (unitItem: Unit) => {
          return (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{unitItem.unitName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">ID</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                  {unitItem.unitId}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Plate Number</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                  {unitItem.plateNo}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Priority</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{unitItem.priority}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Active Status</label>
                <div className="mt-1">
                  <UnitStatus status={unitItem.active ? "active" : "inactive"} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Login Status</label>
                <div className="mt-1">
                  <UnitStatus status={unitItem.isLogin ? "online" : "offline"} />
                </div>
              </div>
            </div>
          )
        }
      },
      {
        key: "location",
        label: "Location",
        // icon: MapPin,
        render: (unitItem: Unit) => {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Latitude</label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                    {unitItem.locLat.toFixed(6)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Longitude</label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                    {unitItem.locLon.toFixed(6)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">GPS Accuracy</label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{unitItem.locAccuracy}m</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Satellites</label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{unitItem.locSatellites}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Provider</label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{unitItem.locProvider}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Last Update</label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                    {new Date(unitItem.locLastUpdateTime).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Location Status</h4>
                  <UnitLocation isOutArea={unitItem?.isOutArea} isLogin={unitItem?.isLogin} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Speed: {unitItem.locSpeed} km/h • Bearing: {unitItem.locBearing}°
                </div>
              </div>
            </div>
          )
        }
      }
    ],
    actions: [
      // {
      //   key: "view",
      //   label: "View",
      //   // icon: EyeIcon,
      //   variant: "primary",
      //   onClick: (unitItem: Unit, closePreview: () => void) => {
      //     closePreview();
      //     navigate(`/unit/${unitItem.id}`);
      //   },
      //   condition: () => (permissions.hasPermission("unit.view") || isSystemAdmin) as boolean
      // },
      {
        key: "update",
        label: "Edit",
        // icon: PencilIcon,
        variant: "warning",
        onClick: (unitItem: Unit, closePreview: () => void) => {
          closePreview();
          navigate(`/unit/${unitItem.id}/edit`);
        },
        condition: () => (permissions.hasPermission("unit.update") || isSystemAdmin) as boolean
      },
      {
        key: "delete",
        label: "Delete",
        // icon: CheckLineIcon,
        variant: "outline",
        onClick: (unitItem: Unit, closePreview: () => void) => {
          closePreview();
          console.log("Delete unit:", unitItem.id);
        },
        condition: () => (permissions.hasPermission("unit.delete") || isSystemAdmin) as boolean
      }
    ]
  };

  // ===================================================================
  // Advanced Filters
  // ===================================================================

  // const advancedFilters = [
  //   {
  //     key: "active",
  //     label: "Status",
  //     type: "select" as const,
  //     options: [
  //       { value: true, label: "Active" },
  //       { value: false, label: "Inactive"}
  //     ],
  //     placeholder: "Select status",
  //   },
  // ];

  // ===================================================================
  // Bulk Actions
  // ===================================================================

  // ===================================================================
  // Export Options
  // ===================================================================

  // ===================================================================
  // Custom Card Rendering
  // ===================================================================

  const renderCard = (unitItem: Unit) => {
    return <UnitCardContent unit={unitItem as Unit} UnitLocation={UnitLocation} UnitStatus={UnitStatus} />;
  };

  // ===================================================================
  // Event Handlers
  // ===================================================================

  // Handle deletion and other actions
  const handleAction = (actionKey: string, unitItem: Unit) => {
    // Add custom unit-specific action handling
    console.log(`Action ${actionKey} triggered for unit:`, unitItem.id);
    
  };

  // Handle deletion
  const handleDelete = (id: string) => {
    // Handle unit delete
    console.log("Unit deleted:", id);
  };

  // ===================================================================
  // Render Component
  // ===================================================================

  // const attrMetrics = [
  //   { key: "activeUnits", title: "Active Units", icon: CheckLineIcon, color: "green", className: "text-green-600" },
  //   { key: "avgResponse", title: "Avg. Response", icon: PieChartIcon, color: "yellow", className: "text-yellow-600" },
  //   { key: "slaCompliance", title: "SLA Compliance", icon: TimeIcon, color: "red", className: "text-red-600" },
  //   { key: "totalCases", title: "Total Cases", icon: ListIcon, color: "blue", className: "text-blue-600" },
  // ];

  return (
    <>
      {/* <MetricsView metrics={mockMetrics} attrMetrics={attrMetrics} /> */}

      <EnhancedCrudContainer
        // advancedFilters={advancedFilters}
        apiConfig={{
          baseUrl: "/api",
          endpoints: {
            create: "/mdm/units",
            read: "/mdm/units/:id",
            list: "/mdm/units",
            update: "/mdm/units/:id",
            delete: "/mdm/units/:id"
          }
        }}
        config={config}
        data={data}
        displayModes={["card", "table"]}
        displayModeDefault="table"
        enableDebug={true} // Enable debug mode to troubleshoot
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
        loading={!unit}
        module="unit"
        previewConfig={previewConfig as PreviewConfig<Unit & { id: string }>}
        searchFields={["unitName", "active", "isOutArea", "isLogin"]}
        onCreate={() => navigate("/unit/create")}
        onDelete={handleDelete}
        onItemAction={handleAction as unknown as (action: string, item: { id: string }) => void}
        onRefresh={() => window.location.reload()}
        renderCard={renderCard as unknown as (item: { id: string }) => React.ReactNode}
      />
    </>
  );
};

export default UnitManagementComponent;
