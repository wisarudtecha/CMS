import { ChevronsUpDown } from "lucide-react";
import Input from "../form/input/InputField";
import { useEffect, useMemo, useRef, useState } from "react";

export const SearchableSelect: React.FC<{
    options: any[],
    value: string;
    onChange: (newValue: string) => void;
    placeholder?: string;
    disabled?: boolean;
    isDynamic?: boolean;
    className?: string;
}> = ({ options, value, onChange, placeholder, disabled, isDynamic = false, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(opt => {
            const label = isDynamic ? opt.value : opt;
            return label.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [options, searchTerm, isDynamic]);

    const selectedLabel = useMemo(() => {
        const selected = options.find(opt => (isDynamic ? opt.value : opt) === value);
        return selected ? (isDynamic ? selected.value : selected) : placeholder || "Select an option";
    }, [options, value, placeholder, isDynamic]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (option: any) => {
        onChange(isDynamic ? option.value : option);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className={className}>
            <div className="relative" ref={wrapperRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700 text-left flex justify-between items-center"
                >
                    <span className="truncate">{selectedLabel}</span>
                    <ChevronsUpDown size={16} className="text-gray-400" />
                </button>
                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 rounded-md shadow-lg border dark:border-gray-700">
                        <div className="p-2">
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className={`w-full`}
                            />
                        </div>
                        <ul className="max-h-60 overflow-auto">
                            {filteredOptions.map((option, index) => {
                                const optionValue = isDynamic ? option.value : option;
                                const optionKey = isDynamic ? option.value : `${option}-${index}`;
                                return (
                                    <li
                                        key={optionKey}
                                        onClick={() => handleSelect(option)}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                        {optionValue}
                                    </li>
                                );
                            })}
                            {filteredOptions.length === 0 && (
                                <li className="px-4 py-2 text-sm text-gray-500 italic">No options found.</li>
                            )}
                        </ul>
                    </div>
                )}
            </div></div>
    );
};