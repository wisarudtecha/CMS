// /src/utils/crud.ts
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const getUniqueValues = <T>(
  array: T[], 
  key: keyof T
): string[] => {
  return [...new Set(array.map(item => String(item[key])).filter(Boolean))];
};

export const createFilterOptions = <T>(
  array: T[], 
  key: keyof T, 
  labelFormatter?: (value: string) => string
) => {
  return getUniqueValues(array, key).map(value => ({
    value,
    label: labelFormatter ? labelFormatter(value) : value
  }));
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
