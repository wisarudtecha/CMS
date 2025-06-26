import PageBreadcrumb from "../../common/PageBreadCrumb";
import PageMeta from "../../common/PageMeta";
import ComponentCard from "../../common/ComponentCard";
import Button from "../../ui/button/Button";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FormField, FormFieldWithChildren, IndividualFormField, IndividualFormFieldWithChildren } from "@/components/interface/FormField";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';




interface FormConfigItem {
  formType: string;
  title: string;
  options?: string[];
  canBeChild?: boolean;
}

interface DynamicFormProps {
  initialForm?: FormField;
  edit?: boolean;
  editFormData?:boolean; // Added editFormData prop
  showDynamicForm?: React.Dispatch<React.SetStateAction<boolean>>;
  onFormSubmit?: (data: FormField) => void;
}

const formConfigurations: FormConfigItem[] = [
  { formType: "textInput", title: "Text Form", canBeChild: true },
  { formType: "Integer", title: "Number Form", canBeChild: true },
  { formType: "textAreaInput", title: "Text Area Form", canBeChild: true },
  { formType: "emailInput", title: "Email Form", canBeChild: true },
  { formType: "option", title: "Multiple Select Form", options: [], canBeChild: true },
  { formType: "select", title: "Single Select Form", options: [], canBeChild: true },
  { formType: "image", title: "Image Upload Form", canBeChild: true },
  { formType: "multiImage", title: "Multi-Image Upload Form", canBeChild: true },
  { formType: "passwordInput", title: "Password Form", canBeChild: true },
  { formType: "dateInput", title: "Date Form", canBeChild: true },
  { formType: "dateLocal", title: "DateLocal Form", canBeChild: true },
  { formType: "radio", title: "Radio Button Form", options: [], canBeChild: true },
  { formType: "InputGroup", title: "Group of Input", canBeChild: false }
];


function createDynamicFormField(
  config: FormConfigItem[],
  typeToInsert: string,
  isChild: boolean = false
): IndividualFormFieldWithChildren | undefined {
  const configItem = config.find((item) => item.formType === typeToInsert);

  if (!configItem) {
    return undefined;
  }
  if (isChild && configItem.formType === "InputGroup") {
    console.warn("Cannot add an InputGroup inside another InputGroup.");
    return undefined;
  }

  const id = `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let defaultValue: any;
  let fieldOptions: string[] | undefined;
  let newOptionText: string | undefined;
  let placeholder: string | undefined;


  if (configItem.formType === "InputGroup") {
    defaultValue = [];
  } else if (configItem.formType === "option") {
    defaultValue = [];
  } else if (configItem.formType === "Integer") {
    defaultValue = null;
  } else if (configItem.formType === "multiImage") {
    defaultValue = [];
  } else if (configItem.formType === "image") {
    defaultValue = null;
  } else {
    defaultValue = "";
  }


  if (configItem.formType === "option" || configItem.formType === "select" || configItem.formType === "radio") {
    fieldOptions = configItem.options || [];
    newOptionText = "";
  }


  return {
    id: id,
    label: configItem.title,
    type: configItem.formType,
    value: defaultValue,
    ...(fieldOptions && { options: fieldOptions }),
    ...(newOptionText !== undefined && { newOptionText: newOptionText }),
    ...(placeholder && { placeholder: placeholder }),
    required: false,
    colSpan: 1,
    isChild: isChild,
  };
}

export default function DynamicForm({ initialForm, edit = true, showDynamicForm, onFormSubmit,editFormData=true }: DynamicFormProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [currentForm, setCurrentForm] = useState<FormFieldWithChildren>(
    initialForm ?
      {
        ...initialForm,
        formFieldJson: initialForm.formFieldJson.map(field => ({
          ...field,
          value: field.type === "InputGroup" && Array.isArray(field.value)
            ? field.value as IndividualFormFieldWithChildren[]
            : field.value,
          ...(field.type === "InputGroup" && (field as any).children && !Array.isArray(field.value)
            ? { value: (field as any).children as IndividualFormFieldWithChildren[] }
            : {}),
        })) as IndividualFormFieldWithChildren[]
      } :
      {
        formId: `form_${Date.now()}`,
        formName: "New Dynamic Form",
        formColSpan: 1,
        formFieldJson: [],
      }
  );

  const handleFormIdChange = useCallback((newId: string) => {
    setCurrentForm(prevForm => ({ ...prevForm, formId: newId }));
  }, []);

  const handleFormNameChange = useCallback((newName: string) => {
    setCurrentForm(prevForm => ({ ...prevForm, formName: newName }));
  }, []);

  const handleOverallFormColSpanChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newColSpan = parseInt(e.target.value, 10);
    if (isNaN(newColSpan) || newColSpan < 1) {
      newColSpan = 1;
    } else if (newColSpan > 12) {
      newColSpan = 12;
    }

    setCurrentForm(prevForm => {
      const updatedFieldJson = prevForm.formFieldJson.map(field => {
        if (field.colSpan && field.colSpan > newColSpan) {
          return { ...field, colSpan: newColSpan as number };
        }
        return field;
      });
      return { ...prevForm, formColSpan: newColSpan, formFieldJson: updatedFieldJson };
    });
  }, []);

  const updateFieldRecursively = useCallback((
    fields: IndividualFormFieldWithChildren[],
    idToUpdate: string,
    callback: (field: IndividualFormFieldWithChildren) => IndividualFormFieldWithChildren
  ): IndividualFormFieldWithChildren[] => {
    return fields.map(field => {
      if (field.id === idToUpdate) {
        return callback(field);
      }
      if (field.type === "InputGroup" && Array.isArray(field.value)) {
        const updatedChildren = updateFieldRecursively(field.value, idToUpdate, callback);
        if (updatedChildren !== field.value) {
          return {
            ...field,
            value: updatedChildren
          };
        }
      }
      return field;
    });
  }, []);


  const removeFieldRecursively = useCallback((
    fields: IndividualFormFieldWithChildren[],
    idToRemove: string
  ): IndividualFormFieldWithChildren[] => {
    const filteredFields = fields.filter(field => field.id !== idToRemove);

    return filteredFields.map(field => {
      if (field.type === "InputGroup" && Array.isArray(field.value)) {
        const updatedChildren = removeFieldRecursively(field.value, idToRemove);
        if (updatedChildren !== field.value) {
          return { ...field, value: updatedChildren };
        }
      }
      return field;
    });
  }, []);

  const addChildFieldRecursively = useCallback((
    fields: IndividualFormFieldWithChildren[],
    parentId: string,
    newField: IndividualFormFieldWithChildren
  ): IndividualFormFieldWithChildren[] => {
    return fields.map(field => {
      if (field.id === parentId && field.type === "InputGroup") {
        return {
          ...field,
          value: Array.isArray(field.value) ? [...field.value, newField] : [newField]
        };
      }
      if (field.type === "InputGroup" && Array.isArray(field.value)) {
        const updatedChildren = addChildFieldRecursively(field.value, parentId, newField);
        if (updatedChildren !== field.value) {
          return { ...field, value: updatedChildren };
        }
      }
      return field;
    });
  }, []);


  const addField = useCallback((formType: string, parentId?: string) => {
    const newField = createDynamicFormField(formConfigurations, formType, !!parentId);
    if (newField) {
      setCurrentForm(prevForm => {
        if (parentId) {
          const updatedFieldJson = addChildFieldRecursively(prevForm.formFieldJson, parentId, newField);
          return {
            ...prevForm,
            formFieldJson: updatedFieldJson
          };
        } else {
          return {
            ...prevForm,
            formFieldJson: [...prevForm.formFieldJson, newField]
          };
        }
      });
    }
  }, [addChildFieldRecursively]);


  const saveSchema = () => {
    console.log("Saved Form Schema:", currentForm);
  }

  const handleFieldChange = useCallback((id: string, newValue: any) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, id, (field) => {
        if (field.type === "image") {
          const valueToStore = newValue instanceof FileList
            ? newValue[0] || null
            : newValue;
          return { ...field, value: valueToStore };
        }
        if (field.type === "multiImage") {
          if (newValue instanceof FileList) {
            const currentFiles = Array.isArray(field.value) ? field.value : [];
            const newFiles = Array.from(newValue);
            const uniqueNewFiles = newFiles.filter(
              (newFile) => !currentFiles.some((existingFile: File) => existingFile.name === newFile.name && existingFile.size === newFile.size)
            );
            return { ...field, value: [...currentFiles, ...uniqueNewFiles] };
          }
          return { ...field, value: newValue };
        }
        if (field.type === "Integer") {
          const numValue = parseInt(newValue, 10);
          return { ...field, value: isNaN(numValue) ? null : numValue };
        }
        if (field.type === "InputGroup") {
          return { ...field, value: field.value };
        }

        return { ...field, value: newValue };
      }),
    }));
  }, [updateFieldRecursively]);

  const handleLabelChange = useCallback((id: string, newLabel: string) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, id, (field) => ({
        ...field,
        label: newLabel
      })),
    }));
  }, [updateFieldRecursively]);

  const handlePlaceholderChange = useCallback((id: string, newPlaceholder: string) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, id, (field) => ({
        ...field,
        placeholder: newPlaceholder
      })),
    }));
  }, [updateFieldRecursively]);

  const handleAddOption = useCallback((id: string, newOptionTextValue: string) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, id, (field) => {
        if (newOptionTextValue.trim() !== "") {
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
      }),
    }));
  }, [updateFieldRecursively]);

  const removeField = useCallback((id: string) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: removeFieldRecursively(prevForm.formFieldJson, id),
    }));
  }, [removeFieldRecursively]);

  const transformFieldForSubmission = useCallback((field: IndividualFormFieldWithChildren): IndividualFormField => {
    if (field.type === "InputGroup" && Array.isArray(field.value)) {
      return {
        ...field,
        value: field.value.map(transformFieldForSubmission),
      } as IndividualFormField;
    }
    const { isChild, ...rest } = field;
    return rest;
  }, []);


  const handleSend = useCallback(() => {
    const validateFields = (fields: IndividualFormFieldWithChildren[]): boolean => {
      return fields.every(field => {
        if (field.required) {
          if (field.type === "InputGroup") {
            return Array.isArray(field.value) && validateFields(field.value);
          }
          if (Array.isArray(field.value)) {
            return field.value.length > 0;
          } else if (typeof field.value === 'string') {
            return field.value.trim() !== '';
          } else if (field.type === 'Integer') {
            return typeof field.value === 'number' && !isNaN(field.value) && field.value !== null;
          } else if (field.value === null || field.value === undefined) {
            return false;
          }
        }
        return true;
      });
    };

    const allFieldsValid = validateFields(currentForm.formFieldJson);
    console.log(currentForm)
    if (allFieldsValid) {
      if (onFormSubmit) {
        const submitData: FormField = {
          ...currentForm,
          formFieldJson: currentForm.formFieldJson.map(transformFieldForSubmission),
        };
        console.log("Sending Form Data:", submitData);
        onFormSubmit(submitData);
      }
    } else {
      alert("Please fill in all required fields.");
    }
  }, [currentForm, onFormSubmit, transformFieldForSubmission]);

  const updateFieldId = useCallback((oldId: string, newId: string) => {
    const trimmedNewId = newId.trim();
    if (!trimmedNewId) {
      alert("Field ID cannot be empty!");
      return;
    }
    const checkIdExistsRecursively = (fields: IndividualFormFieldWithChildren[]): boolean => {
      for (const field of fields) {
        if (field.id === trimmedNewId && field.id !== oldId) {
          return true;
        }
        if (field.type === "InputGroup" && Array.isArray(field.value) && checkIdExistsRecursively(field.value)) {
          return true;
        }
      }
      return false;
    };

    if (checkIdExistsRecursively(currentForm.formFieldJson)) {
      alert(`Error: ID '${trimmedNewId}' already exists. Please choose a unique ID.`);
      return;
    }

    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, oldId, (field) => ({
        ...field,
        id: trimmedNewId
      })),
    }));
  }, [currentForm.formFieldJson, updateFieldRecursively]);

  const handleRemoveOption = useCallback((fieldId: string, optionIndexToRemove: number) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, fieldId, (field) => {
        if (field.options) {
          const updatedOptions = field.options.filter((_, index) => index !== optionIndexToRemove);
          let newValue = field.value;
          if ((field.type === "select" || field.type === "radio") && field.value === field.options[optionIndexToRemove]) {
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
      }),
    }));
  }, [updateFieldRecursively]);

  const handleRemoveFile = useCallback((fieldId: string, fileNameToRemove?: string) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, fieldId, (field) => {
        if (field.type === "image") {
          return { ...field, value: null };
        } else if (field.type === "multiImage" && Array.isArray(field.value)) {
          const updatedFiles = field.value.filter((file: File) => file.name !== fileNameToRemove);
          return { ...field, value: updatedFiles };
        }
        return field;
      }),
    }));
  }, [updateFieldRecursively]);

  const handleToggleRequired = useCallback((id: string) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, id, (field) => ({
        ...field,
        required: !field.required
      })),
    }));
  }, [updateFieldRecursively]);


  const handleColSpanChange = useCallback((id: string, newColSpan: number) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, id, (field) => ({
        ...field,
        colSpan: newColSpan
      })),
    }));
  }, [updateFieldRecursively]);


  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const findTargetArrayAndInfo = (
      fields: IndividualFormFieldWithChildren[],
      targetId: string,
      path: string[] = []
    ): { arr: IndividualFormFieldWithChildren[], index: number, path: string[], isDroppableContainer: boolean } | null => {
      if (targetId === "form-fields") {
        return { arr: fields, index: -1, path: [], isDroppableContainer: true };
      }

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (field.id === targetId) {
          return { arr: fields, index: i, path: path, isDroppableContainer: false };
        }
        if (field.type === "InputGroup" && field.id === targetId) {
          return { arr: Array.isArray(field.value) ? field.value : [], index: -1, path: [...path, field.id], isDroppableContainer: true };
        }
        if (field.type === "InputGroup" && Array.isArray(field.value)) {
          const foundInChild = findTargetArrayAndInfo(field.value, targetId, [...path, field.id]);
          if (foundInChild) return foundInChild;
        }
      }
      return null;
    };

    const sourceInfo = findTargetArrayAndInfo(currentForm.formFieldJson, draggableId);
    const destinationInfo = findTargetArrayAndInfo(currentForm.formFieldJson, destination.droppableId);

    if (!sourceInfo || !destinationInfo) {
      console.error("Could not find source or destination info for drag and drop.");
      return;
    }

    const currentSourceArr = sourceInfo.arr;
    const isSameList = sourceInfo.path.length === destinationInfo.path.length &&
      sourceInfo.path.every((val, idx) => val === destinationInfo.path[idx]);

    if (isSameList) {
      const newArr = Array.from(currentSourceArr);
      const [movedItem] = newArr.splice(source.index, 1);
      newArr.splice(destination.index, 0, movedItem);

      setCurrentForm(prevForm => {
        if (sourceInfo.path.length === 0) {
          return { ...prevForm, formFieldJson: newArr };
        } else {
          const updateNestedArray = (fields: IndividualFormFieldWithChildren[], path: string[]): IndividualFormFieldWithChildren[] => {
            const currentId = path[0];
            return fields.map(field => {
              if (field.id === currentId && field.type === "InputGroup") {
                if (path.length === 1) {

                  return { ...field, value: newArr };
                } else {
                  return { ...field, value: updateNestedArray(Array.isArray(field.value) ? field.value : [], path.slice(1)) };
                }
              }
              return field;
            });
          };
          return { ...prevForm, formFieldJson: updateNestedArray(prevForm.formFieldJson, sourceInfo.path) };
        }
      });
    } else {
      console.warn("Cross-list drag and drop is not fully supported for this component yet.", {
        draggableId,
        source: result.source,
        destination: result.destination,
        sourcePath: sourceInfo.path,
        destinationPath: destinationInfo.path,
      });
    }
  }, [currentForm.formFieldJson]);


  interface FieldEditItemProps {
    field: IndividualFormFieldWithChildren;
    handleLabelChange: (id: string, newLabel: string) => void;
    updateFieldId: (oldId: string, newId: string) => void;
    handleAddOption: (id: string, newOptionText: string) => void;
    handleRemoveOption: (fieldId: string, optionIndexToRemove: number) => void;
    removeField: (id: string) => void;
    handleToggleRequired: (id: string) => void;
    handlePlaceholderChange: (id: string, newPlaceholder: string) => void;
    handleColSpanChange: (id: string, newColSpan: number) => void;
    overallFormColSpan: number;
    addField: (formType: string, parentId?: string) => void;
    editFormData: boolean; // Added editFormData prop
  }

  const FieldEditItem: React.FC<FieldEditItemProps> = React.memo(({
    field,
    handleLabelChange,
    updateFieldId,
    handleAddOption,
    handleRemoveOption,
    removeField,
    handleToggleRequired,
    handlePlaceholderChange,
    handleColSpanChange,
    overallFormColSpan,
    addField,
    editFormData // Destructure editFormData
  }) => {
    const [localIdValue, setLocalIdValue] = useState(field.id);
    const [localLabelValue, setLocalLabelValue] = useState(field.label);
    const [localPlaceholderValue, setLocalPlaceholderValue] = useState(field.placeholder || "");
    const [localNewOptionText, setLocalNewOptionText] = useState("");

    const idInputRef = useRef<HTMLInputElement>(null);
    const labelInputRef = useRef<HTMLInputElement>(null);
    const placeholderInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setLocalIdValue(field.id);
    }, [field.id]);

    useEffect(() => {
      setLocalLabelValue(field.label);
    }, [field.label]);

    useEffect(() => {
      setLocalPlaceholderValue(field.placeholder || "");
    }, [field.placeholder]);

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

    const handleLocalPlaceholderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalPlaceholderValue(e.target.value);
    }, []);

    const handlePlaceholderBlur = useCallback(() => {
      if (localPlaceholderValue !== field.placeholder) {
        handlePlaceholderChange(field.id, localPlaceholderValue);
      }
    }, [localPlaceholderValue, field.id, handlePlaceholderChange]);

    const handlePlaceholderKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (localPlaceholderValue !== field.placeholder) {
          handlePlaceholderChange(field.id, localPlaceholderValue);
        }
        placeholderInputRef.current?.blur();
      }
    }, [localPlaceholderValue, field.id, handlePlaceholderChange]);

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

    const showPlaceholderInput =
      field.type === "textInput" ||
      field.type === "Integer" ||
      field.type === "textAreaInput" ||
      field.type === "emailInput" ||
      field.type === "passwordInput";


    const colSpanOptions = Array.from({ length: overallFormColSpan }, (_, i) => i + 1);

    const isInputGroup = field.type === "InputGroup";
    const showLabelInput = !field.isChild;

    return (
      <div
        className={`mb-6 p-4 border rounded-lg bg-gray-50 relative dark:border-gray-600 dark:bg-white/[0.03] dark:text-white/90`}
      >
        <h1 className="my-px">({field.type}) </h1>
        {showLabelInput && (
          <label className="block text-gray-700 text-sm font-bold mb-1 dark:text-white/90">
            Label:
            <input
              ref={labelInputRef}
              type="text"
              value={localLabelValue}
              onChange={handleLocalLabelChange}
              onBlur={handleLabelBlur}
              onKeyDown={handleLabelKeyDown}
              className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white/90"
              aria-label="Preview field title"
              disabled={!editFormData} // Disable based on editFormData
            />
          </label>
        )}
        <label className="block text-gray-700 text-sm font-bold mb-1 mt-2 dark:text-white/90">
          ID:
          <input
            ref={idInputRef}
            type="text"
            value={localIdValue}
            onChange={handleLocalIdChange}
            onBlur={handleIdBlur}
            onKeyDown={handleIdKeyDown}
            className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white/90"
            aria-label="Edit field id"
            title="Edit Field ID"
            disabled={!editFormData} // Disable based on editFormData
          />
        </label>
        {showPlaceholderInput && (
          <label className="block text-gray-700 text-sm font-bold mb-1 mt-2 dark:text-white/90">
            Placeholder:
            <input
              ref={placeholderInputRef}
              type="text"
              value={localPlaceholderValue}
              onChange={handleLocalPlaceholderChange}
              onBlur={handlePlaceholderBlur}
              onKeyDown={handlePlaceholderKeyDown}
              className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white/90"
              aria-label="Edit field placeholder"
              title="Edit Field Placeholder"
              disabled={!editFormData} // Disable based on editFormData
            />
          </label>
        )}
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id={`required-${field.id}`}
            checked={field.required}
            onChange={() => handleToggleRequired(field.id)}
            className="form-checkbox h-4 w-4 text-blue-600 rounded"
            disabled={!editFormData} // Disable based on editFormData
          />
          <label htmlFor={`required-${field.id}`} className="ml-2 text-gray-700 text-sm dark:text-white/90">
            Required
          </label>
        </div>
        <div className="flex items-center mt-2">
          <label htmlFor={`colSpan-select-${field.id}`} className="text-gray-700 text-sm dark:text-white/90">
            Column Span (Field):
          </label>
          <select
            id={`colSpan-select-${field.id}`}
            value={field.colSpan && field.colSpan <= overallFormColSpan ? field.colSpan : 1}
            onChange={(e) => handleColSpanChange(field.id, parseInt(e.target.value) as number)}
            className="ml-2 py-1 px-2 border rounded-md text-gray-700 dark:bg-white/[0.03] dark:text-white/90"
            disabled={!editFormData} // Disable based on editFormData
          >
            {colSpanOptions.map((span) => (
              <option key={span} value={span}>
                {span} Column{span > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
        {(field.type === "select" || field.type === "option" || field.type === "radio") && field.options ? (
          <div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder="New option"
                value={localNewOptionText}
                onChange={(e) => setLocalNewOptionText(e.target.value)}
                onKeyDown={handleNewOptionKeyDown}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm dark:text-white/90"
                disabled={!editFormData} // Disable based on editFormData
              />
              <Button
                onClick={handleAddOptionClick}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-sm "
                disabled={!editFormData} // Disable based on editFormData
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
                  disabled={!editFormData} // Disable based on editFormData
                >
                  -
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <></>
        )}

        {isInputGroup && (
          <div className="mt-4 p-3 border border-gray-300 rounded-md bg-gray-100 dark:border-gray-500 dark:bg-white/[0.05]">
            <h3 className="text-md font-semibold mb-3 dark:text-white/90">Grouped Fields</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {formConfigurations
                .filter(config => config.canBeChild)
                .map((item) => (
                  <Button
                    key={`add-child-${field.id}-${item.formType}`}
                    onClick={() => addField(item.formType, field.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
                    disabled={!editFormData} // Disable based on editFormData
                  >
                    Add {item.title.replace(" Form", "")}
                  </Button>
                ))}
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId={field.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >

                    {Array.isArray(field.value) && field.value.map((childField: IndividualFormFieldWithChildren, childIndex: number) => (
                      <Draggable key={childField.id} draggableId={childField.id} index={childIndex}>
                        {(childProvided) => (
                          <div
                            ref={childProvided.innerRef}
                            {...childProvided.draggableProps}
                            {...childProvided.dragHandleProps}
                          >
                            <FieldEditItem
                              field={childField}
                              handleLabelChange={handleLabelChange}
                              updateFieldId={updateFieldId}
                              handleAddOption={handleAddOption}
                              handleRemoveOption={handleRemoveOption}
                              removeField={removeField}
                              handleToggleRequired={handleToggleRequired}
                              handlePlaceholderChange={handlePlaceholderChange}
                              handleColSpanChange={handleColSpanChange}
                              overallFormColSpan={overallFormColSpan}
                              addField={addField}
                              editFormData={editFormData} // Pass editFormData to child FieldEditItem
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            {isInputGroup && Array.isArray(field.value) && field.value.length === 0 && (
              <p className="text-center text-gray-500 italic text-sm mt-2">
                No fields in this group yet.
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => removeField(field.id)}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs leading-none w-6 h-6 flex items-center justify-center hover:bg-red-600 transition duration-300"
          title="Remove field"
          disabled={!editFormData} // Disable based on editFormData
        >
          ✕
        </button>
      </div>
    );
  });

  const FormEdit = useCallback(() => {
    return (
      <>
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-white/[0.03] dark:text-white/90">
          <h2 className="text-lg font-bold mb-4">Form Settings</h2>
          <label className="block text-gray-700 text-sm font-bold mb-1 dark:text-white/90">
            Form Name:
            <input
              type="text"
              value={currentForm.formName}
              onChange={(e) => handleFormNameChange(e.target.value)}
              className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white/90"
              placeholder="Enter form name"
              disabled={!editFormData} // Disable based on editFormData
            />
          </label>
          <label className="block text-gray-700 text-sm font-bold mb-1 mt-2 dark:text-white/90">
            Form ID:
            <input
              type="text"
              value={currentForm.formId}
              onChange={(e) => handleFormIdChange(e.target.value)}
              className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-white/90"
              placeholder="Enter unique form ID"
              disabled={!editFormData} // Disable based on editFormData
            />
          </label>
          <div className="flex items-center mt-2">
            <label htmlFor={`overallColSpan-input`} className="text-gray-700 text-sm dark:text-white/90">
              Overall Form Column Span:
            </label>
            <input
              id={`overallColSpan-input`}
              type="number"
              min="1"
              max="12"
              value={currentForm.formColSpan}
              onChange={handleOverallFormColSpanChange}
              className="ml-2 py-1 px-2 border rounded-md text-gray-700 dark:bg-white/[0.03] dark:text-white/90 w-20"
              disabled={!editFormData} // Disable based on editFormData
            />
          </div>
        </div>

        {currentForm.formFieldJson.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            No fields added yet. Use the "Add Form" section to add new fields.
          </p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="form-fields">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {currentForm.formFieldJson.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <FieldEditItem
                            field={field}
                            handleLabelChange={handleLabelChange}
                            updateFieldId={updateFieldId}
                            handleAddOption={handleAddOption}
                            handleRemoveOption={handleRemoveOption}
                            removeField={removeField}
                            handleToggleRequired={handleToggleRequired}
                            handlePlaceholderChange={handlePlaceholderChange}
                            handleColSpanChange={handleColSpanChange}
                            overallFormColSpan={currentForm.formColSpan}
                            addField={addField}
                            editFormData={editFormData} // Pass editFormData to FieldEditItem
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </>
    );
  }, [currentForm, handleFormIdChange, handleFormNameChange, handleOverallFormColSpanChange, handleLabelChange, updateFieldId, handleAddOption, handleRemoveOption, removeField, handleToggleRequired, handlePlaceholderChange, handleColSpanChange, onDragEnd, addField, editFormData]); // Add editFormData to dependency array

  const renderFormField = useCallback((field: IndividualFormFieldWithChildren) => {

    const commonProps = {
      id: field.id,
      className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-white/90",
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      required: field.required,
      disabled: !editFormData, // Disable based on editFormData
    };

    const labelComponent = !field.isChild && (
      <label
        htmlFor={field.id}
        className="block text-gray-700 text-sm font-bold mb-2 dark:text-white/90"
      >
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
    );

    const colSpanMap: Record<number, string> = {
      1: "col-span-1",
      2: "col-span-2",
      3: "col-span-3",
      4: "col-span-4",
      5: "col-span-5",
      6: "col-span-6",
      7: "col-span-7",
      8: "col-span-8",
      9: "col-span-9",
      10: "col-span-10",
      11: "col-span-11",
      12: "col-span-12",
    };

    switch (field.type) {
      case "textInput":
      case "emailInput":
      case "passwordInput":
        return (
          <>
            {labelComponent}
            <input
              type={
                field.type === "textInput"
                  ? "text"
                  : field.type === "emailInput"
                    ? "email"
                    : "password"
              }
              value={field.value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              {...commonProps}
            />
          </>
        );
      case "Integer":
        return (
          <>
            {labelComponent}
            <input
              type="number"
              value={field.value !== null ? field.value : ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              {...commonProps}
            />
          </>
        );
      case "dateInput":
        return (
          <>
            {labelComponent}
            <input
              type="date"
              value={field.value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              {...commonProps}
            />
          </>
        );
      case "dateLocal":
        return (
          <>
            {labelComponent}
            <input
              type="datetime-local"
              value={field.value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              {...commonProps}
            />
          </>
        );
      case "textAreaInput":
        return (
          <>
            {labelComponent}
            <textarea
              value={field.value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              {...commonProps}
              className={`${commonProps.className} h-24`}
            ></textarea>
          </>
        );
      case "select":
        return (
          <>
            {labelComponent}
            <select
              value={field.value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              {...commonProps}
              className={`${commonProps.className} bg-white dark:bg-white/[0.03]`}
            >
              <option value="" className="dark:bg-gray-800">
                Select an option
              </option>
              {field.options?.map((option) => (
                <option
                  className="text-gray-700 dark:text-white dark:bg-gray-800 "
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>
          </>
        );
      case "option":
        return (
          <>
            {labelComponent}
            <div className="flex flex-col gap-2 ">
              {field.options?.map((option) => (
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
                    disabled={!editFormData} // Disable based on editFormData
                  />
                  <span className="ml-2 text-gray-700 dark:text-white/90">{option}</span>
                </label>
              ))}
            </div>
          </>
        );
      case "radio":
        return (
          <>
            {labelComponent}
            <div className="flex flex-col gap-2">
              {field.options?.map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={field.value === option}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="form-radio h-5 w-5 text-blue-600"
                    required={field.required}
                    disabled={!editFormData} // Disable based on editFormData
                  />
                  <span className="ml-2 text-gray-700 dark:text-white/90">{option}</span>
                </label>
              ))}
            </div>
          </>
        );
      case "image":
      case "multiImage":
        return (
          <>
            {labelComponent}
            <div>
              <input
                id={field.id}
                type="file"
                accept="image/*"
                multiple={field.type === "multiImage"}
                onChange={(e) => handleFieldChange(field.id, e.target.files)}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required={field.required && (!field.value || (Array.isArray(field.value) && field.value.length === 0))}
                disabled={!editFormData} // Disable based on editFormData
              />
              {field.type === "image" && field.value instanceof File && (
                <div className="relative group mt-2 w-20 h-20">
                  <img
                    src={URL.createObjectURL(field.value)}
                    alt="Selected"
                    className="w-full h-full object-cover rounded border border-gray-600"
                  />
                  <button
                    onClick={() => handleRemoveFile(field.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={!editFormData} // Disable based on editFormData
                  >
                    ×
                  </button>
                </div>
              )}
              {field.type === "multiImage" && Array.isArray(field.value) && field.value.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-700 dark:text-white text-sm mb-1">Selected Files:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {field.value.map((file: File, index: number) => (
                      <div key={file.name + index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded border border-gray-600"
                        />
                        <button
                          onClick={() => handleRemoveFile(field.id, file.name)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={!editFormData} // Disable based on editFormData
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        );
      case "InputGroup":
        return (
          <div>
            {!field.isChild && (
              <h3 className="text-lg font-semibold mb-3 dark:text-white/90">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </h3>
            )}
            <div className={`grid grid-cols-1 ${currentForm.formColSpan ? `md:grid-cols-${gridColsMap[currentForm.formColSpan]}` : 'md:grid-cols-1'} gap-4`}>
              {Array.isArray(field.value) && field.value.map((childField: IndividualFormFieldWithChildren) => (
                <div
                  key={childField.id}
                  className={`${childField.colSpan ? `col-span-${colSpanMap[childField.colSpan]}` : 'col-span-1'}`}
                >
                  {renderFormField(childField)}
                </div>
              ))}
            </div>
            {Array.isArray(field.value) && field.value.length === 0 && (
              <p className="text-center text-gray-500 italic text-sm mt-2">
                No fields in this group for preview.
              </p>
            )}
          </div>
        );
      default:
        return <p className="text-red-500">Unsupported field type: {field.type}</p>;
    }
  }, [handleFieldChange, handleRemoveFile, currentForm.formColSpan, editFormData]); // Add editFormData to dependency array
  const gridColsMap: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
    7: "md:grid-cols-7",
    8: "md:grid-cols-8",
    9: "md:grid-cols-9",
    10: "md:grid-cols-10",
    11: "md:grid-cols-11",
    12: "md:grid-cols-12",
  };

  const FormPreview = useCallback(() => {

    const gridColsClass = gridColsMap[currentForm.formColSpan] || "md:grid-cols-1";
    return (
      <>
        {currentForm.formFieldJson.length === 0 ? (
          <p className="text-center text-gray-500 italic mb-4">
            No fields added yet. Click "Edit" to start adding.
          </p>
        ) : (

          <div className={`grid grid-cols-1 ${gridColsClass} gap-4`}>
            {currentForm.formFieldJson.map((field) => (
              <div
                key={field.id}
                className={`mb-2 p-4 relative ${field.colSpan ? `col-span-${field.colSpan}` : 'col-span-1'
                  }`}
              >
                {renderFormField(field)}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }, [currentForm.formFieldJson, currentForm.formColSpan, renderFormField]);

  return edit ? (
    <div>
      <PageMeta
        title="React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="From Elements" />
      <div className={isPreview ? "grid grid-cols-1" : "grid grid-cols-[25%_75%] gap-6 "}>
        <div hidden={isPreview}>
          <ComponentCard title="Add Form" >
            <div>
              {formConfigurations.map((item) => (
                <button
                  key={item.formType}
                  className="text-gray-700 hover:text-sky-700 w-full text-left dark:text-white/90 dark:hover:text-sky-400"
                  onClick={() => addField(item.formType)}
                  disabled={!editFormData} // Disable add field buttons
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
                <Button onClick={() => setIsPreview(true)} disabled={!editFormData}>Preview</Button> {/* Disable preview button */}
              </div>
            </div>
            <div hidden={!isPreview} >
              {FormPreview()}
              <div className="flex justify-between">
                <div className="flex">
                  <Button onClick={saveSchema} disabled={!editFormData}>Save schema</Button> {/* Disable save schema button */}
                </div>
                <div className="flex gap-2 \t">
                  <Button onClick={() => setIsPreview(false)} disabled={!editFormData}>Edit</Button> {/* Disable edit button */}
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
    <div className="flex justify-between w-full">
      {showDynamicForm && <Button
        className="m-4 flex mt-4 text-gray-800 hover:bg-blue-300 bg-blue-700 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-500"
        onClick={() => showDynamicForm && showDynamicForm(false)}
      >
        Close
      </Button>}
      {(currentForm.formFieldJson.length !== 0 && onFormSubmit) && (<div>
        <Button
          className="m-4 flex mt-4 text-gray-800 hover:bg-blue-300 bg-blue-700 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-500"
          onClick={handleSend}
        >
          Submit
        </Button>
      </div>)}
    </div>
  </div>);
}