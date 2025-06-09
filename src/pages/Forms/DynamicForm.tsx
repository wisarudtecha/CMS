import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import DefaultInputs from "../../components/form/form-elements/DefaultInputs";
// import InputGroup from "../../components/form/form-elements/InputGroup";
// import DropzoneComponent from "../../components/form/form-elements/DropZone";
// import CheckboxComponents from "../../components/form/form-elements/CheckboxComponents";
// import RadioButtons from "../../components/form/form-elements/RadioButtons";
// import ToggleSwitch from "../../components/form/form-elements/ToggleSwitch";
// import FileInputExample from "../../components/form/form-elements/FileInputExample";
// import SelectInputs from "../../components/form/form-elements/SelectInputs";
// import TextAreaInput from "../../components/form/form-elements/TextAreaInput";
// import InputStates from "../../components/form/form-elements/InputStates";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { useState } from "react";
interface FormConfigItem {
  formType: string; 
  title: string;    
  options?: string[]; 
}


interface FormField {
  id: string;         
  label: string;     
  editableLabel: string; 
  type: string;       
  value: any;         
  options?: string[]; 
  newOptionText?: string; 
}

const formConfigurations: FormConfigItem[] = [
  { formType: "textInput", title: "Text Form" },
  { formType: "textAreaInput", title: "Text Area Form" },
  { formType: "emailInput", title: "Email Form" },
  { formType: "option", title: "Multiple Select Form", options: [] },
  { formType: "select", title: "Single Select Form", options: [] },
  { formType: "image", title: "Image Upload Form" },
  { formType: "multiImage", title: "Multi-Image Upload Form" },
  { formType: "passwordInput", title: "Password Form" },
];


function createDynamicFormField(
  config: FormConfigItem[],
  typeToInsert: string
): FormField | undefined {
  const configItem = config.find(item => item.formType === typeToInsert);

  if (!configItem) {
    console.warn(`Form type "${typeToInsert}" not found in configuration.`);
    return undefined;
  }
  const id = `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let defaultValue: any;
  let fieldOptions: string[] | undefined;
  let newOptionText: string | undefined; 
  switch (configItem.formType) {
    case "textInput":
    case "textAreaInput":
    case "emailInput":
    case "passwordInput":
      defaultValue = ""; 
      break;
    case "option": // For multi-select (e.g., checkboxes)
      defaultValue = []; // An array to hold selected values
      fieldOptions = configItem.options || []; // Use options from config
      newOptionText = ""; // Initialize for option inputs
      break;
    case "select": // For single-select dropdowns
      defaultValue = ""; // Default to an empty string or the first option
      fieldOptions = configItem.options || [];
      newOptionText = ""; // Initialize for option inputs
      break;
    case "image":
      defaultValue = null; // Represents a single file or URL
      break;
    case "multiImage":
      defaultValue = []; // An array to hold multiple files/URLs
      break;
    default:
      defaultValue = null; // Generic default for unknown types
      break;
  }

  // Return the newly constructed FormField object
  return {
    id: id,
    label: configItem.title, // Initial static label
    editableLabel: configItem.title, // Initial editable label
    type: configItem.formType, // Using the formType as the field's type
    value: defaultValue,
    ...(fieldOptions && { options: fieldOptions }), // Conditionally add options if they exist
    ...(newOptionText !== undefined && { newOptionText: newOptionText }) // Conditionally add newOptionText
  };
}


export default function DynamicForm() {
  const [isEdit, setIsEdit] = useState(false);
  const [dynamicFormFields, setDynamicFormFields] = useState<FormField[]>([]);

  // Function to add a new form field
  const addField = (formType: string) => {
    const newField = createDynamicFormField(formConfigurations, formType);
    if (newField) {
      setDynamicFormFields(prevFields => [...prevFields, newField]);
    }
  };

  // Function to handle changes in form field values (used in edit mode for form values)
  const handleFieldChange = (id: string, newValue: any) => {
    setDynamicFormFields(prevFields =>
      prevFields.map(field =>
        field.id === id ? { ...field, value: newValue } : field
      )
    );
  };

  // Function to handle changes in field labels (used in display mode for editing titles)
  const handleLabelChange = (id: string, newLabel: string) => {
    setDynamicFormFields(prevFields =>
      prevFields.map(field =>
        field.id === id ? { ...field, editableLabel: newLabel } : field
      )
    );
  };

  // Function to update the temporary newOptionText for a field
  const handleNewOptionTextChange = (id: string, text: string) => {
    setDynamicFormFields(prevFields =>
      prevFields.map(field =>
        field.id === id ? { ...field, newOptionText: text } : field
      )
    );
  };

  // Function to add a new option to a select/option field
  const handleAddOption = (id: string) => {
    setDynamicFormFields(prevFields =>
      prevFields.map(field => {
        if (field.id === id && field.newOptionText && field.newOptionText.trim() !== '') {
          const newOption = field.newOptionText.trim();
          if (field.options && !field.options.includes(newOption)) {
            return {
              ...field,
              options: [...field.options, newOption],
              newOptionText: ''
            };
          } else if (!field.options) {
            return {
              ...field,
              options: [newOption],
              newOptionText: ''
            };
          }
        }
        return field;
      })
    );
  };

  // Function to remove a form field
  const removeField = (id: string) => {
    setDynamicFormFields(prevFields => prevFields.filter(field => field.id !== id));
  };

  // Function to handle "Send" button click
  const handleSend = () => {
    console.log("Current Dynamic Form Data:", dynamicFormFields);
    alert("Form data logged to console!");
  };

  const handleRemoveOption = (fieldId: string, optionIndexToRemove: number) => {
        setDynamicFormFields(prevFields =>
            prevFields.map(field => {
                if (field.id === fieldId && field.options) {
                    const updatedOptions = field.options.filter((_, index) => index !== optionIndexToRemove);
                    let newValue = field.value;
                    if (field.type === "select" && field.value === field.options[optionIndexToRemove]) {
                        newValue = "";
                    } else if (field.type === "option" && Array.isArray(field.value)) {
                        newValue = field.value.filter((val: string) => val !== field.options?.[optionIndexToRemove]);
                    }
                    return {
                        ...field,
                        options: updatedOptions,
                        value: newValue
                    };
                }
                return field;
            })
        );
    };

  return (
    <div>
      <PageMeta
        title="React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="From Elements" />
      <div className={!isEdit ? "grid grid-cols-1" : "grid grid-cols-[25%_75%] gap-6 xl:grid-cols-2"}>
        <div hidden={!isEdit}>
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
            <div hidden={!isEdit}>

              {dynamicFormFields.length === 0 ? (
                <p className="text-center text-gray-500 italic">No fields added yet. Click "Edit Form" to start adding.</p>
              ) : (
                dynamicFormFields.map((field) => (
                  <div key={field.id} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 relative dark:border-gray-600 dark:bg-white/[0.03] dark:text-white/90">
                    <h1 className="my-px">({field.type}) </h1>
                    <input
                      type="text"
                      value={field.editableLabel}
                      onChange={(e) => handleLabelChange(field.id, e.target.value)}
                      className="block w-full text-gray-700 text-sm font-bold mb-1 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white/90"
                      aria-label="Edit field title"
                    />
                    {(field.type === "select" || field.type === "option") && field.options ? (
                      <div>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="New option"
                          value={field.newOptionText || ''}
                          onChange={(e) => handleNewOptionTextChange(field.id, e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm dark:text-white/90"
                        />

                        <Button
                          onClick={() => handleAddOption(field.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-sm "
                        >
                          +
                        </Button>
                        </div>
                        
                        {field.options.map((option,index) => (
                          <div className="flex justify-between gap-2 mt-2">
                          <p className="text-gray-700 dark:text-white "
                            key={option} >- {option}</p>
                          <Button
                            onClick={() => handleRemoveOption(field.id,index)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-sm "
                          >
                            -
                          </Button>
                        </div>
                        ))}
                      </div>
                      

                    ) : (<></>)}
                    <p className="text-gray-900 break-words mt-2">
                      {field.type === "image" || field.type === "multiImage" ?
                        (field.value ? (field.type === "multiImage" ? `${field.value.length} files selected` : field.value.name || '1 file selected') : 'No file selected') :
                        (Array.isArray(field.value) ? field.value.join(', ') : String(field.value))
                      }
                    </p>
                    <button
                      onClick={() => removeField(field.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs leading-none w-6 h-6 flex items-center justify-center hover:bg-red-600 transition duration-300"
                      title="Remove field"
                    >
                      ✕
                    </button>
                  </div>

                ))
              )}
              <div className="flex justify-end p-4">

                <Button onClick={() => setIsEdit(false)}>Done</Button>
              </div>
            </div>
            <div hidden={isEdit}>
              {dynamicFormFields.length === 0 ? (
                <p className="text-center text-gray-500 italic mb-4">No fields added yet. Use the "Add Form" section to add new fields.</p>
              ) : (
                dynamicFormFields.map((field) => (
                  <div key={field.id} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 relative dark:border-gray-600 dark:bg-white/[0.03] dark:text-white/90">
                    <label htmlFor={field.id} className="block text-gray-700 text-sm font-bold mb-2 dark:text-white/90">
                      {field.editableLabel} ({field.type})
                    </label>
                    {field.type === "textInput" || field.type === "emailInput" || field.type === "passwordInput" ? (
                      <input
                        id={field.id}
                        type={field.type === "textInput" ? "text" : field.type === "emailInput" ? "email" : "password"}
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-white/90"
                        placeholder={`Enter ${field.editableLabel.toLowerCase()}`}
                      />
                    ) : field.type === "textAreaInput" ? (
                      <textarea
                        id={field.id}
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent h-24 dark:text-white/90"
                        placeholder={`Enter ${field.editableLabel.toLowerCase()}`}
                      ></textarea>
                    ) : field.type === "select" && field.options ? (
                      <select
                        id={field.id}
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white dark:text-white/90 dark:bg-white/[0.03]"
                      >
                        <option value="" className="dark:bg-gray-800">Select an option</option>
                        {field.options.map((option) => (
                          <option className="text-gray-700 dark:text-white dark:bg-gray-800 "
                            key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === "option" && field.options ? (
                      <div className="flex flex-col gap-2 ">
                        {field.options.map((option) => (
                          <label key={option} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              value={option}
                              checked={field.value.includes(option)}
                              onChange={(e) => {
                                const currentValues = Array.isArray(field.value) ? [...field.value] : [];
                                if (e.target.checked) {
                                  handleFieldChange(field.id, [...currentValues, option]);
                                } else {
                                  handleFieldChange(field.id, currentValues.filter((val: string) => val !== option));
                                }
                              }}
                              className="form-checkbox h-5 w-5 text-blue-600 rounded  "
                            />
                            <span className="ml-2 text-gray-700 dark:text-white/90">{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === "image" || field.type === "multiImage" ? (
                      <input
                        id={field.id}
                        type="file"
                        multiple={field.type === "multiImage"}
                        onChange={(e) => {
                          handleFieldChange(field.id, field.type === "multiImage" ? e.target.files : e.target.files?.[0]);
                        }}
                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    ) : (
                      <p className="text-red-500">Unsupported field type: {field.type}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Current Value: {JSON.stringify(field.value)}</p>
                  </div>
                ))
              )}
              <div className="flex justify-end p-4 gap-2">
                <Button onClick={handleSend} className="bg-green-500 hover:bg-green-600">Enter</Button>
                <Button onClick={() => setIsEdit(true)}>Edit</Button>
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
