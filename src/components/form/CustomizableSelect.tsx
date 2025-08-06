// /src/components/form/CustomizableSelect.tsx
import { useEffect, useRef, useState } from "react";
import Input from "@/components/form/input/InputField";

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
  onModal?: boolean;
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
  onModal = false
}) => {
  const [inputValue, setInputValue] = useState("");
  const [fetchedOptions, setFetchedOptions] = useState<Option[]>(options);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadOptions = async (query: string, page: number) => {
    if (!asyncFetch) {
      return;
    }
    const newOptions = await asyncFetch(query, page);
    setFetchedOptions((prev) => (page === 1 ? newOptions : [...prev, ...newOptions]));
  };

  useEffect(() => {
    if (!asyncFetch) {
      // Client-side filtering logic
      const filtered = options.filter((opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      const pageSize = 20;
      const start = (page - 1) * pageSize;
      const end = page * pageSize;
      setFetchedOptions((prev) =>
        page === 1 ? filtered.slice(start, end) : [...prev, ...filtered.slice(start, end)]
      );
      return;
    }

    if (inputValue.length < 3) {
      setFetchedOptions([]); // Clear options if not enough characters
      return;
    }

    const delayDebounce = setTimeout(() => {
      loadOptions(inputValue, page);
    }, 3000); // Wait 3 seconds

    return () => clearTimeout(delayDebounce);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, page, asyncFetch, options]);

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
        className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-400 dark:text-gray-400 cursor-pointer ${disabled ? "opacity-50" : ""}`}
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
          className={`${!onModal && "absolute max-h-60"} z-99999 mt-1 w-full overflow-y-auto rounded border bg-white dark:bg-gray-900 shadow-lg`}
        >
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setPage(1);
              setInputValue(e.target.value);
            }}
            className="rounded-none border-0 border-b-2"
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
