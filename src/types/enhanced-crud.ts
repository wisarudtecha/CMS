// /src/types/enhanced-crud.ts
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BulkAction<T> {
  key: string;
  label: string;
  // icon?: React.ComponentType<any>;
  icon?: React.ComponentType<unknown>;
  variant: "primary" | "warning" | "error";
  onClick: (selectedItems: T[]) => Promise<void>;
  condition?: (selectedItems: T[]) => boolean;
  confirmationRequired?: boolean;
  confirmationMessage?: (selectedItems: T[]) => string;
}

export interface ExportOption {
  key: string;
  label: string;
  format: "csv" | "excel" | "pdf" | "json";
  // icon?: React.ComponentType<any>;
  icon?: React.ComponentType<unknown>;
  columns?: string[];
}

export interface AdvancedFilter {
  key: string;
  label: string;
  type: "select" | "multiselect" | "date-range" | "number-range" | "text" | "boolean";
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  modifier?: "ctrl" | "alt" | "shift";
}

export interface CrudFeatures {
  search: boolean;
  sorting: boolean;
  filtering: boolean;
  pagination: boolean;
  bulkActions: boolean;
  export: boolean;
  realTimeUpdates: boolean;
  dragAndDrop: boolean;
  keyboardShortcuts: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    list: string;
    create: string;
    read: string;
    update: string;
    delete: string;
    bulkDelete: string;
    export: string;
  };
  headers?: Record<string, string>;
}
