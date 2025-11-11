// /src/components/common/Checkbox.tsx
import React from "react";
import "@/styles/Checkbox.css";

interface CheckboxProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  disabled,
  label,
  onChange
}) => {
  return (
    <label className="checkbox-container">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
    </label>
  );
};

export default Checkbox;
