// /src/components/admin/HierarchyItem.tsx
import React from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import type { HierarchyAction, HierarchyAnalytics, HierarchyConfig, HierarchyItem, LevelConfig } from "@/types/hierarchy";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

interface HierarchyItemProps {
  analytics?: HierarchyAnalytics;
  canHaveChildren?: boolean;
  childCount?: number;
  config: HierarchyConfig;
  indentLevel?: number;
  isExpanded?: boolean;
  isLoading?: boolean;
  // isParent: boolean;
  isSelected?: boolean;
  item: HierarchyItem;
  levelConfig: LevelConfig;
  onCreateChild?: (
    // parentId: string
  ) => void;
  // onDelete?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  // onSelect?: () => void;
  onToggleExpansion?: () => void;
  // onUpdate?: (item: HierarchyItem) => void;
}

export const HierarchyItemComponent: React.FC<HierarchyItemProps> = ({
  analytics,
  canHaveChildren = true,
  childCount = 0,
  config,
  // indentLevel = 0,
  isExpanded = false,
  isLoading = false,
  // isParent,
  isSelected = false,
  item,
  levelConfig,
  onCreateChild,
  // onDelete,
  onLoadingChange,
  // onSelect,
  onToggleExpansion,
  // onUpdate
}) => {
  const actions = levelConfig.actions || [];
  // const actions = isParent ? config.parentActions : config.childActions;
  const priorityConfig = config.priorityLevels?.find(
    p => p.value.toString() === item.priority?.toString()
  );

  const getDisplayValue = (field: string) => {
    const keys = field.split(".");
    let value: unknown = item;
    for (const key of keys) {
      if (typeof value === "object" && value !== null && key in value) {
        value = (value as Record<string, unknown>)[key];
      }
      else {
        value = undefined;
        break;
      }
    }
    return value;
  };

  const handleActionClick = (action: HierarchyAction) => {
    if (onLoadingChange) {
      onLoadingChange(true);
    }
    
    try {
      action.onClick(item);
    }
    finally {
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    }
  };

  const primaryLabel = getDisplayValue(config.displayFields.primaryLabel);
  const secondaryLabel = config.displayFields.secondaryLabel 
    ? getDisplayValue(config.displayFields.secondaryLabel)
    : null;
  
  // Generate metadata display based on level configuration
  const generateMetadataDisplay = (): string[] => {
    const metadataItems: string[] = [];
    const metadataConfig = levelConfig.metadataDisplay;

    // Use custom formatter if provided
    if (metadataConfig?.customMetadataFormatter) {
      return metadataConfig.customMetadataFormatter(item, childCount);
    }

    // Show child count with custom label
    if (metadataConfig?.showChildCount !== false && canHaveChildren && childCount > 0) {
      const childLabel = levelConfig.childCountLabel;
      if (childLabel) {
        const label = childCount === 1 ? childLabel.singular : childLabel.plural;
        metadataItems.push(`${childCount} ${label}`);
      }
      else {
        metadataItems.push(`${childCount} child items`);
      }
    }

    // Show metadata fields if enabled
    if (metadataConfig?.showMetadata !== false) {
      config.displayFields.metadataFields?.forEach(field => {
        const value = getDisplayValue(field);
        if (value !== undefined && value !== null) {
          metadataItems.push(String(value));
        }
      });
    }

    return metadataItems;
  };

  const metadataItems = generateMetadataDisplay();

  // Calculate background color based on level
  const getBackgroundColor = () => {
    if (isSelected) {
      return "bg-blue-100 dark:bg-blue-800";
    }
    if (levelConfig?.styling?.backgroundColor) {
      return levelConfig.styling.backgroundColor;
    }
    
    // Default background colors by level
    const levelBackgrounds = [
      "", // Level 0 - default
      "bg-gray-50 dark:bg-gray-800", // Level 1
      "bg-gray-100 dark:bg-gray-700", // Level 2
      "bg-gray-150 dark:bg-gray-650", // Level 3
    ];
    
    return levelBackgrounds[item.level || 0] || levelBackgrounds[levelBackgrounds.length - 1];
  };

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 xl:flex space-y-2 xl:space-y-0 items-center justify-between border border-gray-200 dark:border-gray-700 ${getBackgroundColor()}`}
      // className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 xl:flex space-y-2 xl:space-y-0 items-center justify-between border border-gray-200 dark:border-gray-700 ${
      //   isSelected ? "bg-blue-100 dark:bg-blue-800" : ""
      // } ${!isParent ? "border-gray-300 dark:border-gray-600" : ""}`}
      onClick={onToggleExpansion}
      // onClick={onSelect}
    >
      <div className="flex items-center space-x-3">
        {/* Expansion Button for Parent Items */}
        {
          // isParent && 
          canHaveChildren && onToggleExpansion && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpansion();
              }}
              className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-400 dark:text-gray-500"
            >
              {isExpanded ? (
                // config.collapseIcon
                levelConfig.collapseIcon
                || <ChevronDown className="w-4 h-4" />
              ) : (
                // config.expandIcon
                levelConfig.expandIcon
                || <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )
        }
        
        <div className="flex items-center space-x-3">
          {/* Level Icon */}
          {levelConfig.icon || (
            canHaveChildren ? (
              isExpanded ? (
                <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              ) : (
                <Folder className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              )
            ) : (
              <div className="w-4 h-4" />
            )
          )}
          {/* Icon */}
          {/*
          {isParent ? (
            config.parentIcon || 
            (isExpanded ? (
              <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            ) : (
              <Folder className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            ))
          ) : (
            config.childIcon || <div className="w-4 h-4" />
          )}
          */}
          
          {/* Custom Icon */}
          {item.icon && (
            typeof item.icon === "string" ? (
              <span className="text-2xl">{item.icon}</span>
            ) : (
              item.icon
            )
          )}
          
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`font-semibold text-gray-800 dark:text-gray-100`}
                // className={`font-${isParent ? "semibold" : "medium"} text-gray-800 dark:text-gray-100`}
              >
                {primaryLabel as React.ReactNode}
              </span>
              {secondaryLabel as React.ReactNode && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({secondaryLabel as React.ReactNode})
                </span>
              )}
              {priorityConfig && (
                <Badge className={priorityConfig.color} size="xs">
                  {priorityConfig.label}
                </Badge>
              )}
              {!item.active && config.showInactiveLabel && (
                <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                  Inactive
                </span>
              )}
              
              {/*
              <span className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                Level {item.level}
              </span>
              */}
            </div>
            
            {/* Dynamic Metadata Display */}
            {metadataItems.length > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {metadataItems.join(' • ')}
                {analytics && (
                  <span className="ml-2">
                    {analytics.usageCount !== undefined && ` • ${analytics.usageCount} uses`}
                    {analytics.slaCompliance !== undefined && ` • ${analytics.slaCompliance}% SLA`}
                  </span>
                )}
              </div>
            )}
            
            {/* Metadata Display */}
            {/*
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {
                canHaveChildren && childCount > 0
                // isParent && childCount !== undefined 
                && (
                  <span>{childCount} child items</span>
                )
              }
              
              {config.displayFields.metadataFields?.map((field, index) => {
                const value = getDisplayValue(field);
                return value ? (
                  <span key={field}>
                    {(index > 0 || (
                      canHaveChildren && childCount > 0
                      // isParent && childCount !== undefined
                    )) && " • "}
                    {value as React.ReactNode}
                  </span>
                ) : null;
              })}
              
              {analytics && (
                <span className="ml-2">
                  {analytics.usageCount !== undefined && `• ${analytics.usageCount} uses`}
                  {analytics.slaCompliance !== undefined && ` • ${analytics.slaCompliance}% SLA`}
                </span>
              )}
            </div>
            */}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-1">
        {/* Create Child Action */}
        {canHaveChildren && onCreateChild && (
          <Button
            onClick={() => {
              onCreateChild();
            }}
            variant="primary"
            size="xs"
            disabled={isLoading}
          >
            {levelConfig.createChildLabel || "Create Child"}
          </Button>
        )}
        {/* Create Child Action for Parent Items */}
        {/*
        {isParent && onCreateChild && (
          <Button
            onClick={() => {
              onCreateChild(item.id);
            }}
            variant="primary"
            size="xs"
            disabled={isLoading}
          >
            Create Child
          </Button>
        )}
        */}
        
        {/* Dynamic Actions */}
        {actions.map((action, index) => {
          if (action.showWhen && !action.showWhen(item)) {
            return null;
          }
          
          return (
            <Button
              disabled={isLoading}
              key={index}
              size={action.size || "xs"}
              variant={action.variant || "primary"}
              onClick={() => handleActionClick(action)}
            >
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default HierarchyItemComponent;
