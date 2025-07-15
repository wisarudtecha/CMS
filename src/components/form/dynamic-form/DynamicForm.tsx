import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid';
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
  Hash,
  AlignJustify,
  Mail,
  CheckSquare,
  ChevronsUpDown,
  Image as ImageIcon,
  Lock,
  CalendarDays,
  Clock,
  Circle,
  LayoutGrid,
  LetterText,
  Slack,
  FileIcon,
} from 'lucide-react';
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import TextArea from "../input/TextArea";
import { Modal } from "@/components/ui/modal";
import { IndividualFormFieldWithChildren, IndividualFormField, FormField, FormConfigItem, FormFieldWithChildren } from "@/components/interface/FormField";
// --- Interface Definitions ---
import Toast from "@/components/toast/Toast";

interface DynamicFormProps {
  initialForm?: FormField;
  edit?: boolean;
  editFormData?: boolean;
  showDynamicForm?: React.Dispatch<React.SetStateAction<boolean>>;
  onFormSubmit?: (data: FormField) => void;
  enableFormTitle?: boolean;
  enableSelfBg?:boolean;
  saveDraftsLocalStoreName?:string;
  onFormChange?: (data: FormField) => void;
  returnFormAllFill?:(isFill:boolean)=> void;
}
const maxGridCol = 5
// --- Responsive Helper Functions & Maps ---
const colSpanClasses: Record<string, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

const gridColumnContainerClasses: Record<string, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
  9: 'md:grid-cols-9',
  10: 'md:grid-cols-10',
  11: 'md:grid-cols-11',
  12: 'md:grid-cols-12',
};

const getResponsiveGridClass = (cols: number | undefined,) => {

  return gridColumnContainerClasses[cols ?? 1];
};

const getResponsiveColSpanClass = (span: number | undefined) => {

  return colSpanClasses[span ?? 1];
};

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white  focus:outline-none dark:bg-gray-800">
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

const DndImageUploader: React.FC<{
  onFileSelect: (file: File) => void;
  existingFile: File | null;
  handleRemoveFile: () => void;
  disabled?: boolean;
}> = ({ onFileSelect, existingFile, handleRemoveFile, disabled }) => {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Necessary to allow drop
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files[0].type.startsWith('image/')) {
        onFileSelect(files[0]);
      } else {

        // setShowToast(true)
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      {existingFile ? (
        <div className="relative group mt-2 w-full h-40">
          <img src={URL.createObjectURL(existingFile)} alt="Selected" className="w-full h-full object-contain rounded border border-gray-300 dark:border-gray-600" />
          <Button onClick={handleRemoveFile} className="absolute top-1 right-1 rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" disabled={disabled} size="xxs" variant="error">×</Button>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors
              ${dragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
              ${disabled ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-800' : 'cursor-pointer hover:border-blue-400'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
          <ImageIcon className="w-12 h-12 text-gray-400" />
          <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Drag & drop an image here, or click to select</p>
        </div>
      )}
    </div>
  );
};

const DndMultiImageUploader: React.FC<{
  onFilesSelect: (files: File[]) => void;
  existingFiles: File[];
  handleRemoveFile: (fileName: string) => void;
  disabled?: boolean;
}> = ({ onFilesSelect, existingFiles, handleRemoveFile, disabled }) => {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        onFilesSelect(imageFiles);
      } else {
        // setShowToast(true)
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelect(Array.from(files));
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors
            ${dragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
            ${disabled ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-800' : 'cursor-pointer hover:border-blue-400'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        <ImageIcon className="w-12 h-12 text-gray-400" />

        <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Drag & drop images here, or click to select</p>
      </div>
      {existingFiles.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-2">
          {existingFiles.map((file: File, index: number) => (
            <div key={`${file.name}-${index}`} className="relative group aspect-square">
              <img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} className="w-full h-full object-cover rounded border border-gray-300 dark:border-gray-600" />
              <Button onClick={() => handleRemoveFile(file.name)} className="absolute top-1 right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" disabled={disabled} size="xxs" variant="error">×</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



const PageMeta: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  useEffect(() => {
    document.title = title;
  }, [title, description]);
  return null;
};

// const PageBreadcrumb: React.FC<{ pageTitle: string }> = ({ pageTitle }) => {
//   return (
//     <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//       <h2 className="text-title-md2 font-semibold text-gray-900 dark:text-white">
//         {pageTitle}
//       </h2>
//     </div>
//   );
// };


// --- Main DynamicForm Component ---
const formConfigurations: FormConfigItem[] = [
  { formType: "textInput", title: "Text", canBeChild: true ,property:["contain","maxLength","minLength"] },
  { formType: "Integer", title: "Number", canBeChild: true ,property:["maxnumber","minnumber"]},
  { formType: "textAreaInput", title: "Text Area", canBeChild: true ,property:["contain","maxLength","minLength"]},
  { formType: "emailInput", title: "Email", canBeChild: true ,property:["validEmailFormat"]},
  { formType: "option", title: "Multi-Checkbox", options: [], canBeChild: true ,property:["maxSelections","minSelections"] },
  { formType: "select", title: "Single-Select", options: [], canBeChild: true },
  { formType: "image", title: "Image", canBeChild: true ,property: ["maxFileSize", "allowedFileTypes"]},
  { formType: "dndImage", title: "DnD Image", canBeChild: true ,property: ["maxFileSize", "allowedFileTypes"]},
  { formType: "multiImage", title: "Multi-Image", canBeChild: true ,property: ["maxFileSize", "allowedFileTypes","minFiles","maxFiles",]},
  { formType: "dndMultiImage", title: "DnD Multi-Image", canBeChild: true ,property: ["maxFileSize", "allowedFileTypes","minFiles","maxFiles",]},
  { formType: "passwordInput", title: "Password", canBeChild: true ,property: ["minLength","maxLength","hasUppercase","hasLowercase","hasNumber","hasSpecialChar","noWhitespace",],},
  { formType: "dateInput", title: "Date", canBeChild: true ,property: [ "minDate", "maxDate", "futureDateOnly", "pastDateOnly"]},
  { formType: "dateLocal", title: "Date & Time", canBeChild: true ,property: [ "minDate", "maxDate", "futureDateOnly", "pastDateOnly"]},
  { formType: "radio", title: "Radio", options: [], canBeChild: true },
  { formType: "InputGroup", title: "Group", canBeChild: false },
  { formType: "dynamicField", title: "Dynamic Field", canBeChild: false }
];

const formTypeIcons: Record<string, JSX.Element> = {
  textInput: <LetterText size={16} />,
  Integer: <Hash size={16} />,
  textAreaInput: <AlignJustify size={16} />,
  emailInput: <Mail size={16} />,
  option: <CheckSquare size={16} />,
  select: <ChevronsUpDown size={16} />,
  image: <ImageIcon size={16} />,
  dndImage: <FileIcon size={16} />,
  multiImage: <ImageIcon size={16} />,
  dndMultiImage: <ImageIcon size={16} />,
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

  const id = uuidv4();

  let defaultValue: any;
  let fieldOptions: any[] | undefined;
  let newOptionText: string | undefined;
  let placeholder: string | undefined;
  let GroupColSpan: number | undefined;
  let DynamicFieldColSpan: number | undefined;
  let enableSearch: boolean | undefined;


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
  } else if (configItem.formType === "multiImage" || configItem.formType === "dndMultiImage") {
    defaultValue = [];
  } else if (configItem.formType === "image" || configItem.formType === "dndImage") {
    defaultValue = null;
  } else {
    defaultValue = "";
  }

  if (configItem.formType === "option" || configItem.formType === "select" || configItem.formType === "radio" || configItem.formType === "dynamicField") {
    fieldOptions = configItem.options || [];
    newOptionText = "";
  }

  if ([ "select", "dynamicField"].includes(configItem.formType)) {
    enableSearch = false;
  }


  return {
    id: id,
    label: configItem.title,
    type: configItem.formType,
    showLabel: true,
    value: defaultValue,
    ...(enableSearch !== undefined && { enableSearch }),
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

const renderHiddenFieldPreview = (field: IndividualFormFieldWithChildren) => {
  const commonClasses = "shadow-sm appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight bg-gray-200 dark:bg-gray-700 dark:border-gray-600 pointer-events-none opacity-70";

  switch (field.type) {
    case 'textInput':
    case 'emailInput':
    case 'passwordInput':
    case 'Integer':
    case 'dateInput':
    case 'dateLocal':
      return <Input type="text" className={commonClasses} disabled placeholder={field.placeholder} />;
    case 'textAreaInput':
      return <textarea className={`${commonClasses} h-12`} disabled placeholder={field.placeholder} />;
    case 'select':
    case 'dynamicField':
      return (
        <select className={commonClasses} disabled>
          <option>{field.options?.length ? `${field.options.length} options` : 'Select...'}</option>
        </select>
      );
    case 'option':
      return (
        <div className="flex flex-col gap-1 text-xs text-gray-500 p-2 border rounded bg-gray-200 dark:bg-gray-700 dark:border-gray-600">
          {(field.options && field.options.length > 0) ? field.options.slice(0, 3).map(opt => <div key={opt} className="truncate"><CheckSquare size={12} className="inline-block mr-1" />{opt}</div>) : <span className="italic">No options</span>}
          {field.options && field.options.length > 3 && <span className="italic">...and more</span>}
        </div>
      );
    case 'radio':
      return (
        <div className="flex flex-col gap-1 text-xs text-gray-500 p-2 border rounded bg-gray-200 dark:bg-gray-700 dark:border-gray-600">
          {(field.options && field.options.length > 0) ? field.options.slice(0, 3).map(opt => <div key={opt} className="truncate"><Circle size={12} className="inline-block mr-1" />{opt}</div>) : <span className="italic">No options</span>}
          {field.options && field.options.length > 3 && <span className="italic">...and more</span>}
        </div>
      );
    case 'dndImage':
    case 'image':
    case 'dndMultiImage':
    case 'multiImage':
      return (
        <div className={`${commonClasses} flex items-center justify-center h-20`}>
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      );
    case 'InputGroup':
      return (
        <div className={`${commonClasses} flex items-center justify-center h-20`}>
          <LayoutGrid className="w-8 h-8 text-gray-400" />
        </div>
      );
    default:
      return <div className="text-xs italic text-gray-400">No preview available</div>;
  }
};


 function DynamicForm({ initialForm, edit = true, showDynamicForm, onFormSubmit, editFormData = true, enableFormTitle = true ,enableSelfBg=false,saveDraftsLocalStoreName="",onFormChange,returnFormAllFill}: DynamicFormProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [showToast, setShowToast] = useState(false);
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
        formId: uuidv4(),
        formName: "New Dynamic Form",
        formColSpan: 1,
        formFieldJson: [],
      }
  );
  
  const [importJsonText, setImportJsonText] = useState(String);
  const [expandedDynamicFields, setExpandedDynamicFields] = useState<Record<string, boolean>>({});
  const [isImport, setImport] = useState(false);
  const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(new Set());

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
  const handleFormImport = useCallback(() => {
    try {
      const parsedJson = JSON.parse(importJsonText);
      setCurrentForm(parsedJson);
      setImport(false);
    } catch (error) {
      setShowToast(true)
    }
  }, [importJsonText]);

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

  const hideAllCards = useCallback(() => {
    const allIds = getAllFieldIds(currentForm.formFieldJson);
    setHiddenCardIds(new Set(allIds));
  }, [currentForm.formFieldJson]);

  const showAllCards = useCallback(() => {
    setHiddenCardIds(new Set());
  }, []);
  const isSyncingWithInitialFormRef = useRef(false);
  useEffect(() => {
    if (onFormChange && currentForm) {
      if (isSyncingWithInitialFormRef.current) {
        isSyncingWithInitialFormRef.current = false;
      } else {
        onFormChange(currentForm);
      }
    }
  }, [currentForm, onFormChange]);
  const checkAllRequiredFields = useCallback((fields: IndividualFormFieldWithChildren[]): boolean => {
    for (const field of fields) {
      if (field.required) {
        if (field.type === "InputGroup" && Array.isArray(field.value)) {
          if (!checkAllRequiredFields(field.value)) return false;
        } else if (field.type === "dynamicField") {
          const selectedOption = field.options?.find(o => o.value === field.value);
          if (!field.value) { 
            return false;
          }
          if (selectedOption && Array.isArray(selectedOption.form) && !checkAllRequiredFields(selectedOption.form)) {
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
  }, []);

  useEffect(() => {
    if (onFormChange && currentForm) {
      if (isSyncingWithInitialFormRef.current) {
        isSyncingWithInitialFormRef.current = false;
      } else {
        onFormChange(currentForm);
      }
    }
    if(returnFormAllFill){
      const allFilled = checkAllRequiredFields(currentForm.formFieldJson)
      returnFormAllFill(allFilled)
    }
  }, [currentForm, checkAllRequiredFields]);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getColSpanPercentage = (span: number, totalColumns: number = maxGridCol) => {
    if (span <= 0 || totalColumns <= 0) return '0%';
    return `${((span / totalColumns) * 100).toFixed(0)}%`;
  };
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
    } else if (newColSpan > maxGridCol) {
      newColSpan = maxGridCol;
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
    } else if (newColSpan > maxGridCol) {
      newColSpan = maxGridCol;
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
        if (field.type === "image" || field.type === "dndImage") {
          const valueToStore = newValue instanceof FileList
            ? newValue[0] || null
            : newValue;
          return { ...field, value: valueToStore };
        }
        if (field.type === "multiImage" || field.type === "dndMultiImage") {
          const currentFiles = Array.isArray(field.value) ? field.value : [];
          const newFilesArray = (newValue instanceof FileList) ? Array.from(newValue) : Array.isArray(newValue) ? newValue : [];

          const filesToAdd = newFilesArray.filter(
            (newFile): newFile is File => newFile instanceof File
          );

          if (filesToAdd.length > 0) {
            const uniqueNewFiles = filesToAdd.filter(
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

  const handleShowLabelChange = useCallback((id: string, newValue: boolean) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, id, (field) => ({
        ...field,
        showLabel: newValue
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
        returnFormAllFill && returnFormAllFill(true)
      }
    } else {
      setShowToast(true)
      returnFormAllFill && returnFormAllFill(false)
    }
  }, [currentForm, onFormSubmit, transformFieldForSubmission]);

  const updateFieldId = useCallback((oldId: string, newId: string) => {
    const trimmedNewId = newId.trim();
    if (!trimmedNewId) {
      setShowToast(true)
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
      setShowToast(true)
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
        if (field.type === "image" || field.type === "dndImage") {
          return { ...field, value: null };
        } else if ((field.type === "multiImage" || field.type === "dndMultiImage") && Array.isArray(field.value)) {
          const updatedFiles = field.value.filter((file: File) => file.name !== fileNameToRemove);
          return { ...field, value: updatedFiles };
        }
        return field;
      }),
    }));
  }, [updateFieldRecursively]);

  const getDrafts = () => {
    if (saveDraftsLocalStoreName !== "") {
      try {
        const savedDraft = localStorage.getItem(saveDraftsLocalStoreName);
        if (savedDraft) {
          const parsedDraft: FormFieldWithChildren = JSON.parse(savedDraft);
          setCurrentForm(parsedDraft);
          console.log("Draft loaded successfully:", parsedDraft.formName);
        } else {
          console.log("No draft found in localStorage.");
        }
      } catch (error) {
        console.error("Failed to parse draft from localStorage:", error);
        localStorage.removeItem(saveDraftsLocalStoreName); 
      }
    }
  };
  useEffect(() => {
    getDrafts();
  }, [])
  const saveDrafts = ()=>{
    const handleSaveDrafts = ()=>{
      localStorage.setItem(saveDraftsLocalStoreName,JSON.stringify(currentForm))
    }
    return (<div >
      <Button  variant="success" onClick={handleSaveDrafts}>Save Drafts</Button>
    </div>
    )
  }

  const handleToggleRequired = useCallback((id: string) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, id, (field) => ({
        ...field,
        required: !field.required
      })),
    }));
  }, [updateFieldRecursively]);

  const handleToggleEnableSearch = useCallback((id: string) => {
    setCurrentForm(prevForm => ({
      ...prevForm,
      formFieldJson: updateFieldRecursively(prevForm.formFieldJson, id, (field) => ({
        ...field,
        enableSearch: !field.enableSearch
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
    handleShowLabelChange: (id: string, showLabel: boolean) => void;
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
    isHidden: boolean;
    toggleCardVisibility: (id: string) => void;
  }

  const SortableFieldEditItem: React.FC<FieldEditItemProps> = React.memo(({
    field,
    handleLabelChange,
    handleShowLabelChange,
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
    isHidden,
    toggleCardVisibility,
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

    useEffect(() => { setLocalIdValue(field.id); }, [field.id]);
    useEffect(() => { setLocalLabelValue(field.label); }, [field.label]);
    useEffect(() => { setLocalPlaceholderValue(field.placeholder || ""); }, [field.placeholder]);
    useEffect(() => { setLocalGroupColSpan(field.GroupColSpan || 1); }, [field.GroupColSpan]);
    useEffect(() => { setLocalDynamicFieldColSpan(field.DynamicFieldColSpan || 1); }, [field.DynamicFieldColSpan]);

    const handleLocalIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setLocalIdValue(e.target.value); }, []);
    const handleIdBlur = useCallback(() => { if (localIdValue !== field.id) { updateFieldId(field.id, localIdValue); } }, [localIdValue, field.id, updateFieldId]);
    const handleIdKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleIdBlur(); idInputRef.current?.blur(); } }, [localIdValue, field.id, updateFieldId, handleIdBlur]);

    const handleLocalLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setLocalLabelValue(e.target.value); }, []);
    const handleLabelBlur = useCallback(() => { if (localLabelValue !== field.label) { handleLabelChange(field.id, localLabelValue); } }, [localLabelValue, field.id, handleLabelChange]);
    const handleLabelKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleLabelBlur(); labelInputRef.current?.blur(); } }, [localLabelValue, field.id, handleLabelChange, handleLabelBlur]);

    const handleLocalPlaceholderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setLocalPlaceholderValue(e.target.value); }, []);
    const handlePlaceholderBlur = useCallback(() => { if (localPlaceholderValue !== field.placeholder) { handlePlaceholderChange(field.id, localPlaceholderValue); } }, [localPlaceholderValue, field.id, handlePlaceholderChange]);
    const handlePlaceholderKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handlePlaceholderBlur(); placeholderInputRef.current?.blur(); } }, [localPlaceholderValue, field.id, handlePlaceholderChange, handlePlaceholderBlur]);

    const handleAddOptionClick = useCallback(() => {
      const trimmedOption = localNewOptionText.trim();
      if (trimmedOption !== "") {
        handleAddOption(field.id, trimmedOption);
        setLocalNewOptionText("");
      }
    }, [localNewOptionText, field.id, handleAddOption]);

    const handleNewOptionKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOptionClick(); } }, [handleAddOptionClick]);

    const handleLocalGroupColSpanChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalGroupColSpan(parseInt(e.target.value, 10));
      handleChildContainerColSpanChange(e, field.id, "InputGroup");
    }, [field.id, handleChildContainerColSpanChange]);

    const handleLocalDynamicFieldColSpanChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalDynamicFieldColSpan(parseInt(e.target.value, 10));
      handleChildContainerColSpanChange(e, field.id, "dynamicField");
    }, [field.id, handleChildContainerColSpanChange]);

    const showPlaceholderInput = ["textInput", "Integer", "textAreaInput", "emailInput", "passwordInput"].includes(field.type);
    const colSpanOptions = Array.from({ length: overallFormColSpan }, (_, i) => i + 1);
    const isInputGroup = field.type === "InputGroup";
    const isDynamicField = field.type === "dynamicField";
    const childFormFields = formConfigurations.filter(f => f.canBeChild);
    const isAnyDropdownOpen = isAddDropdownOpen || Object.values(dynamicOptionDropdown).some(Boolean);

    return (
      <div
        ref={setNodeRef} style={style}
        className={`mb-6 p-4 border rounded-lg bg-gray-50 relative dark:border-gray-600 dark:bg-white/[0.03] dark:text-gray-400 ${isAnyDropdownOpen ? 'z-20' : 'z-auto'}`}
        {...attributes}
      >
        <div className="flex items-start justify-between flex-wrap gap-y-2">
          <div
            ref={setActivatorNodeRef}
            className="p-1 cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 -ml-1"
            title="Drag to reorder"
            {...listeners}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => toggleCardVisibility(field.id)} size="xxs" className="px-2 py-1 bg-blue-400 text-gray-700 rounded-md hover:bg-blue-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 text-xs">
              {isHidden ? 'Show' : 'Hide'}
            </Button>
            <Button onClick={() => removeField(field.id)} className="p-1 bg-red-500 text-white rounded-full text-xs leading-none w-6 h-6 flex items-center justify-center hover:bg-red-600 transition duration-300" title="Remove field" disabled={!editFormData} size="xxs">
              ✕
            </Button>
          </div>
        </div>

        {isHidden ? (
          <div>
            <div className="flex items-center justify-between gap-2 py-2">
              <span className="text-gray-700 dark:text-gray-400 text-lg font-semibold truncate">{field.label}</span>
              <span className="text-blue-500 dark:text-blue-300 text-xl flex-shrink-0">{formTypeIcons[field.type] || <span className="text-sm">?</span>}</span>
            </div>
            <div className="mt-2">
              {renderHiddenFieldPreview(field)}
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-4">
            <h1 className="my-px font-mono text-xs">({field.type})</h1>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id={`showLabel-toggle-${field.id}`}
                  type="checkbox"
                  checked={field.showLabel}
                  onChange={(e) => handleShowLabelChange(field.id, e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                  disabled={!editFormData}
                />
                <label htmlFor={`showLabel-toggle-${field.id}`} className="ml-2 text-gray-700 text-sm font-bold dark:text-gray-400">Show Label</label>
              </div>
              {field.showLabel && (
                <label className="block text-gray-700 text-sm dark:text-gray-400">
                  Label Text:
                  <Input
                    ref={labelInputRef}
                    type="text"
                    value={localLabelValue}
                    onChange={handleLocalLabelChange}
                    onBlur={handleLabelBlur}
                    onKeyDown={handleLabelKeyDown}
                    className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-gray-400"
                    aria-label="Edit field label"
                    disabled={!editFormData}
                  />
                </label>
              )}
            </div>

            <label className="block text-gray-700 text-sm font-bold dark:text-gray-400">ID:
              <Input ref={idInputRef} type="text" value={localIdValue} onChange={handleLocalIdChange} onBlur={handleIdBlur} onKeyDown={handleIdKeyDown} className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-gray-400" aria-label="Edit field id" title="Edit Field ID" disabled={true} />
            </label>

            {showPlaceholderInput && (
              <label className="block text-gray-700 text-sm font-bold dark:text-gray-400">Placeholder:
                <Input ref={placeholderInputRef} type="text" value={localPlaceholderValue} onChange={handleLocalPlaceholderChange} onBlur={handlePlaceholderBlur} onKeyDown={handlePlaceholderKeyDown} className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-gray-400" aria-label="Edit field placeholder" title="Edit Field Placeholder" disabled={!editFormData} />
              </label>
            )}

            <div className="flex items-center">
              <input type="checkbox" id={`required-${field.id}`} checked={field.required} onChange={() => handleToggleRequired(field.id)} className="form-checkbox h-4 w-4 text-blue-600 rounded" disabled={!editFormData} />
              <label htmlFor={`required-${field.id}`} className="ml-2 text-gray-700 text-sm dark:text-gray-400">Required</label>
            </div>

            {["select", "dynamicField"].includes(field.type) && (
              <div className="flex items-center">
                <input
                  id={`enableSearch-toggle-${field.id}`}
                  type="checkbox"
                  checked={!!field.enableSearch}
                  onChange={() => handleToggleEnableSearch(field.id)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded"
                  disabled={!editFormData}
                />
                <label htmlFor={`enableSearch-toggle-${field.id}`} className="ml-2 text-gray-700 text-sm dark:text-gray-400">Enable Search</label>
              </div>
            )}

            

            <div className="space-y-2">
              {(isInputGroup || isDynamicField) && !field.isChild && (
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor={`overallColSpan-input-${field.id}`} className="text-gray-700 text-sm dark:text-gray-400">
                    Desktop Grid Columns:
                  </label>
                  <Input id={`overallColSpan-input-${field.id}`} type="number" min="1" max={maxGridCol.toString()} value={isInputGroup ? localGroupColSpan : localDynamicFieldColSpan} onChange={isInputGroup ? handleLocalGroupColSpanChange : handleLocalDynamicFieldColSpanChange} className="py-1 px-2 border rounded-md text-gray-700 dark:bg-white/[0.03] dark:text-gray-400 w-20" disabled={!editFormData} />
                </div>
              )}
              <div className={`flex flex-wrap items-center gap-2`}>
                <label htmlFor={`colSpan-select-${field.id}`} className="text-gray-700 text-sm dark:text-gray-400">Desktop Column Span:</label>
                <select id={`colSpan-select-${field.id}`} value={field.colSpan || 1} onChange={(e) => handleColSpanChange(field.id, parseInt(e.target.value))} className="py-1 px-2 border rounded-md text-gray-700 dark:bg-white/[0.03] dark:text-gray-400" disabled={!editFormData}>
                  {colSpanOptions.map((span) => (
                    <option key={span} value={span}>
                      {getColSpanPercentage(span, overallFormColSpan)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(field.type === "select" || field.type === "option" || field.type === "radio" || isDynamicField) && (
              <div className="space-y-3">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <Input type="text" placeholder="New option" value={localNewOptionText} onChange={(e) => setLocalNewOptionText(e.target.value)} onKeyDown={handleNewOptionKeyDown} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm dark:text-gray-400" disabled={!editFormData} />
                  <Button onClick={handleAddOptionClick} className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 text-sm flex-shrink-0" disabled={!editFormData} size="sm">+</Button>
                </div>

                {field.options && field.options.map((option, index) => {
                  const optionValue = isDynamicField ? option.value : option;
                  const isExpanded = !!expandedDynamicFields[`${field.id}-${optionValue}`];
                  const isOptionDropdownOpen = !!dynamicOptionDropdown[optionValue];

                  return (
                    <div key={optionValue} className="flex flex-col gap-2 mt-2 border-t pt-2">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <p className="text-gray-700 dark:text-white break-all">- {optionValue}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isDynamicField && (<Button onClick={() => toggleDynamicFieldExpansion(optionValue)} className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs">{isExpanded ? 'Hide' : 'Show'}</Button>)}
                          <Button onClick={() => handleRemoveOption(field.id, index)} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 text-sm" disabled={!editFormData} size="sm">-</Button>
                        </div>
                      </div>
                      {isDynamicField && isExpanded && (
                        <div className="mt-2 p-3 rounded-md bg-blue-50 dark:bg-white/[0.03]">
                          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                            <h4 className="text-sm font-semibold dark:text-gray-400">Form for "{optionValue}"</h4>
                            <div className="relative">
                              <Button className="dropdown-toggle" onClick={() => setDynamicOptionDropdown(prev => ({ ...prev, [optionValue]: !prev[optionValue] }))}>Add Field</Button>
                              <Dropdown isOpen={isOptionDropdownOpen} onClose={() => setDynamicOptionDropdown(prev => ({ ...prev, [optionValue]: false }))}>
                                {childFormFields.map(formItem => (<DropdownItem className="text-gray-700 text-sm dark:text-gray-400" key={formItem.formType} onClick={() => { addFieldToDynamicOption(field.id, optionValue, formItem.formType); setDynamicOptionDropdown(prev => ({ ...prev, [optionValue]: false })); }}>{formItem.title}</DropdownItem>))}
                              </Dropdown>
                            </div>
                          </div>
                          <SortableContext items={(option.form || []).map((f: IndividualFormFieldWithChildren) => f.id)} strategy={rectSortingStrategy}>
                            <div className={`grid grid-cols-1 ${getResponsiveGridClass(field.DynamicFieldColSpan)} gap-4`}>
                              {(option.form || []).map((childField: IndividualFormFieldWithChildren) => (<div className={getResponsiveColSpanClass(childField.colSpan)} key={childField.id}>
                                <SortableFieldEditItem key={childField.id} field={childField} handleLabelChange={handleLabelChange} handleShowLabelChange={handleShowLabelChange} updateFieldId={updateFieldId} handleAddOption={handleAddOption} handleRemoveOption={handleRemoveOption} removeField={removeField} handleToggleRequired={handleToggleRequired} handlePlaceholderChange={handlePlaceholderChange} handleColSpanChange={handleColSpanChange} overallFormColSpan={field.DynamicFieldColSpan || 1} addField={addField} addFieldToDynamicOption={addFieldToDynamicOption} editFormData={editFormData} handleChildContainerColSpanChange={handleChildContainerColSpanChange} isHidden={hiddenCardIds.has(childField.id)} toggleCardVisibility={toggleCardVisibility} />
                              </div>))}
                            </div>
                          </SortableContext>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isInputGroup && (
              <div className="mt-4 p-3 border border-gray-300 rounded-md bg-gray-100 dark:border-gray-500 dark:bg-white/[0.05]">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-2">
                  <h3 className="text-md font-semibold dark:text-gray-400">Grouped Fields</h3>
                  <div className="relative">
                    <Button className="dropdown-toggle" onClick={() => setAddDropdownOpen(prev => !prev)}>Add Field</Button>
                    <Dropdown isOpen={isAddDropdownOpen} onClose={() => setAddDropdownOpen(false)}>
                      {childFormFields.map(item => (<DropdownItem key={item.formType} onClick={() => { addField(item.formType, field.id); setAddDropdownOpen(false); }}>{item.title}</DropdownItem>))}
                    </Dropdown>
                  </div>
                </div>
                <SortableContext items={Array.isArray(field.value) ? field.value.map((f: IndividualFormFieldWithChildren) => f.id) : []} strategy={rectSortingStrategy}>
                  <div className={`grid grid-cols-1 ${getResponsiveGridClass(field.GroupColSpan)} gap-4`}>
                    {Array.isArray(field.value) && field.value.map((childField: IndividualFormFieldWithChildren) => (<div className={getResponsiveColSpanClass(childField.colSpan)} key={childField.id}>
                      <SortableFieldEditItem key={childField.id} field={childField} handleLabelChange={handleLabelChange} handleShowLabelChange={handleShowLabelChange} updateFieldId={updateFieldId} handleAddOption={handleAddOption} handleRemoveOption={handleRemoveOption} removeField={removeField} handleToggleRequired={handleToggleRequired} handlePlaceholderChange={handlePlaceholderChange} handleColSpanChange={handleColSpanChange} overallFormColSpan={field.GroupColSpan || 1} addField={addField} addFieldToDynamicOption={addFieldToDynamicOption} editFormData={editFormData} handleChildContainerColSpanChange={handleChildContainerColSpanChange} isHidden={hiddenCardIds.has(childField.id)} toggleCardVisibility={toggleCardVisibility} />
                    </div>))}
                  </div>
                </SortableContext>
              </div>
            )}
          </div>
        )}
      </div>
    );
  });


  const FormEdit = useCallback(() => {
    return (
      <>
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
          <h2 className="text-lg font-bold mb-4">Form Settings</h2>
          <div className="space-y-4">
            <label className="block text-gray-600 text-sm font-bold dark:text-gray-400">Form Name:
              <Input type="text" value={currentForm.formName} onChange={(e) => handleFormNameChange(e.target.value)} className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-gray-400" placeholder="Enter form name" disabled={!editFormData} />
            </label>
            <label className="block text-gray-700 text-sm font-bold dark:text-gray-400">Form ID:
              <Input type="text" value={currentForm.formId} onChange={(e) => handleFormIdChange(e.target.value)} className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-gray-400" placeholder="Enter unique form ID" disabled={true} />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor={`overallColSpan-input`} className="text-gray-700 text-sm dark:text-gray-400">Desktop Grid Columns:</label>
              <Input id={`overallColSpan-input`} type="number" min="1" max={maxGridCol.toString()} value={currentForm.formColSpan} onChange={handleOverallFormColSpanChange} className="py-1 px-2 border rounded-md text-gray-700 dark:bg-white/[0.03] dark:text-gray-400 w-20" disabled={!editFormData} />
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-lg font-bold">Form Layout Editor</h2>
            <div className="flex gap-2">
              <Button onClick={hideAllCards} className="px-3 py-1 bg-blue-200 text-gray-700 rounded-md hover:bg-blue-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 text-sm">Hide All</Button>
              <Button onClick={showAllCards} className="px-3 py-1 bg-blue-200 text-gray-700 rounded-md hover:bg-blue-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 text-sm">Show All</Button>
            </div>
          </div>

          {currentForm.formFieldJson.length === 0 ? (
            <p className="text-center text-gray-500 italic">No fields added yet. Use the buttons above to add new fields.</p>
          ) : (
            <div>

              <SortableContext items={currentForm.formFieldJson.map(field => field.id)} strategy={rectSortingStrategy} key={currentForm.formId}>
                <div className={`grid w-full grid-cols-1 ${getResponsiveGridClass(currentForm.formColSpan)} gap-4`}>
                  {currentForm.formFieldJson.map((field) => (
                    <div className={getResponsiveColSpanClass(field.colSpan)} key={field.id}>
                      <SortableFieldEditItem key={field.id} field={field} handleLabelChange={handleLabelChange} handleShowLabelChange={handleShowLabelChange} updateFieldId={updateFieldId} handleAddOption={handleAddOption} handleRemoveOption={handleRemoveOption} removeField={removeField} handleToggleRequired={handleToggleRequired} handlePlaceholderChange={handlePlaceholderChange} handleColSpanChange={handleColSpanChange} overallFormColSpan={currentForm.formColSpan} addField={addField} addFieldToDynamicOption={addFieldToDynamicOption} editFormData={editFormData} handleChildContainerColSpanChange={handleChildContainerColSpanChange} isHidden={hiddenCardIds.has(field.id)} toggleCardVisibility={toggleCardVisibility} />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </div>
          )}
        </div>
        {isImport && (<Modal isOpen={isImport} onClose={() => setImport(false)} className="max-w-4xl p-6">
          <div><h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Import Form JSON</h3></div>
          <div className="p-4"><div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Paste JSON Content</label>
            <TextArea value={importJsonText} onChange={(value) => setImportJsonText(value)} className="w-full h-64 px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-mono text-sm" placeholder="Paste your form JSON here..." />
          </div></div>
          <div className="flex items-center justify-end gap-2 p-4">
            <Button onClick={() => setImport(false)} variant="error">Cancel</Button>
            <Button onClick={handleFormImport} disabled={!importJsonText.trim()} variant={!importJsonText.trim() ? 'outline' : 'success'}><FileIcon className="w-4 h-4" /> Import Form</Button>
          </div>
        </Modal>)}
      </>
    );
  }, [currentForm, handleFormIdChange, handleFormNameChange, handleOverallFormColSpanChange, handleLabelChange, handleShowLabelChange, updateFieldId, handleAddOption, handleRemoveOption, removeField, handleToggleRequired, handlePlaceholderChange, handleColSpanChange, addField, addFieldToDynamicOption, editFormData, handleChildContainerColSpanChange, expandedDynamicFields, hiddenCardIds, toggleCardVisibility, hideAllCards, showAllCards, isImport, importJsonText, handleFormImport, setImportJsonText]);


  const SearchableSelect: React.FC<{
    options: any[],
    value: string;
    onChange: (newValue: string) => void;
    placeholder?: string;
    disabled?: boolean;
    isDynamic?: boolean;
  }> = ({ options, value, onChange, placeholder, disabled, isDynamic = false }) => {
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
      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700 text-left flex justify-between items-center"
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
    );
  };
  const renderFormField = useCallback((field: IndividualFormFieldWithChildren) => {

    const commonProps = {
      id: field.id,
      className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700",
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      required: field.required,
      disabled: !editFormData,
    };

    const labelComponent = field.showLabel && (<label htmlFor={field.id} className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-400">{field.label} {field.required && <span className="text-red-500">*</span>}</label>);

    switch (field.type) {
      case "textInput": case "emailInput": case "passwordInput":
        return (<> {labelComponent} <Input type={field.type === "textInput" ? "text" : field.type === "emailInput" ? "email" : "password"} value={field.value as string} onChange={(e) => handleFieldChange(field.id, e.target.value)} {...commonProps} /> </>);

      case "Integer":
        return (<> {labelComponent} <Input type="number" value={field.value !== null ? field.value : ''} onChange={(e) => handleFieldChange(field.id, e.target.value)} {...commonProps} /> </>);

      case "dateInput":
        return (<> {labelComponent} <Input type="date" value={field.value as string} onChange={(e) => handleFieldChange(field.id, e.target.value)} {...commonProps} className="rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:border-gray-300 disabled:bg-gray-100" /> </>);

      case "dateLocal":
        return (<> {labelComponent} <Input  type="datetime-local" value={field.value as string} onChange={(e) => handleFieldChange(field.id, e.target.value)} {...commonProps} className="dark:[&::-webkit-calendar-picker-indicator]:invert rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:border-gray-300 disabled:bg-gray-100"/> </>);

      case "textAreaInput":
        return (<> {labelComponent} <textarea value={field.value as string} onChange={(e) => handleFieldChange(field.id, e.target.value)} {...commonProps} className={`${commonProps.className} ${commonProps.disabled ? 'bg-gray-100 dark:bg-gray-800 ' : 'bg-transparent  dark:bg-gray-900'} rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:border-gray-300 disabled:bg-gray-100` }></textarea> </>);

      case "select":
        if (field.enableSearch) {
          return <>
            {labelComponent}
            <SearchableSelect
              options={field.options || []}
              value={String(field.value || "")}
              onChange={(newValue) => handleFieldChange(field.id, newValue)}
              placeholder={field.placeholder || "Select an option"}
              disabled={!editFormData}
            />
          </>;
        }
        return (<> {labelComponent} <select value={String(field.value || "")} onChange={(e) => handleFieldChange(field.id, e.target.value)} {...commonProps} className={`${commonProps.className} ${commonProps.disabled ? 'bg-gray-100 dark:bg-gray-800' : ' dark:bg-gray-900 bg-transparent'}`}>
          <option value="" className="dark:bg-gray-800">Select an option</option>
          {field.options?.map((option) => (<option className="text-gray-700  dark:text-white dark:bg-gray-800" key={option} value={option}>{option}</option>))}
        </select> </>);

      case "option":
        return (<> {labelComponent} <div className="flex flex-col gap-2"> {field.options?.map((option) => (<label key={option} className="inline-flex items-center">
          <input type="checkbox" value={option} checked={Array.isArray(field.value) && field.value.includes(option)} onChange={(e) => { const currentValues = Array.isArray(field.value) ? [...field.value] : []; if (e.target.checked) { handleFieldChange(field.id, [...currentValues, option]); } else { handleFieldChange(field.id, currentValues.filter((val: string) => val !== option)); } }} className="form-checkbox h-5 w-5 text-blue-600 rounded" required={field.required && Array.isArray(field.value) && field.value.length === 0} disabled={!editFormData} />
          <span className="ml-2 text-gray-700 dark:text-gray-400">{option}</span>
        </label>))} </div> </>);

      case "radio":
        return (<> {labelComponent} <div className="flex flex-col gap-2"> {field.options?.map((option) => (<label key={option} className="inline-flex items-center">
          <input type="radio" name={field.id} value={option} checked={field.value === option} onChange={(e) => handleFieldChange(field.id, e.target.value)} className="form-radio h-5 w-5 text-blue-600" required={field.required} disabled={!editFormData} />
          <span className="ml-2 text-gray-700 dark:text-gray-400">{option}</span>
        </label>))} </div> </>);

      case "dndImage":
        return (
          <>
            {labelComponent}
            <DndImageUploader
              onFileSelect={(file) => handleFieldChange(field.id, file)}
              existingFile={field.value instanceof File ? field.value : null}
              handleRemoveFile={() => handleRemoveFile(field.id)}
              disabled={!editFormData}
            />
            {field.required && !field.value && <p className="text-red-500 text-xs italic mt-1">This field is required.</p>}
          </>
        );

      case "image":
        return (<> {labelComponent} <div> <input id={field.id} type="file" accept="image/*" onChange={(e) => handleFieldChange(field.id, e.target.files)} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-500 dark:file:text-white hover:dark:file:bg-gray-600" required={field.required && !field.value} disabled={!editFormData} />
          {field.value instanceof File && (<div className="relative group mt-2 w-20 h-20">
            <img src={URL.createObjectURL(field.value)} alt="Selected" className="w-full h-full object-cover rounded border border-gray-600" />
            <Button onClick={() => handleRemoveFile(field.id)} className="absolute top-1 right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" disabled={!editFormData} size="sm" variant="error">×</Button>
          </div>)}
        </div></>);

      case "multiImage":
        return (<> {labelComponent} <div> <input id={field.id} type="file" accept="image/*" multiple onChange={(e) => handleFieldChange(field.id, e.target.files)} className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-500 dark:file:text-white hover:dark:file:bg-gray-600" required={field.required && (!field.value || (Array.isArray(field.value) && field.value.length === 0))} disabled={!editFormData} />
          {Array.isArray(field.value) && field.value.length > 0 && (<div className="mt-2">
            <p className="text-gray-700 dark:text-white text-sm mb-1">Selected Files:</p>
            <div className="grid grid-cols-3 gap-2"> {field.value.map((file: File, index: number) => (<div key={file.name + index} className="relative group">
              <img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} className="w-full h-20 object-cover rounded border border-gray-600 " />
              <Button onClick={() => handleRemoveFile(field.id, file.name)} className="absolute top-1 right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" disabled={!editFormData} size="sm" variant="error">×</Button>
            </div>))} </div> </div>)} </div> </>);

      case "dndMultiImage":
        return (
          <>
            {labelComponent}
            <DndMultiImageUploader
              onFilesSelect={(files) => handleFieldChange(field.id, files)}
              existingFiles={Array.isArray(field.value) ? field.value : []}
              handleRemoveFile={(fileName) => handleRemoveFile(field.id, fileName)}
              disabled={!editFormData}
            />
            {field.required && (!field.value || (Array.isArray(field.value) && field.value.length === 0)) && <p className="text-red-500 text-xs italic mt-1">This field is required.</p>}
          </>
        );

      case "InputGroup":
        return (<div> {field.showLabel && (<h3 className="text-sm font-semibold mb-3 dark:text-gray-400">{field.label} {field.required && <span className="text-red-500">*</span>}</h3>)}
          <div className={`grid grid-cols-1 ${getResponsiveGridClass(field.GroupColSpan)} gap-4`}> {Array.isArray(field.value) && field.value.map((childField: IndividualFormFieldWithChildren) => (<div key={childField.id} className={getResponsiveColSpanClass(childField.colSpan)}>{renderFormField(childField)}</div>))} </div>
          {Array.isArray(field.value) && field.value.length === 0 && (<p className="text-center text-gray-500 italic text-sm mt-2">No fields in this group for preview.</p>)}
        </div>);

      case "dynamicField":
        const selectedOption = field.options?.find((option: any) => option.value === field.value);
        if (field.enableSearch) {
          return <>
            {labelComponent}
            <SearchableSelect
              options={field.options || []}
              value={String(field.value || "")}
              onChange={(newValue) => handleFieldChange(field.id, newValue)}
              placeholder={field.placeholder || "Select an option"}
              disabled={!editFormData}
              isDynamic={true}
            />
            {selectedOption && Array.isArray(selectedOption.form) && (<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className={`grid grid-cols-1 ${getResponsiveGridClass(field.DynamicFieldColSpan)} gap-4`}> {selectedOption.form.map((nestedField: IndividualFormFieldWithChildren) => (<div key={nestedField.id} className={getResponsiveColSpanClass(nestedField.colSpan)}>{renderFormField(nestedField)} </div>))} </div>
            </div>)}
          </>;
        }
        return (<> {labelComponent} <select value={String(field.value || "")} onChange={(e) => handleFieldChange(field.id, e.target.value)} {...commonProps} className={`${commonProps.className} bg-white dark:bg-gray-800 disabled:opacity-50`}>
          <option value="" className="dark:bg-gray-800">Select an option</option>
          {field.options?.map((option: any) => (<option className="text-gray-700 dark:text-white dark:bg-gray-800" key={option.value} value={option.value}>{option.value}</option>))}
        </select>
          {selectedOption && Array.isArray(selectedOption.form) && (<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className={`grid grid-cols-1 ${getResponsiveGridClass(field.DynamicFieldColSpan)} gap-4`}> {selectedOption.form.map((nestedField: IndividualFormFieldWithChildren) => (<div key={nestedField.id} className={getResponsiveColSpanClass(nestedField.colSpan)}>{renderFormField(nestedField)}</div>))} </div>
          </div>)} </>);

      default: return <p className="text-red-500">Unsupported field type: {field.type}</p>;
    }
  }, [handleFieldChange, handleRemoveFile, editFormData]);

  const FormPreview = useCallback(() => {
    return (
      <div>
        {enableFormTitle && <div className="px-3  text-xl dark:text-white">{currentForm.formName}</div>}
        {currentForm.formFieldJson.length === 0 ? (<p className="text-center text-gray-500 italic mb-4">No fields added yet. Click "Edit" to start adding.</p>
        ) : (
          <div className={`grid grid-cols-1 ${getResponsiveGridClass(currentForm.formColSpan)} gap-4`}>
            {currentForm.formFieldJson.map((field) => (<div key={field.id} className={`mb-2 p-4 relative ${getResponsiveColSpanClass(field.colSpan)}`}>{renderFormField(field)}</div>))}
          </div>
        )}
      </div>
    );
  }, [currentForm, renderFormField, enableFormTitle]);

  return edit ? (
    <div className={!isPreview ? "grid grid-cols-[2fr_8fr]  md:block" : ""}>
      <PageMeta title="Dynamic Form Builder" description="" />
      {/* <PageBreadcrumb pageTitle="Form Builder"  /> */}
      {showToast && (
        <Toast
          message="Please enter all data."
          type="error"
          duration={1000}
          onClose={() => setShowToast(false)}
        />
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>

        {!isPreview && (
          <div className="
            left-0 top-[70px]  h-screen
            py-4 px-2 /* Padding for the sidebar */
            z-30 /* Ensure it's above other content */
            bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm
            rounded-r-2xl 
            flex-col 
            sticky
            
            
            
            overflow-y-auto custom-scrollbar
            
            /* === Styles for Medium and Larger Screens (md and up) === */
            md:sticky md:top-[100px] /* Revert to  positioning at the top */
            md:w-full md:h-auto /* Full width, auto height for the top bar */
            md:my-3.5 /* Original top bar margin */
            md:px-2 md:sm:px-5 md:py-2 /* Original top bar padding */
            md:rounded-2xl /* Full rounded corners for the top bar */
            md:flex-none md:block /* Remove  properties and treat as a block for desktop layout */
          ">
            <div className="
              /* === Default Styles (Mobile/Small Screens < md) - Inner Button Container === */
              flex flex-col space-y-2 /* Stack buttons vertically inside the sidebar with spacing */
              w-full /* Buttons take full width of the sidebar */

              /* === Styles for Medium and Larger Screens (md and up) - Inner Button Container === */
              md:grid md:grid-cols-5 md:sm:grid-cols-4 md:md:grid-cols-7 md:lg:grid-cols-10 md:xl:grid-cols-14 md:gap-2 
              md:w-auto md:h-auto 
            ">

              <h1 className="text-gray-700 dark:text-white text-center content-center">Form Element</h1>
              {formConfigurations.map((item) => (
                <Button
                  key={item.formType}
                  className="w-full text-center bg-gray-200/50 dark:bg-gray-700/50 rounded-lg p-1 sm:p-2 text-[10px] sm:text-sm dark:text-gray-300 text-gray-800 hover:text-sky-700 dark:hover:text-sky-400"
                  onClick={() => addField(item.formType)}
                  disabled={!editFormData}
                  variant="outline-no-transparent"
                  size="xxs"
                  endIcon={formTypeIcons[item.formType]}
                >
                  <span className="xxs:truncate">{item.title}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
            <div hidden={isPreview}>
              {FormEdit()}
              <div className="flex justify-end sticky bottom-2 z-30 space-x-2 mt-6">
                <Button onClick={() => setImport(true)} disabled={!editFormData}>Import</Button>
                <Button onClick={() => setIsPreview(true)} disabled={!editFormData}>Preview</Button>
              </div>
            </div>
            <div hidden={!isPreview} className={enableSelfBg?" rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12":undefined}>
              {FormPreview()}
              <div className="flex justify-between flex-wrap gap-2 mt-6">
                <Button onClick={saveSchema} disabled={!editFormData}>Save Schema</Button>
                <div className="flex gap-2">
                  <Button onClick={() => setIsPreview(false)} disabled={!editFormData}>Edit</Button>
                  <Button onClick={handleSend} className="bg-green-500 hover:bg-green-600">Submit</Button>
                </div>
              </div>
            </div>
        </div>
      </DndContext>
    </div>
  ) : (

    
    <div className={enableSelfBg?" rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12":undefined}>
      {FormPreview()}
      <div className="flex justify-between w-full mt-4">
        {showDynamicForm && <Button className="m-4" onClick={() => showDynamicForm(false)}>Close</Button>}
        {saveDraftsLocalStoreName!=""? saveDrafts():null}
        {onFormSubmit && currentForm.formFieldJson.length > 0 && <Button className="m-4" onClick={handleSend}>Submit</Button>}
      </div>
    </div>
  );
}

export default React.memo(DynamicForm)