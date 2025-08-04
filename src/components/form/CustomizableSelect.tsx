// /src/components/form/CustomizableSelect.tsx
import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options?: Option[];
  value?: string[]; // support multi-select
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  asyncFetch?: (query: string, page: number) => Promise<Option[]>;
  className?: string;
}

const CustomizableSelect: React.FC<CustomSelectProps> = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select...",
  disabled = false,
  // multiple = true,
  asyncFetch,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [fetchedOptions, setFetchedOptions] = useState<Option[]>(options);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadOptions = async (query: string, page: number) => {
    if (!asyncFetch) return;
    const newOptions = await asyncFetch(query, page);
    setFetchedOptions((prev) => (page === 1 ? newOptions : [...prev, ...newOptions]));
  };

  useEffect(() => {
    if (asyncFetch) loadOptions(inputValue, page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, page]);

  const toggleOption = (val: string) => {
    const updated = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    onChange(updated);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setPage((prev) => prev + 1);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    setInputValue("");
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm cursor-pointer ${disabled ? "opacity-50" : ""}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.map((val) => {
              const label = fetchedOptions.find((opt) => opt.value === val)?.label || val;
              return (
                <span
                  key={val}
                  className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded text-xs"
                >
                  {label}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <div
          onScroll={handleScroll}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded border bg-white dark:bg-gray-900 shadow-lg"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setPage(1);
              setInputValue(e.target.value);
            }}
            className="w-full p-2 border-b bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Search..."
          />
          {fetchedOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white ${
                value.includes(opt.value) ? "bg-blue-100 dark:bg-blue-800 text-gray-900 dark:text-white" : ""
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomizableSelect;
