// /src/components/crud/EnhancedCrudContainer.tsx
import React, { useState, useCallback, useMemo } from "react";
import Button from "@/components/ui/button/Button";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import { DisplayModeToggle } from "./DisplayModeToggle";
// import { EnhancedDataTable } from "./EnhancedDataTable";
// import { EnhancedCardGrid } from "./EnhancedCardGrid";
import { Pagination } from "./Pagination";
import { ToastContainer } from "./ToastContainer";
import { ConfirmModal } from "./ConfirmModal";
import { BulkActionBar } from "./BulkActionBar";
import { ExportMenu } from "./ExportMenu";
import { AdvancedFilterPanel } from "./AdvancedFilterPanel";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { PreviewDialog } from "./PreviewDialog";
import { ClickableCard } from "./ClickableCard";
import { ClickableTableRow } from "./ClickableTableRow";
import { usePagination } from "@/hooks/usePagination";
import { useSort } from "@/hooks/useSort";
import { useFilter } from "@/hooks/useFilter";
import { useToast } from "@/hooks/useToast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { usePreview } from "@/hooks/usePreview";
import { useApi } from "@/hooks/useApi";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import {
  // exportToCSV,
  exportToJSON
} from "@/utils/export";
import { apiService } from "@/services/api";
import { InfoIcon, ChevronDownIcon, ChevronUpIcon } from "@/icons";
import type { 
  BulkAction, 
  ExportOption, 
  AdvancedFilter,
  KeyboardShortcut,
  CrudFeatures,
  ApiConfig,
  PreviewConfig
} from "@/types/enhanced-crud";
import type { CrudConfig } from "@/types/crud";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Checkbox from "@/components/form/input/Checkbox"; 
interface EnhancedCrudContainerProps<T> {
  data: T[];
  config: CrudConfig<T>;
  features?: Partial<CrudFeatures>;
  previewConfig?: PreviewConfig<T>;
  apiConfig?: ApiConfig;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onCreate?: () => void;
  onUpdate?: (item: T) => void;
  onDelete?: (id: string) => void;
  renderCard?: (item: T) => React.ReactNode;
  customFilterFunction?: (item: T, filters: unknown) => boolean;
  searchFields?: (keyof T)[];
  bulkActions?: BulkAction<T>[];
  exportOptions?: ExportOption[];
  advancedFilters?: AdvancedFilter[];
  keyboardShortcuts?: KeyboardShortcut[];
  enableDebug?: boolean;
  onItemAction?: (action: string, item: T) => void;
  onItemClick?: (item: T) => void;
}

export const EnhancedCrudContainer = <T extends { id: string }>({
  data,
  config,
  previewConfig,
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
  onItemAction,
  onItemClick
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
    // preview: true,
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

  const { toasts, addToast, removeToast } = useToast();
  const { confirmDialog, openConfirmDialog, closeConfirmDialog, handleConfirm } = useConfirmDialog();
  
  // Debug the confirmDialog state changes
  React.useEffect(() => {
    console.log("EnhancedCrudContainer: confirmDialog state changed:", confirmDialog);
  }, [confirmDialog]);

  const {
    selectedItems,
    // isSelected,
    isAllSelected,
    // isPartialSelected,
    selectItem,
    selectAll,
    deselectAll,
    toggleSelectAll,
    getSelectedCount
  } = useBulkSelection(sortedData);

  // Preview functionality
  const {
    previewState,
    openPreview,
    closePreview,
    nextItem,
    prevItem,
    canGoNext,
    canGoPrev
  } = usePreview<T>();

  // API hooks
  const deleteApi = useApi(apiService.delete as (...args: unknown[]) => Promise<unknown>);
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
  }, [
    handleDeleteItem,
    config.actions,
    onItemAction
  ]);

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

  // Handle item click for preview
  const handleItemClick = useCallback((item: T) => {
    if (previewConfig) {
      openPreview(item, sortedData);
    }
  }, [previewConfig, openPreview, sortedData]);

  const actualClickHandler = onItemClick || handleItemClick;

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
                  <div className="mb-2 xl:mb-0">
                    <DisplayModeToggle mode={displayMode} onChange={setDisplayMode} />
                  </div>

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

                  {enabledFeatures.export && allExportOptions.length > 0 && (
                    <div className="mb-2 xl:mb-0">
                      <ExportMenu
                        data={selectedItems.length > 0 ? selectedItems : sortedData}
                        exportOptions={allExportOptions}
                        onExport={handleExport}
                      />
                    </div>
                  )}

                  {/*
                  {previewConfig && (
                    <div className="mb-2 xl:mb-0">
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        (Click items to preview)
                      </span>
                    </div>
                  )}
                  */}
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
          // <EnhancedCardGrid
          //   data={paginatedData}
          //   renderCard={renderCard}
          //   actions={enhancedActions}
          //   selectedItems={selectedItems}
          //   onSelectItem={selectItem}
          //   bulkSelectionEnabled={enabledFeatures.bulkActions}
          //   className="mb-8"
          // />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xl:gap-6 mb-8">
            {paginatedData.map((item) => (
              <ClickableCard
                key={item.id}
                item={item}
                // onClick={handleItemClick}
                onClick={handleItemClick}
                actions={enhancedActions}
                selectedItems={selectedItems}
                onSelectItem={selectItem}
                bulkSelectionEnabled={enabledFeatures.bulkActions}
              >
                {renderCard(item)}
              </ClickableCard>
            ))}
          </div>
        ) : (
          // <EnhancedDataTable
          //   data={paginatedData}
          //   columns={config.columns}
          //   sortConfig={sortConfig}
          //   onSort={handleSort}
          //   actions={enhancedActions}
          //   selectedItems={selectedItems}
          //   onSelectItem={selectItem}
          //   onSelectAll={toggleSelectAll}
          //   isAllSelected={isAllSelected}
          //   isPartialSelected={isPartialSelected}
          //   bulkSelectionEnabled={enabledFeatures.bulkActions}
          //   className="mb-8"
          // />

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border-none overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    {enabledFeatures.bulkActions && (
                      <TableCell isHeader className="px-6 py-3 text-left w-12">
                        <Checkbox
                          checked={isAllSelected}
                          // ref={(input) => {
                          //   if (input) input.indeterminate = isPartialSelected;
                          // }}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </TableCell>
                    )}
                    
                    {config.columns.map((column) => (
                      <TableCell isHeader key={column.key as string} className="px-6 py-3 text-left">
                        {column.sortable ? (
                          <button
                            onClick={() => handleSort(column.key as keyof T)}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                          >
                            {column.label}
                            {sortConfig.key === column.key && (
                              sortConfig.direction === "asc" 
                                ? <ChevronUpIcon className="w-4 h-4" /> 
                                : <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {column.label}
                          </span>
                        )}
                      </TableCell>
                    ))}
                    
                    {enhancedActions && enhancedActions.length > 0 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.map((item) => (
                    <ClickableTableRow
                      key={item.id}
                      item={item}
                      columns={config.columns}
                      actions={enhancedActions}
                      // onClick={handleItemClick}
                      onClick={actualClickHandler}
                      selectedItems={selectedItems}
                      onSelectItem={selectItem}
                      bulkSelectionEnabled={enabledFeatures.bulkActions}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
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

        {/* Debug Info (only in development) */}
        {enableDebug && (
          // ""
          <div
            className="
              fixed
              bottom-12
              right-12
              xl:bottom-6
              xl:right-3
              bg-gray-200
              dark:bg-gray-700
              text-gray-700
              dark:text-gray-200
              border-gray-300
              dark:border-gray-600
              border
              p-2
              rounded-lg
              shadow-lg
              max-w-sm
              text-xs
              font-mono
              z-40
              h-9
              hover:h-auto
              w-9
              hover:w-auto
              overflow-hidden
            "
          >
            <InfoIcon className="w-5 h-5" />
            <div className="font-bold mt-2">Debug Info</div>
            <div>Total Items: {data.length}</div>
            <div>Filtered Items: {filteredData.length}</div>
            <div>Selected Items: {getSelectedCount()}</div>
            <div>Display Mode: {displayMode}</div>
            <div>Actions Count: {enhancedActions?.length || 0}</div>
            {/* <div>Debug Modal: {debugModalOpen ? "OPEN" : "CLOSED"}</div> */}
            <div className="mt-2 pt-2 border-t border-gray-700 dark:border-gray-200">
              <div className="font-bold">Confirm Dialog</div>
              <div>Is Open: {confirmDialog.isOpen ? "YES" : "NO"}</div>
              <div>Type: {confirmDialog.type}</div>
              <div>Entity: {confirmDialog.entityName}</div>
              <div>Has onConfirm: {confirmDialog.onConfirm ? "YES" : "NO"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
