// /src/components/crud/EnhancedCrudContainer.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  // ChevronDownIcon,
  // ChevronUpIcon,
  InfoIcon
} from "@/icons";
// import { RoleHierarchyView } from "@/components/admin/HierarchyView";
// import { PermissionMatrixView } from "@/components/admin/PermissionMatrixView";
import { TableView } from "@/components/admin/TableView";
import { AdvancedFilterPanel } from "@/components/crud/AdvancedFilterPanel";
import { BulkActionBar } from "@/components/crud/BulkActionBar";
import { ClickableCard } from "@/components/crud/ClickableCard";
// import { ClickableTableRow } from "@/components/crud/ClickableTableRow";
import { ConfirmModal } from "@/components/crud/ConfirmModal";
import { DisplayModeToggle } from "@/components/crud/DisplayModeToggle";
import { ExportMenu } from "@/components/crud/ExportMenu";
import { FilterBar } from "@/components/crud/FilterBar";
import { KeyboardShortcuts } from "@/components/crud/KeyboardShortcuts";
import { Pagination } from "@/components/crud/Pagination";
import { PreviewDialog } from "@/components/crud/PreviewDialog";
import { SearchBar } from "@/components/crud/SearchBar";
import { ToastContainer } from "@/components/crud/ToastContainer";
// import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useApi } from "@/hooks/useApi";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { usePreview } from "@/hooks/usePreview";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { useSort } from "@/hooks/useSort";
import { useToast } from "@/hooks/useToast";
import { apiService } from "@/services/api";
import type { CrudConfig } from "@/types/crud";
import type { AdvancedFilter, ApiConfig, BulkAction, CrudFeatures, ExportOption, KeyboardShortcut, PreviewConfig } from "@/types/enhanced-crud";
// import type { Permission, Role } from "@/types/role";
// import Checkbox from "@/components/form/input/Checkbox";
import Button from "@/components/ui/button/Button";
// import allPermissions from "@/mocks/allPermissions.json";
// import roles from "@/mocks/roles.json";
import {
  // exportToCSV,
  exportToJSON
} from "@/utils/export";

interface EnhancedCrudContainerProps<T> {
  advancedFilters?: AdvancedFilter[];
  apiConfig?: ApiConfig;
  bulkActions?: BulkAction<T>[];
  config: CrudConfig<T>;
  // config: CrudConfig<{ id: string; }>;
  data: T[];
  displayModes?: ("card" | "table" | "matrix" | "hierarchy")[];
  enableDebug?: boolean;
  error?: string | null;
  exportOptions?: ExportOption[];
  features?: Partial<CrudFeatures>;
  keyboardShortcuts?: KeyboardShortcut[];
  loading?: boolean;
  previewConfig?: PreviewConfig<T>;
  // searchFields?: (keyof T)[];
  searchFields?: unknown;
  customFilterFunction?: (item: T, filters: unknown) => boolean;
  onCreate?: () => void;
  onDelete?: (id: string) => void;
  onItemAction?: (action: string, item: T) => void;
  onItemClick?: (item: T) => void;
  onRefresh?: () => void;
  onUpdate?: (item: T) => void;
  renderCard?: (item: T) => React.ReactNode;
  renderHierarchy?: (item: T) => React.ReactNode;
  renderMatrix?: () => React.ReactNode;
}

export const EnhancedCrudContainer = <T extends { id: string }>({
  advancedFilters = [],
  apiConfig,
  bulkActions = [],
  config,
  data,
  displayModes = ["card", "table", "matrix", "hierarchy"],
  enableDebug = false,
  error = null,
  exportOptions = [],
  features = {},
  keyboardShortcuts = [],
  loading = false,
  previewConfig,
  // searchFields = ["name", "description", "title"] as (keyof T)[],
  searchFields,
  customFilterFunction,
  onCreate,
  onDelete,
  onItemAction,
  onItemClick,
  onRefresh,
  onUpdate,
  renderCard,
  renderHierarchy,
  renderMatrix
}: EnhancedCrudContainerProps<T>) => {
  const [displayMode, setDisplayMode] = useState<"card" | "table" | "matrix" | "hierarchy">("card");
  const [searchInput, setSearchInput] = useState<string>("");

  // ===================================================================
  // Feature Flags with Defaults
  // ===================================================================

  const enabledFeatures: CrudFeatures = {
    bulkActions: false,
    dragAndDrop: false,
    export: true,
    filtering: true,
    keyboardShortcuts: true,
    pagination: true,
    // preview: true,
    realTimeUpdates: false,
    search: true,
    sorting: true,
    ...features
  };

  // ===================================================================
  // Custom Hooks
  // ===================================================================

  const { confirmDialog, closeConfirmDialog, handleConfirm, openConfirmDialog } = useConfirmDialog();
  // const { filterConfig, filteredData, hasActiveFilters, clearFilters, handleFilter } = useFilter(data, customFilterFunction, searchFields);
  const { filterConfig, filteredData, hasActiveFilters, clearFilters, handleFilter } = useFilter(data, customFilterFunction, searchFields as unknown as (keyof T)[]);
  const { sortConfig, sortedData, handleSort } = useSort(filteredData);
  const { endEntry, pagination, startEntry, totalPages, changePageSize, goToPage } = usePagination(sortedData.length);
  const { toasts, addToast, removeToast } = useToast();
  const {
    isAllSelected,
    // isPartialSelected,
    selectedItems,
    deselectAll,
    getSelectedCount,
    // isSelected,
    selectItem,
    selectAll,
    toggleSelectAll
  } = useBulkSelection(sortedData);

  // Preview functionality
  const { canGoNext, canGoPrev, previewState, closePreview, nextItem, openPreview, prevItem } = usePreview<T>();

  // API functionality
  const bulkDeleteApi = useApi(apiService.bulkDelete as (...args: unknown[]) => Promise<unknown>);
  const deleteApi = useApi(apiService.delete as (...args: unknown[]) => Promise<unknown>);
  
  // ===================================================================
  // Debug
  // ===================================================================

  // Debug the confirmDialog state changes
  // React.useEffect(() => {
  //   console.log("EnhancedCrudContainer: confirmDialog state changed:", confirmDialog);
  // }, [confirmDialog]);

  // ===================================================================
  // Real Time Updates
  // ===================================================================

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

  // ===================================================================
  // Paginated Data
  // ===================================================================

  const startIndex = enabledFeatures.pagination ? (pagination.page - 1) * pagination.pageSize : 0;
  const endIndex = enabledFeatures.pagination ? startIndex + pagination.pageSize : sortedData.length;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // ===================================================================
  // Handlers
  // ===================================================================

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action: BulkAction<T>) => {
    if (action.confirmationRequired) {
      openConfirmDialog({
        type: "custom",
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
          }
          catch (error) {
            addToast("error", `${action.label} failed`);
            console.error(error);
          }
        }
      });
    }
    else {
      try {
        await action.onClick(selectedItems);
        deselectAll();
        addToast("success", `${action.label} completed successfully`);
      }
      catch (error) {
        addToast("error", `${action.label} failed`);
        console.error(error);
      }
    }
  }, [selectedItems, addToast, deselectAll, getSelectedCount, openConfirmDialog]);

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput("");
    handleFilter("search", "");
  };

  // Handle delete item
  const handleDeleteItem = useCallback(async (item: T) => {
    console.log("handleDeleteItem called for item:", item);
    
    openConfirmDialog({
      type: "delete",
      entityId: item.id,
      entityName: (item as Record<string, unknown>).name as string || (item as Record<string, unknown>).title as string || item.id,
      onConfirm: async () => {
        console.log("Delete confirmed for item:", item.id);
        try {
          if (apiConfig) {
            await deleteApi.execute(`${apiConfig.endpoints.delete.replace(":id", item.id)}`);
          }
          if (onDelete) {
            onDelete(item.id);
          }
          addToast("success", `${config.entityName} deleted successfully`);
        }
        catch (error) {
          console.error("Delete failed:", error);
          addToast("error", `Failed to delete ${config.entityName.toLowerCase()}`);
        }
      }
    });
  }, [apiConfig, config, deleteApi, addToast, onDelete, openConfirmDialog]);

  // Handle export
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
    }
    catch (error) {
      addToast("error", `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }, [config.entityNamePlural, addToast]);

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
    }
    else {
      console.warn("Action not found in config:", actionKey);
    }

    // Call custom action handler if provided
    if (onItemAction) {
      onItemAction(actionKey, item);
    }
  }, [config.actions, handleDeleteItem, onItemAction]);

  // Handle item click for preview
  const handleItemClick = useCallback((item: T) => {
    if (previewConfig) {
      openPreview(item, sortedData);
    }
  }, [previewConfig, sortedData, openPreview]);

  const actualClickHandler = onItemClick || handleItemClick;

  // Handle search
  const handleSearch = () => {
    handleFilter("search", searchInput.trim());
  };

  // ===================================================================
  // Utility Functions
  // ===================================================================

  // Create enhanced actions with proper delete handling
  const enhancedActions = useMemo(() => {
    if (!config.actions) return undefined;

    return config.actions.map(action => ({
      ...action,
      onClick: (item: T) => handleItemAction(action.key, item)
    }));
  }, [config.actions, handleItemAction]);

  // Default bulk actions
  const defaultBulkActions: BulkAction<T>[] = [
    {
      key: "delete",
      label: "Delete Selected",
      variant: "error",
      onClick: async (items) => {
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
      <div className="mx-auto w-full">
        {/* Keyboard Shortcuts */}
        {enabledFeatures.keyboardShortcuts && (
          <KeyboardShortcuts shortcuts={allShortcuts} />
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="xl:flex items-center justify-between mb-4">
            <div>
              {/* Controls */}
              <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                <div className="xl:flex items-center gap-4">
                  {/* Display Modes (Card / Default:Table / Matrix / Hierarchy) */}
                  <div className="mb-2 xl:mb-0">
                    <DisplayModeToggle mode={displayMode} list={displayModes} onChange={setDisplayMode} />
                  </div>

                  {/* Search Bar */}
                  {enabledFeatures.search && (
                    <div className="mb-2 xl:mb-0">
                      <SearchBar
                        value={searchInput}
                        onChange={setSearchInput}
                        onSearch={handleSearch}
                        onClear={handleClearSearch}
                        placeholder={`Search ${config.entityNamePlural.toLowerCase()}...`}
                      />
                    </div>
                  )}

                  {/* Basic Filters */}
                  {enabledFeatures.filtering && config.filters && (
                    <div className="mb-2 xl:mb-0">
                      <FilterBar
                        filters={config.filters}
                        values={filterConfig}
                        onChange={handleFilter}
                        onClear={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                      />
                    </div>
                  )}

                  {/* Advanced Filters */}
                  {advancedFilters.length > 0 && (
                    <div className="mb-2 xl:mb-0">
                      <AdvancedFilterPanel
                        filters={advancedFilters}
                        values={filterConfig}
                        onChange={(filters) => Object.entries(filters).forEach(([key, value]) => 
                          handleFilter(key, value as string | number | boolean | null | undefined)
                        )}
                        onApply={() => {}}
                        onReset={clearFilters}
                      />
                    </div>
                  )}

                  {/* Export Button */}
                  {enabledFeatures.export && allExportOptions.length > 0 && (
                    <div className="mb-2 xl:mb-0">
                      <ExportMenu
                        data={selectedItems.length > 0 ? selectedItems : sortedData}
                        exportOptions={allExportOptions}
                        onExport={handleExport}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Create Button */}
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
          // Loading State
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        ) : error ? (
          // Error
          <div className="text-center py-12">
            <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
            {onRefresh && (
              <Button onClick={onRefresh} variant="primary">
                Retry
              </Button>
            )}
          </div>
        ) : paginatedData.length === 0 ? (
          // No Data
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No {config.entityNamePlural.toLowerCase()} found
            </div>

            <p className="text-gray-400 dark:text-gray-500 mb-4">
              {hasActiveFilters ? "Try adjusting your filters or search terms" : `Create your first ${config.entityName.toLowerCase()} to get started`}
            </p>

            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="primary">
                Clear Filters
              </Button>
            )}
          </div>
        ) : displayMode === "card" && renderCard ? (
          // Card View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xl:gap-6 mb-8">
            {paginatedData.map((item) => (
              <ClickableCard
                key={item.id}
                item={item}
                actions={enhancedActions}
                bulkSelectionEnabled={enabledFeatures.bulkActions}
                selectedItems={selectedItems}
                onClick={handleItemClick}
                onSelectItem={selectItem}
              >
                {renderCard(item)}
              </ClickableCard>
            ))}
          </div>
        ) : displayMode === "matrix" && renderMatrix ? (
          // Matrix View
          <>{renderMatrix()}</>
        ) 
        : displayMode === "hierarchy" && renderHierarchy ? (
          // Hierarchy View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xl:gap-6 mb-8">
            {/* <RoleHierarchyView /> */}
          </div>
        ) : (
          // Table View (Default)
          config?.columns ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border-none overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <TableView
                  data={paginatedData}
                  columns={config.columns}
                  sortConfig={sortConfig as { key: keyof T; direction: "asc" | "desc" }}
                  onSort={handleSort}
                  onClickItem={actualClickHandler}
                  actions={enhancedActions}
                  selectedItems={selectedItems}
                  selectItem={selectItem}
                  isAllSelected={isAllSelected}
                  toggleSelectAll={toggleSelectAll}
                  bulkSelectionEnabled={enabledFeatures.bulkActions}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">No columns defined for this entity</div>
            </div>
          )
        )}

        {/* Pagination */}
        {enabledFeatures.pagination && displayMode !== "matrix" && displayMode !== "hierarchy" && (
          <Pagination
            endEntry={endEntry}
            pagination={{ ...pagination, total: sortedData.length }}
            startEntry={startEntry}
            totalPages={totalPages}
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

        {/* Confirmation Dialog */}
        <ConfirmModal
          dialog={confirmDialog}
          onConfirm={handleConfirm}
          onCancel={closeConfirmDialog}
        />

        {/* Preview Dialog */}
        {previewConfig && (
          <>
            <PreviewDialog
              previewState={previewState}
              config={previewConfig}
              onClose={closePreview}
              onNext={nextItem}
              onPrev={prevItem}
              canGoNext={canGoNext}
              canGoPrev={canGoPrev}
            />
          </>
        )}

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Debug Info (only in development) */}
        {enableDebug && (
          <div
            className="
              bg-gray-200
              dark:bg-gray-700
              text-gray-700
              dark:text-gray-200
              border-gray-300
              dark:border-gray-600
              border
              fixed
              bottom-12
              xl:bottom-6
              right-12
              xl:right-3
              font-mono
              h-9
              active:h-auto
              hover:h-auto
              w-9
              active:w-auto
              hover:w-auto
              max-w-sm
              overflow-hidden
              p-2
              rounded-lg
              shadow-lg
              text-xs
              z-99999
            "
          >
            <InfoIcon className="w-5 h-5" />
            <div className="font-bold mt-2">Debug Info</div>
            <div>Total Items: {data.length}</div>
            <div>Filtered Items: {filteredData.length}</div>
            <div>Selected Items: {getSelectedCount()}</div>
            <div>Display Mode: {displayMode}</div>
            <div>Actions Count: {enhancedActions?.length || 0}</div>

            {/*
            <div>Debug Modal: {debugModalOpen ? "OPEN" : "CLOSED"}</div>
            <div className="mt-2 pt-2 border-t border-gray-700 dark:border-gray-200">
              <div className="font-bold">Confirm Dialog</div>
              <div>Is Open: {confirmDialog.isOpen ? "YES" : "NO"}</div>
              <div>Type: {confirmDialog.type}</div>
              <div>Entity: {confirmDialog.entityName}</div>
              <div>Has onConfirm: {confirmDialog.onConfirm ? "YES" : "NO"}</div>
            </div>
            */}
          </div>
        )}
      </div>
    </div>
  );
};
