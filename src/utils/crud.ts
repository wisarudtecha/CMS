// /src/utils/crud.ts
export const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const formatLastLogin = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
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


