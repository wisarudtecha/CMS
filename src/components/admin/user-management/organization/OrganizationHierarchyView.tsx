// /src/components/admin/user-management/organization/OrganizationHierarchyView.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CloseIcon, FileIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import type {
  Department,
  Command,
  Station,
  // Organization
} from "@/types/organization";
import type { HierarchyItem, HierarchyConfig } from "@/types/hierarchy";
import HierarchyView from "@/components/admin/HierarchyView";
import Button from "@/components/ui/button/Button";

interface OrganizationHierarchyViewProps {
  departments: Department[];
  commands: Command[];
  stations: Station[];
  // organizations: Organization[];
  showInactive: boolean;
  handleDepartmentDelete: (id: number) => void;
  handleDepartmentReset: () => void;
  handleCommandDelete: (id: number) => void;
  handleCommandReset: () => void;
  handleStationDelete: (id: number) => void;
  handleStationReset: () => void;
  setDeptId: (id: string) => void;
  setDeptIsOpen: (isOpen: boolean) => void;
  setDeptTh: (th: string) => void;
  setDeptEn: (en: string) => void;
  setCommId: (id: string) => void;
  setCommIsOpen: (isOpen: boolean) => void;
  setCommDeptId: (deptId: string) => void;
  setCommandTh: (th: string) => void;
  setCommandEn: (en: string) => void;
  setStnId: (id: string) => void;
  setStnIsOpen: (isOpen: boolean) => void;
  setStnDeptId: (deptId: string) => void;
  setStnCommId: (commId: string) => void;
  setStnTh: (th: string) => void;
  setStnEn: (en: string) => void;
  // onDepartmentsChange?: (departments: Department[]) => void;
  // onCommandsChange?: (commands: Command[]) => void;
  // onStationsChange?: (stations: Station[]) => void;
  // onOrganizationsChange?: (organizations: Organization[]) => void;
}

const OrganizationHierarchyView: React.FC<OrganizationHierarchyViewProps> = ({
  departments,
  commands,
  stations,
  // organizations,
  showInactive,
  handleDepartmentDelete,
  handleDepartmentReset,
  handleCommandDelete,
  handleCommandReset,
  handleStationDelete,
  handleStationReset,
  setDeptId,
  setDeptIsOpen,
  setDeptTh,
  setDeptEn,
  setCommId,
  setCommIsOpen,
  setCommDeptId,
  setCommandTh,
  setCommandEn,
  setStnId,
  setStnIsOpen,
  setStnDeptId,
  setStnCommId,
  setStnTh,
  setStnEn,
  // onDepartmentsChange,
  // onCommandsChange,
  // onStationsChange,
  // onOrganizationsChange
}) => {
  const [deleteId, setDeleteId] = useState(0);
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteHeader, setDeleteHeader] = useState("");
  const [deleteType, setDeleteType] = useState("");
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
    // Check if item has children
    const hasChildren = hierarchyItems.some(
      hierarchyItem => hierarchyItem.parentId === item.id
    );

    if (hasChildren) {
      const childLabelMap: Record<string, string> = {
        "department": "commands",
        "command": "stations",
      };
      
      const childLabel = childLabelMap[type] || "child items";
      
      alert(
        `Cannot delete this ${type}. It has ${childLabel}. ` +
        `Please remove all ${childLabel} first before deleting this item.`
      );
      return;
    }

    const confirmMessage = `Are you sure you want to delete this ${type}?${item?.level !== undefined && item.level > 2 ? " This will also delete all its children." : ""}`;
    
    // if (confirm(confirmMessage)) {
      setIsLoading(true);

      setDeleteId(item.id as number);
      setDeleteIsOpen(true);
      setDeleteMessage(confirmMessage);
      setDeleteType(type);
      
      // setTimeout(() => {
        if (type === "department"
          // && onDepartmentsChange
        ) {
          // handleDepartmentDelete(item.id as number);

          setDeleteHeader(`Department: ${item.name}`);

          // Also remove associated commands and stations
          // const updatedDepartments = departments.filter(dept => dept.id !== item.id);
          // const remainingCommands = commands.filter(cmd => cmd.deptId !== item.id);
          // const remainingStations = stations.filter(stn => {
          //   const command = commands.find(cmd => cmd.id === stn.commId);
          //   return command?.deptId !== item.id;
          // });
          
          // onDepartmentsChange(updatedDepartments);
          // if (onCommandsChange) {
          //   onCommandsChange(remainingCommands);
          // }
          // if (onStationsChange) {
          //   onStationsChange(remainingStations);
          // }
        } 
        else if (type === "command"
          // && onCommandsChange
        ) {
          // handleCommandDelete(item.id as number);

          setDeleteHeader(`Command: ${item.name}`);

          // Also remove associated stations
          // const updatedCommands = commands.filter(cmd => cmd.id !== item.id);
          // const remainingStations = stations.filter(stn => stn.id !== item.id);
          
          // onCommandsChange(updatedCommands);
          // if (onStationsChange) {
          //   onStationsChange(remainingStations);
          // }
        }
        else if (type === "station"
          // && onStationsChange
        ) {
          // handleStationDelete(item.id as number);

          setDeleteHeader(`Station: ${item.name}`);

          // const updatedStations = stations.filter(stn => stn.id !== item.id);
          // onStationsChange(updatedStations);
        }
        setIsLoading(false);
      // }, 1000);
    // }
  }, [
    hierarchyItems,
    // handleDepartmentDelete,
    // handleCommandDelete,
    // handleStationDelete
  ]);

  const handleDeleteSelection = (id: number, type: string) => {
    if (type === "department") {
      handleDepartmentDelete(id);
    }
    else if (type === "command") {
      handleCommandDelete(id);
    }
    else if (type === "station") {
      handleStationDelete(id);
    }
  }

  // Event handlers (converted to work with generic hierarchy items)
  const handleEditDepartment = useCallback((item: HierarchyItem) => {
    // Implementation for editing department
    // console.log("Edit department:", item);

    handleCommandReset();
    handleStationReset();
    setDeptId(item.id as string);
    setDeptTh(item.name || "");
    setDeptEn(item.secondaryName || "");
    setDeptIsOpen(true);
    setCommIsOpen(false);
    setStnIsOpen(false);
  }, [handleCommandReset, handleStationReset, setDeptId, setDeptTh, setDeptEn, setDeptIsOpen, setCommIsOpen, setStnIsOpen]);

  const handleEditCommand = useCallback((item: HierarchyItem) => {
    // Implementation for editing command
    // console.log("Edit command:", item);

    handleDepartmentReset();
    handleStationReset();
    setCommId(item.id as string);
    setCommandTh(item.name || "");
    setCommandEn(item.secondaryName || "");
    setCommDeptId(item?.metadata?.deptId as string || "");
    setDeptIsOpen(false);
    setCommIsOpen(true);
    setStnIsOpen(false);
  }, [handleDepartmentReset, handleStationReset, setCommandEn, setCommandTh, setCommDeptId, setCommId, setCommIsOpen, setDeptIsOpen, setStnIsOpen]);

  const handleEditStation = useCallback((item: HierarchyItem) => {
    // Implementation for editing station
    // console.log("Edit station:", item);

    handleDepartmentReset();
    handleCommandReset();
    setStnId(item.id as string);
    setStnTh(item.name || "");
    setStnEn(item.secondaryName || "");
    setStnCommId(item?.metadata?.commId as string || "");
    setStnDeptId(item?.metadata?.deptId as string || "");
    setDeptIsOpen(false);
    setCommIsOpen(false);
    setStnIsOpen(true);
  }, [handleDepartmentReset, handleCommandReset, setStnId, setStnTh, setStnEn, setStnCommId, setStnDeptId, setDeptIsOpen, setCommIsOpen, setStnIsOpen]);

  // Configuration for the hierarchy view
  const hierarchyConfig: HierarchyConfig = useMemo(() => ({
    // childIcon: <FileIcon className="w-4 h-4 text-green-600 dark:text-green-300" />,
    // defaultExpanded: departments?.slice(0, 1).map(dept => dept.id),
    maxLevels: 3,
    showInactiveLabel: true,
    displayFields: {
      primaryLabel: "name",
      secondaryLabel: "secondaryName",
      metadataFields: []
    },
    levels: [
      // Level 0
      {
        canHaveChildren: true,
        createChildLabel: "Add Command",
        emptyChildrenMessage: "No commands defined for this department",
        // icon: <FileIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />,
        childCountLabel: {
          plural: "commands",
          singular: "command"
        },
        metadataDisplay: {
          showChildCount: true,
          showMetadata: false, // We"ll use custom formatter
          customMetadataFormatter: (_, childCount) => {
            const metadata: string[] = [];
            // Show child count with custom label
            if (childCount > 0) {
              metadata.push(`${childCount} ${childCount === 1 ? "command" : "commands"}`);
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
        emptyChildrenMessage: "No station defined for this command",
        childCountLabel: {
          plural: "stations",
          singular: "station"
        },
        metadataDisplay: {
          showChildCount: true,
          showMetadata: true,
          customMetadataFormatter: (_, childCount) => {
            const metadata: string[] = [];
            // Show child count with custom label
            if (childCount > 0) {
              metadata.push(`${childCount} ${childCount === 1 ? "station" : "stations"}`);
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
  }), [handleDelete, handleEditCommand, handleEditDepartment, handleEditStation]);

  const handleCreateChild = (
    _parentId: string,
    level: number
  ) => {
    // console.log(`Create child at level ${level} for parent ${parentId}`);

    handleDepartmentReset();
    handleCommandReset();
    handleStationReset();
    
    if (level === 1) {
      // Create command
      // console.log("Create new command for department:", parentId);

      setDeptIsOpen(false);
      setCommIsOpen(true);
      setStnIsOpen(false);
    }
    else if (level === 2) {
      // Create station
      // console.log("Create new station for command:", parentId);

      setDeptIsOpen(false);
      setCommIsOpen(false);
      setStnIsOpen(true);
    }
    else {
      setDeptIsOpen(false);
      setCommIsOpen(false);
      setStnIsOpen(false);
    }
  };

  return (
    <>
      <HierarchyView
        config={hierarchyConfig}
        isLoading={isLoading}
        items={hierarchyItems}
        showInactive={showInactive}
        // onCreateChild={(parentId) => handleCreateChild(parentId, 0)}
        onCreateChild={(parentId, level) => handleCreateChild(parentId, level)}
        onLoadingChange={setIsLoading}
      />

      <Modal isOpen={deleteIsOpen} onClose={() => setDeleteIsOpen(false)} className="max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">
            Delete {deleteHeader}
          </h3>
          <Button onClick={() => setDeleteIsOpen(false)} size="sm" variant="ghost">
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          {deleteMessage}
        </div>
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <Button onClick={() => setDeleteIsOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={() => {
              handleDeleteSelection(deleteId, deleteType);
              setDeleteIsOpen(false);
            }} variant="error">Confirm</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default OrganizationHierarchyView;
