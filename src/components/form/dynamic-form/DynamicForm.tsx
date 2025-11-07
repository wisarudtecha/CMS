import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import Button from "@/components/ui/button/Button";
import { IndividualFormFieldWithChildren, IndividualFormField, FormField, FormFieldWithChildren } from "@/components/interface/FormField";
import { useCreateFormMutation, useUpdateFormMutation } from "@/store/api/formApi";
import { useNavigate } from "react-router";
import { formConfigurations } from "./constant";
import 'react-phone-number-input/style.css'
import { getCountries } from 'react-phone-number-input/input'
import { validateInput } from "./validateDynamicForm";
import { ToastContainer } from "@/components/crud/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { createDynamicFormField, getResponsiveColSpanClass, getResponsiveGridClass } from "./dynamicFormFunction.ts";
import { FormEdit } from "./dynamicFormEditMode.tsx";
import RenderFormField from "./renderFormField.tsx";
import { ImportDynamicFormModal } from "./importDynamicFormModal.tsx";
import AddFormSelector from "./addFormSelector.tsx";
import { useTranslation } from "@/hooks/useTranslation.ts";
import { ArrowLeft, Download, Upload } from "lucide-react";
import ExportDynamicFormModal from "./exportDynamicForm.tsx";
export type CountryCode = ReturnType<typeof getCountries>[number]




interface DynamicFormProps {
  initialForm?: FormField;
  edit?: boolean;
  editFormData?: boolean;
  showDynamicForm?: React.Dispatch<React.SetStateAction<boolean>>;
  onFormSubmit?: (data: FormField) => void;
  enableFormTitle?: boolean;
  enableSelfBg?: boolean;
  saveDraftsLocalStoreName?: string;
  onFormChange?: (data: FormField) => void;
  returnValidValue?: (isValid: boolean) => void;
  showValidationErrors?: boolean;
}


const PageMeta: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  useEffect(() => {
    document.title = title;
  }, [title, description]);
  return null;
};




function DynamicForm({ initialForm, edit = true, showDynamicForm, onFormSubmit, editFormData = true, enableFormTitle = true, enableSelfBg = false, saveDraftsLocalStoreName = "", onFormChange, returnValidValue, showValidationErrors = true }: DynamicFormProps) {
  const [isPreview, setIsPreview] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const [updateFormData] = useUpdateFormMutation();
  const [createFormData] = useCreateFormMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [hide, setHide] = useState<boolean>(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentForm, setCurrentForm] = useState<FormFieldWithChildren>(
    initialForm ?
      {
        ...initialForm,
        formFieldJson: initialForm.formFieldJson?.map(field => {
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
        }) ?? []
      } :
      {
        formId: uuidv4(),
        formName: "New Dynamic Form",
        formColSpan: 1,
        formFieldJson: [],
      }
  );

  const Saving = () => {

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100000">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <div className="text-center">
              <div className="text-lg text-gray-700 dark:text-gray-200 font-semibold">{t("common.saving")}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (initialForm) {
      setCurrentForm({
        ...initialForm,
        formFieldJson: initialForm.formFieldJson?.map(field => {
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
        }) ?? []
      });
    } else {
      setCurrentForm({
        formId: uuidv4(),
        formName: "New Dynamic Form",
        formColSpan: 1,
        formFieldJson: [],
      });
    }
  }, [initialForm]);

  const [isImport, setImport] = useState(false);
  const [isExport, setExport] = useState(false);


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


  const isSyncingWithInitialFormRef = useRef(false);

  useEffect(() => {
    if (onFormChange && currentForm) {
      if (isSyncingWithInitialFormRef.current) {
        isSyncingWithInitialFormRef.current = false;
      } else {
        onFormChange(currentForm);
      }
    }

    const isFormValid = validateInput(currentForm);

    if (returnValidValue) {
      returnValidValue(isFormValid);
    }
  }, [currentForm, onFormChange, returnValidValue]);


  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );













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



  const saveSchema = async () => {
    let response
    try {
      setIsSaving(true)
      if (initialForm) {
        response = await updateFormData({
          formId: currentForm.formId,
          formColSpan: currentForm.formColSpan,
          formFieldJson: currentForm.formFieldJson,
          formName: currentForm.formName,
          locks: false,
          publish: false,
          active: true,
        }).unwrap();

      } else {
        if (currentForm.formFieldJson.length != 0) {
          response = await createFormData({
            active: true,
            formColSpan: currentForm.formColSpan,
            formFieldJson: currentForm.formFieldJson,
            formName: currentForm.formName,
            locks: false,
            publish: false,
          }).unwrap();
        }
        else {
          addToast("error", "There are no element in form.")
          return
        }
      }
      if (response.msg === "Success") {
        navigate(0);
      } else {
        addToast("success", response.desc)
        console.log("error")
      }
      setIsSaving(true)
    } catch (e: any) {
      setIsSaving(false)
      addToast("error", e.data.desc)
    }
  }


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

    const isFormValid = validateInput(currentForm);

    if (isFormValid) {
      if (onFormSubmit) {
        const submitData: FormField = {
          ...currentForm,
          formFieldJson: currentForm.formFieldJson.map(transformFieldForSubmission),
        };
        console.log("Sending Valid Form Data:", submitData);
        onFormSubmit(submitData);
      }
    } else {
      addToast("error", "Please correct the errors before submitting.");
    }
  }, [currentForm, onFormSubmit, transformFieldForSubmission]);






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
  const saveDrafts = () => {
    const handleSaveDrafts = () => {
      localStorage.setItem(saveDraftsLocalStoreName, JSON.stringify(currentForm))
    }
    return (<div >
      <Button variant="success" onClick={handleSaveDrafts}>Save Drafts</Button>
    </div>
    )
  }



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



  const FormPreview = useCallback(() => {
    return (
      <div>
        {enableFormTitle && <div className="px-3  text-xl dark:text-white">{currentForm.formName}</div>}
        {currentForm.formFieldJson.length === 0 ? (<p className="text-center text-gray-500 italic mb-4">No fields added yet. Click "Edit" to start adding.</p>
        ) : (
          <div className={`grid grid-cols-1 ${getResponsiveGridClass(currentForm.formColSpan)} gap-4`}>
            {currentForm.formFieldJson.map((field) => (<div key={field.id} className={`mb-2 px-4 relative ${getResponsiveColSpanClass(field.colSpan)}`}><RenderFormField setCurrentForm={setCurrentForm} field={field} showValidationErrors={showValidationErrors} editFormData={editFormData} /></div>))}
          </div>
        )}
      </div>
    );
  }, [currentForm, enableFormTitle]);

  return edit ? (
    <div
      className={
        !isPreview
          ? `grid ${hide ? "" : "grid-cols-[2fr_8fr]"
          } md:block`
          : ""
      }
    >
      <PageMeta title="Dynamic Form Builder" description="" />
      {/* <PageBreadcrumb pageTitle="Form Builder"  /> */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {isSaving && <Saving />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>

        <AddFormSelector
          isOpen={!isPreview}
          addField={addField}
          hide={hide}
          setHide={setHide}
        />

        <div className="fixed-1 grid grid-cols-1 gap-6">
          <div hidden={isPreview}>
            <FormEdit
              currentForm={currentForm}
              addField={addField}
              editFormData={editFormData}
              setCurrentForm={setCurrentForm}
              showValidationErrors={showValidationErrors}
            />
            <ImportDynamicFormModal isImport={isImport} setImport={setImport} setCurrentForm={setCurrentForm} />
            <ExportDynamicFormModal  isOpen={isExport}  onClose={()=>{setExport(false)}} currentForm={currentForm}/>
            <div className="fixed bottom-0 right-0 w-ful shadow-md z-50 m-4">
              <div className="flex space-x-2">
                <Button onClick={() => setImport(true)} disabled={!editFormData}><Upload className="w-4 h-4 mr-2" />Import</Button>
                <Button onClick={() => setExport(true)} disabled={!editFormData}><Download className="w-4 h-4 mr-2" />Export</Button>
                <Button onClick={() => setIsPreview(true)} disabled={!editFormData}>Preview</Button>
              </div>
            </div>
          </div>
          {enableSelfBg && isPreview && <div><Button variant="ghost" size="sm" onClick={() => setIsPreview(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("case.back")}
          </Button></div>}
          <div hidden={!isPreview} className={enableSelfBg ? " h-fit relative rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12" : undefined}>
            {FormPreview()}
            <div className="fixed bottom-0 right-0 w-ful shadow-md z-50 m-4">
              <div className="flex space-x-2">
                {/* <Button onClick={() => setIsPreview(false)} disabled={!editFormData}>
                  Edit
                </Button> */}
                <Button onClick={saveSchema} disabled={!editFormData} variant="success">
                  {initialForm ? "Save Change" : "Save Form"}
                </Button>
                <div className="flex gap-2">

                  {/* <Button onClick={handleSend} className="bg-green-500 hover:bg-green-600">Submit</Button> */}
                </div>
              </div>
            </div>

          </div>


        </div>
      </DndContext>
    </div>
  ) : (


    <div className={enableSelfBg ? " rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12" : undefined}>
      {FormPreview()}
      <div className="flex justify-between w-full mt-4">
        {showDynamicForm && <Button className="m-4" onClick={() => showDynamicForm(false)}>Close</Button>}
        {saveDraftsLocalStoreName != "" ? saveDrafts() : null}
        {onFormSubmit && currentForm.formFieldJson.length > 0 && <Button className="m-4" onClick={handleSend}>Submit</Button>}
      </div>
    </div>
  );
}

export default React.memo(DynamicForm)