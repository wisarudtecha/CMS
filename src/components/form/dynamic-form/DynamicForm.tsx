import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid'; // IMPORT: Using uuid library
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JSX } from "react/jsx-runtime";
import {
  AlignLeft,
  Hash,
  AlignJustify,
  Mail,
  CheckSquare,
  ChevronsUpDown,
  Image as ImageIcon,
  Layers,
  Lock,
  CalendarDays,
  Clock,
  Circle,
  LayoutGrid,
  Slack,
} from 'lucide-react';

// --- Interface Definitions ---
interface IndividualFormField {
  id: string;
  label: string;
  type: string;
  value: any;
  options?: any[];
  placeholder?: string;
  required: boolean;
  colSpan?: number;
  isChild?: boolean;
  GroupColSpan?: number;
  DynamicFieldColSpan?: number;
}

interface IndividualFormFieldWithChildren extends IndividualFormField {
  value: any | IndividualFormFieldWithChildren[];
  options?: Array<any | { value: string; form: IndividualFormFieldWithChildren[] }>;
}

interface FormField {
  formId: string;
  formName: string;
  formColSpan: number;
  formFieldJson: IndividualFormField[];
}

interface FormFieldWithChildren extends FormField {
  formFieldJson: IndividualFormFieldWithChildren[];
}

interface FormConfigItem {
  formType: string;
  title: string;
  options?: any[];
  canBeChild?: boolean;
}

interface DynamicFormProps {
  initialForm?: FormField;
  edit?: boolean;
  editFormData?: boolean;
  showDynamicForm?: React.Dispatch<React.SetStateAction<boolean>>;
  onFormSubmit?: (data: FormField) => void;
}

// --- Basic UI Components (Inline implementations to resolve import errors and preserve theme) ---
const gridColsMap: Record<number, string> = {
    1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
    5: "grid-cols-5", 6: "grid-cols-6", 7: "grid-cols-7", 8: "grid-cols-8",
    9: "grid-cols-9", 10: "grid-cols-10", 11: "grid-cols-11", 12: "grid-cols-12",
  };
  const colsMap: Record<number, string> = {
    1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4",
    5: "col-span-5", 6: "col-span-6", 7: "col-span-7", 8: "col-span-8",
    9: "col-span-9", 10: "col-span-10", 11: "col-span-11", 12: "col-span-12",
  };
  
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {children}
      </div>
    </div>
  );
};

interface DropdownItemProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ onClick, children, className }) => {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:hover:bg-gray-700 ${className}`}
      role="menuitem"
    >
      {children}
    </button>
  );
};

const ComponentCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] md:p-6 xl:p-9">
      <h4 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h4>
      {children}
    </div>
  );
};

const PageMeta: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  useEffect(() => {
    document.title = title;
  }, [title, description]);
  return null;
};

const PageBreadcrumb: React.FC<{ pageTitle: string }> = ({ pageTitle }) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-gray-900 dark:text-white">
        {pageTitle}
      </h2>
    </div>
  );
};


// --- Main DynamicForm Component ---
const formConfigurations: FormConfigItem[] = [
  { formType: "textInput", title: "Text Form", canBeChild: true },
  { formType: "Integer", title: "Number Form", canBeChild: true },
  { formType: "textAreaInput", title: "Text Area Form", canBeChild: true },
  { formType: "emailInput", title: "Email Form", canBeChild: true },
  { formType: "option", title: "Multiple Select Form", options: [], canBeChild: true },
  { formType: "select", title: "Single Select Form", options: [], canBeChild: true },
  { formType: "image", title: "Image", canBeChild: true },
  { formType: "multiImage", title: "MultiImage", canBeChild: true },
  { formType: "passwordInput", title: "Password", canBeChild: true },
  { formType: "dateInput", title: "Date Form", canBeChild: true },
  { formType: "dateLocal", title: "DateLocal Form", canBeChild: true },
  { formType: "radio", title: "Radio Button Form", options: [], canBeChild: true },
  { formType: "InputGroup", title: "Group of Input", canBeChild: false },
  { formType: "dynamicField", title: "Dynamic Field", canBeChild: false }
];

const formTypeIcons: Record<string, JSX.Element> = {
  textInput: <AlignLeft size={16} />,
  Integer: <Hash size={16} />,
  textAreaInput: <AlignJustify size={16} />,
  emailInput: <Mail size={16} />,
  option: <CheckSquare size={16} />,
  select: <ChevronsUpDown size={16} />,
  image: <ImageIcon size={16} />,
  multiImage: <div><Layers size={16} /><ImageIcon size={16} /></div>,
  passwordInput: <Lock size={16} />,
  dateInput: <CalendarDays size={16} />,
  dateLocal: <Clock size={16} />,
  radio: <Circle size={16} />,
  InputGroup: <LayoutGrid size={16} />,
  dynamicField: <Slack size={16} />,
};


function createDynamicFormField(
  config: FormConfigItem[],
  typeToInsert: string,
  isChild: boolean = false
): IndividualFormFieldWithChildren | undefined {
  const configItem = config.find((item) => item.formType === typeToInsert);

  if (!configItem) {
    return undefined;
  }
  if (isChild && !configItem.canBeChild) {
    console.warn(`Cannot add a "${configItem.title}" inside a group.`);
    return undefined;
  }

  const id = uuidv4(); // EDIT: Use uuidv4 for ID generation

  let defaultValue: any;
  let fieldOptions: any[] | undefined;
  let newOptionText: string | undefined;
  let placeholder: string | undefined;
  let GroupColSpan: number | undefined;
  let DynamicFieldColSpan: number | undefined;

  if (configItem.formType === "InputGroup") {
    defaultValue = [];
    GroupColSpan = 1;
  } else if (configItem.formType === "dynamicField") {
    defaultValue = "";
    DynamicFieldColSpan = 1;
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

  if (configItem.formType === "option" || configItem.formType === "select" || configItem.formType === "radio" || configItem.formType === "dynamicField") {
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
    ...(GroupColSpan !== undefined && { GroupColSpan: GroupColSpan }),
    ...(DynamicFieldColSpan !== undefined && { DynamicFieldColSpan: DynamicFieldColSpan }),
  };
}


export default function DynamicForm({ initialForm, edit = true, showDynamicForm, onFormSubmit, editFormData = true }: DynamicFormProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [currentForm, setCurrentForm] = useState<FormFieldWithChildren>(
    initialForm ?
      {
        ...initialForm,
        formFieldJson: initialForm.formFieldJson.map(field => {
          let updatedField: IndividualFormFieldWithChildren = { ...field as IndividualFormFieldWithChildren };

          if (updatedField.type === "InputGroup" && Array.isArray(updatedField.value)) {
            updatedField.value = updatedField.value as IndividualFormFieldWithChildren[];
          } else if (updatedField.type === "dynamicField") {
            updatedField.value = typeof updatedField.value === 'string' ? updatedField.value : "";
            updatedField.options = updatedField.options?.map(option => ({
              ...option,
              form: Array.isArray(option.form) ? option.form as IndividualFormFieldWithChildren[] : []
            }));
          }

          if (updatedField.type === "InputGroup" && updatedField.GroupColSpan === undefined) {
            updatedField.GroupColSpan = 1;
          }
          if (updatedField.type === "dynamicField" && updatedField.DynamicFieldColSpan === undefined) {
            updatedField.DynamicFieldColSpan = 1;
          }

          return updatedField;
        })
      } :
      {
        formId: uuidv4(), // EDIT: Use uuidv4 for ID generation
        formName: "New Dynamic Form",
        formColSpan: 1,
        formFieldJson: [],
      }
  );
  const [expandedDynamicFields, setExpandedDynamicFields] = useState<Record<string, boolean>>({});
  
  // EDIT: State for managing hidden cards in the layout editor
  const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(new Set());

  // EDIT: Toggle visibility of a single card
  const toggleCardVisibility = useCallback((id: string) => {
    setHiddenCardIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // EDIT: Get all field IDs recursively for "Hide/Show All"
  const getAllFieldIds = (fields: IndividualFormFieldWithChildren[]): string[] => {
    let ids: string[] = [];
    for (const field of fields) {
      ids.push(field.id);
      if (field.type === "InputGroup" && Array.isArray(field.value)) {
        ids = ids.concat(getAllFieldIds(field.value));
      }
      if (field.type === "dynamicField" && Array.isArray(field.options)) {
        for (const option of field.options) {
          if (Array.isArray(option.form)) {
            ids = ids.concat(getAllFieldIds(option.form));
          }
        }
      }
    }
    return ids;
  };

  // EDIT: Hide all cards
  const hideAllCards = useCallback(() => {
    const allIds = getAllFieldIds(currentForm.formFieldJson);
    setHiddenCardIds(new Set(allIds));
  }, [currentForm.formFieldJson]);

  // EDIT: Show all cards
  const showAllCards = useCallback(() => {
    setHiddenCardIds(new Set());
  }, []);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
        return { ...field, value: updateFieldRecursively(field.value, idToUpdate, callback) };
      }
      if (field.type === "dynamicField" && Array.isArray(field.options)) {
        return {
          ...field,
          options: field.options.map(option => ({
            ...option,
            form: Array.isArray(option.form) ? updateFieldRecursively(option.form, idToUpdate, callback) : []
          }))
        };
      }
      return field;
    });
  }, []);

  const handleChildContainerColSpanChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, containerId: string, containerType: "InputGroup" | "dynamicField") => {
    let newColSpan = parseInt(e.target.value, 10);
    if (isNaN(newColSpan) || newColSpan < 1) {
      newColSpan = 1;
    } else if (newColSpan > 12) {
      newColSpan = 12;
    }

    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, containerId, (field) => {
        if (field.type === containerType) {
          const updatedChildren = Array.isArray(field.value)
            ? field.value.map((childField: IndividualFormFieldWithChildren) => {
              if (childField.colSpan && childField.colSpan > newColSpan) {
                return { ...childField, colSpan: newColSpan };
              }
              return childField;
            })
            : [];

          if (containerType === "InputGroup") {
            return { ...field, GroupColSpan: newColSpan, value: updatedChildren };
          } else if (containerType === "dynamicField") {
            const updatedOptions = field.options?.map(option => {
              if (Array.isArray(option.form)) {
                const updatedOptionForm = option.form.map((childField: IndividualFormFieldWithChildren) => {
                  if (childField.colSpan && childField.colSpan > newColSpan) {
                    return { ...childField, colSpan: newColSpan };
                  }
                  return childField;
                });
                return { ...option, form: updatedOptionForm };
              }
              return option;
            });
            return { ...field, DynamicFieldColSpan: newColSpan, options: updatedOptions };
          }
        }
        return field;
      }),
    }));
  }, [updateFieldRecursively]);


  const removeFieldRecursively = useCallback((
    fields: IndividualFormFieldWithChildren[],
    idToRemove: string
  ): IndividualFormFieldWithChildren[] => {
    const filteredFields = fields.filter(field => field.id !== idToRemove);

    return filteredFields.map(field => {
      if (field.type === "InputGroup" && Array.isArray(field.value)) {
        return { ...field, value: removeFieldRecursively(field.value, idToRemove) };
      }
      if (field.type === "dynamicField" && Array.isArray(field.options)) {
        return {
          ...field,
          options: field.options.map(option => ({
            ...option,
            form: Array.isArray(option.form) ? removeFieldRecursively(option.form, idToRemove) : []
          }))
        };
      }
      return field;
    });
  }, []);


  const addField = useCallback((formType: string, parentId?: string) => {
    const newField = createDynamicFormField(formConfigurations, formType, !!parentId);
    if (!newField) return;

    setCurrentForm(prevForm => {
      if (!parentId) {
        return {
          ...prevForm,
          formFieldJson: [...prevForm.formFieldJson, newField]
        };
      }

      const addRecursively = (fields: IndividualFormFieldWithChildren[]): IndividualFormFieldWithChildren[] => {
        return fields.map(field => {
          if (field.id === parentId && field.type === "InputGroup") {
            const newValue = Array.isArray(field.value) ? [...field.value, newField] : [newField];
            return { ...field, value: newValue };
          }
          if (field.type === "InputGroup" && Array.isArray(field.value)) {
            return { ...field, value: addRecursively(field.value) };
          }
          if (field.type === "dynamicField" && Array.isArray(field.options)) {
            const updatedOptions = field.options.map(option => ({
              ...option,
              form: Array.isArray(option.form) ? addRecursively(option.form) : []
            }));
            return { ...field, options: updatedOptions };
          }
          return field;
        });
      };

      return {
        ...prevForm,
        formFieldJson: addRecursively(prevForm.formFieldJson)
      };
    });
  }, []);

  const addFieldToDynamicOption = useCallback((dynamicFieldId: string, optionValue: string, formType: string) => {
    const newField = createDynamicFormField(formConfigurations, formType, true);
    if (!newField) return;

    const callback = (field: IndividualFormFieldWithChildren) => {
      if (field.id === dynamicFieldId && field.type === "dynamicField") {
        const updatedOptions = field.options?.map(option => {
          if (option.value === optionValue) {
            const newForm = Array.isArray(option.form) ? [...option.form, newField] : [newField];
            return { ...option, form: newForm };
          }
          return option;
        });
        return { ...field, options: updatedOptions };
      }
      return field;
    };

    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, dynamicFieldId, callback)
    }));
  }, [updateFieldRecursively]);


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
        if (field.type === "select" || field.type === "dynamicField") {
          return { ...field, value: String(newValue) };
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
          const newOptionValue = newOptionTextValue.trim();
          if (field.type === "dynamicField") {
            const newOption = {
              value: newOptionValue,
              form: []
            };
            if (field.options && !field.options.some(o => o.value === newOptionValue)) {
              return { ...field, options: [...field.options, newOption] };
            } else if (!field.options) {
              return { ...field, options: [newOption] };
            }
          } else {
            if (field.options && !field.options.includes(newOptionValue)) {
              return { ...field, options: [...field.options, newOptionValue] };
            } else if (!field.options) {
              return { ...field, options: [newOptionValue] };
            }
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
    const { isChild, ...rest } = field;

    if (rest.type === "InputGroup" && Array.isArray(rest.value)) {
      return {
        ...rest,
        value: rest.value.map(transformFieldForSubmission),
      } as IndividualFormField;
    }

    if (rest.type === "dynamicField" && Array.isArray(rest.options)) {
      return {
        ...rest,
        options: rest.options.map(option => ({
          ...option,
          form: Array.isArray(option.form) ? option.form.map(transformFieldForSubmission) : []
        }))
      };
    }

    return rest;
  }, []);


  const handleSend = useCallback(() => {
    const validateFields = (fields: IndividualFormFieldWithChildren[]): boolean => {
      for (const field of fields) {
        if (field.required) {
          if (field.type === "InputGroup" && Array.isArray(field.value)) {
            if (!validateFields(field.value)) return false;
          } else if (field.type === "dynamicField") {
            const selectedOption = field.options?.find(o => o.value === field.value);
            if (!selectedOption || !validateFields(selectedOption.form || [])) {
              return false;
            }
          } else if (Array.isArray(field.value)) {
            if (field.value.length === 0) return false;
          } else if (typeof field.value === 'string') {
            if (field.value.trim() === '') return false;
          } else if (field.type === 'Integer') {
            if (typeof field.value !== 'number' || isNaN(field.value) || field.value === null) return false;
          } else if (field.value === null || field.value === undefined) {
            return false;
          }
        }
      }
      return true;
    };

    const allFieldsValid = validateFields(currentForm.formFieldJson);
    console.log("Current Form Data:", currentForm);

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
        if (field.type === "dynamicField" && Array.isArray(field.options)) {
          for (const option of field.options) {
            if (Array.isArray(option.form) && checkIdExistsRecursively(option.form)) {
              return true;
            }
          }
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
          const removedOption = field.options[optionIndexToRemove];
          const updatedOptions = field.options.filter((_, index) => index !== optionIndexToRemove);
          let newValue = field.value;

          if (field.type === "dynamicField") {
            if (field.value === removedOption.value) {
              newValue = "";
            }
          } else if ((field.type === "select" || field.type === "radio") && field.value === removedOption) {
            newValue = "";
          } else if (field.type === "option" && Array.isArray(field.value)) {
            newValue = field.value.filter(val => val !== removedOption);
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

  type PathSegment = UniqueIdentifier | { id: UniqueIdentifier; optionValue: string };

  const getParentAndCurrentArray = useCallback((
    fields: IndividualFormFieldWithChildren[],
    id: UniqueIdentifier,
    parentPath: PathSegment[] = []
  ): { arr: IndividualFormFieldWithChildren[]; index: number; path: PathSegment[] } | null => {
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (field.id === id) {
        return { arr: fields, index: i, path: parentPath };
      }
      if (field.type === "InputGroup" && Array.isArray(field.value)) {
        const found = getParentAndCurrentArray(field.value, id, [...parentPath, field.id]);
        if (found) return found;
      }
      if (field.type === "dynamicField" && Array.isArray(field.options)) {
        for (const option of field.options) {
          if (Array.isArray(option.form)) {
            const found = getParentAndCurrentArray(option.form, id, [...parentPath, { id: field.id, optionValue: option.value }]);
            if (found) return found;
          }
        }
      }
    }
    return null;
  }, []);


  const updateNestedFormFields = useCallback((
    fields: IndividualFormFieldWithChildren[],
    path: PathSegment[],
    updatedArray: IndividualFormFieldWithChildren[]
  ): IndividualFormFieldWithChildren[] => {
    if (path.length === 0) {
      return updatedArray;
    }

    const currentPathSegment = path[0];
    const currentId = (typeof currentPathSegment === 'object' && currentPathSegment !== null)
      ? currentPathSegment.id
      : currentPathSegment;

    return fields.map(field => {
      if (field.id !== currentId) {
        return field;
      }

      if (field.type === "InputGroup" && (typeof currentPathSegment === 'string' || typeof currentPathSegment === 'number')) {
        return { ...field, value: updateNestedFormFields(Array.isArray(field.value) ? field.value : [], path.slice(1), updatedArray) };
      }

      if (field.type === "dynamicField" && typeof currentPathSegment === 'object' && currentPathSegment !== null) {
        const optionValueToUpdate = currentPathSegment.optionValue;
        const updatedOptions = field.options?.map(option => {
          if (option.value === optionValueToUpdate) {
            return { ...option, form: updateNestedFormFields(Array.isArray(option.form) ? option.form : [], path.slice(1), updatedArray) };
          }
          return option;
        });
        return { ...field, options: updatedOptions };
      }
      return field;
    });
  }, []);

  const onDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setCurrentForm(prevForm => {
      const newFormFieldJson = JSON.parse(JSON.stringify(prevForm.formFieldJson));

      const activeInfo = getParentAndCurrentArray(newFormFieldJson, active.id);
      const overInfo = getParentAndCurrentArray(newFormFieldJson, over.id);

      if (!activeInfo || !overInfo) {
        return prevForm;
      }

      const pathToString = (p: PathSegment[]) => p.map(i => (typeof i === 'object' ? `${i.id}_${i.optionValue}` : i)).join('>');

      if (pathToString(activeInfo.path) !== pathToString(overInfo.path)) {
        console.warn("Moving items between different groups is not allowed.");
        return prevForm;
      }

      const { arr: activeArr, index: activeIndex } = activeInfo;
      const { index: overIndex } = overInfo;
      const reorderedArr = arrayMove(activeArr, activeIndex, overIndex);

      const finalFormJson = updateNestedFormFields(newFormFieldJson, activeInfo.path, reorderedArr);

      return { ...prevForm, formFieldJson: finalFormJson };
    });
  }, [getParentAndCurrentArray, updateNestedFormFields]);

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
    handleChildContainerColSpanChange: (e: React.ChangeEvent<HTMLInputElement>, containerId: string, containerType: "InputGroup" | "dynamicField") => void;
    addField: (formType: string, parentId?: string) => void;
    addFieldToDynamicOption: (dynamicFieldId: string, optionValue: string, formType: string) => void;
    editFormData: boolean;
    isHidden: boolean; // EDIT: Receive hidden state as a prop
    toggleCardVisibility: (id: string) => void; // EDIT: Receive toggle function as a prop
  }

  const SortableFieldEditItem: React.FC<FieldEditItemProps> = React.memo(({
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
    handleChildContainerColSpanChange,
    addField,
    addFieldToDynamicOption,
    editFormData,
    isHidden, // EDIT
    toggleCardVisibility, // EDIT
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isOver,
      setActivatorNodeRef
    } = useSortable({ id: field.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isOver ? 0.5 : 1,
    };

    const [isAddDropdownOpen, setAddDropdownOpen] = useState(false);
    const [dynamicOptionDropdown, setDynamicOptionDropdown] = useState<Record<string, boolean>>({});
    const [localIdValue, setLocalIdValue] = useState(field.id);
    const [localLabelValue, setLocalLabelValue] = useState(field.label);
    const [localPlaceholderValue, setLocalPlaceholderValue] = useState(field.placeholder || "");
    const [localNewOptionText, setLocalNewOptionText] = useState("");
    const [localGroupColSpan, setLocalGroupColSpan] = useState(field.GroupColSpan || 1);
    const [localDynamicFieldColSpan, setLocalDynamicFieldColSpan] = useState(field.DynamicFieldColSpan || 1);

    const idInputRef = useRef<HTMLInputElement>(null);
    const labelInputRef = useRef<HTMLInputElement>(null);
    const placeholderInputRef = useRef<HTMLInputElement>(null);

    const toggleDynamicFieldExpansion = (optionValue: string) => {
      setExpandedDynamicFields(prev => ({ ...prev, [`${field.id}-${optionValue}`]: !prev[`${field.id}-${optionValue}`] }));
    };

    useEffect(() => {
      setLocalIdValue(field.id);
    }, [field.id]);

    useEffect(() => {
      setLocalLabelValue(field.label);
    }, [field.label]);

    useEffect(() => {
      setLocalPlaceholderValue(field.placeholder || "");
    }, [field.placeholder]);

    useEffect(() => {
      setLocalGroupColSpan(field.GroupColSpan || 1);
    }, [field.GroupColSpan]);

    useEffect(() => {
      setLocalDynamicFieldColSpan(field.DynamicFieldColSpan || 1);
    }, [field.DynamicFieldColSpan]);


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

    const handleLocalGroupColSpanChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalGroupColSpan(parseInt(e.target.value, 10));
      handleChildContainerColSpanChange(e, field.id, "InputGroup");
    }, [field.id, handleChildContainerColSpanChange]);

    const handleLocalDynamicFieldColSpanChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalDynamicFieldColSpan(parseInt(e.target.value, 10));
      handleChildContainerColSpanChange(e, field.id, "dynamicField");
    }, [field.id, handleChildContainerColSpanChange]);


    const showPlaceholderInput =
      field.type === "textInput" ||
      field.type === "Integer" ||
      field.type === "textAreaInput" ||
      field.type === "emailInput" ||
      field.type === "passwordInput";

    const colSpanOptions = Array.from({ length: overallFormColSpan }, (_, i) => i + 1);
    const isInputGroup = field.type === "InputGroup";
    const isDynamicField = field.type === "dynamicField";
    const showLabelInput = !field.isChild;
    const childFormFields = formConfigurations.filter(f => f.canBeChild);

    const isAnyDropdownOpen = isAddDropdownOpen || Object.values(dynamicOptionDropdown).some(Boolean);

    return (
      <div
        ref={setNodeRef} style={style}
        className={`mb-6 p-4 border rounded-lg bg-gray-50 relative dark:border-gray-600 dark:bg-white/[0.03] dark:text-white/90 ${isAnyDropdownOpen ? 'z-20' : 'z-auto'}`}
        {...attributes}
      >
        <div
          ref={setActivatorNodeRef}
          className="flex top-2 left-2 p-1 cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          title="Drag to reorder"
          {...listeners}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>

        {/* EDIT: Hide/Show button using new prop-based state */}
        <div className="absolute top-2 right-9">
          <Button
            onClick={() => toggleCardVisibility(field.id)}
            className="px-2 py-1 bg-blue-400 text-gray-700 rounded-md hover:bg-blue-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 text-xs"
          >
            {isHidden ? 'Show' : 'Hide'}
          </Button>
        </div>

        {/* EDIT: Conditional rendering based on `isHidden` prop */}
        {isHidden ? (
          <div className="flex items-center gap-2 py-2">
            <span className="text-gray-700 dark:text-white/90 text-lg font-semibold">
              {field.label}
            </span>
            <span className="text-blue-500 dark:text-blue-300 text-xl">
              {formTypeIcons[field.type] || <span className="text-sm">?</span>}
            </span>
          </div>
        ) : (
          <>
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
                  disabled={!editFormData}
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
                disabled={true}
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
                  disabled={!editFormData}
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
                disabled={!editFormData}
              />
              <label htmlFor={`required-${field.id}`} className="ml-2 text-gray-700 text-sm dark:text-white/90">
                Required
              </label>
            </div>
            {field.isChild ?
              <div className={`flex items-center mt-2`}>
                <label htmlFor={`colSpan-select-${field.id}`} className="text-gray-700 text-sm dark:text-white/90">
                  Column Span (Field):
                </label>
                <select
                  id={`colSpan-select-${field.id}`}
                  value={field.colSpan && field.colSpan <= overallFormColSpan ? field.colSpan : 1}
                  onChange={(e) => handleColSpanChange(field.id, parseInt(e.target.value) as number)}
                  className="ml-2 py-1 px-2 border rounded-md text-gray-700 dark:bg-white/[0.03] dark:text-white/90"
                  disabled={!editFormData}
                >
                  {colSpanOptions.map((span) => (
                    <option key={span} value={span}>
                      {Math.trunc(span / overallFormColSpan * 100)} %
                    </option>
                  ))}
                </select>
              </div> : (isInputGroup || isDynamicField) ?
                <div>
                  <div className="flex items-center mt-2">
                    <label htmlFor={`overallColSpan-input-${field.id}`} className="text-gray-700 text-sm dark:text-white/90">
                      Overall {isInputGroup ? 'Group' : 'Dynamic Field'} Column Span:
                    </label>
                    <input
                      id={`overallColSpan-input-${field.id}`}
                      type="number"
                      min="1"
                      max="12"
                      value={isInputGroup ? localGroupColSpan : localDynamicFieldColSpan}
                      onChange={isInputGroup ? handleLocalGroupColSpanChange : handleLocalDynamicFieldColSpanChange}
                      className="ml-2 py-1 px-2 border rounded-md text-gray-700 dark:bg-white/[0.03] dark:text-white/90 w-20"
                      disabled={!editFormData}
                    />
                  </div>
                  <div className={`flex items-center mt-2`}>

                    <label htmlFor={`colSpan-select-${field.id}`} className="text-gray-700 text-sm dark:text-white/90">
                      Column Span (Field):
                    </label>
                    <select
                      id={`colSpan-select-${field.id}`}
                      value={field.colSpan && field.colSpan <= overallFormColSpan ? field.colSpan : 1}
                      onChange={(e) => handleColSpanChange(field.id, parseInt(e.target.value) as number)}
                      className="ml-2 py-1 px-2 border rounded-md text-gray-700 dark:bg-white/[0.03] dark:text-white/90"
                      disabled={!editFormData}
                    >
                      {colSpanOptions.map((span) => (
                        <option key={span} value={span}>
                          {Math.trunc(span / overallFormColSpan * 100)} %
                        </option>
                      ))}
                    </select>
                  </div> </div> :
                <div className="flex items-center mt-2">
                  <label htmlFor={`colSpan-select-${field.id}`} className="text-gray-700 text-sm dark:text-white/90">
                    Column Span (Field):
                  </label>
                  <select
                    id={`colSpan-select-${field.id}`}
                    value={field.colSpan && field.colSpan <= overallFormColSpan ? field.colSpan : 1}
                    onChange={(e) => handleColSpanChange(field.id, parseInt(e.target.value) as number)}
                    className="ml-2 py-1 px-2 border rounded-md text-gray-700 dark:bg-white/[0.03] dark:text-white/90"
                    disabled={!editFormData}
                  >
                    {colSpanOptions.map((span) => (
                      <option key={span} value={span}>
                        {Math.trunc(span / overallFormColSpan * 100)} %
                      </option>
                    ))}
                  </select>
                </div>}


            {(field.type === "select" || field.type === "option" || field.type === "radio" || isDynamicField) && field.options ? (
              <div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="New option"
                    value={localNewOptionText}
                    onChange={(e) => setLocalNewOptionText(e.target.value)}
                    onKeyDown={handleNewOptionKeyDown}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm dark:text-white/90"
                    disabled={!editFormData}
                  />
                  <Button
                    onClick={handleAddOptionClick}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-sm "
                    disabled={!editFormData}
                  >
                    +
                  </Button>
                </div>

                {field.options.map((option, index) => {
                  const optionValue = isDynamicField ? option.value : option;
                  const isExpanded = !!expandedDynamicFields[`${field.id}-${optionValue}`];
                  const isOptionDropdownOpen = !!dynamicOptionDropdown[optionValue];

                  return (
                    <div key={optionValue} className="flex flex-col gap-2 mt-2 border-t pt-2">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-700 dark:text-white">- {optionValue}</p>
                        <div className="flex items-center gap-2">
                          {isDynamicField && (
                            <Button
                              onClick={() => toggleDynamicFieldExpansion(optionValue)}
                              className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs"
                            >
                              {isExpanded ? 'Hide Form' : 'Show Form'}
                            </Button>
                          )}
                          <Button
                            onClick={() => handleRemoveOption(field.id, index)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 text-sm "
                            disabled={!editFormData}
                          >
                            -
                          </Button>
                        </div>
                      </div>
                      {isDynamicField && isExpanded && (
                        <div className="mt-2 p-3  rounded-md bg-blue-50  dark:bg-white/[0.03]">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold dark:text-white/90">Form for "{optionValue}"</h4>
                            <div className="relative">
                              <Button className="dropdown-toggle" onClick={() => setDynamicOptionDropdown(prev => ({ ...prev, [optionValue]: !prev[optionValue] }))}>
                                Add Field
                              </Button>
                              <Dropdown isOpen={isOptionDropdownOpen} onClose={() => setDynamicOptionDropdown(prev => ({ ...prev, [optionValue]: false }))}>
                                {childFormFields.map(formItem => (
                                  <DropdownItem
                                    className="text-gray-700  text-sm dark:text-white/90"
                                    key={formItem.formType}
                                    onClick={() => {
                                      addFieldToDynamicOption(field.id, optionValue, formItem.formType);
                                      setDynamicOptionDropdown(prev => ({ ...prev, [optionValue]: false }));
                                    }}
                                  >
                                    {formItem.title}
                                  </DropdownItem>
                                ))}
                              </Dropdown>
                            </div>
                          </div>
                          <SortableContext
                            items={(option.form || []).map((f: IndividualFormFieldWithChildren) => f.id)}
                            strategy={rectSortingStrategy}
                          >
                            <div className={` min-h-[50px] space-y-4 grid grid-cols-${field.DynamicFieldColSpan || 1} gap-4`}>
                              {(option.form || []).map((childField: IndividualFormFieldWithChildren) => (
                                <div className={colsMap[childField.colSpan||1]} key={childField.id}>
                                  <SortableFieldEditItem
                                    key={childField.id}
                                    field={childField}
                                    handleLabelChange={handleLabelChange}
                                    updateFieldId={updateFieldId}
                                    handleAddOption={handleAddOption}
                                    handleRemoveOption={handleRemoveOption}
                                    removeField={removeField}
                                    handleToggleRequired={handleToggleRequired}
                                    handlePlaceholderChange={handlePlaceholderChange}
                                    handleColSpanChange={handleColSpanChange}
                                    overallFormColSpan={field.DynamicFieldColSpan || 1}
                                    addField={addField}
                                    addFieldToDynamicOption={addFieldToDynamicOption}
                                    editFormData={editFormData}
                                    handleChildContainerColSpanChange={handleChildContainerColSpanChange}
                                    isHidden={hiddenCardIds.has(childField.id)}
                                    toggleCardVisibility={toggleCardVisibility}
                                  />
                                </div>
                              ))}
                            </div>
                          </SortableContext>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {isInputGroup && (
              <div className="mt-4 p-3 border border-gray-300 rounded-md bg-gray-100 dark:border-gray-500 dark:bg-white/[0.05]">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-semibold dark:text-white/90">Grouped Fields</h3>
                  <div className="relative">
                    <Button className="dropdown-toggle" onClick={() => setAddDropdownOpen(prev => !prev)}>Add Field</Button>
                    <Dropdown isOpen={isAddDropdownOpen} onClose={() => setAddDropdownOpen(false)}>
                      {childFormFields.map(item => (
                        <DropdownItem
                          key={item.formType}
                          onClick={() => {
                            addField(item.formType, field.id);
                            setAddDropdownOpen(false);
                          }}
                        >
                          {item.title}
                        </DropdownItem>
                      ))}
                    </Dropdown>
                  </div>
                </div>
                <SortableContext
                  items={Array.isArray(field.value) ? field.value.map((f: IndividualFormFieldWithChildren) => f.id) : []}
                  strategy={rectSortingStrategy}
                >
                  <div
                    className={`min-h-[50px] -space-y-6 grid grid-cols-${field.GroupColSpan || 1} gap-4`}
                  >
                    {Array.isArray(field.value) && field.value.map((childField: IndividualFormFieldWithChildren) => (
                      <div className={colsMap[childField.colSpan||1]} key={childField.id}>
                        <SortableFieldEditItem
                          key={childField.id}
                          field={childField}
                          handleLabelChange={handleLabelChange}
                          updateFieldId={updateFieldId}
                          handleAddOption={handleAddOption}
                          handleRemoveOption={handleRemoveOption}
                          removeField={removeField}
                          handleToggleRequired={handleToggleRequired}
                          handlePlaceholderChange={handlePlaceholderChange}
                          handleColSpanChange={handleColSpanChange}
                          overallFormColSpan={field.GroupColSpan || 1}
                          addField={addField}
                          addFieldToDynamicOption={addFieldToDynamicOption}
                          editFormData={editFormData}
                          handleChildContainerColSpanChange={handleChildContainerColSpanChange}
                          isHidden={hiddenCardIds.has(childField.id)}
                          toggleCardVisibility={toggleCardVisibility}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </div>
            )}
          </>
        )}

        <button
          onClick={() => removeField(field.id)}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs leading-none w-6 h-6 flex items-center justify-center hover:bg-red-600 transition duration-300 z-10"
          title="Remove field"
          disabled={!editFormData}
        >
          ✕
        </button>
      </div>
    );
  });


  const FormEdit = useCallback(() => {
    const gridColsMapClass: Record<number, string> = {
      1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
      5: "grid-cols-5", 6: "grid-cols-6", 7: "grid-cols-7", 8: "grid-cols-8",
      9: "grid-cols-9", 10: "grid-cols-10", 11: "grid-cols-11", 12: "grid-cols-12",
    };
    const overallGridClass = gridColsMapClass[currentForm.formColSpan] || "grid-cols-1";

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
              disabled={!editFormData}
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
              disabled={true}
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
              disabled={!editFormData}
            />
          </div>
        </div>

        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-white/[0.03] dark:text-white/90">
          <div className="flex justify-between items-center mb-4 ">
            <h2 className="text-lg font-bold">Form Layout Preview</h2>
            {/* EDIT: Hide/Show All buttons */}
            <div className="flex gap-2">
                <Button
                    onClick={hideAllCards}
                    className="px-3 py-1 bg-blue-200 text-gray-700 rounded-md hover:bg-blue-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 text-sm"
                >
                    Hide All
                </Button>
                <Button
                    onClick={showAllCards}
                    className="px-3 py-1 bg-blue-200 text-gray-700 rounded-md hover:bg-blue-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 text-sm"
                >
                    Show All
                </Button>
            </div>
          </div>

          {currentForm.formFieldJson.length === 0 ? (
            <p className="text-center text-gray-500 italic">
              No fields added yet. Use the "Add Form" section to add new fields.
            </p>
          ) : (
            <div className={`p-4 border   dark:border-gray-500 rounded-lg  dark:bg-white/[0.03]`}>
              <p className="text-blue-700 text-sm font-semibold mb-3 dark:text-gray-300">
                Form Layout Preview (Overall {currentForm.formColSpan} Columns)
              </p>
              <SortableContext
                items={currentForm.formFieldJson.map(field => field.id)}
                strategy={rectSortingStrategy}
                key={currentForm.formId}
              >
                <div className={`grid w-full ${overallGridClass} gap-4`}>
                  {currentForm.formFieldJson.map((field) => (
                    <div className={colsMap[field.colSpan||1]} key={field.id}>
                      <SortableFieldEditItem
                        key={field.id}
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
                        addFieldToDynamicOption={addFieldToDynamicOption}
                        editFormData={editFormData}
                        handleChildContainerColSpanChange={handleChildContainerColSpanChange}
                        isHidden={hiddenCardIds.has(field.id)} // EDIT: Pass hidden state
                        toggleCardVisibility={toggleCardVisibility} // EDIT: Pass toggle function
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </div>
          )}
        </div>
      </>
    );
  }, [currentForm, handleFormIdChange, handleFormNameChange, handleOverallFormColSpanChange, handleLabelChange, updateFieldId, handleAddOption, handleRemoveOption, removeField, handleToggleRequired, handlePlaceholderChange, handleColSpanChange, addField, addFieldToDynamicOption, editFormData, handleChildContainerColSpanChange, expandedDynamicFields, hiddenCardIds, toggleCardVisibility, hideAllCards, showAllCards]);

  const renderFormField = useCallback((field: IndividualFormFieldWithChildren) => {

    const commonProps = {
      id: field.id,
      className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-white/90 dark:border-gray-800 dark:bg-gray-900",
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      required: field.required,
      disabled: !editFormData,
    };

    const labelComponent = !field.isChild && (
      <label
        htmlFor={field.id}
        className="block text-gray-700 text-sm font-bold mb-2 dark:text-white/90"
      >
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
    );
    const groupGridColsMap: Record<number, string> = {
      1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
      5: "grid-cols-5", 6: "grid-cols-6", 7: "grid-cols-7", 8: "grid-cols-8",
      9: "grid-cols-9", 10: "grid-cols-10", 11: "grid-cols-11", 12: "grid-cols-12",
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
                field.type === "textInput" ? "text" : field.type === "emailInput" ? "email" : "password"
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
              value={String(field.value || "")}
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
                    disabled={!editFormData}
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
                    disabled={!editFormData}
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
                disabled={!editFormData}
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
                    disabled={!editFormData}
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
                          disabled={!editFormData}
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
        const groupColSpanClass = groupGridColsMap[field.GroupColSpan || 1] || "grid-cols-1";

        return (
          <div>
            {!field.isChild && (
              <h3 className="text-lg font-semibold mb-3 dark:text-white/90">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </h3>
            )}
            <div className={`grid ${groupColSpanClass} gap-4`}>
              {Array.isArray(field.value) && field.value.map((childField: IndividualFormFieldWithChildren) => (
                <div
                  key={childField.id}
                  className={`${childField.colSpan ? `col-span-${childField.colSpan}` : 'col-span-1'}`}
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
      case "dynamicField":
        const selectedOption = field.options?.find(
          (option: any) => option.value === field.value
        );
        const dynamicFieldColSpanClass = groupGridColsMap[field.DynamicFieldColSpan || 1] || "grid-cols-1";

        return (
          <>
            {labelComponent}
            <select
              value={String(field.value || "")}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              {...commonProps}
              className={`${commonProps.className} bg-white dark:bg-white/[0.03]`}
            >
              <option value="" className="dark:bg-gray-800">
                Select an option
              </option>
              {field.options?.map((option: any) => (
                <option
                  className="text-gray-700 dark:text-white dark:bg-gray-800"
                  key={option.value}
                  value={option.value}
                >
                  {option.value}
                </option>
              ))}
            </select>
            {selectedOption && Array.isArray(selectedOption.form) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className={`grid ${dynamicFieldColSpanClass} gap-4`}>
                  {selectedOption.form.map((nestedField: IndividualFormFieldWithChildren) => (
                    <div
                      key={nestedField.id}
                      className={`col-span-${nestedField.colSpan || 1}`}
                    >
                      {renderFormField(nestedField)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      default:
        return <p className="text-red-500">Unsupported field type: {field.type}</p>;
    }
  }, [handleFieldChange, handleRemoveFile, editFormData]);
  
  const FormPreview = useCallback(() => {

    const gridColsClass = gridColsMap[currentForm.formColSpan] || "grid-cols-1";
    return (
      <>
        {currentForm.formFieldJson.length === 0 ? (
          <p className="text-center text-gray-500 italic mb-4">
            No fields added yet. Click "Edit" to start adding.
          </p>
        ) : (

          <div className={`grid ${gridColsClass} gap-4`}>
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
    <div >
      <PageMeta
        title="React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="From Elements" />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        {!isPreview && (

          <div className="sticky top-[100px]  z-30 bg-white dark:bg-gray-800 border dark:border-gray-800 px-5 py-2 rounded-2xl my-3.5">
            <div className="grid grid-cols-9 gap-1 mb-2">
              {formConfigurations.map((item) => (
                <button
                  key={item.formType}
                  className="text-gray-700 hover:text-sky-700 w-full text-left dark:text-white/90 dark:hover:text-sky-400"
                  onClick={() => addField(item.formType)}
                  disabled={!editFormData}
                >
                  {item.title.replace(" Form", "")}
                </button>
              ))}
            </div>

          </div>
        )}

        <div className={isPreview ? "grid grid-cols-1" : "grid  gap-6 "}>

          <div className="space-y-6 ">
            <ComponentCard title="Dynamic Form">
              <div hidden={isPreview}>
                {FormEdit()}
                <div className="flex justify-end sticky bottom-2 z-30">
                  <Button onClick={() => setIsPreview(true)} disabled={!editFormData}>
                    Preview
                  </Button>
                </div>
              </div>
              <div hidden={!isPreview} >
                {FormPreview()}
                <div className="flex justify-between">
                  <div className="flex">
                    <Button onClick={saveSchema} disabled={!editFormData}>Save schema</Button>
                  </div>
                  <div className="flex gap-2 ">
                    <Button onClick={() => setIsPreview(false)} disabled={!editFormData}>Edit</Button>
                    <Button onClick={handleSend} className="bg-green-500 hover:bg-green-600">Enter</Button>
                  </div>
                </div>
              </div>
            </ComponentCard>

          </div>

        </div>
      </DndContext>
    </div>
  ) : (<div>
    {FormPreview()}
    <div className="flex justify-between w-full">
      {showDynamicForm && <Button
        className="m-4 flex mt-4 text-gray-800 hover:bg-blue-300 bg-blue-700 dark:bg-dark-900 dark:text-white dark:hover:bg-dark-700"
        onClick={() => showDynamicForm && showDynamicForm(false)}
      >
        Close
      </Button>}
      {(currentForm.formFieldJson.length !== 0 && onFormSubmit) && (<div>
        <Button
          className="m-4 flex mt-4 text-gray-800 hover:bg-blue-300 bg-blue-700 dark:bg-dark-900 dark:text-white dark:hover:bg-dark-700"
          onClick={handleSend}
        >
          Submit
        </Button>
      </div>)}
    </div>
  </div>);
}