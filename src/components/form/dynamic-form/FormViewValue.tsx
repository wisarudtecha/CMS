import React from 'react';
import { FormField, IndividualFormField } from "@/components/interface/FormField";

interface FormViewerProps {
  formData: FormField;
}

const FormViewer: React.FC<FormViewerProps> = ({ formData }) => {
  const renderFieldValue = (field: IndividualFormField) => {
    const valueTextClasses = "text-md font-medium text-gray-900 dark:text-white";
    const labelTextClasses = "text-md text-gray-500 dark:text-gray-400";
    let valueContent: React.ReactNode;

    // Helper to render the label with a required indicator
    const renderLabel = (label: string, required?: boolean) => (
      <span className={labelTextClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
    );

    switch (field.type) {
      case "textInput":
      case "emailInput":
      case "passwordInput":
      case "Integer":
      case "textAreaInput":
      case "dateInput":
      case "dateLocal":
      case "select":
      case "radio":
        valueContent = field.value || "-";
        break;

      case "option": // Multi-checkbox
        valueContent = Array.isArray(field.value) && field.value.length > 0
          ? field.value.join(", ")
          : "-";
        break;

      case "image":
      case "dndImage":
        const singleImageUrl = field.value instanceof File ? URL.createObjectURL(field.value) : (typeof field.value === 'string' ? field.value : null);
        valueContent = singleImageUrl ? (
          <img src={singleImageUrl} alt={field.label} className="max-w-xs h-auto" /> // Added some basic image styling
        ) : (
          "No image uploaded"
        );
        break;

      case "multiImage":
      case "dndMultiImage":
        const multiImageFiles = Array.isArray(field.value) ? field.value : [];
        valueContent = multiImageFiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"> {/* Added a grid for multiple images */}
            {multiImageFiles.map((file: File | { name: string; url: string;[key: string]: any }, index: number) => {
              let imageUrl: string = "";
              if (file instanceof File || file instanceof Blob) {
                imageUrl = URL.createObjectURL(file);
              } else if (typeof file === 'object' && file !== null && 'url' in file && typeof file.url === 'string') {
                imageUrl = file.url;
              } else {
                imageUrl = "";
              }
              return imageUrl ? (
                <img key={`${file.name}-${index}`} src={imageUrl} alt={`${field.label} ${index + 1}`} className="max-w-full h-auto" />
              ) : null;
            })}
          </div>
        ) : (
          "No images uploaded"
        );
        break;

      case "InputGroup":
        return (
          <>
            {field.showLabel && (
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-300">
                {renderLabel(field.label, field.required)}
              </h3>
            )}
            {Array.isArray(field.value) && field.value.map((childField: IndividualFormField) => (
              <React.Fragment key={childField.id}>
                {renderFieldValue(childField)}
              </React.Fragment>
            ))}
            {Array.isArray(field.value) && field.value.length === 0 && (
              <p className="text-center text-gray-500 italic text-sm mt-2">No fields in this group.</p>
            )}
          </>
        );

      case "dynamicField":
        const selectedOption = field.options?.find((option: any) => option.value === field.value);
        return (
          <>
            {field.showLabel && renderLabel(field.label, field.required)}
            <div className={valueTextClasses}>{field.value || "-"}</div>
            {selectedOption && Array.isArray(selectedOption.form) && selectedOption.form.length > 0 && (
              <>
                <h4 className="text-md font-semibold mb-3 dark:text-gray-300">Details for "{field.value}"</h4>
                {selectedOption.form.map((nestedField: IndividualFormField) => (
                  <React.Fragment key={nestedField.id}>
                    {renderFieldValue(nestedField)}
                  </React.Fragment>
                ))}
              </>
            )}
          </>
        );

      default:
        valueContent = <p className="text-red-500">Unsupported field type: {field.type}</p>;
        break;
    }

    return (
      <div className="mb-2">
        {field.showLabel && renderLabel(field.label, field.required)}
        <div className={valueTextClasses}>&nbsp;&nbsp;&nbsp;&nbsp;{valueContent}</div>
      </div>
    );
  };

  return (
    <div>
      {(formData?.formFieldJson?.length || 0) > 0 ? (
        formData.formFieldJson.map((field) => (
          <React.Fragment key={field.id}>
            {renderFieldValue(field)}
          </React.Fragment>
        ))
      ) : null}
    </div>
  );
};

export default FormViewer;