// /src/components/crud/Pagination.tsx
import React from "react";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import type { PaginationConfig } from "@/types/crud";

interface PaginationProps {
  pagination: PaginationConfig;
  totalPages: number;
  startEntry: number;
  endEntry: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: { value: string; label: string }[];
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  totalPages,
  startEntry,
  endEntry,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ]
}) => {
  // if (totalPages <= 1) {
  //   return null;
  // }

  if (totalPages <= 0) {
    return null;
  }

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          onClick={() => onPageChange(i)}
          variant={pagination.page === i ? "info" : "primary"}
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing {startEntry}-{endEntry} of {pagination.total || 0} entries
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Show:</span>
          <Select
            value={pagination.pageSize.toString()}
            onChange={(value) => onPageSizeChange(parseInt(value))}
            options={pageSizeOptions}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">entries</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Page {pagination.page} of {totalPages}
        </div>
        
        <Button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        <Button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
