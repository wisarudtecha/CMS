// /src/components/crud/EnhancedCrudContainer.tsx
import React, {
  useState,
  // useEffect,
  useCallback,
  useMemo
} from "react";
import Button from "@/components/ui/button/Button";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import { DisplayModeToggle } from "./DisplayModeToggle";
import { EnhancedDataTable } from "./EnhancedDataTable";
import { EnhancedCardGrid } from "./EnhancedCardGrid";
import { Pagination } from "./Pagination";
import { ToastContainer } from "./ToastContainer";
import { ConfirmModal } from "./ConfirmModal";
import { BulkActionBar } from "./BulkActionBar";
import { ExportMenu } from "./ExportMenu";
import { AdvancedFilterPanel } from "./AdvancedFilterPanel";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { usePagination } from "@/hooks/usePagination";
import { useSort } from "@/hooks/useSort";
import { useFilter } from "@/hooks/useFilter";
import { useToast } from "@/hooks/useToast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useApi } from "@/hooks/useApi";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import {
  // exportToCSV,
  exportToJSON
} from "@/utils/export";
import { apiService } from "@/services/api";
import type { 
  // CrudConfig, 
  BulkAction, 
  ExportOption, 
  AdvancedFilter,
  KeyboardShortcut,
  CrudFeatures,
  ApiConfig
} from "@/types/enhanced-crud";
import type { 
  CrudConfig,
  // ConfirmDialog
} from "@/types/crud";

interface EnhancedCrudContainerProps<T> {
  data: T[];
  config: CrudConfig<T>;
  features?: Partial<CrudFeatures>;
  apiConfig?: ApiConfig;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onCreate?: () => void;
  onUpdate?: (item: T) => void;
  onDelete?: (id: string) => void;
  renderCard?: (item: T) => React.ReactNode;
  customFilterFunction?: (item: T, filters:
    // any
    unknown
  ) => boolean;
  searchFields?: (keyof T)[];
  bulkActions?: BulkAction<T>[];
  exportOptions?: ExportOption[];
  advancedFilters?: AdvancedFilter[];
  keyboardShortcuts?: KeyboardShortcut[];
  enableDebug?: boolean;
  onItemAction?: (action: string, item: T) => void;
}

export const EnhancedCrudContainer = <T extends { id: string }>({
  data,
  config,
  features = {},
  apiConfig,
  loading = false,
  error = null,
  onRefresh,
  onCreate,
  onUpdate,
  onDelete,
  renderCard,
  customFilterFunction,
  searchFields = ["name", "description", "title"] as (keyof T)[],
  bulkActions = [],
  exportOptions = [],
  advancedFilters = [],
  keyboardShortcuts = [],
  enableDebug = false,
  onItemAction
}: EnhancedCrudContainerProps<T>) => {
  const [displayMode, setDisplayMode] = useState<"card" | "table">("card");
  const [searchInput, setSearchInput] = useState<string>("");

  // Feature flags with defaults
  const enabledFeatures: CrudFeatures = {
    search: true,
    sorting: true,
    filtering: true,
    pagination: true,
    bulkActions: true,
    export: true,
    realTimeUpdates: false,
    dragAndDrop: false,
    keyboardShortcuts: true,
    ...features
  };

  // Custom hooks
  const { filterConfig, filteredData, handleFilter, clearFilters, hasActiveFilters } = 
    useFilter(data, customFilterFunction, searchFields);
  
  const { sortConfig, handleSort, sortedData } = useSort(filteredData);
  
  const { 
    pagination, 
    totalPages, 
    startEntry, 
    endEntry, 
    goToPage, 
    changePageSize 
  } = usePagination(sortedData.length);

  // Simple direct modal state for debugging
  // const [debugModalOpen, setDebugModalOpen] = useState(false);

  // const openDebugModal = () => {
  //   console.log('Opening debug modal directly');
  //   setDebugModalOpen(true);
  // };

  // const closeDebugModal = () => {
  //   console.log('Closing debug modal');
  //   setDebugModalOpen(false);
  // };

  const { toasts, addToast, removeToast } = useToast();
  const { confirmDialog, openConfirmDialog, closeConfirmDialog, handleConfirm } = useConfirmDialog();
  
  // Debug the confirmDialog state changes
  React.useEffect(() => {
    console.log('EnhancedCrudContainer: confirmDialog state changed:', confirmDialog);
  }, [confirmDialog]);

  const {
    selectedItems,
    // isSelected,
    isAllSelected,
    isPartialSelected,
    selectItem,
    selectAll,
    deselectAll,
    toggleSelectAll,
    getSelectedCount
  } = useBulkSelection(sortedData);

  // API hooks
  // const deleteApi = useApi(apiService.delete);
  const deleteApi = useApi(apiService.delete as (...args: unknown[]) => Promise<unknown>);
  // const bulkDeleteApi = useApi(apiService.bulkDelete);
  const bulkDeleteApi = useApi(apiService.bulkDelete as (...args: unknown[]) => Promise<unknown>);

  // Real-time updates
  useRealTimeUpdates<T>({
    endpoint: config.entityNamePlural.toLowerCase(),
    onUpdate: (updatedItem) => {
      if (onUpdate) onUpdate(updatedItem);
      addToast("info", `${config.entityName} updated`);
    },
    onDelete: (deletedId) => {
      if (onDelete) onDelete(deletedId);
      addToast("info", `${config.entityName} deleted`);
    },
    onCreate: (newItem) => {
      addToast("success", `New ${config.entityName.toLowerCase()} created`);
      console.log("success", `New ${config.entityName.toLowerCase()} created`, newItem);
    },
    enabled: enabledFeatures.realTimeUpdates
  });

  // Paginated data
  const startIndex = enabledFeatures.pagination 
    ? (pagination.page - 1) * pagination.pageSize 
    : 0;
  const endIndex = enabledFeatures.pagination 
    ? startIndex + pagination.pageSize 
    : sortedData.length;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Handlers
  const handleSearch = () => {
    handleFilter("search", searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    handleFilter("search", "");
  };

  const handleDeleteItem = useCallback(async (item: T) => {
    console.log("handleDeleteItem called for item:", item);
    
    openConfirmDialog({
      type: "delete",
      entityId: item.id,
      // entityName: (item as any).name || (item as any).title || item.id,
      entityName: (item as Record<string, unknown>).name as string || (item as Record<string, unknown>).title as string || item.id,
      onConfirm: async () => {
        console.log("Delete confirmed for item:", item.id);
        try {
          if (apiConfig) {
            await deleteApi.execute(`${apiConfig.endpoints.delete.replace(":id", item.id)}`);
          }
          if (onDelete) onDelete(item.id);
          addToast("success", `${config.entityName} deleted successfully`);
        } catch (error) {
          console.error("Delete failed:", error);
          addToast("error", `Failed to delete ${config.entityName.toLowerCase()}`);
        }
      }
    });
  }, [
    config,
    deleteApi,
    onDelete,
    addToast,
    openConfirmDialog,
    apiConfig
  ]);

  // Handle item actions with special handling for delete
  const handleItemAction = useCallback((actionKey: string, item: T) => {
    console.log("handleItemAction called:", { actionKey, itemId: item.id });
    
    if (actionKey === "delete") {
      console.log("Delete action detected, calling handleDeleteItem");
      handleDeleteItem(item);
      return;
    }

    // Find the action in config and execute it
    const action = config.actions?.find(a => a.key === actionKey);
    if (action) {
      console.log("Executing action from config:", action.key);
      action.onClick(item);
    } else {
      console.warn("Action not found in config:", actionKey);
    }

    // Call custom action handler if provided
    if (onItemAction) {
      onItemAction(actionKey, item);
    }
  }, [handleDeleteItem, config.actions, onItemAction]);

  // Create enhanced actions with proper delete handling
  const enhancedActions = useMemo(() => {
    if (!config.actions) return undefined;

    return config.actions.map(action => ({
      ...action,
      onClick: (item: T) => handleItemAction(action.key, item)
    }));
  }, [config.actions, handleItemAction]);

  const handleBulkAction = useCallback(async (action: BulkAction<T>) => {
    if (action.confirmationRequired) {
      openConfirmDialog({
        type: "custom",
        // type: ["delete", "status"].includes(action.key) ? (action.key as ConfirmDialog["type"]) : "custom",
        entityId: "",
        entityName: "",
        title: `${action.label} ${getSelectedCount()} items`,
        message: action.confirmationMessage 
          ? action.confirmationMessage(selectedItems)
          : `Are you sure you want to ${action.label.toLowerCase()} ${getSelectedCount()} items?`,
        onConfirm: async () => {
          try {
            await action.onClick(selectedItems);
            deselectAll();
            addToast("success", `${action.label} completed successfully`);
          } catch (error) {
            addToast("error", `${action.label} failed`);
            console.error(error);
          }
        }
      });
    } else {
      try {
        await action.onClick(selectedItems);
        deselectAll();
        addToast("success", `${action.label} completed successfully`);
      } catch (error) {
        addToast("error", `${action.label} failed`);
        console.error(error);
      }
    }
  }, [selectedItems, getSelectedCount, deselectAll, addToast, openConfirmDialog]);

  const handleExport = useCallback(async (option: ExportOption, exportData: T[]) => {
    try {
      const filename = `${config.entityNamePlural.toLowerCase()}_${new Date().toISOString().split("T")[0]}`;
      
      switch (option.format) {
        case "csv":
          // exportToCSV(exportData, filename, option.columns);
          break;
        case "json":
          exportToJSON(exportData, filename);
          break;
        case "excel":
          // Would implement Excel export
          addToast("warning", "Excel export not implemented yet");
          break;
        case "pdf":
          // Would implement PDF export
          addToast("warning", "PDF export not implemented yet");
          break;
        default:
          throw new Error(`Unsupported export format: ${option.format}`);
      }
      
      addToast("success", `Data exported as ${option.format.toUpperCase()}`);
    } catch (error) {
      addToast("error", `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }, [config.entityNamePlural, addToast]);

  // Default keyboard shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: "n",
      modifier: "ctrl",
      description: "Create new item",
      action: () => onCreate && onCreate()
    },
    {
      key: "r",
      modifier: "ctrl",
      description: "Refresh data",
      action: () => onRefresh && onRefresh()
    },
    {
      key: "a",
      modifier: "ctrl",
      description: "Select all",
      action: () => enabledFeatures.bulkActions && selectAll()
    },
    {
      key: "Escape",
      description: "Clear selection",
      action: () => deselectAll()
    }
  ];

  const allShortcuts = [...defaultShortcuts, ...keyboardShortcuts];

  // Default export options
  const defaultExportOptions: ExportOption[] = [
    {
      key: "csv",
      label: "CSV File",
      format: "csv"
    },
    {
      key: "json",
      label: "JSON File",
      format: "json"
    }
  ];

  const allExportOptions = [...defaultExportOptions, ...exportOptions];

  // Default bulk actions
  const defaultBulkActions: BulkAction<T>[] = [
    {
      key: "delete",
      label: "Delete Selected",
      variant: "error",
      // icon: TrashBinIcon,
      onClick: async (items) => {
        // console.log(items);
        const ids = items.map(item => item.id);
        if (apiConfig) {
          await bulkDeleteApi.execute(apiConfig.endpoints.bulkDelete, ids);
        }
        ids.forEach(id => onDelete && onDelete(id));
      },
      confirmationRequired: true,
      confirmationMessage: (items) => `Are you sure you want to delete ${items.length} ${config.entityNamePlural.toLowerCase()}? This action cannot be undone.`
    }
  ];

  const allBulkActions = [...defaultBulkActions, ...bulkActions];

  return (
    <div
      // className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12"
      className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6"
    >
      <div className="mx-auto w-full">
        {/* Keyboard Shortcuts */}
        {enabledFeatures.keyboardShortcuts && (
          <KeyboardShortcuts shortcuts={allShortcuts} />
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              {/*
              <p className="text-gray-600 dark:text-gray-300">
                Manage and monitor your {config.entityNamePlural.toLowerCase()}
              </p>
              */}

              {/* Controls */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex items-center gap-4">
                  <DisplayModeToggle mode={displayMode} onChange={setDisplayMode} />

                  {enabledFeatures.search && (
                    <SearchBar
                      value={searchInput}
                      onChange={setSearchInput}
                      onSearch={handleSearch}
                      onClear={handleClearSearch}
                      placeholder={`Search ${config.entityNamePlural.toLowerCase()}...`}
                    />
                  )}

                  {/* Basic Filters */}
                  {enabledFeatures.filtering && config.filters && (
                    <FilterBar
                      filters={config.filters}
                      values={filterConfig}
                      onChange={handleFilter}
                      onClear={clearFilters}
                      hasActiveFilters={hasActiveFilters}
                    />
                  )}

                  {advancedFilters.length > 0 && (
                    <AdvancedFilterPanel
                      filters={advancedFilters}
                      values={filterConfig}
                      onChange={(filters) => Object.entries(filters).forEach(([key, value]) => 
                        handleFilter(key, value as string | number | boolean | null | undefined)
                      )}
                      onApply={() => {}}
                      onReset={clearFilters}
                    />
                  )}

                  {enabledFeatures.export && allExportOptions.length > 0 && (
                    <ExportMenu
                      data={selectedItems.length > 0 ? selectedItems : sortedData}
                      exportOptions={allExportOptions}
                      onExport={handleExport}
                    />
                  )}
                </div>
              </div>
            </div>
            {onCreate && (
              <Button onClick={onCreate} variant="primary" className="h-11">
                Create {config.entityName}
              </Button>
            )}
          </div>
        </div>

        {/* Results Info */}
        {/*
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing {startEntry}-{endEntry} of {sortedData.length} {config.entityNamePlural.toLowerCase()}
            {getSelectedCount() > 0 && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                ({getSelectedCount()} selected)
              </span>
            )}
          </div>
        </div>
        */}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
            {onRefresh && (
              <Button onClick={onRefresh} variant="primary">
                Retry
              </Button>
            )}
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No {config.entityNamePlural.toLowerCase()} found
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters or search terms"
                : `Create your first ${config.entityName.toLowerCase()} to get started`
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="primary">
                Clear Filters
              </Button>
            )}
          </div>
        ) : displayMode === "card" && renderCard ? (
          <EnhancedCardGrid
            data={paginatedData}
            renderCard={renderCard}
            // actions={config.actions}
            actions={enhancedActions}
            selectedItems={selectedItems}
            onSelectItem={selectItem}
            bulkSelectionEnabled={enabledFeatures.bulkActions}
            className="mb-8"
          />
        ) : (
          <EnhancedDataTable
            data={paginatedData}
            columns={config.columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            // actions={config.actions}
            actions={enhancedActions}
            selectedItems={selectedItems}
            onSelectItem={selectItem}
            onSelectAll={toggleSelectAll}
            isAllSelected={isAllSelected}
            isPartialSelected={isPartialSelected}
            bulkSelectionEnabled={enabledFeatures.bulkActions}
            className="mb-8"
          />
        )}

        {/* Pagination */}
        {enabledFeatures.pagination && (
          <Pagination
            pagination={{ ...pagination, total: sortedData.length }}
            totalPages={totalPages}
            startEntry={startEntry}
            endEntry={endEntry}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
          />
        )}

        {/* Bulk Action Bar */}
        {enabledFeatures.bulkActions && (
          <BulkActionBar
            selectedCount={getSelectedCount()}
            totalCount={sortedData.length}
            bulkActions={allBulkActions}
            selectedItems={selectedItems}
            onDeselectAll={deselectAll}
            onAction={handleBulkAction}
          />
        )}

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Debug Info (only in development) */}

        {/* Direct Debug Modal */}
        {/* {debugModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeDebugModal}></div>
              <div className="inline-block bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Direct Debug Modal
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  This modal bypasses all hooks and state management. If you see this, the basic modal functionality works.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeDebugModal}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      alert('Direct modal action executed!');
                      closeDebugModal();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Test Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        )} */}
        
        {/* Debug Info (only in development) */}
        {enableDebug && (
          ""
          // <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs font-mono z-40">
          //   <div className="font-bold mb-2">🔧 Debug Info</div>
          //   <div>Total Items: {data.length}</div>
          //   <div>Filtered Items: {filteredData.length}</div>
          //   <div>Selected Items: {getSelectedCount()}</div>
          //   <div>Display Mode: {displayMode}</div>
          //   <div>Actions Count: {enhancedActions?.length || 0}</div>
          //   {/* <div>Debug Modal: {debugModalOpen ? 'OPEN' : 'CLOSED'}</div> */}
          //   <div className="mt-2 pt-2 border-t border-gray-700">
          //     <div className="font-bold">Confirm Dialog:</div>
          //     <div>Is Open: {confirmDialog.isOpen ? 'YES' : 'NO'}</div>
          //     <div>Type: {confirmDialog.type}</div>
          //     <div>Entity: {confirmDialog.entityName}</div>
          //     <div>Has onConfirm: {confirmDialog.onConfirm ? 'YES' : 'NO'}</div>
          //   </div>
          // </div>
        )}
       

        {/* Confirmation Dialog */}
        <ConfirmModal
          dialog={confirmDialog}
          onConfirm={handleConfirm}
          onCancel={closeConfirmDialog}
        />
      </div>
    </div>
  );
};
