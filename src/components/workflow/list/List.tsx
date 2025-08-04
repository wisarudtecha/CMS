// /src/components/workflow/list/List.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import { BoltIcon, ListIcon, TimeIcon, VideoIcon } from "@/icons";
import { formatDate } from "@/utils/crud";
import type { PreviewConfig } from "@/types/enhanced-crud";
import type { Workflow } from "@/types/workflow";
import Badge from "@/components/ui/badge/Badge";
import workflowList from "@/mocks/workflowList.json";

const WorkflowListComponent: React.FC = () => {
  const navigate = useNavigate();

  // ===================================================================
  // Mock Data
  // ===================================================================

  const data: Workflow[] = workflowList as Workflow[];

  // ===================================================================
  // CRUD Configuration
  // ===================================================================

  const config = {
    entityName: "Workflow",
    entityNamePlural: "Workflows",
    apiEndpoints: {
      list: "/api/workflows",
      create: "/api/workflows",
      read: "/api/workflows/:id",
      update: "/api/workflows/:id",
      delete: "/api/workflows/:id",
      bulkDelete: "/api/workflows/bulk",
      export: "/api/workflows/export"
    },
    columns: [
      {
        key: "name",
        label: "Name",
        sortable: true,
        render: (workflow: Workflow) => (
          <div className="flex items-center gap-3">
            <VideoIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {workflow.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {workflow.description}
              </div>
            </div>
          </div>
        )
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (workflow: Workflow) => {
          const statusConfig = {
            active: { color: "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100", label: "Active" },
            inactive: { color: "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100", label: "Inactive" },
            draft: { color: "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100", label: "Draft" },
            testing: { color: "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100", label: "Testing" }
          }[workflow.status];
          
          return (
            <Badge className={`${statusConfig.color}`}>
              {statusConfig.label}
            </Badge>
          );
        }
      },
      {
        key: "createdAt",
        label: "Created",
        sortable: true,
        render: (workflow: Workflow) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(workflow.createdAt)}
          </span>
        )
      },
      {
        key: "runCount",
        label: "Runs",
        sortable: true,
        render: (workflow: Workflow) => (
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {workflow.runCount}
          </span>
        )
      }
    ],
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "draft", label: "Draft" },
          { value: "testing", label: "Testing" }
        ]
      }
    ],
    actions: [
      {
        key: "view",
        label: "View",
        variant: "primary" as const,
        // icon: EyeIcon,
        onClick: (workflow: Workflow) => navigate(`/workflow/editor/v2/${workflow.id}`)
      },
      {
        key: "edit",
        label: "Edit",
        variant: "warning" as const,
        // icon: PencilIcon,
        onClick: (workflow: Workflow) => navigate(`/workflow/editor/v2/${workflow.id}/edit`)
      },
      {
        key: "delete",
        label: "Delete",
        variant: "error" as const,
        // icon: TrashBinIcon,
        onClick: (workflow: Workflow) => {
          // This will be intercepted by the container"s handleItemAction
          console.log("Delete action triggered for:", workflow.id);
        }
      }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  // Preview Configuration
  const previewConfig: PreviewConfig<Workflow> = {
    title: (workflow: Workflow) => workflow.name,
    subtitle: (workflow: Workflow) => `${workflow.category}`,
    avatar: (workflow: Workflow) => {
      const statusConfig = {
        active: VideoIcon,
        inactive: ListIcon,
        draft: TimeIcon,
        testing: BoltIcon
      }[workflow.status];
      const Icon = statusConfig;
      
      return (
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
        </div>
      );
    },
    size: "lg" as const,
    enableNavigation: true,
    tabs: [
      {
        key: "overview",
        label: "Overview",
        // icon: InfoIcon,
        fields: [
          {
            key: "description",
            label: "Description",
            type: "text" as const,
          },
          {
            key: "status",
            label: "Status",
            type: "custom",
            render: (value: unknown) => {
              const statusConfig = {
                active: "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100",
                inactive: "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100",
                draft: "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100",
                testing: "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100"
              }[value as "active" | "inactive" | "draft" | "testing"];
              
              return typeof value === 'string' && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig}`}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
              );
            }
          },
          {
            key: "category",
            label: "Category",
            type: "text" as const,
          },
          {
            key: "author",
            label: "Author",
            type: "text" as const,
          },
          {
            key: "version",
            label: "Version",
            type: "text" as const,
            copyable: true
          },
          {
            key: "createdAt",
            label: "Created",
            type: "date" as const,
          },
          {
            key: "lastRun",
            label: "Last Run",
            type: "date" as const,
          },
          {
            key: "runCount",
            label: "Total Runs",
            type: "number" as const
          },
          {
            key: "tags",
            label: "Tags",
            type: "tags" as const
          }
        ]
      },
      {
        key: "configuration",
        label: "Configuration",
        // icon: PencilIcon,
        fields: [
          {
            key: "config",
            label: "Configuration",
            type: "json" as const
          }
        ]
      },
      {
        key: "activity",
        label: "Activity",
        render: (item: unknown) => {
          const workflow = item as Workflow;
          return (
            <div className="space-y-4">
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
            </div>);
        },
        fields: []
      }
    ],
    actions: [
      {
        key: "edit",
        label: "Edit",
        // icon: PencilIcon,
        variant: "primary",
        onClick: (workflow: Workflow, closePreview: () => void) => {
          closePreview();
          navigate(`/workflow/editor/v2/${workflow.id}/edit`);
        }
      },
      {
        key: "duplicate",
        label: "Duplicate",
        // icon: CopyIcon,
        variant: "light",
        onClick: (workflow: Workflow, closePreview: () => void) => {
          console.log("Duplicating workflow:", workflow.id);
          closePreview();
        }
      },
      {
        key: "delete",
        label: "Delete",
        // icon: TrashBinIcon,
        variant: "error",
        onClick: (workflow: Workflow, closePreview: () => void) => {
          console.log("Deleting workflow:", workflow.id);
          closePreview();
        }
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
        { value: "Customer Management", label: "Customer Management" },
        { value: "Finance", label: "Finance" },
        { value: "Operations", label: "Operations" },
        { value: "Marketing", label: "Marketing" }
      ]
    },
    {
      key: "runCount",
      label: "Run Count",
      type: "number-range" as const,
      min: 0,
      max: 10000
    },
    {
      key: "createdAt",
      label: "Created Date",
      type: "date-range" as const
    }
  ];

  // ===================================================================
  // Bulk Actions
  // ===================================================================

  const bulkActions = [
    {
      key: "activate",
      label: "Activate Selected",
      variant: "primary" as const,
      onClick: async (items: Workflow[]) => {
        // API call to activate
        console.log("Activating workflows:", items.map(w => w.id));
      },
      condition: (items: Workflow[]) => items.some(w => w.status !== "active")
    },
    {
      key: "deactivate",
      label: "Deactivate Selected",
      variant: "warning" as const,
      onClick: async (items: Workflow[]) => {
        // API call to deactivate
        console.log("Deactivating workflows:", items.map(w => w.id));
      },
      condition: (items: Workflow[]) => items.some(w => w.status === "active")
    }
  ];

  // ===================================================================
  // Export Options
  // ===================================================================

  const exportOptions = [
    {
      key: "csv-selected",
      label: "Export Selected (CSV)",
      format: "csv" as const,
      columns: ["name", "status", "createdAt", "runCount"]
    },
    {
      key: "json-all",
      label: "Export All (JSON)",
      format: "json" as const
    }
  ];

  // ===================================================================
  // Custom Card Rendering
  // ===================================================================

  const renderCard = (workflow: Workflow) => {
    const statusConfig = {
      active: { icon: VideoIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800", label: "Active" },
      inactive: { icon: ListIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800", label: "Inactive" },
      draft: { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800", label: "Draft" },
      testing: { icon: BoltIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800", label: "Testing" }
    }[workflow.status];

    const Icon = statusConfig.icon;

    const safeTrimToEllipsis = (str: string, maxLength: number) => {
      if (maxLength < 3) {
        throw new Error("maxLength must be at least 3 to fit ellipsis.");
      };
      if (str.length <= maxLength) {
        return str;
      }
      return str.slice(0, maxLength - 3) + "...";
    }

    return (
      <>
        <div className="xl:flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-h-14 xl:min-h-0">
            <Icon className="lg:hidden w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {workflow.name}
            </h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm lg:min-h-15 xl:min-h-0">
          {safeTrimToEllipsis(workflow.description, 50)}
        </p>

        <div className="xl:flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            {/* <CalenderIcon className="w-4 h-4" /> */}
            {formatDate(workflow.createdAt)}
          </div>
          <div className="font-medium">{workflow.runCount} runs</div>
        </div>
      </>
    );
  };

  // ===================================================================
  // Event Handlers
  // ===================================================================

  // Handle deletion and other actions
  const handleAction = (actionKey: string, workflow: Workflow) => {
    console.log(`Action ${actionKey} triggered for workflow:`, workflow.id);
    // Add any custom action handling here
  };

  // Handle deletion
  const handleDelete = (workflowId: string) => {
    console.log("Workflow deleted:", workflowId);
    // In a real app, might want to update local state or refetch data
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
            list: "/workflow",
            create: "/workflow",
            read: "/workflow/:id",
            update: "/workflow/:id",
            delete: "/workflow/:id",
            bulkDelete: "/workflow/bulk",
            export: "/workflow/export"
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
          export: true,
          realTimeUpdates: false, // Disabled for demo
          keyboardShortcuts: true
        }}
        // keyboardShortcuts={[]}
        // loading={false}
        previewConfig={previewConfig}
        searchFields={["name", "description", "category"]}
        // customFilterFunction={() => true}
        onCreate={() => navigate("/workflow/editor/v2")}
        onDelete={handleDelete}
        onItemAction={handleAction}
        // onItemClick={(item) => navigate(`/role/${item.id}`)}
        onRefresh={() => window.location.reload()}
        // onUpdate={() => {}}
        renderCard={renderCard}
      />
    </>
  );
};

export default WorkflowListComponent;
