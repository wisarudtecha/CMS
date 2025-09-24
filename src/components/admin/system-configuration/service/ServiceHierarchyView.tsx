// /src/components/admin/system-configuration/service/ServiceHierarchyView.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FileIcon } from "@/icons";
import type {
  EnhancedCaseSubType,
  EnhancedCaseType,
  // TypeAnalytics
} from "@/types/case";
import type { HierarchyItem, HierarchyConfig, PriorityLevel } from "@/types/hierarchy";
import HierarchyView from "@/components/admin/HierarchyView";

const PRIORITY_LEVELS: PriorityLevel[] = [
  { value: 0, label: "High", color: "bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700" },
  { value: 1, label: "High", color: "bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700" },
  { value: 2, label: "High", color: "bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700" },
  { value: 3, label: "High", color: "bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 border-red-200 dark:border-red-700" },
  { value: 4, label: "Medium", color: "bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700" },
  { value: 5, label: "Medium", color: "bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700" },
  { value: 6, label: "Medium", color: "bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700" },
  { value: 7, label: "Low", color: "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 border-green-200 dark:border-green-700" },
  { value: 8, label: "Low", color: "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 border-green-200 dark:border-green-700" },
  { value: 9, label: "Low", color: "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 border-green-200 dark:border-green-700" },
];

interface ServiceHierarchyViewProps {
  // analytics: Record<string, TypeAnalytics>;
  caseSubTypes: EnhancedCaseSubType[];
  caseTypes: EnhancedCaseType[];
  // filteredTypes: EnhancedCaseType[];
  showInactive: boolean;
  onCaseSubTypesChange?: (caseSubTypes: EnhancedCaseSubType[]) => void;
  onCaseTypesChange?: (caseTypes: EnhancedCaseType[]) => void;
  // setCaseTypes: React.Dispatch<React.SetStateAction<EnhancedCaseType[]>>;
  // setIsLoading: (value: boolean) => void;
}

const ServiceHierarchyView: React.FC<ServiceHierarchyViewProps> = ({
  // analytics,
  caseSubTypes,
  caseTypes,
  // filteredTypes,
  showInactive,
  onCaseSubTypesChange,
  onCaseTypesChange,
  // setCaseTypes,
  // setIsLoading
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Convert case types and sub-types to generic hierarchy items
  const convertToHierarchyItems = useCallback((): HierarchyItem[] => {
    const items: HierarchyItem[] = [];
    
    // Add parent items (case types)
    (caseTypes || []).forEach(type => {
      items.push({
        id: type.id,
        parentId: null, // Explicitly set to null for root items
        name: type.th,
        secondaryName: type.en,
        icon: type.icon,
        active: type.active,
        level: 0,
        metadata: {
          typeId: type.typeId,
          color: type.color,
          createdAt: type.createdAt,
          updatedAt: type.updatedAt
        }
      });
    });
    
    // Add child items (case sub-types)
    (caseSubTypes || []).forEach(subType => {
      const parentType = caseTypes?.find(type => type.typeId === subType.typeId);
      if (parentType) {
        items.push({
          id: subType.id,
          parentId: parentType.id,
          name: subType.th,
          secondaryName: subType.en,
          active: subType.active,
          priority: subType.priority,
          level: 1,
          metadata: {
            sTypeCode: subType.sTypeCode,
            caseSla: subType.caseSla,
            skillRequirements: subType.userSkillList,
            // skillRequirements: subType.skillRequirements,
            typeId: subType.typeId
          }
        });
      }
    });
    
    return items;
  }, [caseSubTypes, caseTypes]);

  const [hierarchyItems, setHierarchyItems] = useState<HierarchyItem[]>(
    convertToHierarchyItems()
  );

  // Update hierarchy items when props change
  useEffect(() => {
    setHierarchyItems(convertToHierarchyItems());
  }, [caseSubTypes, caseTypes, convertToHierarchyItems]);

  const handleDelete = useCallback(async (item: HierarchyItem, type: string) => {
    const confirmMessage = `Are you sure you want to delete this ${type}? This will also delete all its children.`;
    
    if (confirm(confirmMessage)) {
      setIsLoading(true);
      
      setTimeout(() => {
        if (type === "caseType" && onCaseTypesChange) {
          // Also remove associated sub-types
          const updatedTypes = caseTypes.filter(ct => ct.id !== item.id);
          const remainingSubTypes = caseSubTypes.filter(cst => cst.id !== item.id);
          
          onCaseTypesChange(updatedTypes);
          if (onCaseSubTypesChange) {
            onCaseSubTypesChange(remainingSubTypes);
          }
        }
        else if (type === "caseSubType" && onCaseSubTypesChange) {
          const updatedSubTypes = caseSubTypes.filter(cst => cst.id !== item.id);
          onCaseSubTypesChange(updatedSubTypes);
        }
        setIsLoading(false);
      }, 1000);
    }
  }, [caseSubTypes, caseTypes, onCaseSubTypesChange, onCaseTypesChange]);

  // Configuration for the hierarchy view
  const hierarchyConfig: HierarchyConfig = useMemo(() => ({
    // childIcon: <FileIcon className="w-4 h-4 text-green-600 dark:text-green-300" />,
    // defaultExpanded: caseTypes?.slice(0, 1).map(ct => ct.id),
    displayFields: {
      primaryLabel: "name",
      secondaryLabel: "secondaryName",
      metadataFields: []
      // metadataFields: ["metadata.caseSla", "metadata.skillRequirements.length"]
    },
    maxLevels: 2,
    priorityLevels: PRIORITY_LEVELS,
    showInactiveLabel: true,
    levels: [
      // Level 0
      {
        canHaveChildren: true,
        childCountLabel: {
          plural: "sub-types",
          singular: "sub-type"
        },
        createChildLabel: "Add Sub-Type",
        emptyChildrenMessage: "No sub-types defined for this type",
        // icon: <FileIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />,
        metadataDisplay: {
          showChildCount: true,
          showMetadata: false, // We'll use custom formatter
          customMetadataFormatter: (item, childCount) => {
            const metadata: string[] = [];
            
            // Show child count with custom label
            if (childCount > 0) {
              metadata.push(`${childCount} ${childCount === 1 ? 'sub-type' : 'sub-types'}`);
            }
            
            // Add any additional metadata for case types
            if (item.metadata?.region) {
              metadata.push(`Region: ${item.metadata.region}`);
            }
            
            return metadata;
          }
        },
        styling: {
          indentSize: 32,
          // backgroundColor: "bg-blue-100 dark:bg-blue-800"
        },
        actions: [
          {
            label: "Edit",
            variant: "warning",
            onClick: (item) => handleEditType(item)
          },
          {
            label: "Delete",
            variant: "outline",
            onClick: (item) => handleDelete(item, "caseType")
          }
        ]
      },
      // Level 1
      {
        canHaveChildren: false,
        icon: <FileIcon className="w-4 h-4 text-green-600 dark:text-green-300" />,
        metadataDisplay: {
          showChildCount: false,
          showMetadata: true,
          customMetadataFormatter: (item) => {
            const metadata: string[] = [];
            
            // Show SLA
            if (item.metadata?.caseSla) {
              metadata.push(`SLA: ${item.metadata.caseSla}min`);
            }
            
            // Show skill requirements
            if (Array.isArray(item.metadata?.skillRequirements) && item.metadata.skillRequirements.length) {
              const skillCount = item.metadata.skillRequirements.length;
              metadata.push(`${skillCount} ${skillCount === 1 ? 'skill' : 'skills'} required`);
            }
            
            return metadata;
          }
        },
        styling: {
          backgroundColor: "bg-gray-100 dark:bg-gray-800"
          // backgroundColor: "bg-green-100 dark:bg-green-800"
        },
        actions: [
          {
            label: "Edit",
            variant: "warning",
            onClick: (item) => handleEditSubType(item)
          },
          {
            label: "Delete",
            variant: "outline",
            onClick: (item) => handleDelete(item, "caseSubType")
          }
        ]
      }
    ]
    // parentActions: [
    //   {
    //     label: "Edit",
    //     variant: "warning",
    //     onClick: (item) => handleEditType(item)
    //   },
    //   {
    //     label: "Deactivate",
    //     variant: "error",
    //     onClick: (item) => handleToggleActive(item.id, true),
    //     showWhen: (item) => item.active
    //   },
    //   {
    //     label: "Activate",
    //     variant: "success",
    //     onClick: (item) => handleToggleActive(item.id, true),
    //     showWhen: (item) => !item.active
    //   },
    //   {
    //     label: "Delete",
    //     variant: "outline",
    //     onClick: (item) => handleDeleteType(item.id)
    //   }
    // ],
    // childActions: [
    //   {
    //     label: "Edit",
    //     variant: "warning",
    //     onClick: (item) => handleEditSubType(item)
    //   },
    //   {
    //     label: "Deactivate",
    //     variant: "error",
    //     onClick: (item) => handleToggleActive(item.id, false),
    //     showWhen: (item) => item.active
    //   },
    //   {
    //     label: "Activate",
    //     variant: "success",
    //     onClick: (item) => handleToggleActive(item.id, false),
    //     showWhen: (item) => !item.active
    //   },
    //   {
    //     label: "Delete",
    //     variant: "outline",
    //     onClick: (item) => handleDeleteSubType(item.id)
    //   }
    // ]
  }), [
    // caseTypes,
    handleDelete
  ]);

  // Event handlers (converted to work with generic hierarchy items)
  const handleEditType = (item: HierarchyItem) => {
    // Implementation for editing case type
    console.log("Edit type:", item);
  };

  const handleEditSubType = (item: HierarchyItem) => {
    // Implementation for editing case sub-type
    console.log("Edit sub-type:", item);
  };

  // const handleToggleActive = (
  //   item: HierarchyItem, type: string
  //   // id: string, isType: boolean
  // ) => {
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     if (type === "caseType" && onCaseTypesChange) {
  //       const updated = caseTypes.map(ct => 
  //         ct.id === item.id ? { ...ct, active: !ct.active } : ct
  //       );
  //       onCaseTypesChange(updated);
  //     }
  //     else if (type === "caseSubType" && onCaseSubTypesChange) {
  //       const updated = caseSubTypes.map(cst => 
  //         cst.id === item.id ? { ...cst, active: !cst.active } : cst
  //       );
  //       onCaseSubTypesChange(updated);
  //     }
  //     setIsLoading(false);
  //   }, 500);
  //   // if (isType) {
  //   //   setCaseTypes(prev => prev.map(type => 
  //   //     type.id === id ? { ...type, active: !type.active } : type
  //   //   ));
  //   // }
  //   // else {
  //   //   // Handle sub-type toggle
  //   //   console.log("Toggle sub-type active:", id);
  //   // }
  // };

  // const handleDeleteType = async (id: string) => {
  //   if (confirm("Are you sure you want to delete this case type?")) {
  //     setIsLoading(true);
  //     setTimeout(() => {
  //       setCaseTypes(prev => prev.filter(type => type.id !== id));
  //       setIsLoading(false);
  //     }, 1000);
  //   }
  // };

  // const handleDeleteSubType = async (id: string) => {
  //   if (confirm("Are you sure you want to delete this sub-type?")) {
  //     setIsLoading(true);
  //     setTimeout(() => {
  //       console.log("Delete sub-type:", id);
  //       setIsLoading(false);
  //     }, 1000);
  //   }
  // };

  const handleCreateChild = (
    parentId: string,
    level: number
  ) => {
    console.log(`Create child at level ${level} for parent ${parentId}`);
    
    if (level === 1) {
      // Create sub-type
      console.log("Create new sub-type for type:", parentId);
    }

    // console.log("Create new sub-type for type:", parentId);
  };

  // const handleCreateSubType = (parentId: string) => {
  //   console.log("Create sub-type for parent:", parentId);
  // };

  // useEffect(() => {
  //   console.log('🚀 Debug - caseTypes:', caseTypes);
  //   console.log('🚀 Debug - caseSubTypes:', caseSubTypes);
  //   console.log('🚀 Debug - showInactive:', showInactive);
  //   console.log('🚀 Debug - hierarchyItems:', hierarchyItems);
  //   console.log('🚀 Debug - config:', hierarchyConfig);
  // }, [caseTypes, caseSubTypes, showInactive, hierarchyItems, hierarchyConfig]);

  return (
    <HierarchyView
      // analytics={analytics}
      config={hierarchyConfig}
      // defaultExpanded={["EMERGENCY"]}
      isLoading={isLoading}
      items={hierarchyItems}
      showInactive={showInactive}
      onCreateChild={(parentId) => handleCreateChild(parentId, 0)}
      // onCreateChild={handleCreateSubType}
      onLoadingChange={setIsLoading}
      // onItemsChange={setHierarchyItems}
    />
  );
};

export default ServiceHierarchyView;
