import React from 'react';
import { FormField, IndividualFormField } from "@/components/interface/FormField";

interface FormViewerProps {
  formData: FormField;
}

const FormViewer: React.FC<FormViewerProps> = ({ formData }) => {
    console.log(formData)
  const renderFieldValue = (field: IndividualFormField) => {
    const valueTextClasses = "text-md font-medium text-gray-900 dark:text-white";
    const labelTextClasses = "text-md text-gray-500 dark:text-gray-400";
    let valueContent: React.ReactNode;

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
        valueContent = field.value || "N/A";
        break;

      case "option": // Multi-checkbox
        valueContent = Array.isArray(field.value) && field.value.length > 0
          ? field.value.join(", ")
          : "N/A";
        break;

      case "image":
      case "dndImage":
        const singleImageUrl = field.value instanceof File ? URL.createObjectURL(field.value) : (typeof field.value === 'string' ? field.value : null);
        valueContent = singleImageUrl ? (
          <img src={singleImageUrl} alt={field.label} /> // No specific CSS classes for image
        ) : (
          "No image uploaded"
        );
        break;

      case "multiImage":
      case "dndMultiImage":
        const multiImageFiles = Array.isArray(field.value) ? field.value : [];
        valueContent = multiImageFiles.length > 0 ? (
          <div> {/* Simple div for multiple images, no grid */}
            {multiImageFiles.map((file: File | { name: string; url: string; [key: string]: any }, index: number) => {
              let imageUrl: string = "";
              if (file instanceof File || file instanceof Blob) {
                imageUrl = URL.createObjectURL(file);
              } else if (typeof file === 'object' && file !== null && 'url' in file && typeof file.url === 'string') {
                imageUrl = file.url;
              } else {
                imageUrl = "";
              }
              return imageUrl ? (
                <img key={`${file.name}-${index}`} src={imageUrl} alt={`${field.label} ${index + 1}`} /> // No specific CSS classes for image
              ) : null;
            })}
          </div>
        ) : (
          "No images uploaded"
        );
        break;

      case "InputGroup":
        // For InputGroup, just render its children directly without a wrapping div with styling
        return (
          <>
            {field.showLabel && (
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-300">{field.label}</h3>
            )}
            {Array.isArray(field.value) && field.value.map((childField: IndividualFormField) => (
              <React.Fragment key={childField.id}>
                {renderFieldValue(childField)} {/* Recursive call */}
              </React.Fragment>
            ))}
            {Array.isArray(field.value) && field.value.length === 0 && (
              <p className="text-center text-gray-500 italic text-sm mt-2">No fields in this group.</p>
            )}
          </>
        );

      case "dynamicField":
        // For dynamicField, render the selected option's value and then its associated sub-form fields directly
        const selectedOption = field.options?.find((option: any) => option.value === field.value);
        return (
          <>
            {field.showLabel && <span className={labelTextClasses}>{field.label}</span>}
            <div className={valueTextClasses}>{field.value || "N/A"}</div>
            {selectedOption && Array.isArray(selectedOption.form) && selectedOption.form.length > 0 && (
              <>
                <h4 className="text-md font-semibold mb-3 dark:text-gray-300">Details for "{field.value}"</h4>
                {selectedOption.form.map((nestedField: IndividualFormField) => (
                  <React.Fragment key={nestedField.id}>
                    {renderFieldValue(nestedField)} {/* Recursive call */}
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

    // This is the common wrapper for label and value, applied to all non-group types
    return (
      <div className="mb-2">
        {field.showLabel && <span className={labelTextClasses}>{field.label}</span>}
        <div className={valueTextClasses}>{valueContent}</div>
      </div>
    );
  };

  return (
    <div>
      {/* Removed enableFormTitle conditional rendering and styling */}

      {formData.formFieldJson.length === 0 ? (
        <p className="text-center text-gray-500 italic">No form fields to display.</p>
      ) : (
        <div> {/* No grid or other layout CSS here */}
          {formData.formFieldJson.map((field) => (
            <React.Fragment key={field.id}>
              {renderFieldValue(field)}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormViewer;
