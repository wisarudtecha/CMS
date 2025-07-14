// /src/components/case/CaseHistory.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedCrudContainer } from "@/components/crud/EnhancedCrudContainer";
import {
  AlertHexaIcon,
  CalenderIcon,
  ChatIcon,
  CheckCircleIcon,
  ChevronUpIcon,
  FileIcon,
  FolderIcon,
  // InfoIcon,
  // PencilIcon,
  // PieChartIcon,
  TimeIcon,
  UserIcon,
} from "@/icons";
import { formatDate } from "@/utils/crud";
import { PreviewConfig } from "@/types/enhanced-crud"
import type { CaseEntity } from "@/types/case";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import caseHistoryList from "@/mocks/caseHistoryList.json";

const CaseHistoryComponent: React.FC = () => {
  const navigate = useNavigate();

  // Mock Case Data
  const data: CaseEntity[] = caseHistoryList as CaseEntity[];

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
            <FolderIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {caseItem.caseNumber}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {caseItem.title}
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
          const statusConfig = {
            "open": { color: "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100", label: "Open" },
            "in-progress": { color: "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100", label: "In Progress" },
            "resolved": { color: "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100", label: "Resolved" },
            "closed": { color: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100", label: "Closed" },
            "escalated": { color: "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100", label: "Escalated" }
          }[caseItem.status];
          
          return (
            <Badge className={`${statusConfig.color}`}>
              {statusConfig.label}
            </Badge>
          );
        }
      },
      {
        key: "priority",
        label: "Priority",
        sortable: true,
        render: (caseItem: CaseEntity) => {
          const priorityConfig = {
            "low": { color: "text-green-600 dark:text-green-400", icon: CheckCircleIcon },
            "medium": { color: "text-yellow-600 dark:text-yellow-400", icon: TimeIcon },
            "high": { color: "text-orange-600 dark:text-orange-400", icon: AlertHexaIcon },
            "critical": { color: "text-red-600 dark:text-red-400", icon: ChevronUpIcon }
          }[caseItem.priority];
          
          const Icon = priorityConfig.icon;
          
          return (
            <div className={`flex items-center gap-1 ${priorityConfig.color}`}>
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium capitalize">{caseItem.priority}</span>
            </div>
          );
        }
      },
      {
        key: "assignedTo",
        label: "Assigned To",
        sortable: true,
        render: (caseItem: CaseEntity) => (
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900 dark:text-white">{caseItem.assignedTo}</span>
          </div>
        )
      },
      {
        key: "createdAt",
        label: "Created",
        sortable: true,
        render: (caseItem: CaseEntity) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(caseItem.createdAt)}
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
          { value: "open", label: "Open" },
          { value: "in-progress", label: "In Progress" },
          { value: "resolved", label: "Resolved" },
          { value: "closed", label: "Closed" },
          { value: "escalated", label: "Escalated" }
        ]
      },
      {
        key: "priority",
        label: "Priority",
        type: "select" as const,
        options: [
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
          { value: "critical", label: "Critical" }
        ]
      }
    ],
    actions: [
      {
        key: "view",
        label: "View",
        variant: "primary" as const,
        // icon: EyeIcon,
        onClick: (caseItem: CaseEntity) => navigate(`/case/assignment${caseItem.id}`)
      },
      {
        key: "edit",
        label: "Edit",
        variant: "warning" as const,
        // icon: PencilIcon,
        onClick: (caseItem: CaseEntity) => navigate(`/case/assignment${caseItem.id}`)
      },
      {
        key: "delete",
        label: "Cancel",
        variant: "error" as const,
        // icon: TrashBinIcon,
        onClick: (caseItem: CaseEntity) => {
          console.log("Delete case:", caseItem.id);
        }
      }
    ]
  };

  // ===================================================================
  // Preview Configuration
  // ===================================================================

  const previewConfig: PreviewConfig<CaseEntity> = {
    title: (caseItem: CaseEntity) => `${caseItem.caseNumber}: ${caseItem.title}`,
    subtitle: (caseItem: CaseEntity) => `${caseItem.category} • Assigned to ${caseItem.assignedTo}`,
    avatar: (caseItem: CaseEntity) => {
      const priorityConfig = {
        "low": { icon: CheckCircleIcon, color: "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300" },
        "medium": { icon: TimeIcon, color: "bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300" },
        "high": { icon: AlertHexaIcon, color: "bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300" },
        "critical": { icon: ChevronUpIcon, color: "bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300" }
      }[caseItem.priority];
      
      const Icon = priorityConfig.icon;
      
      return (
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${priorityConfig.color}`}>
          <Icon className="w-6 h-6" />
        </div>
      );
    },
    size: "xl",
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
            type: "text" as const
          },
          {
            key: "status",
            label: "Status",
            type: "badge" as const,
            render: (value: string) => {
              // const statusConfig = {
              //   "open": "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100",
              //   "in-progress": "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100",
              //   "resolved": "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100",
              //   "closed": "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100",
              //   "escalated": "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100"
              // }[value as keyof typeof statusConfig];
              const statusConfigMap = {
                "open": "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100",
                "in-progress": "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100",
                "resolved": "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100",
                "closed": "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100",
                "escalated": "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100"
              };
              const statusConfig = statusConfigMap[value as keyof typeof statusConfigMap];
              
              return (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig}`}>
                  {value.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              );
            }
          },
          {
            key: "priority",
            label: "Priority",
            type: "badge" as const,
            render: (value: string) => {
              // const priorityConfig = {
              //   "low": "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100",
              //   "medium": "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100",
              //   "high": "bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-100",
              //   "critical": "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100"
              // }[value as keyof typeof priorityConfig];
              const priorityConfigMap = {
                "low": "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100",
                "medium": "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100",
                "high": "bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-100",
                "critical": "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100"
              };
              const priorityConfig = priorityConfigMap[value as keyof typeof priorityConfigMap];
              
              return (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig}`}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
              );
            }
          },
          {
            key: "category",
            label: "Category",
            type: "text" as const
          },
          {
            key: "assignedTo",
            label: "Assigned To",
            type: "text" as const
          },
          {
            key: "reporter",
            label: "Reporter",
            type: "text" as const
          },
          {
            key: "caseNumber",
            label: "Case Number",
            type: "text" as const,
            copyable: true
          },
          {
            key: "createdAt",
            label: "Created",
            type: "date" as const
          },
          {
            key: "updatedAt",
            label: "Last Updated",
            type: "date" as const
          },
          {
            key: "dueDate",
            label: "Due Date",
            type: "date" as const
          },
          {
            key: "resolvedAt",
            label: "Resolved",
            type: "date" as const
          },
          {
            key: "tags",
            label: "Tags",
            type: "tags" as const
          },
          {
            key: "location",
            label: "Location",
            type: "text" as const
          },
          {
            key: "department",
            label: "Department",
            type: "text" as const
          }
        ]
      },
      {
        key: "details",
        label: "Details",
        // icon: PencilIcon,
        fields: [
          {
            key: "estimatedHours",
            label: "Estimated Hours",
            type: "number" as const
          },
          {
            key: "actualHours",
            label: "Actual Hours",
            type: "number" as const
          },
          {
            key: "customFields",
            label: "Custom Fields",
            type: "json" as const
          }
        ]
      },
      {
        key: "activity",
        label: "Activity",
        // icon: PieChartIcon,
        render: (caseItem: CaseEntity) => (
          <div className="space-y-6">
            {/* Comments Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <ChatIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Comments ({caseItem.comments.length})
                </h4>
              </div>
              
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
            </div>

            {/* Attachments Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <FileIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Attachments ({caseItem.attachments.length})
                </h4>
              </div>
              
              {caseItem.attachments.length > 0 ? (
                <div className="space-y-2">
                  {caseItem.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border">
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

            {/* Time Tracking */}
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
              
              {caseItem.estimatedHours && caseItem.actualHours && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{Math.round((caseItem.actualHours / caseItem.estimatedHours) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((caseItem.actualHours / caseItem.estimatedHours) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }
    ],
    actions: [
      {
        key: "edit",
        label: "Edit Case",
        // icon: PencilIcon,
        variant: "primary",
        onClick: (caseItem: CaseEntity, closePreview: () => void) => {
          closePreview();
          navigate(`/cases/${caseItem.id}/edit`);
        }
      },
      {
        key: "assign",
        label: "Assign",
        // icon: UserIcon,
        variant: "light",
        onClick: (caseItem: CaseEntity, closePreview: () => void) => {
          console.log("Assigning case:", caseItem.id);
          // Would open assignment modal
          closePreview();
        }
      },
      {
        key: "close",
        label: "Close Case",
        // icon: CheckCircleIcon,
        variant: "warning",
        onClick: (caseItem: CaseEntity, closePreview: () => void) => {
          console.log("Closing case:", caseItem.id);
          closePreview();
        },
        condition: (caseItem: CaseEntity) => caseItem.status !== "closed" && caseItem.status !== "resolved"
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
      key: "assignedTo",
      label: "Assigned To",
      type: "select" as const,
      options: [
        { value: "John Smith", label: "John Smith" },
        { value: "Alice Johnson", label: "Alice Johnson" },
        { value: "Mike Davis", label: "Mike Davis" },
        { value: "Security Team", label: "Security Team" }
      ]
    },
    {
      key: "createdAt",
      label: "Created Date",
      type: "date-range" as const
    },
    {
      key: "estimatedHours",
      label: "Estimated Hours",
      type: "number-range" as const,
      min: 0,
      max: 100
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
      condition: (items: CaseEntity[]) => items.some(c => c.status !== "closed"),
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
      columns: ["caseNumber", "title", "description", "status", "priority", "category", "assignedTo", "reporter", "createdAt", "dueDate"]
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
    const statusConfig = {
      "open": { icon: FolderIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800", label: "Open" },
      "in-progress": { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800", label: "In Progress" },
      "resolved": { icon: CheckCircleIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800", label: "Resolved" },
      "closed": { icon: CheckCircleIcon, color: "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800", label: "Closed" },
      "escalated": { icon: AlertHexaIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800", label: "Escalated" }
    }[caseItem.status];

    const priorityConfig = {
      "low": { color: "text-green-600", label: "Low" },
      "medium": { color: "text-yellow-600", label: "Medium" },
      "high": { color: "text-orange-600", label: "High" },
      "critical": { color: "text-red-600", label: "Critical" }
    }[caseItem.priority];

    const Icon = statusConfig.icon;

    return (
      <>
        <div className="xl:flex items-start justify-between mb-4">
          <div className="xl:flex items-center gap-3 min-w-0 xl:flex-1">
            <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 hidden xl:block" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {caseItem.caseNumber}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {caseItem.title}
              </p>
            </div>
          </div>
          <div className="xl:flex flex-col gap-1 items-end flex-shrink-0">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} mr-2 xl:mr-0`}>
              {statusConfig.label}
            </span>
            <span className={`text-xs font-medium ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2">
          {caseItem.description}
        </p>
        
        <div className="xl:flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="xl:flex items-center gap-1">
            <UserIcon className="w-4 h-4 hidden xl:block" />
            <span>{caseItem.assignedTo}</span>
          </div>
          <div className="xl:flex items-center gap-1">
            <CalenderIcon className="w-4 h-4 hidden xl:block" />
            <span>{formatDate(caseItem.createdAt)}</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="xl:flex items-center justify-between">
          <div className="xl:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {/*
            {caseItem.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <ChatIcon className="w-3 h-3" />
                <span>{caseItem.comments.length}</span>
              </div>
            )}
            */}
            {/*
            {caseItem.attachments.length > 0 && (
              <div className="xl:flex items-center gap-1">
                <FileIcon className="w-3 h-3" />
                <span>{caseItem.attachments.length}</span>
              </div>
            )}
            */}
            {/* {caseItem.location && ( */}
              <div className="xl:flex items-center gap-1 min-h-4">
                {/* <MapPinIcon className="w-3 h-3" /> */}
                <span>{caseItem.location || ""}</span>
              </div>
            {/* )} */}
          </div>
          
          {caseItem.dueDate && (
            <div className="flex items-center gap-1 text-xs">
              {/* <FlagIcon className="w-3 h-3 text-orange-500" /> */}
              <span className="text-orange-600 dark:text-orange-400">
                Due {formatDate(caseItem.dueDate)}
              </span>
            </div>
          )}
        </div>

        {/*
        {caseItem.tags.length > 0 && (
          <div className="xl:flex flex-wrap gap-1 mt-3">
            {caseItem.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                {tag}
              </span>
            ))}
            {caseItem.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded">
                +{caseItem.tags.length - 3}
              </span>
            )}
          </div>
        )}
        */}
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
        data={data}
        config={config}
        previewConfig={previewConfig}
        features={{
          search: true,
          sorting: true,
          filtering: true,
          pagination: true,
          bulkActions: true,
          export: true,
          realTimeUpdates: false, // Disabled for demo
          keyboardShortcuts: true
        }}
        onCreate={() => navigate("/case/creation")}
        onRefresh={() => window.location.reload()}
        onDelete={handleDelete}
        onItemAction={handleAction}
        renderCard={renderCard}
        searchFields={["caseNumber", "title", "description", "assignedTo", "reporter"]}
        bulkActions={bulkActions}
        exportOptions={exportOptions}
        advancedFilters={advancedFilters}
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
        enableDebug={true} // Enable debug mode to troubleshoot
      />
    </>
  );
};

export default CaseHistoryComponent;
