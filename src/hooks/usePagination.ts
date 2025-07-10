// /src/hooks/usePagination.ts
import { useState, useMemo } from "react";
import type { PaginationConfig } from "@/types/crud";

export interface UsePaginationResult {
  pagination: PaginationConfig;
  setPagination: React.Dispatch<React.SetStateAction<PaginationConfig>>;
  totalPages: number;
  startEntry: number;
  endEntry: number;
  goToPage: (page: number) => void;
  changePageSize: (size: number) => void;
  resetPagination: () => void;
}

export const usePagination = (
  total: number,
  initialPageSize: number = 10
): UsePaginationResult => {
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: initialPageSize,
    total
  });

  const totalPages = useMemo(() => 
    Math.ceil(total / pagination.pageSize), 
    [total, pagination.pageSize]
  );

  const startEntry = useMemo(() => 
    (pagination.page - 1) * pagination.pageSize + 1, 
    [pagination.page, pagination.pageSize]
  );

  const endEntry = useMemo(() => 
    Math.min(pagination.page * pagination.pageSize, total), 
    [pagination.page, pagination.pageSize, total]
  );

  const goToPage = (page: number) => {
    setPagination(prev => ({ 
      ...prev, 
      page: Math.max(1, Math.min(page, totalPages)) 
    }));
  };

  const changePageSize = (size: number) => {
    setPagination(prev => ({ 
      ...prev, 
      pageSize: size, 
      page: 1 
    }));
  };

  const resetPagination = () => {
    setPagination({ page: 1, pageSize: initialPageSize, total });
  };

  return {
    pagination,
    setPagination,
    totalPages,
    startEntry,
    endEntry,
    goToPage,
    changePageSize,
    resetPagination
  };
};
