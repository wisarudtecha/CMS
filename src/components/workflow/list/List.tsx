// /src/components/workflow/list/List.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import {
  // BoltIcon,
  CheckLineIcon,
  CloseLineIcon,
  GroupIcon, 
  // ListIcon,
  LockIcon,
  // PencilIcon,
  TimeIcon,
  VideoIcon
} from "@/icons";
import { usePermissions } from "@/hooks/usePermissions";
import { useIsSystemAdmin } from "@/hooks/useIsSystemAdmin";
import { useTranslation } from "@/hooks/useTranslation";
import {
  // useDeleteWorkflowMutation,
  useGetWorkflowsQuery
} from "@/store/api/workflowApi";
// import { AuthService } from "@/utils/authService";
import { formatDate } from "@/utils/crud";
import type { PreviewConfig } from "@/types/enhanced-crud";
import type {
  Workflow,
  WorkflowAnalytics,
  // WorkflowData
} from "@/types/workflow";
import MetricsView from "@/components/admin/MetricsView";
// import Badge from "@/components/ui/badge/Badge";
// import workflowList from "@/mocks/workflowList.json";

const WorkflowListComponent: React.FC<{ workflows: Workflow[] }> = ({ workflows }) => {
  // const [deleteWorkflow] = useDeleteWorkflowMutation();
  const { refetch: getWorkflows } = useGetWorkflowsQuery("");
  // const isSystemAdmin = AuthService.isSystemAdmin();
  const isSystemAdmin = useIsSystemAdmin();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { t } = useTranslation();
  const [data, setData] = useState<(Workflow & { id: string })[]>([]);
  const [workflowAnalytics, setWorkflowAnalytics] = useState<WorkflowAnalytics>();

  const isDeleteAvailable = (publish: boolean) => {
    const canDelete = permissions.hasPermission("workflow.delete") && !publish;
    // console.log("🚀 ~ isDeleteAvailable ~ canDelete:", canDelete);
    // console.log("🚀 ~ isDeleteAvailable ~ publish:", publish);
    return canDelete || isSystemAdmin;
  }

  const isEditAvailable = (publish: boolean) => {
    const canEdit = permissions.hasPermission("workflow.update") && !publish;
    // console.log("🚀 ~ isEditAvailable ~ canEdit:", canEdit);
    // console.log("🚀 ~ isEditAvailable ~ publish:", publish);
    return canEdit || isSystemAdmin;
  }

  const isViewAvailable = () => {
    const canView = permissions.hasPermission("workflow.view");
    // console.log("🚀 ~ isDeleteAvailable ~ canView:", canView);
    return canView || isSystemAdmin;
  }

  // ===================================================================
  // Mock Data
  // ===================================================================

  // const data: Workflow[] = workflowList as Workflow[];

  // ===================================================================
  // Real Functionality Data
  // ===================================================================

  // const data: Workflow[] = workflows as Workflow[];
  const tmp: (Workflow & { id: string })[] = workflows.map(w => ({
    ...w,
    id: typeof w.id === "string" ? w.id : w.wfId?.toString?.() ?? w.id?.toString?.() ?? "",
  }));

  useEffect(() => {
    setData(tmp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflows]);

  useEffect(() => {
    setWorkflowAnalytics({
      totalWorkflows: data.length,
      activeWorkflows: data.filter(r => r.active).length,
      publishedWorkflows: data.filter(r => r.publish).length,
      draftWorkflows: data.filter(r => r.versions).length,
      lockedWorkflows: data.filter(r => r.locks).length
    });
  }, [data]);

  const statusConfig = [
    {
      active: true,
      color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
      icon: <CheckLineIcon className="w-4 h-4" />
    },
    {
      active: false,
      color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
      icon: <CloseLineIcon className="w-4 h-4" />
    }
  ];
  const publicationConfig = [
    {
      publish: true,
      color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
      icon: <VideoIcon className="w-4 h-4" />
    },
    {
      publish: false,
      color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
      icon: <TimeIcon className="w-4 h-4" />
    }
  ];
  const lockConfig = {
    locks: true,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
    icon: <LockIcon className="w-4 h-4" />
  };

  const safeTrimToEllipsis = (str: string, maxLength: number) => {
    if (maxLength < 3) {
      throw new Error("maxLength must be at least 3 to fit ellipsis.");
    };
    if (str.length <= maxLength) {
      return str;
    }
    return str.slice(0, maxLength - 3) + "...";
  }

  // ===================================================================
  // CRUD Configuration
  // ===================================================================

  const config = {
    entityName: t("crud.workflow.name"),
    entityNamePlural: t("crud.workflow.name"),
    apiEndpoints: {
      list: "/workflows",
      create: "/workflows",
      read: "/workflows/:id",
      update: "/workflows/:id",
      delete: "/workflows/:id",
      bulkDelete: "/workflows/bulk",
      export: "/workflows/export"
    },
    columns: [
      {
        key: "name",
        label: t("crud.workflow.list.header.title"),
        sortable: true,
        render: (workflow: Workflow) => (
          <div className="flex items-center gap-3">
            {/* <VideoIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" /> */}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {workflow.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {workflow.desc}
              </div>
            </div>
          </div>
        )
      },
      {
        key: "status",
        label: t("crud.workflow.list.header.active"),
        sortable: true,
        render: (workflow: Workflow) => {
          return (
            <div className="text-lg font-medium text-gray-900 dark:text-white capitalize">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1
                ${statusConfig.find(s => s.active === workflow.active)?.color || ""}
              `}>
                {statusConfig.find(s => s.active === workflow.active)?.icon || ""}
                {workflow.active ? t("common.active") : t("common.inactive")}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1
                ${publicationConfig.find(p => p.publish === workflow.publish)?.color || ""}
              `}>
                {publicationConfig.find(p => p.publish === workflow.publish)?.icon || ""}
                {workflow.publish ? t("common.publish") : t("common.draft")}
              </span>
              {workflow.locks && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1 ${lockConfig.color}`}>
                  <LockIcon className="w-3 h-4" />
                  {t("common.locked")}
                </span>
              )}
            </div>
          );
        }
      },
      {
        key: "createdAt",
        label: t("crud.workflow.list.header.createdAt"),
        sortable: true,
        render: (workflow: Workflow) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(workflow.createdAt)} {t("common.by")} {workflow.createdBy}
          </span>
        )
      },
    ],
    // filters: [
    //   {
    //     key: "status",
    //     label: "Status",
    //     type: "select" as const,
    //     options: [
    //       { value: "active", label: "Active" },
    //       { value: "inactive", label: "Inactive" },
    //       { value: "draft", label: "Draft" },
    //       { value: "testing", label: "Testing" }
    //     ]
    //   }
    // ],
    actions: [
      {
        key: "view",
        label: t("crud.common.read"),
        variant: "primary" as const,
        // icon: EyeIcon,
        onClick: (workflow: Workflow) => navigate(`/workflow/editor/v3/${workflow.wfId}`),
        // condition: () => permissions.hasPermission("workflow.view")
        condition: () => isViewAvailable()
      },
      {
        key: "update",
        label: t("crud.common.update"),
        variant: "warning" as const,
        // icon: PencilIcon,
        onClick: (workflow: Workflow) => navigate(`/workflow/editor/v3/${workflow.wfId}/edit`),
        // condition: (workflow: Workflow) => ((permissions.hasPermission("workflow.update") && !workflow.publish) || isSystemAdmin) as boolean
        condition: (workflow: Workflow) => isEditAvailable(workflow.publish)
      },
      {
        key: "delete",
        label: t("crud.common.delete"),
        variant: "outline" as const,
        // icon: TrashBinIcon,
        onClick: (workflow: Workflow) => {
          // This will be intercepted by the container"s handleItemAction
          console.log("Delete action triggered for:", workflow.wfId);
        },
        // condition: (workflow: Workflow) => ((permissions.hasPermission("workflow.delete") && !workflow.publish) || isSystemAdmin) as boolean
        condition: (workflow: Workflow) => isDeleteAvailable(workflow.publish)
      }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  // Preview Configuration
  const previewConfig: PreviewConfig<Workflow> = {
    title: (workflow: Workflow) => workflow.title,
    // subtitle: (workflow: Workflow) => safeTrimToEllipsis(workflow.desc, 50),
    // avatar: (workflow: Workflow) => {},
    size: "lg" as const,
    enableNavigation: true,
    tabs: [
      {
        key: "overview",
        label: t("crud.workflow.list.preview.tab.header.overview"),
        // icon: InfoIcon,
        fields: [
          {
            key: "desc",
            label: t("crud.workflow.list.preview.tab.overview.desc"),
            type: "text" as const,
          },
          {
            key: "active",
            label: "Status",
            type: "custom",
            render: value => value ? t("common.active") : t("common.inactive")
          },
          {
            key: "publish",
            label: "Publish",
            type: "custom",
            render: value => value ? t("common.yes") : t("common.no")
          },
          {
            key: "locks",
            label: "Locks",
            type: "custom",
            render: value => value ? t("common.yes") : t("common.no")
          },
          {
            key: "versions",
            label: t("crud.workflow.list.preview.tab.overview.versions"),
            type: "text" as const,
          },
          {
            key: "createdAt",
            label: t("crud.workflow.list.preview.tab.overview.createdAt"),
            type: "date" as const,
            render: value => value ? formatDate(value) : ""
          },
          {
            key: "createdBy",
            label: t("crud.workflow.list.preview.tab.overview.createdBy"),
            type: "text" as const
          },
          {
            key: "updatedAt",
            label: t("crud.workflow.list.preview.tab.overview.updatedAt"),
            type: "date" as const,
            render: value => value ? formatDate(value) : ""
          },
          {
            key: "updatedBy",
            label: t("crud.workflow.list.preview.tab.overview.updatedBy"),
            type: "text" as const
          }
        ]
      },
      {
        key: "configuration",
        label: t("crud.workflow.list.preview.tab.header.configuration"),
        // icon: PencilIcon,
        // fields: [
        //   {
        //     key: "config",
        //     label: "Configuration",
        //     type: "json" as const
        //   }
        // ]
      },
      {
        key: "activity",
        label: t("crud.workflow.list.preview.tab.header.activity"),
        render: (
          // item: unknown
        ) => {
          // const workflow = item as Workflow;
          return (
            <div className="space-y-4">
              {/*
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">
                      Workflow executed successfully
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 ml-auto">
                      2 hours ago
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">
                      Configuration updated
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 ml-auto">
                      1 day ago
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-300">
                      Workflow created
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 ml-auto">
                      {formatDate(workflow.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              */}

              {/*
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Performance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {workflow.runCount}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Runs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      98.5%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
                  </div>
                </div>
              </div>
              */}
            </div>);
        },
        fields: []
      }
    ],
    actions: [
      {
        key: "edit",
        label: t("crud.common.update"),
        // icon: PencilIcon,
        variant: "primary",
        onClick: (workflow: Workflow, closePreview: () => void) => {
          closePreview();
          navigate(`/workflow/editor/v3/${workflow.wfId}/edit`);
        },
        // condition: (workflow: Workflow) => ((permissions.hasPermission("workflow.update") && !workflow.publish) || isSystemAdmin) as boolean
        condition: (workflow: Workflow) => isEditAvailable(workflow.publish)
      },
      // {
      //   key: "duplicate",
      //   label: "Duplicate",
      //   // icon: CopyIcon,
      //   variant: "light",
      //   onClick: (workflow: Workflow, closePreview: () => void) => {
      //     console.log("Duplicating workflow:", workflow.wfId);
      //     closePreview();
      //   },
      //   condition: () => permissions.hasPermission("workflow.create")
      // },
      {
        key: "delete",
        label: t("crud.common.delete"),
        // icon: TrashBinIcon,
        variant: "outline",
        onClick: (workflow: Workflow, closePreview: () => void) => {
          console.log("Deleting workflow:", workflow.wfId);
          closePreview();
        },
        // condition: (workflow: Workflow) => ((permissions.hasPermission("workflow.delete") && !workflow.publish) || isSystemAdmin) as boolean
        condition: (workflow: Workflow) => isDeleteAvailable(workflow.publish)
      }
    ]
  };

  // ===================================================================
  // Advanced Filters
  // ===================================================================

  // const advancedFilters = [
  //   {
  //     key: "category",
  //     label: "Category",
  //     type: "select" as const,
  //     options: [
  //       { value: "Customer Management", label: "Customer Management" },
  //       { value: "Finance", label: "Finance" },
  //       { value: "Operations", label: "Operations" },
  //       { value: "Marketing", label: "Marketing" }
  //     ]
  //   },
  //   {
  //     key: "runCount",
  //     label: "Run Count",
  //     type: "number-range" as const,
  //     min: 0,
  //     max: 10000
  //   },
  //   {
  //     key: "createdAt",
  //     label: "Created Date",
  //     type: "date-range" as const
  //   }
  // ];

  // ===================================================================
  // Bulk Actions
  // ===================================================================

  // const bulkActions = [
  //   {
  //     key: "activate",
  //     label: "Activate Selected",
  //     variant: "primary" as const,
  //     onClick: async (items: Workflow[]) => {
  //       // API call to activate
  //       console.log("Activating workflows:", items.map(w => w.id));
  //     },
  //     condition: (items: Workflow[]) => items.some(w => w.active === false)
  //   },
  //   {
  //     key: "deactivate",
  //     label: "Deactivate Selected",
  //     variant: "warning" as const,
  //     onClick: async (items: Workflow[]) => {
  //       // API call to deactivate
  //       console.log("Deactivating workflows:", items.map(w => w.id));
  //     },
  //     condition: (items: Workflow[]) => items.some(w => w.active === true)
  //   }
  // ];

  // ===================================================================
  // Export Options
  // ===================================================================

  // const exportOptions = [
  //   {
  //     key: "csv-selected",
  //     label: "Export Selected (CSV)",
  //     format: "csv" as const,
  //     columns: ["name", "status", "createdAt", "runCount"]
  //   },
  //   {
  //     key: "json-all",
  //     label: "Export All (JSON)",
  //     format: "json" as const
  //   }
  // ];

  // ===================================================================
  // Custom Card Rendering
  // ===================================================================

  const renderCard = (workflow: Workflow) => {
    // const statusConfig = {
    //   active: { icon: VideoIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800", label: "Active" },
    //   inactive: { icon: ListIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800", label: "Inactive" },
    //   draft: { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800", label: "Draft" },
    //   testing: { icon: BoltIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800", label: "Testing" }
    // }[workflow.status];

    // const Icon = statusConfig.icon;

    return (
      <>
        <div className="items-start justify-left mb-4">
          <div className="items-center gap-3 mb-3">
            {/* <Icon className="lg:hidden w-5 h-5 text-gray-500 dark:text-gray-400" /> */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {workflow.title}
            </h3>
          </div>
          <span className={`inline-flex mr-2 items-center px-2 py-1 rounded-full text-xs font-medium
            ${statusConfig.find(s => s.active === workflow.active)?.color || ""}
          `}>
            {statusConfig.find(s => s.active === workflow.active)?.icon || ""}
            {workflow.active ? "Active" : "Inactive"}
          </span>
          <span className={`inline-flex mr-2 items-center px-2 py-1 rounded-full text-xs font-medium
            ${publicationConfig.find(p => p.publish === workflow.publish)?.color || ""}
          `}>
            {publicationConfig.find(p => p.publish === workflow.publish)?.icon || ""}
            {workflow.publish ? "Publish" : "Draft"}
          </span>
          {workflow.locks && (
            <span className={`inline-flex mr-2 items-center px-2 py-1 rounded-full text-xs font-medium ${lockConfig.color}`}>
              <LockIcon className="w-4 h-4" />
              Lock
            </span>
          )}

          {/*
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          */}
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm lg:min-h-15 xl:min-h-5 truncate">
          {safeTrimToEllipsis(workflow.desc, 50)}
        </p>

        <div className="xl:flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            {formatDate(workflow.createdAt)}
          </div>
        </div>

        {/*
        <div className="xl:flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            {formatDate(workflow.createdAt)}
          </div>
          <div className="font-medium">{workflow.runCount} runs</div>
        </div>
        */}
      </>
    );
  };

  // ===================================================================
  // Event Handlers
  // ===================================================================

  // Handle deletion and other actions
  const handleAction = (actionKey: string, workflow: Workflow) => {
    console.log(`Action ${actionKey} triggered for workflow:`, workflow.wfId);
    // Add any custom action handling here
  };

  // Handle deletion
  const handleDelete = async (workflowId: string) => {
    console.log("Workflow deleted:", workflowId);
    // In a real app, might want to update local state or refetch data
    // setData(prevData => prevData.filter(w => w.id !== workflowId));
    const workflowsData = await getWorkflows().unwrap();
    const workflows = (workflowsData?.data as unknown as Workflow[]) || [];
    setData(
      workflows.map((w) => ({ ...w, id: w.wfId?.toString() ?? w.id?.toString() ?? '' })),
    );
  };

  // ===================================================================
  // Render Component
  // ===================================================================

  const attrMetrics = [
    { key: "totalWorkflows", title: t("crud.workflow.metrics.total"), icon: GroupIcon, color: "blue", className: "text-blue-600" },
    { key: "activeWorkflows", title: t("crud.workflow.metrics.active"), icon: CheckLineIcon, color: "green", className: "text-green-600" },
    { key: "publishedWorkflows", title: t("crud.workflow.metrics.published"), icon: VideoIcon, color: "green", className: "text-green-600" },
    // { key: "draftWorkflows", title: "Draft", icon: PencilIcon, color: "yellow", className: "text-yellow-600" },
    { key: "lockedWorkflows", title: t("crud.workflow.metrics.locked"), icon: LockIcon, color: "red", className: "text-red-600" },
  ];

  return (
    <>
      <MetricsView metrics={workflowAnalytics} attrMetrics={attrMetrics} />

      <EnhancedCrudContainer
        // advancedFilters={advancedFilters}
        apiConfig={{
          baseUrl: "/api",
          endpoints: {
            list: "/workflows",
            create: "/workflows",
            read: "/workflows/:id",
            update: "/workflows/:id",
            delete: "/workflows/:id",
            bulkDelete: "/workflows/bulk",
            export: "/workflows/export"
          }
        }}
        // bulkActions={bulkActions}
        config={config}
        data={data}
        displayModes={["card", "table"]}
        displayModeDefault="table"
        enableDebug={true} // Enable debug mode to troubleshoot
        // error={null}
        // exportOptions={exportOptions}
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
        module="workflow"
        // previewConfig={previewConfig}
        previewConfig={previewConfig as PreviewConfig<Workflow & { id: string }>}
        searchFields={["title", "desc"]}
        // customFilterFunction={() => true}
        onCreate={() => navigate("/workflow/editor/v3")}
        onDelete={handleDelete}
        onItemAction={handleAction}
        // onItemAction={handleAction as (action: string, item: { wfId: string }) => void}
        // onItemClick={(item) => navigate(`/role/${item.id}`)}
        onRefresh={() => window.location.reload()}
        // onUpdate={() => {}}
        renderCard={renderCard}
        // renderCard={renderCard as (item: Workflow) => React.ReactNode}
      />
    </>
  );
};

export default WorkflowListComponent;
