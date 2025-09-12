// /src/components/crud/Pagination.tsx
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
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
  const { t } = useTranslation();

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
          className="mb-2 xl:mb-0"
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  const info = t("crud.common.info")
    .replace("_START_", `${startEntry}`)
    .replace("_END_", `${endEntry}`)
    .replace("_TOTAL_", `${pagination.total || 0}`);

  const paginationInfo = t("crud.common.paginate.info")
    .replace("_PAGE_", `${pagination.page}`)
    .replace("_TOTAL_", `${totalPages}`);

  return (
    <div className="xl:flex items-center justify-between">
      <div className="xl:flex items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 xl:mb-0 cursor-default">
          {/* Showing {startEntry}-{endEntry} of {pagination.total || 0} entries */}
          {info}
        </div>
        <div className="flex items-center gap-2 mb-2 xl:mb-0">
          <span className="text-sm text-gray-600 dark:text-gray-300 cursor-default">{t("crud.common.length_menu.show")}:</span>
          <span>
            <Select
              value={pagination.pageSize.toString()}
              onChange={(value) => onPageSizeChange(parseInt(value))}
              options={pageSizeOptions}
              className="cursor-pointer"
            />
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-300 cursor-default">{t("crud.common.length_menu.entries")}</span>
        </div>
      </div>

      <div className="xl:flex items-center gap-2">
        <div className="flex text-sm text-gray-600 dark:text-gray-300 mb-2 xl:mb-0 cursor-default">
          {/* Page {pagination.page} of {totalPages} */}
          {paginationInfo}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="mb-2 xl:mb-0"
          >
            {t("crud.common.paginate.previous")}
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        <div className="flex items-center gap-1">
          <Button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === totalPages}
          >
            {t("crud.common.paginate.next")}
          </Button>
        </div>
      </div>
    </div>
  );
};
