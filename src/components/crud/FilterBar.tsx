// /src/components/crud/FilterBar.tsx
import React from "react";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { CloseIcon } from "@/icons";
import type { FilterDefinition, FilterConfig } from "@/types/crud";

interface FilterBarProps {
  filters: FilterDefinition[];
  values: FilterConfig;
  onChange: (key: string, value: string | number | boolean | undefined) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  values,
  onChange,
  onClear,
  hasActiveFilters
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2">
          {filter.type === "select" && filter.options && (
            <Select
              value={values[filter.key] as string || ""}
              onChange={(value) => onChange(filter.key, value)}
              options={filter.options}
              placeholder={filter.placeholder || `Select ${filter.label}`}
            />
          )}
        </div>
      ))}

      {hasActiveFilters && (
        <Button
          onClick={onClear}
          className="h-11"
        >
          <CloseIcon className="w-4 h-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};
