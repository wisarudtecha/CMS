// /src/components/admin/user-management/organization/OrganizationHierarchyView.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FileIcon } from "@/icons";
import type {
  Department,
  Command,
  Station,
  // Organization
} from "@/types/organization";
import type { HierarchyItem, HierarchyConfig } from "@/types/hierarchy";
import HierarchyView from "@/components/admin/HierarchyView";

interface OrganizationHierarchyViewProps {
  departments: Department[];
  commands: Command[];
  stations: Station[];
  // organizations: Organization[];
  showInactive: boolean;
  onDepartmentsChange?: (departments: Department[]) => void;
  onCommandsChange?: (commands: Command[]) => void;
  onStationsChange?: (stations: Station[]) => void;
  // onOrganizationsChange?: (organizations: Organization[]) => void;
}

const OrganizationHierarchyView: React.FC<OrganizationHierarchyViewProps> = ({
  departments,
  commands,
  stations,
  // organizations,
  showInactive,
  onDepartmentsChange,
  onCommandsChange,
  onStationsChange,
  // onOrganizationsChange
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Convert department, commands and stations to generic hierarchy items
  const convertToHierarchyItems = useCallback((): HierarchyItem[] => {
    const items: HierarchyItem[] = [];
    
    // Add parent items (departments)
    (departments || []).forEach(dept => {
      items.push({
        id: dept.id,
        parentId: null, // Explicitly set to null for root items
        name: dept.th,
        secondaryName: dept.en,
        // icon: dept.icon,
        active: dept.active,
        level: 0,
        metadata: {
          createdAt: dept.createdAt,
          updatedAt: dept.updatedAt
        }
      });
    });
    
    // Add child items for department (commands)
    (commands || []).forEach(cmd => {
      const parentType = departments?.find(dept => dept.deptId === cmd.deptId);
      if (parentType) {
        items.push({
          id: cmd.id,
          parentId: parentType.id,
          name: cmd.th,
          secondaryName: cmd.en,
          active: cmd.active,
          // priority: cmd.priority,
          level: 1,
          metadata: {
            deptId: cmd.deptId
          }
        });
      }
    });

    // Add child items for command (stations)
    (stations || []).forEach(stn => {
      const parentType = commands?.find(cmd => cmd.commId === stn.commId);
      if (parentType) {
        items.push({
          id: stn.id,
          parentId: parentType.id,
          name: stn.th,
          secondaryName: stn.en,
          active: stn.active,
          // priority: stn.priority,
          level: 2,
          metadata: {
            deptId: stn.deptId,
            commId: stn.commId
          }
        });
      }
    });
    
    return items;
  }, [departments, commands, stations]);

  const [hierarchyItems, setHierarchyItems] = useState<HierarchyItem[]>(
    convertToHierarchyItems()
  );

  // Update hierarchy items when props change
  useEffect(() => {
    setHierarchyItems(convertToHierarchyItems());
  }, [departments, commands, stations, convertToHierarchyItems]);

  const handleDelete = useCallback(async (item: HierarchyItem, type: string) => {
    const confirmMessage = `Are you sure you want to delete this ${type}? This will also delete all its children.`;
    
    if (confirm(confirmMessage)) {
      setIsLoading(true);
      
      setTimeout(() => {
        if (type === "department" && onDepartmentsChange) {
          // Also remove associated commands and stations
          const updatedDepartments = departments.filter(dept => dept.id !== item.id);
          const remainingCommands = commands.filter(cmd => cmd.deptId !== item.id);
          const remainingStations = stations.filter(stn => {
            const command = commands.find(cmd => cmd.id === stn.commId);
            return command?.deptId !== item.id;
          });
          
          onDepartmentsChange(updatedDepartments);
          if (onCommandsChange) {
            onCommandsChange(remainingCommands);
          }
          if (onStationsChange) {
            onStationsChange(remainingStations);
          }
        } 
        else if (type === "command" && onCommandsChange) {
          // Also remove associated stations
          const updatedCommands = commands.filter(cmd => cmd.id !== item.id);
          const remainingStations = stations.filter(stn => stn.id !== item.id);
          
          onCommandsChange(updatedCommands);
          if (onStationsChange) {
            onStationsChange(remainingStations);
          }
        }
        else if (type === "station" && onStationsChange) {
          const updatedStations = stations.filter(stn => stn.id !== item.id);
          onStationsChange(updatedStations);
        }
        setIsLoading(false);
      }, 1000);
    }
  }, [departments, commands, stations, onDepartmentsChange, onCommandsChange, onStationsChange]);

  // Configuration for the hierarchy view
  const hierarchyConfig: HierarchyConfig = useMemo(() => ({
    // childIcon: <FileIcon className="w-4 h-4 text-green-600 dark:text-green-300" />,
    // defaultExpanded: departments?.slice(0, 1).map(dept => dept.id),
    displayFields: {
      primaryLabel: "name",
      secondaryLabel: "secondaryName",
      metadataFields: []
    },
    maxLevels: 3,
    showInactiveLabel: true,
    levels: [
      // Level 0
      {
        canHaveChildren: true,
        childCountLabel: {
          plural: "commands",
          singular: "command"
        },
        createChildLabel: "Add Command",
        emptyChildrenMessage: "No commands defined for this department",
        // icon: <FileIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />,
        metadataDisplay: {
          showChildCount: true,
          showMetadata: false, // We'll use custom formatter
          customMetadataFormatter: (_, childCount) => {
            const metadata: string[] = [];
            
            // Show child count with custom label
            if (childCount > 0) {
              metadata.push(`${childCount} ${childCount === 1 ? 'command' : 'commands'}`);
            }
            
            return metadata;
          }
        },
        styling: {
          indentSize: 32,
        },
        actions: [
          {
            label: "Edit",
            variant: "warning",
            onClick: (item) => handleEditDepartment(item)
          },
          {
            label: "Delete",
            variant: "outline",
            onClick: (item) => handleDelete(item, "department")
          }
        ]
      },
      // Level 1
      {
        canHaveChildren: true,
        createChildLabel: "Add Station",
        metadataDisplay: {
          showChildCount: true,
          showMetadata: true,
          customMetadataFormatter: (_, childCount) => {
            const metadata: string[] = [];

            // Show child count with custom label
            if (childCount > 0) {
              metadata.push(`${childCount} ${childCount === 1 ? 'station' : 'stations'}`);
            }

            return metadata;
          }
        },
        styling: {
          backgroundColor: "bg-gray-100 dark:bg-gray-800"
        },
        actions: [
          {
            label: "Edit",
            variant: "warning",
            onClick: (item) => handleEditCommand(item)
          },
          {
            label: "Delete",
            variant: "outline",
            onClick: (item) => handleDelete(item, "command")
          }
        ]
      },
      // Level 2
      {
        canHaveChildren: false,
        icon: <FileIcon className="w-4 h-4 text-green-600 dark:text-green-300" />,
        metadataDisplay: {
          showChildCount: false,
          showMetadata: false,
          customMetadataFormatter: () => {
            const metadata: string[] = [];
            return metadata;
          }
        },
        styling: {
          backgroundColor: "bg-gray-200 dark:bg-gray-700"
        },
        actions: [
          {
            label: "Edit",
            variant: "warning",
            onClick: (item) => handleEditStation(item)
          },
          {
            label: "Delete",
            variant: "outline",
            onClick: (item) => handleDelete(item, "station")
          }
        ]
      }
    ]
  }), [handleDelete]);

  // Event handlers (converted to work with generic hierarchy items)
  const handleEditDepartment = (item: HierarchyItem) => {
    // Implementation for editing department
    console.log("Edit department:", item);
  };

  const handleEditCommand = (item: HierarchyItem) => {
    // Implementation for editing command
    console.log("Edit command:", item);
  };

  const handleEditStation = (item: HierarchyItem) => {
    // Implementation for editing station
    console.log("Edit station:", item);
  };

  const handleCreateChild = (
    parentId: string,
    level: number
  ) => {
    console.log(`Create child at level ${level} for parent ${parentId}`);
    
    if (level === 1) {
      // Create command
      console.log("Create new command for department:", parentId);
    }
    else if (level === 2) {
      // Create station
      console.log('Create new station for command:', parentId);
    }
  };

  return (
    <HierarchyView
      config={hierarchyConfig}
      isLoading={isLoading}
      items={hierarchyItems}
      showInactive={showInactive}
      onCreateChild={(parentId) => handleCreateChild(parentId, 0)}
      onLoadingChange={setIsLoading}
    />
  );
};

export default OrganizationHierarchyView;
