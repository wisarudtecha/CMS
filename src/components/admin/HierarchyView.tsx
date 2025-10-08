// /src/components/admin/HierarchyView.tsx
import React, { useCallback, useMemo, useState } from "react";
import type { HierarchyAnalytics, HierarchyConfig, HierarchyItem } from "@/types/hierarchy";
import HierarchyItemComponent from "@/components/admin/HierarchyItem";

interface HierarchyViewProps {
  analytics?: Record<string, HierarchyAnalytics>;
  config: HierarchyConfig;
  // defaultExpanded?: string[];
  items: HierarchyItem[];
  isLoading?: boolean;
  showInactive?: boolean;
  onCreateChild?: (parentId: string, level: number) => void;
  onItemsChange?: (items: HierarchyItem[]) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export const HierarchyView: React.FC<HierarchyViewProps> = ({
  analytics = {},
  config,
  // defaultExpanded = [],
  items,
  isLoading = false,
  showInactive = false,
  onCreateChild,
  // onItemsChange,
  onLoadingChange,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(
      config.defaultExpanded || []
      // defaultExpanded
    )
  );
  const [selectedItem, ] = useState<string | null>(null);
  // const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Calculate levels for items if not provided
  const itemsWithLevels = useMemo(() => {
    const calculateLevel = (item: HierarchyItem, allItems: HierarchyItem[], visited = new Set<string>()): number => {
      if (visited.has(String(item.id))) {
        return 0; // Prevent infinite recursion
      }
      visited.add(String(item.id));
      
      if (!item.parentId) {
        return 0;
      }
      
      const parent = allItems.find(i => i.id === item.parentId);
      if (!parent) {
        return 0;
      }
      
      return calculateLevel(parent, allItems, visited) + 1;
    };

    return items.map(item => ({
      ...item,
      level: item.level ?? calculateLevel(item, items)
    }));
  }, [items]);

  // Get items by level and parent
  const getItemsByParentAndLevel = useCallback((parentId: string | null, level: number) => {
    return itemsWithLevels.filter(item => {
      // Handle both null and undefined for root items
      const matchesParent = parentId === null 
        ? (item.parentId === null || item.parentId === undefined)
        : item.parentId === parentId;
      
      return matchesParent && 
            item.level === level &&
            (showInactive || item.active);
    });

    // return itemsWithLevels.filter(item => 
    //   item.parentId === parentId && 
    //   item.level === level &&
    //   (showInactive || item.active)
    // );
  }, [itemsWithLevels, showInactive]);

  // Get parent items (items without parentId)
  // const parentItems = items.filter(item => !item.parentId);
  
  // Filter based on active status
  // const filteredParentItems = parentItems.filter(item => 
  //   showInactive || item.active
  // );

  const getChildItems = useCallback((parentId: string) => {
    const parent = itemsWithLevels.find(item => item.id === parentId);
    if (!parent) {
      return [];
    }

    return itemsWithLevels.filter(item => 
      item.parentId === parentId && (showInactive || item.active)
    );

    // return items.filter(item => 
    //   item.parentId === parentId && (showInactive || item.active)
    // );
  }, [
    // items,
    itemsWithLevels,
    showInactive
  ]);

  const toggleExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    }
    else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // const handleItemUpdate = (updatedItem: HierarchyItem) => {
  //   if (onItemsChange) {
  //     const updatedItems = items.map(item => 
  //       item.id === updatedItem.id ? updatedItem : item
  //     );
  //     onItemsChange(updatedItems);
  //   }
  // };

  // const handleItemDelete = (itemId: string) => {
  //   if (onItemsChange) {
  //     // Remove item and all its descendants
  //     const removeItemAndDescendants = (id: string): string[] => {
  //       const children = itemsWithLevels.filter(item => item.parentId === id);
  //       const descendantIds = children.flatMap(child => removeItemAndDescendants(child.id));
  //       return [id, ...descendantIds];
  //     };
  //     const idsToRemove = removeItemAndDescendants(itemId);
  //     const updatedItems = items.filter(item => !idsToRemove.includes(item.id));
  //     // const updatedItems = items.filter(item => item.id !== itemId);
  //     onItemsChange(updatedItems);
  //   }
  // };

  // Recursive component for rendering hierarchy levels
  const renderHierarchyLevel = (parentId: string | null, level: number, indentLevel: number = 0) => {
    const levelItems = getItemsByParentAndLevel(parentId, level);

    // console.log(`🚀 renderHierarchyLevel - parentId: ${parentId}, level: ${level}, levelItems:`, levelItems);
    // console.log(`🚀 renderHierarchyLevel - itemsWithLevels:`, itemsWithLevels);
    // console.log(`🚀 renderHierarchyLevel - showInactive:`, showInactive);
    
    if (levelItems.length === 0) {
      // console.log(`🚀 No items found for parentId: ${parentId}, level: ${level}`);
      return null;
    }
    
    return levelItems.map((item) => {
      const isExpanded = expandedItems.has(String(item.id));
      const childItems = getChildItems(String(item.id));
      const itemAnalytics = analytics[item.id];
      const levelConfig = config.levels[level] || config.levels[config.levels.length - 1];
      const canHaveChildren = levelConfig?.canHaveChildren !== false && (!config.maxLevels || level < config.maxLevels - 1);

      // console.log(`🚀 Rendering item: ${item.name}, level: ${level}, canHaveChildren: ${canHaveChildren}`);

      // Use a composite key to ensure uniqueness
      const compositeKey = `${parentId ?? "root"}-${level}-${item.id}`;

      return (
        <div
          key={compositeKey}
          // key={item.id}
        >
          <HierarchyItemComponent
            analytics={itemAnalytics}
            canHaveChildren={canHaveChildren}
            childCount={childItems.length}
            config={config}
            indentLevel={indentLevel}
            isExpanded={isExpanded}
            isLoading={isLoading}
            isSelected={selectedItem === item.id}
            item={item}
            levelConfig={levelConfig}
            onCreateChild={onCreateChild ? () => onCreateChild(
              String(item.id),
              level + 1
            ) : undefined}
            // onDelete={() => handleItemDelete(item.id)}
            onLoadingChange={onLoadingChange}
            // onSelect={() => setSelectedItem(item.id)}
            onToggleExpansion={() => toggleExpansion(String(item.id))}
            // onUpdate={handleItemUpdate}
          />
          
          {/* Recursively render child levels */}
          {isExpanded && (
            <div 
              // className="border-l border-gray-200 dark:border-gray-700"
              style={{ 
                marginLeft: `${(levelConfig?.styling?.indentSize || 32)}px`,
                backgroundColor: levelConfig?.styling?.backgroundColor 
              }}
            >
              {childItems.length > 0 ? (
                renderHierarchyLevel(String(item.id), level + 1, indentLevel + 1)
              ) : canHaveChildren ? (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 dark:text-gray-400">
                  <p>{levelConfig?.emptyChildrenMessage || "No child items defined"}</p>
                  {onCreateChild && (
                    <button
                      onClick={() => onCreateChild(
                        String(item.id),
                        level + 1
                      )}
                      className="mt-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 text-sm"
                    >
                      {levelConfig?.createChildLabel || "Add first child item"}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      );
    });
  };

  // Start with root level items (level 0)
  return (
    <div className="space-y-2">
      {itemsWithLevels.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 cursor-default">
          <p>No items to display</p>
          <p className="text-sm mt-2">
            Check if your data is loaded correctly or if showInactive filter is hiding all items.
          </p>
        </div>
      ) : (
        renderHierarchyLevel(null, 0)
      )}

      {/* {renderHierarchyLevel(null, 0)} */}
    </div>
    
    // <div className="space-y-2">
    //   {filteredParentItems.map((parentItem) => {
    //     const isExpanded = expandedItems.has(parentItem.id);
    //     const childItems = getChildItems(parentItem.id);
    //     const itemAnalytics = analytics[parentItem.id];
    //     return (
    //       <div key={parentItem.id}>
    //         <HierarchyItemComponent
    //           item={parentItem}
    //           analytics={itemAnalytics}
    //           config={config}
    //           isParent={true}
    //           isExpanded={isExpanded}
    //           isSelected={selectedItem === parentItem.id}
    //           childCount={childItems.length}
    //           onToggleExpansion={() => toggleExpansion(parentItem.id)}
    //           onSelect={() => setSelectedItem(parentItem.id)}
    //           onUpdate={handleItemUpdate}
    //           onDelete={() => handleItemDelete(parentItem.id)}
    //           onCreateChild={onCreateChild}
    //           isLoading={isLoading}
    //           onLoadingChange={onLoadingChange}
    //         />
    //         {/* Child Items */}
    //         {isExpanded && (
    //           <div className="border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 ml-8 border-t-0">
    //             {childItems.length > 0 ? (
    //               childItems.map((childItem) => (
    //                 <HierarchyItemComponent
    //                   key={childItem.id}
    //                   item={childItem}
    //                   config={config}
    //                   isParent={false}
    //                   isSelected={selectedItem === childItem.id}
    //                   onSelect={() => setSelectedItem(childItem.id)}
    //                   onUpdate={handleItemUpdate}
    //                   onDelete={() => handleItemDelete(childItem.id)}
    //                   isLoading={isLoading}
    //                   onLoadingChange={onLoadingChange}
    //                 />
    //               ))
    //             ) : (
    //               <div className="border-t border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 dark:text-gray-400">
    //                 <p>No child items defined</p>
    //                 {onCreateChild && (
    //                   <button
    //                     onClick={() => onCreateChild(parentItem.id)}
    //                     className="mt-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 text-sm"
    //                   >
    //                     Add first child item
    //                   </button>
    //                 )}
    //               </div>
    //             )}
    //           </div>
    //         )}
    //       </div>
    //     );
    //   })}
    // </div>
  );
};

export default HierarchyView;
