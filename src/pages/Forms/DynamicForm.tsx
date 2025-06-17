import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FormField } from "@/components/interface/FormField";

// --- Interface Definitions ---
interface FormConfigItem {
  formType: string;
  title: string;
  options?: string[];
}


interface DynamicFormProps {
  form?: FormField[];
  edit?: boolean;
  showDynamicForm?: React.Dispatch<React.SetStateAction<boolean>>;
  onFormSubmit?: (data: FormField[]) => void;
}


// --- Form Configurations ---
const formConfigurations: FormConfigItem[] = [
  { formType: "textInput", title: "Text Form" },
  { formType: "Integer", title: "Number Form" }, // Added Integer type
  { formType: "textAreaInput", title: "Text Area Form" },
  { formType: "emailInput", title: "Email Form" },
  { formType: "option", title: "Multiple Select Form", options: [] },
  { formType: "select", title: "Single Select Form", options: [] },
  { formType: "image", title: "Image Upload Form" },
  { formType: "multiImage", title: "Multi-Image Upload Form" },
  { formType: "passwordInput", title: "Password Form" },
  { formType: "dateInput", title: "Date Form" },
];

// --- Helper Function to Create New Fields ---
function createDynamicFormField(
  config: FormConfigItem[],
  typeToInsert: string
): FormField | undefined {
  const configItem = config.find((item) => item.formType === typeToInsert);

  if (!configItem) {
    console.warn(`Form type "${typeToInsert}" not found in configuration.`);
    return undefined;
  }
  // Generate a unique ID for the new field
  const id = `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let defaultValue: any;
  let fieldOptions: string[] | undefined;
  let newOptionText: string | undefined;

  switch (configItem.formType) {
    case "textInput":
    case "textAreaInput":
    case "emailInput":
    case "passwordInput":
    case "dateInput": // Handle date input
      defaultValue = "";
      break;
    case "Integer": // Handle Integer input
      defaultValue = null; // Initialize with null or 0, depending on preference
      break;
    case "option":
      defaultValue = []; // For checkboxes
      fieldOptions = configItem.options || [];
      newOptionText = "";
      break;
    case "select":
      defaultValue = ""; // For select dropdown
      fieldOptions = configItem.options || [];
      newOptionText = "";
      break;
    case "image":
      defaultValue = null; // Single file (File object or null)
      break;
    case "multiImage":
      defaultValue = []; // Array of File objects
      break;
    default:
      defaultValue = null;
      break;
  }

  return {
    id: id,
    label: configItem.title,
    type: configItem.formType,
    value: defaultValue,
    ...(fieldOptions && { options: fieldOptions }),
    ...(newOptionText !== undefined && { newOptionText: newOptionText }),
    required: false,
  };
}

export default function DynamicForm({ form = [], edit = true, showDynamicForm, onFormSubmit }: DynamicFormProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [dynamicFormFields, setDynamicFormFields] = useState<FormField[]>(form);
  const addField = useCallback((formType: string) => {
    const newField = createDynamicFormField(formConfigurations, formType);
    if (newField) {
      setDynamicFormFields((prevFields) => [...prevFields, newField]);
    }
  }, []);
  const saveSchema = () => {
    console.log("Saved Form")
  }

  useEffect(() => {
      setDynamicFormFields(form);
  }, [form !== dynamicFormFields]);

  const handleFieldChange = useCallback((id: string, newValue: any) => {
    setDynamicFormFields((prevFields) =>
      prevFields.map((field) => {
        if (field.id === id) {
          if (field.type === "image" || field.type === "multiImage") {
            // Correctly handle FileList: convert to array for multiImage, single file for image
            const valueToStore =
              field.type === "multiImage" && newValue instanceof FileList
                ? Array.from(newValue)
                : newValue instanceof FileList
                  ? newValue[0] || null
                  : newValue;
            return { ...field, value: valueToStore };
          }
          if (field.type === "Integer") {
            const numValue = parseInt(newValue, 10);
            return { ...field, value: isNaN(numValue) ? null : numValue }; // Store null for empty or invalid number
          }
          return { ...field, value: newValue };
        }
        return field;
      })
    );
  }, []);

  const handleLabelChange = useCallback((id: string, newLabel: string) => {
    setDynamicFormFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, label: newLabel } : field
      )
    );
  }, []);

  const handleAddOption = useCallback((id: string, newOptionTextValue: string) => {
    setDynamicFormFields((prevFields) =>
      prevFields.map((field) => {
        if (field.id === id && newOptionTextValue.trim() !== "") {
          const newOption = newOptionTextValue.trim();
          if (field.options && !field.options.includes(newOption)) {
            return {
              ...field,
              options: [...field.options, newOption],
            };
          } else if (!field.options) {
            return {
              ...field,
              options: [newOption],
            };
          }
        }
        return field;
      })
    );
  }, []);

  const removeField = useCallback((id: string) => {
    setDynamicFormFields((prevFields) => prevFields.filter((field) => field.id !== id));
  }, []);

  const handleSend = useCallback(() => {
    const allFieldsValid = dynamicFormFields.every(field => {
      if (field.required) {
        if (Array.isArray(field.value)) {
          return field.value.length > 0;
        } else if (typeof field.value === 'string') {
          return field.value.trim() !== '';
        } else if (field.type === 'Integer') { // Specific validation for Integer type
          return typeof field.value === 'number' && !isNaN(field.value) && field.value !== null;
        } else if (field.value === null || field.value === undefined) {
          return false;
        }
      }
      return true;
    });

    if (allFieldsValid) {
      console.log("Current Dynamic Form Data:", dynamicFormFields);
      if (onFormSubmit) {
        onFormSubmit(dynamicFormFields);
      }
    } else {
      alert("Please fill in all required fields.");
    }
    onFormSubmit && onFormSubmit(dynamicFormFields)
  }, [dynamicFormFields, onFormSubmit]);

  const updateFieldId = useCallback((oldId: string, newId: string) => {
    const trimmedNewId = newId.trim();
    if (!trimmedNewId) {
      alert("Field ID cannot be empty!");
      return;
    }
    const idExists = dynamicFormFields.some(
      (field) => field.id === trimmedNewId && field.id !== oldId
    );
    if (idExists) {
      alert(`Error: ID '${trimmedNewId}' already exists. Please choose a unique ID.`);
      return;
    }

    setDynamicFormFields((prevFields) =>
      prevFields.map((field) =>
        field.id === oldId ? { ...field, id: trimmedNewId } : field
      )
    );
  }, [dynamicFormFields]);

  const handleRemoveOption = useCallback((fieldId: string, optionIndexToRemove: number) => {
    setDynamicFormFields(prevFields =>
      prevFields.map(field => {
        if (field.id === fieldId && field.options) {
          const updatedOptions = field.options.filter((_, index) => index !== optionIndexToRemove);
          let newValue = field.value;
          if (field.type === "select" && field.value === field.options[optionIndexToRemove]) {
            newValue = "";
          } else if (field.type === "option" && Array.isArray(field.value)) {
            newValue = field.value.filter(
              (val: string) => val !== field.options?.[optionIndexToRemove]
            );
          }
          return {
            ...field,
            options: updatedOptions,
            value: newValue,
          };
        }
        return field;
      })
    );
  }, []);

  // handleRemoveFile is for preview mode interaction
  const handleRemoveFile = useCallback((fieldId: string, fileNameToRemove?: string) => {
    setDynamicFormFields(prevFields =>
      prevFields.map(field => {
        if (field.id === fieldId) {
          if (field.type === "image") {
            // For single image, simply clear the value
            return { ...field, value: null };
          } else if (field.type === "multiImage" && Array.isArray(field.value)) {
            // For multi-image, filter out the file by name
            const updatedFiles = field.value.filter((file: File) => file.name !== fileNameToRemove);
            return { ...field, value: updatedFiles };
          }
        }
        return field;
      })
    );
  }, []);

  const handleToggleRequired = useCallback((id: string) => {
    setDynamicFormFields(prevFields =>
      prevFields.map(field =>
        field.id === id ? { ...field, required: !field.required } : field
      )
    );
  }, []);

  // --- FieldEditItem Component (Internal to DynamicForm) ---
  interface FieldEditItemProps {
    field: FormField;
    handleLabelChange: (id: string, newLabel: string) => void;
    updateFieldId: (oldId: string, newId: string) => void;
    handleAddOption: (id: string, newOptionText: string) => void;
    handleRemoveOption: (fieldId: string, optionIndexToRemove: number) => void;
    removeField: (id: string) => void;
    handleToggleRequired: (id: string) => void; // Add this prop
  }

  const FieldEditItem: React.FC<FieldEditItemProps> = React.memo(({
    field,
    handleLabelChange,
    updateFieldId,
    handleAddOption,
    handleRemoveOption,
    removeField,
    handleToggleRequired,
  }) => {
    const [localIdValue, setLocalIdValue] = useState(field.id);
    const [localLabelValue, setLocalLabelValue] = useState(field.label);
    const [localNewOptionText, setLocalNewOptionText] = useState("");

    const idInputRef = useRef<HTMLInputElement>(null);
    const labelInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
      setLocalIdValue(field.id);
    }, [field.id]);

    useEffect(() => {
      setLocalLabelValue(field.label);
    }, [field.label]);

    const handleLocalIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalIdValue(e.target.value);
    }, []);

    const handleIdBlur = useCallback(() => {
      if (localIdValue !== field.id) {
        updateFieldId(field.id, localIdValue);
      }
    }, [localIdValue, field.id, updateFieldId]);

    const handleIdKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (localIdValue !== field.id) {
          updateFieldId(field.id, localIdValue);
        }
        idInputRef.current?.blur();
      }
    }, [localIdValue, field.id, updateFieldId]);

    const handleLocalLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalLabelValue(e.target.value);
    }, []);

    const handleLabelBlur = useCallback(() => {
      if (localLabelValue !== field.label) {
        handleLabelChange(field.id, localLabelValue);
      }
    }, [localLabelValue, field.id, handleLabelChange]);

    const handleLabelKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (localLabelValue !== field.label) {
          handleLabelChange(field.id, localLabelValue);
        }
        labelInputRef.current?.blur();
      }
    }, [localLabelValue, field.id, handleLabelChange]);

    const handleAddOptionClick = useCallback(() => {
      const trimmedOption = localNewOptionText.trim();
      if (trimmedOption !== "") {
        handleAddOption(field.id, trimmedOption);
        setLocalNewOptionText("");
      }
    }, [localNewOptionText, field.id, handleAddOption]);

    const handleNewOptionKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddOptionClick();
      }
    }, [handleAddOptionClick]);

    
    return (
      <div
        key={field.id}
        className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 relative dark:border-gray-600 dark:bg-white/[0.03] dark:text-white/90"
      >
        <h1 className="my-px">({field.type}) </h1>
        <input
          ref={labelInputRef}
          type="text"
          value={localLabelValue}
          onChange={handleLocalLabelChange}
          onBlur={handleLabelBlur}
          onKeyDown={handleLabelKeyDown}
          className="mx-1 text-gray-700 text-sm font-bold mb-1 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white/90"
          aria-label="Preview field title"
        />
        <input
          ref={idInputRef}
          type="text"
          value={localIdValue}
          onChange={handleLocalIdChange}
          onBlur={handleIdBlur}
          onKeyDown={handleIdKeyDown}
          className="mx-1 text-gray-700 text-sm font-bold mb-1 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white/90"
          aria-label="Edit field id"
          title="Edit Field ID"
        />
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id={`required-${field.id}`}
            checked={field.required}
            onChange={() => handleToggleRequired(field.id)}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor={`required-${field.id}`} className="ml-2 text-gray-700 text-sm dark:text-white/90">
            Required
          </label>
        </div>
        {(field.type === "select" || field.type === "option") && field.options ? (
          <div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder="New option"
                value={localNewOptionText}
                onChange={(e) => setLocalNewOptionText(e.target.value)}
                onKeyDown={handleNewOptionKeyDown}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm dark:text-white/90"
              />
              <Button
                onClick={handleAddOptionClick}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-sm "
              >
                +
              </Button>
            </div>

            {field.options.map((option, index) => (
              <div key={option} className="flex justify-between gap-2 mt-2">
                <p className="text-gray-700 dark:text-white ">- {option}</p>
                <Button
                  onClick={() => handleRemoveOption(field.id, index)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 text-sm "
                >
                  -
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <></>
        )}
        {/* {!(field.type === "image" || field.type === "multiImage") && (
          <p className="text-gray-900 break-words mt-2">
            {Array.isArray(field.value) ? field.value.join(", ") : String(field.value)}
          </p>
        )} */}
        <button
          onClick={() => removeField(field.id)}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs leading-none w-6 h-6 flex items-center justify-center hover:bg-red-600 transition duration-300"
          title="Remove field"
        >
          ✕
        </button>
      </div>
    );
  });

  const FormEdit = useCallback(() => {
    return (
      <>
        {dynamicFormFields.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            No fields added yet. Use the "Add Form" section to add new fields.
          </p>
        ) : (
          dynamicFormFields.map((field) => (
            <FieldEditItem
              key={field.id}
              field={field}
              handleLabelChange={handleLabelChange}
              updateFieldId={updateFieldId}
              handleAddOption={handleAddOption}
              handleRemoveOption={handleRemoveOption}
              removeField={removeField}
              handleToggleRequired={handleToggleRequired} // Pass the new prop
            />
          ))
        )}
      </>
    );
  }, [dynamicFormFields, handleLabelChange, updateFieldId, handleAddOption, handleRemoveOption, removeField, handleToggleRequired]);
  const FormPreview = useCallback(() => {
    return (
      <>
        {dynamicFormFields.length === 0 ? (
          <p className="text-center text-gray-500 italic mb-4">
            No fields added yet. Click "Edit" to start adding.
          </p>
        ) : (
          dynamicFormFields.map((field) => (
            <div
              key={field.id}
              className="mb-2 p-4  relative  dark:text-white/90"
            >
              <label
                htmlFor={field.id}
                className="block text-gray-700 text-sm font-bold mb-2 dark:text-white/90"
              >
                {field.label} ({field.type}) {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === "textInput" ||
                field.type === "emailInput" ||
                field.type === "passwordInput"
                ? (
                  <input
                    id={field.id}
                    type={
                      field.type === "textInput"
                        ? "text"
                        : field.type === "emailInput"
                          ? "email"
                          : field.type === "passwordInput"
                            ? "password"
                            : ""
                    }
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-white/90"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                  />
                ) : field.type === "Integer" ? ( // Render for Integer type
                  <input
                    id={field.id}
                    type="number" // Use type="number" for integer input
                    value={field.value !== null ? field.value : ''} // Display empty string for null
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-white/90"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                  />
                ) : field.type === "dateInput" ? (
                  <input
                    id={field.id}
                    type="date"
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-white/90"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                  />

                ) : field.type === "textAreaInput" ? (
                  <textarea
                    id={field.id}
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent h-24 dark:text-white/90"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    required={field.required}
                  ></textarea>
                ) : field.type === "select" && field.options ? (
                  <select
                    id={field.id}
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white dark:text-white/90 dark:bg-white/[0.03]"
                    required={field.required}
                  >
                    <option value="" className="dark:bg-gray-800">
                      Select an option
                    </option>
                    {field.options.map((option) => (
                      <option
                        className="text-gray-700 dark:text-white dark:bg-gray-800 "
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "option" && field.options ? (
                  <div className="flex flex-col gap-2 ">
                    {field.options.map((option) => (
                      <label key={option} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          value={option}
                          checked={Array.isArray(field.value) && field.value.includes(option)}
                          onChange={(e) => {
                            const currentValues = Array.isArray(field.value) ? [...field.value] : [];
                            if (e.target.checked) {
                              handleFieldChange(field.id, [...currentValues, option]);
                            } else {
                              handleFieldChange(
                                field.id,
                                currentValues.filter((val: string) => val !== option)
                              );
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded"
                          required={field.required && Array.isArray(field.value) && field.value.length === 0}
                        />
                        <span className="ml-2 text-gray-700 dark:text-white/90">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : field.type === "image" || field.type === "multiImage" ? (
                  <div>
                    <input
                      id={field.id}
                      type="file"
                      multiple={field.type === "multiImage"}
                      onChange={(e) => handleFieldChange(field.id, e.target.files)}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required={field.required && (!field.value || (Array.isArray(field.value) && field.value.length === 0))}
                    />
                    {field.type === "image" && field.value instanceof File && (
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-gray-700 dark:text-white text-sm">
                          Selected: {field.value.name}
                        </p>
                        <Button
                          onClick={() => handleRemoveFile(field.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    {field.type === "multiImage" && Array.isArray(field.value) && field.value.length > 0 && (
                      <div className="mt-2">
                        <p className="text-gray-700 dark:text-white text-sm mb-1">Selected Files:</p>
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((file: File) => (
                            <div key={file.name} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-xs">
                              <span className="text-gray-800 dark:text-gray-200">{file.name}</span>
                              <Button
                                onClick={() => handleRemoveFile(field.id, file.name)}
                                className="ml-1 px-1 py-0 bg-red-400 text-white rounded-full hover:bg-red-500 disabled:opacity-50 text-xs leading-none"
                              >
                                ✕
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-500">Unsupported field type: {field.type}</p>
                )}
            </div>
          ))
        )}
      </>
    );
  }, [dynamicFormFields, handleFieldChange, handleRemoveFile]);


  return edit ? (
    <div>
      <PageMeta
        title="React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="From Elements" />
      <div className={isPreview ? "grid grid-cols-1" : "grid grid-cols-[25%_75%] gap-6 xl:grid-cols-2"}>
        <div hidden={isPreview}>
          <ComponentCard title="Add Form" >
            <div>
              {formConfigurations.map((item) => (
                <button
                  key={item.formType}
                  className="text-gray-700 hover:text-sky-700 w-full text-left dark:text-white/90 dark:hover:text-sky-400"
                  onClick={() => addField(item.formType)}
                >
                  {item.title.replace(" Form", "")}
                </button>
              ))}
            </div>
          </ComponentCard></div>
        <div className="space-y-6">
          <ComponentCard title="Dynamic Form">
            <div hidden={isPreview}>
              {FormEdit()}
              <div className="flex justify-end p-4">
                <Button onClick={() => setIsPreview(true)}>Preview</Button>
              </div>
            </div>
            <div hidden={!isPreview} >

              {FormPreview()}
              <div className="flex justify-between">
                <div className="flex">
                  <Button onClick={saveSchema}>Save schema</Button>
                </div>
                <div className="flex gap-2 ">
                  <Button onClick={() => setIsPreview(false)}>Edit</Button>
                  <Button onClick={handleSend} className="bg-green-500 hover:bg-green-600">Enter</Button>
                </div>
              </div>

            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  ) : (<div>
    {FormPreview()}
    <div className="flex justify-between w-full"> {/* Add this div */}
      {showDynamicForm && <Button
        className="m-4 flex mt-4 text-gray-800 hover:bg-blue-300 bg-blue-700 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-500"
        onClick={() => showDynamicForm && showDynamicForm(false)}
      >
        Close
      </Button>}
      {dynamicFormFields.length != 0 && (<div>

        <Button
          className="m-4 flex mt-4 text-gray-800 hover:bg-blue-300 bg-blue-700 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-500"
          onClick={handleSend}
        >
          Summit
        </Button>
      </div>)}

    </div>
  </div>);
}