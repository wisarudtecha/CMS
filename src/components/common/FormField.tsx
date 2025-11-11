// /src/components/common/FormField.tsx
import React from "react";
import "@/styles/FormField.css";

interface FormFieldProps {
  children: React.ReactNode;
  error?: string;
  helpText?: string;
  label: string;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  children,
  error,
  helpText,
  label,
  required
}) => {
  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      {children}
      {helpText && <span className="help-text">{helpText}</span>}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default FormField;
