// /src/components/workflow/list/List.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
// import { CrudContainer } from "@/components/crud/CrudContainer";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import {
  VideoIcon,
  ListIcon,
  TimeIcon,
  BoltIcon,
  // EyeIcon,
  // PencilIcon,
  // TrashBinIcon
} from "@/icons";
import { formatDate } from "@/utils/crud";
import type {
  // CrudConfig,
  // TableColumn,
  // CrudAction,
  // StatusOption
} from "@/types/crud";
import Badge from "@/components/ui/badge/Badge";
// import { useConfirmDialog } from "@/hooks/useConfirmDialog";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft" | "testing";
  createdAt: string;
  lastRun?: string;
  runCount: number;
  category?: string;
  tags?: string[];
}

const WorkflowListComponent: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const workflows: Workflow[] = [
    {
      id: "1",
      name: "Customer Onboarding",
      description: "Automated workflow for new customer registration and setup",
      status: "active",
      createdAt: "2025-01-15T10:30:00Z",
      lastRun: "2025-06-11T08:15:00Z",
      runCount: 234,
      category: "Customer Management",
    },
    {
      id: "2",
      name: "Invoice Processing",
      description: "Handle incoming invoices and route for approval",
      status: "active",
      createdAt: "2025-02-20T14:20:00Z",
      lastRun: "2025-06-10T16:45:00Z",
      runCount: 1456
    },
    {
      id: "3",
      name: "Data Backup",
      description: "Daily backup of critical system data",
      status: "inactive",
      createdAt: "2025-01-05T09:00:00Z",
      lastRun: "2025-06-08T02:00:00Z",
      runCount: 89
    },
    {
      id: "4",
      name: "Email Campaign",
      description: "Automated marketing email sequences for leads",
      status: "draft",
      createdAt: "2025-06-10T11:30:00Z",
      runCount: 0
    },
    {
      id: "5",
      name: "Quality Assurance",
      description: "Automated testing and quality checks for production releases",
      status: "active",
      createdAt: "2025-03-12T13:45:00Z",
      lastRun: "2025-06-11T07:30:00Z",
      runCount: 567
    },
    {
      id: "6",
      name: "User Analytics",
      description: "Track and analyze user behavior patterns",
      status: "active",
      createdAt: "2025-04-01T12:00:00Z",
      lastRun: "2025-06-12T09:20:00Z",
      runCount: 892,
      category: "Analytics",
      // tags: ["analytics", "tracking", "insights"]
    },
    {
      id: "7",
      name: "Inventory Management",
      description: "Monitor and manage inventory levels automatically",
      status: "active",
      createdAt: "2025-05-15T16:30:00Z",
      lastRun: "2025-06-11T14:10:00Z",
      runCount: 124,
      category: "Operations",
      // tags: ["inventory", "management", "monitoring"]
    },
    {
      id: "8",
      name: "Security Audit",
      description: "Regular security checks and vulnerability assessments",
      status: "inactive",
      createdAt: "2025-02-28T08:45:00Z",
      lastRun: "2025-06-05T22:30:00Z",
      runCount: 67,
      category: "Security",
      // tags: ["security", "audit", "compliance"]
    },
    {
      id: "9",
      name: "Customer Onboarding",
      description: "Automated workflow for new customer registration and setup",
      status: "active",
      createdAt: "2025-01-15T10:30:00Z",
      lastRun: "2025-06-11T08:15:00Z",
      runCount: 234
    },
    {
      id: "10",
      name: "Invoice Processing",
      description: "Handle incoming invoices and route for approval",
      status: "active",
      createdAt: "2025-02-20T14:20:00Z",
      lastRun: "2025-06-10T16:45:00Z",
      runCount: 1456
    },
    {
      id: "11",
      name: "Data Backup",
      description: "Daily backup of critical system data",
      status: "inactive",
      createdAt: "2025-01-05T09:00:00Z",
      lastRun: "2025-06-08T02:00:00Z",
      runCount: 89
    },
    {
      id: "12",
      name: "Email Campaign",
      description: "Automated marketing email sequences for leads",
      status: "draft",
      createdAt: "2025-06-10T11:30:00Z",
      runCount: 0
    },
    {
      id: "13",
      name: "Quality Assurance",
      description: "Automated testing and quality checks for production releases",
      status: "active",
      createdAt: "2025-03-12T13:45:00Z",
      lastRun: "2025-06-11T07:30:00Z",
      runCount: 567
    },
    {
      id: "14",
      name: "User Analytics",
      description: "Track and analyze user behavior patterns",
      status: "active",
      createdAt: "2025-04-01T12:00:00Z",
      lastRun: "2025-06-12T09:20:00Z",
      runCount: 892,
      category: "Analytics",
      // tags: ["analytics", "tracking", "insights"]
    },
    {
      id: "15",
      name: "Inventory Management",
      description: "Monitor and manage inventory levels automatically",
      status: "active",
      createdAt: "2025-05-15T16:30:00Z",
      lastRun: "2025-06-11T14:10:00Z",
      runCount: 124,
      category: "Operations",
      // tags: ["inventory", "management", "monitoring"]
    },
    {
      id: "16",
      name: "Security Audit",
      description: "Regular security checks and vulnerability assessments",
      status: "inactive",
      createdAt: "2025-02-28T08:45:00Z",
      lastRun: "2025-06-05T22:30:00Z",
      runCount: 67,
      category: "Security",
      // tags: ["security", "audit", "compliance"]
    }
  ];

  // Configuration
  const config
    // : CrudConfig<Workflow>
    = {
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
        render: (
          // workflow
          workflow: Workflow
        ) => (
          // <div>
          //   <div className="font-medium text-gray-900 dark:text-white">
          //     {workflow.name}
          //   </div>
          //   <div className="text-sm text-gray-500 dark:text-gray-400">
          //     {workflow.description}
          //   </div>
          // </div>
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
        render: (
          // workflow
          workflow: Workflow
        ) => {
          const statusConfig = {
            // active: { icon: VideoIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800" },
            // inactive: { icon: ListIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800" },
            // draft: { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800" },
            // testing: { icon: BoltIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800" }
            active: { color: "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100", label: "Active" },
            inactive: { color: "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100", label: "Inactive" },
            draft: { color: "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100", label: "Draft" },
            testing: { color: "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100", label: "Testing" }
          }[workflow.status];
          
          return (
            <Badge className={`${statusConfig.color}`}>
              {/* {workflow.status} */}
              {statusConfig.label}
            </Badge>
          );
        }
      },
      {
        key: "createdAt",
        label: "Created",
        sortable: true,
        // render: (workflow) => formatDate(workflow.createdAt)
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
        // type: "select",
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
        // onClick: (workflow) => navigate(`/workflow/editor/v2/${workflow.id}`)
        onClick: (workflow: Workflow) => navigate(`/workflow/editor/v2/${workflow.id}`)
      },
      {
        key: "edit",
        label: "Edit",
        variant: "warning" as const,
        // icon: PencilIcon,
        // onClick: (workflow) => navigate(`/workflow/editor/v2/${workflow.id}/edit`)
        onClick: (workflow: Workflow) => navigate(`/workflow/editor/v2/${workflow.id}/edit`)
      },
      {
        key: "delete",
        label: "Delete",
        variant: "error" as const,
        // icon: TrashBinIcon,
        // onClick: (workflow) => console.log("Delete", workflow.id)
        onClick: (workflow: Workflow) => {
          // This will be intercepted by the container"s handleItemAction
          console.log("Delete action triggered for:", workflow.id);
        }
      }
    ] // satisfies CrudAction<Workflow>[]
  };

  // Advanced filters
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

  // Bulk actions
  const bulkActions = [
    {
      key: "activate",
      label: "Activate Selected",
      variant: "primary" as const,
      onClick: async (items: Workflow[]) => {
        // API call to activate workflows
        console.log("Activating workflows:", items.map(w => w.id));
      },
      condition: (items: Workflow[]) => items.some(w => w.status !== "active")
    },
    {
      key: "deactivate",
      label: "Deactivate Selected",
      variant: "warning" as const,
      onClick: async (items: Workflow[]) => {
        // API call to deactivate workflows
        console.log("Deactivating workflows:", items.map(w => w.id));
      },
      condition: (items: Workflow[]) => items.some(w => w.status === "active")
    }
  ];

  // Export options
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

  const renderWorkflowCard = (workflow: Workflow) => {
    const statusConfig = {
      active: { icon: VideoIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800", label: "Active" },
      inactive: { icon: ListIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800", label: "Inactive" },
      draft: { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800", label: "Draft" },
      testing: { icon: BoltIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800", label: "Testing" }
    }[workflow.status];

    const Icon = statusConfig.icon;

    return (
      <>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {workflow.name}
            </h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
          {workflow.description}
        </p>
        
        {/*
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div>{formatDate(workflow.createdAt)}</div>
          <div className="font-medium">{workflow.runCount} runs</div>
        </div>
        */}

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            {/* <CalenderIcon className="w-4 h-4" /> */}
            {formatDate(workflow.createdAt)}
          </div>
          <div className="font-medium">{workflow.runCount} runs</div>
        </div>

        {/*
        {workflow.tags && (
          <div className="flex flex-wrap gap-1">
            {workflow.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        */}
      </>
    );
  };

  // const handleDelete = (id: string) => {
  //   console.log("Confirmed delete:", id);
  //   // Call API or dispatch delete logic here
  // };

  // Handle workflow deletion and other actions
  const handleWorkflowAction = (actionKey: string, workflow: Workflow) => {
    console.log(`Action ${actionKey} triggered for workflow:`, workflow.id);
    // Add any custom action handling here
  };

  // Handle workflow deletion
  const handleWorkflowDelete = (workflowId: string) => {
    console.log("Workflow deleted:", workflowId);
    // In a real app, you might want to update local state or refetch data
    // For now, we"ll just log it
  };

  return (
    // <CrudContainer
    //   data={workflows}
    //   config={config}
    //   onCreate={() => navigate("/workflow/editor/v2")}
    //   renderCard={renderWorkflowCard}
    //   searchFields={["name", "description", "category"]}
    // />
    <EnhancedCrudContainer
      data={workflows}
      config={config}
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
      features={{
        search: true,
        sorting: true,
        filtering: true,
        pagination: true,
        bulkActions: true,
        export: true,
        realTimeUpdates: true,
        keyboardShortcuts: true
      }}
      onCreate={() => navigate("/workflow/editor/v2")}
      onRefresh={() => window.location.reload()}
      onDelete={handleWorkflowDelete}
      onItemAction={handleWorkflowAction}
      renderCard={renderWorkflowCard}
      searchFields={["name", "description", "category"]}
      bulkActions={bulkActions}
      exportOptions={exportOptions}
      advancedFilters={advancedFilters}
      enableDebug={true} // Enable debug mode to troubleshoot
    />
  );
};

export default WorkflowListComponent;
