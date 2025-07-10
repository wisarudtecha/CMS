// /src/hooks/useFilter.ts
import {
  useState,
  useMemo,
  // useCallback
} from "react";
import type { FilterConfig } from "@/types/crud";

export interface UseFilterResult<T> {
  filterConfig: FilterConfig;
  setFilterConfig: React.Dispatch<React.SetStateAction<FilterConfig>>;
  filteredData: T[];
  handleFilter: (key: string, value: string | number | boolean | null | undefined) => void;
  // handleFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export const useFilter = <T>(
  data: T[],
  filterFunction?: (item: T, filters: FilterConfig) => boolean,
  searchFields?: (keyof T)[]
): UseFilterResult<T> => {
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});

  const defaultFilterFunction = 
    // useCallback(
      (item: T, filters: FilterConfig): boolean => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) {
            return true;
          }

          // Handle special "search" key - search across multiple fields
          if (key === "search" && typeof value === "string") {
            const searchTerm = value.toLowerCase();
            // const fieldsToSearch = searchFields || ["name", "description", "title"] as (keyof T)[];
            const fieldsToSearch: (keyof T)[] = (searchFields || []) as (keyof T)[];
            
            return fieldsToSearch.some(field => {
              const fieldValue = item[field];
              // const fieldValue = item[field as keyof T];
              // const fieldValue = (item as any)[field];
              return fieldValue && String(fieldValue).toLowerCase().includes(searchTerm);
            });
          }
          
          // Handle regular field filtering
          const itemValue = (item as Record<string, unknown>)[key];
          // const itemValue = (item as any)[key];
          if (typeof value === "string") {
            return String(itemValue).toLowerCase().includes(value.toLowerCase());
          }
          return itemValue === value;
        });
      }
    // , [])
  ;

  const filteredData = useMemo(() => {
    const filterFn = filterFunction || defaultFilterFunction;
    return data.filter(item => filterFn(item, filterConfig));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    filterConfig,
    filterFunction,
    // defaultFilterFunction
  ]);
  
  const handleFilter = (key: string, value: string | number | boolean | null | undefined) => {
    setFilterConfig(prev => ({ ...prev, [key]: value }));
  };

  // const handleFilter = (key: string, value: any) => {
  //   setFilterConfig(prev => ({ ...prev, [key]: value }));
  // };

  const clearFilters = () => {
    setFilterConfig({});
  };

  const hasActiveFilters = useMemo(() => 
    Object.values(filterConfig).some(value => 
      value !== "" && value !== null && value !== undefined
    ), 
    [filterConfig]
  );

  return {
    filterConfig,
    setFilterConfig,
    filteredData,
    handleFilter,
    clearFilters,
    hasActiveFilters
  };
};
