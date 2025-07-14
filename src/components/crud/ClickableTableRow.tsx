// /src/components/crud/ClickableTableRow.tsx
import React from "react";
import { TableCell } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import type { TableColumn, CrudAction } from "@/types/crud";

interface ClickableTableRowProps<T> {
  item: T;
  columns: TableColumn<T>[];
  actions?: CrudAction<T>[];
  onClick: (item: T) => void;
  selectedItems: T[];
  onSelectItem: (item: T) => void;
  bulkSelectionEnabled?: boolean;
}

export const ClickableTableRow = <T extends { id: string }>({
  item,
  columns,
  actions,
  onClick,
  selectedItems,
  onSelectItem,
  bulkSelectionEnabled = false
}: ClickableTableRowProps<T>) => {
  // const isSelected = selectedItems.some(selected => selected.id === item.id);
  const isSelected = (item: T) => selectedItems.some(selected => selected.id === item.id);

  const handleRowClick = (e: React.MouseEvent) => {
    // Don"t trigger preview if clicking on buttons or checkboxes
    const target = e.target as HTMLElement;
    if (
      target.closest("button") || 
      target.closest(`input[type="checkbox"]`) ||
      target.closest(".action-button")
    ) {
      return;
    }
    
    onClick(item);
  };

  // const handleCheckboxClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   onSelectItem(item);
  // };

  const renderCell = (column: TableColumn<T>) => {
    if (column.render) {
      return column.render(item);
    }
    
    const value = item[column.key as keyof T];
    return value?.toString() || "";
  };

  return (
    <tr 
      className={`transition-colors cursor-pointer ${
        isSelected(item) 
          ? "bg-blue-50 dark:bg-blue-900/20" 
          : "hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
      onClick={handleRowClick}
    >
      {bulkSelectionEnabled && (
        <td className="px-6 py-4 w-12">
          <input
            type="checkbox"
            checked={isSelected(item)}
            onChange={() => onSelectItem(item)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </td>
      )}
      
      {columns.map((column) => (
        <TableCell key={`${item.id}-${column.key as string}`} className={`px-6 py-4 ${column.className || ""}`}>
          {renderCell(column)}
        </TableCell>
      ))}
      
      {actions && actions.length > 0 && (
        <TableCell className="px-6 py-4">
          <div className="flex items-center gap-2">
            {actions
              .filter(action => !action.condition || action.condition(item))
              .map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.key}
                    onClick={() => action.onClick(item)}
                    variant={action.variant}
                    size="xs"
                    title={action.label}
                    className="action-button"
                  >
                    {Icon && <Icon />}
                    {action.label}
                  </Button>
                );
              })}
          </div>
        </TableCell>
      )}
    </tr>
  );
};
