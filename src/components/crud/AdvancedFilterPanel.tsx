// /src/components/crud/AdvancedFilterPanel.tsx
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/modal";
import {
  // FilterIcon,
  CloseIcon
} from "@/icons";
import type { AdvancedFilter } from "@/types/enhanced-crud";
import type { FilterConfig } from "@/types/crud";

interface AdvancedFilterPanelProps {
  filters: AdvancedFilter[];
  values: FilterConfig;
  onChange: (filters: FilterConfig) => void;
  onApply: () => void;
  onReset: () => void;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  filters,
  values,
  onChange,
  onApply,
  onReset
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localValues, setLocalValues] = useState<FilterConfig>(values);

  const handleFilterChange = (key: string, value: unknown) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onChange(localValues);
    onApply();
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalValues({});
    onReset();
    setIsOpen(false);
  };

  const renderFilter = (filter: AdvancedFilter) => {
    const value = localValues[filter.key];

    switch (filter.type) {
      case "select":
        return (
          <Select
            value={value as string || ""}
            onChange={(newValue) => handleFilterChange(filter.key, newValue)}
            options={filter.options || []}
            placeholder={filter.placeholder}
            multiple={filter.multiple}
          />
        );

      case "text":
        return (
          <Input
            type="text"
            value={value as string || ""}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
          />
        );

      case "date-range":
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={(value as { start?: string })?.start || ""}
              onChange={(e) => handleFilterChange(filter.key, {
                ...(value as { start?: string }),
                start: e.target.value
              })}
              placeholder="Start date"
            />
            <Input
              type="date"
              value={(value as { end?: string })?.end || ""}
              onChange={(e) => handleFilterChange(filter.key, {
                ...(value as { end?: string }),
                end: e.target.value
              })}
              placeholder="End date"
            />
          </div>
        );

      case "number-range":
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={(value as { min?: string })?.min || ""}
              onChange={(e) => handleFilterChange(filter.key, {
                ...(value as { min?: string }),
                min: parseInt(e.target.value) || undefined
              })}
              placeholder={`Min (${filter.min || 0})`}
              min={`${filter.min}`}
              max={`${filter.max}`}
            />
            <Input
              type="number"
              value={(value as { max?: string })?.max || ""}
              onChange={(e) => handleFilterChange(filter.key, {
                ...(value as { max?: string }),
                max: parseInt(e.target.value) || undefined
              })}
              placeholder={`Max (${filter.max || 100})`}
              min={`${filter.min}`}
              max={`${filter.max}`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = Object.values(localValues).some(v => 
    v !== "" && v !== null && v !== undefined
  );

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="h-11"
      >
        {/* <FilterIcon className="w-4 h-4" /> */}
        Advanced Filters
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full text-xs">
            {Object.values(localValues).filter(v => v !== "" && v !== null && v !== undefined).length}
          </span>
        )}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Advanced Filters
          </h3>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            <CloseIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6 max-h-96 overflow-y-auto">
          {filters.map(filter => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {filter.label}
              </label>
              {renderFilter(filter)}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
          <Button onClick={handleApply} variant="primary">
            Apply Filters
          </Button>
        </div>
      </Modal>
    </>
  );
};
