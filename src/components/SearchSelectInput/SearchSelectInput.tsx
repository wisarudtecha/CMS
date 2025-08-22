import { ChevronsUpDown } from "lucide-react";
import Input from "../form/input/InputField";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Calculate dropdown position
    const calculatePosition = useCallback(() => {
        if (!wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const dropdownHeight = 300; // Approximate max height (60*4 + padding + search input)

        const spaceBelow = windowHeight - rect.bottom;
        const spaceAbove = rect.top;

        // If not enough space below but enough space above, position on top
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            setDropdownPosition('top');
        } else {
            setDropdownPosition('bottom');
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Calculate position when dropdown opens
    useEffect(() => {
        if (isOpen) {
            calculatePosition();
            // Recalculate on scroll/resize
            const handleScroll = () => calculatePosition();
            const handleResize = () => calculatePosition();

            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('scroll', handleScroll, true);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [isOpen, calculatePosition]);

    const handleSelect = (option: any) => {
        onChange(isDynamic ? option.value : option);
        setIsOpen(false);
        setSearchTerm("");
    };

    const dropdownClasses = `
        absolute z-10 w-full bg-white dark:bg-gray-900 rounded-md shadow-lg border dark:border-gray-700
        ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}
    `;

    return (
        <div className={className}>
            <div className="relative" ref={wrapperRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700 text-left flex justify-between items-center"
                >
                    <span className="truncate">{selectedLabel}</span>
                    <ChevronsUpDown size={16} className="text-gray-400" />
                </button>
                {isOpen && (
                    <div className={dropdownClasses} ref={dropdownRef}>
                        <div className="p-2">
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <ul className="max-h-60 overflow-auto custom-scrollbar">
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
            </div>
        </div>
    );
};