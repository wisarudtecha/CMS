// /src/types/enhanced-crud.ts
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BulkAction<T> {
  key: string;
  label: string;
  icon?: React.ComponentType<unknown>;
  // variant: "primary" | "warning" | "error";
  variant: "primary" | "success" | "error" | "warning" | "info" | "light" | "dark"
    | "outline" | "outline-primary" | "outline-success" | "outline-error" | "outline-warning" | "outline-info"
    | "ghost" | "ghost-primary" | "ghost-success" | "ghost-error" | "ghost-warning" | "ghost-info"
    | "outline-no-transparent";
  onClick: (selectedItems: T[]) => Promise<void>;
  condition?: (selectedItems: T[]) => boolean;
  confirmationRequired?: boolean;
  confirmationMessage?: (selectedItems: T[]) => string;
}

export interface ExportOption {
  key: string;
  label: string;
  format: "csv" | "excel" | "pdf" | "json";
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
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  maxSelections?: number;
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
  // preview: boolean;
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

export interface PreviewField<T = string> {
  key: string;
  label: string;
  type: "text" | "badge" | "date" | "number" | "tags" | "json" | "custom";
  render?: (value: string, item: T) => React.ReactNode;
  className?: string;
  copyable?: boolean;
}

export interface PreviewTab<T = string> {
  key: string;
  label: string;
  icon?: React.ComponentType<unknown>;
  fields?: PreviewField<T>[];
  render?: (item: T) => React.ReactNode;
}

export interface PreviewConfig<T> {
  title: (item: T) => string;
  subtitle?: (item: T) => string;
  avatar?: (item: T) => React.ReactNode;
  tabs: PreviewTab<T>[];
  actions?: PreviewAction<T>[];
  enableNavigation?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export interface PreviewAction<T> {
  key: string;
  label: string;
  icon?: React.ComponentType<unknown>;
  variant: "primary" | "success" | "error" | "warning" | "info" | "light" | "dark"
    | "outline" | "outline-primary" | "outline-success" | "outline-error" | "outline-warning" | "outline-info"
    | "ghost" | "ghost-primary" | "ghost-success" | "ghost-error" | "ghost-warning" | "ghost-info"
    | "outline-no-transparent";
  onClick: (item: T, closePreview: () => void) => void;
  condition?: (item: T) => boolean;
}

export interface PreviewState<T> {
  isOpen: boolean;
  item: T | null;
  currentIndex: number;
  totalItems: number;
}
