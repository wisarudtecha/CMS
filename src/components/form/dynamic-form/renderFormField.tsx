import Button from '@/components/ui/button/Button';
import React, { useCallback } from 'react';
import DndImageUploader from '../input/DndImageUploader';
import PhoneInput from 'react-phone-number-input/input';
import { CountryCode } from './DynamicForm';
import { commonClasses } from './constant';
import { SearchableSelect } from '@/components/SearchInput/SearchSelectInput';
import Input from '../input/InputField';
import DndMultiImageUploader from '../input/DndMultiImageUploader.tsx';
import MultiImageUpload from '../input/MultiImageUpload';
import { FormFieldWithChildren, IndividualFormFieldWithChildren } from '@/components/interface/FormField';
import { getResponsiveColSpanClass, getResponsiveGridClass, updateFieldRecursively } from './dynamicFormFunction.ts';
import { validateFieldValue } from './validateDynamicForm.tsx';

interface renderRenderFormFieldProps {
    field: IndividualFormFieldWithChildren;
    editFormData: boolean;
    showValidationErrors: boolean;
    setCurrentForm: React.Dispatch<React.SetStateAction<FormFieldWithChildren>>
}

const RenderFormField: React.FC<renderRenderFormFieldProps> = ({
    field,
    editFormData,
    showValidationErrors,
    setCurrentForm
}) => {
    const commonProps = {
        id: field.id,
        className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:bg-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-400 dark:disabled:border-gray-700 autofill:shadow-[inset_0_0_0px_1000px_white] autofill:[-webkit-text-fill-color:rgb(55,65,81)] dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(17,24,39)] dark:autofill:[-webkit-text-fill-color:rgb(209,213,219)]",
        placeholder: field.placeholder || (field.label && `Enter ${field.label.toLowerCase()}`),
        required: field.required,
        disabled: !editFormData,

    };

    const handleRemoveFile = useCallback((fieldId: string, indexToRemove?: number) => {
        setCurrentForm(prevForm => ({
            ...prevForm,
            formFieldJson: updateFieldRecursively(prevForm.formFieldJson, fieldId, (field) => {
                if (field.type === "image" || field.type === "dndImage") {
                    return { ...field, value: null };
                } else if ((field.type === "multiImage" || field.type === "dndMultiImage") && Array.isArray(field.value)) {
                    if (indexToRemove !== undefined) {
                        const updatedFiles = field.value.filter((_: any, index: number) => index !== indexToRemove);
                        return { ...field, value: updatedFiles };
                    }
                }
                return field;
            }),
        }));
    }, [updateFieldRecursively]);

    const labelComponent = field.showLabel ? (
        <label htmlFor={field.id} className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-400">
            {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
    ) : (
        field.required && <span className="text-red-500">*</span>
    );



    const FieldError: React.FC<{ field: IndividualFormFieldWithChildren }> = useCallback(({ field }) => {
        if (!showValidationErrors) {
            return null;
        }
        const errors = validateFieldValue(field);
        if (errors.length > 0) {
            return <p className="text-red-500 text-xs italic mt-1">{errors[0]}</p>;
        }
        return null;
    }, [showValidationErrors]);

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

                    let newFilesToAdd: File[] = [];
                    if (newValue instanceof FileList) {
                        newFilesToAdd = Array.from(newValue);
                    } else if (Array.isArray(newValue)) {
                        newFilesToAdd = newValue.filter((f): f is File => f instanceof File);
                    }

                    if (newFilesToAdd.length > 0) {
                        return { ...field, value: [...currentFiles, ...newFilesToAdd] };
                    }
                    return field;
                }
                if (field.type === "phoneNumber") {
                    return { ...field, value: newValue ?? "" }
                }
                if (field.type === "Integer") {
                    const max = field.formRule?.maxnumber ?? Infinity;
                    const min = field.formRule?.minnumber ?? -Infinity;
                    const numValue = parseInt(newValue, 10);
                    if (isNaN(numValue)) {
                        return { ...field, value: null };
                    }
                    const clampedValue = Math.max(min, Math.min(max, numValue));
                    return { ...field, value: clampedValue };
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

    const renderTextInput = () => (
        <>
            {labelComponent}
            <Input
                maxlength={field.formRule?.maxLength}
                minlength={field.formRule?.minLength}
                type={field.type === "textInput" ? "text" : field.type === "emailInput" ? "email" : "password"}
                value={field.value as string}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                {...commonProps}
            />
            <FieldError field={field} />
        </>
    );

    const renderInteger = () => (
        <>
            {labelComponent}
            <Input
                type="number"
                value={field.value !== null ? field.value : ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                {...commonProps}
            />
            <FieldError field={field} />
        </>
    );

    const renderDateInput = () => (
        <>
            {labelComponent}
            <Input
                type="date"
                min={field.formRule?.minDate !== undefined ? field.formRule.minDate.toString() : undefined}
                max={field.formRule?.maxDate !== undefined ? field.formRule.maxDate.toString() : undefined}
                value={field.value as string}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                {...commonProps}
                className="rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:border-gray-300 disabled:bg-gray-100"
            />
            <FieldError field={field} />
        </>
    );

    const renderDateLocal = () => (
        <>
            {labelComponent}
            <Input
                min={field.formRule?.minLocalDate !== undefined ? field.formRule.minLocalDate.toString() : undefined}
                max={field.formRule?.maxLocalDate !== undefined ? field.formRule.maxLocalDate.toString() : undefined}
                type="datetime-local"
                value={field.value as string}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                {...commonProps}
                className="dark:[&::-webkit-calendar-picker-indicator]:invert rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:border-gray-300 disabled:bg-gray-100"
            />
            <FieldError field={field} />
        </>
    );

    const renderTextArea = () => (
        <>
            {labelComponent}
            <textarea
                maxLength={field.formRule?.maxLength}
                minLength={field.formRule?.minLength}
                value={field.value as string}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                {...commonProps}
                className={`${commonProps.className} ${commonProps.disabled ? 'text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' : 'bg-transparent dark:bg-gray-900'} rounded-lg border border-gray-200 bg-transparent py-2 px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 disabled:dark:border-gray-700 disabled:border-gray-300 disabled:bg-gray-100`}
            />
            <FieldError field={field} />
        </>
    );

    const renderSelect = () => {
        if (field.enableSearch) {
            return (
                <>
                    {labelComponent}
                    <SearchableSelect
                        options={field.options || []}
                        value={String(field.value || "")}
                        onChange={(newValue) => handleFieldChange(field.id, newValue)}
                        placeholder={field.placeholder || "Select an option"}
                        disabled={!editFormData}
                    />
                    <FieldError field={field} />
                </>
            );
        }

        return (
            <>
                {labelComponent}
                <select
                    value={String(field.value || "")}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    {...commonProps}
                    className={`${commonProps.className} ${commonProps.disabled ? 'bg-gray-100 dark:bg-gray-800' : ' dark:bg-gray-900 bg-transparent'}`}
                >
                    <option value="">{field.placeholder || "Select an option"}</option>
                    {field.options?.map((option) => (
                        <option className="text-gray-700 dark:text-white dark:bg-gray-800" key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <FieldError field={field} />
            </>
        );
    };

    const renderOption = () => (
        <>
            {labelComponent}
            <div className="flex flex-col gap-2">
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
                                    handleFieldChange(field.id, currentValues.filter((val: string) => val !== option));
                                }
                            }}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            required={field.required && Array.isArray(field.value) && field.value.length === 0}
                            disabled={!editFormData}
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-400">{option}</span>
                    </label>
                ))}
            </div>
            <FieldError field={field} />
        </>
    );

    const renderRadio = () => (
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
                        <span className="ml-2 text-gray-700 dark:text-gray-400">{option}</span>
                    </label>
                ))}
            </div>
            <FieldError field={field} />
        </>
    );

    const renderPhoneNumber = () => (
        <>
            {labelComponent}
            <PhoneInput
                placeholder="Enter phone number"
                countries={field.formRule?.allowedCountries as CountryCode[]}
                value={field.value || ""}
                onChange={(value) => handleFieldChange(field.id, value)}

                defaultCountry="TH"
                className={commonClasses + " !p-3"}
            />
            <FieldError field={field} />
        </>
    );

    const renderDndImage = () => (
        <div >
            {labelComponent}
            <DndImageUploader
                onFileSelect={(file) => handleFieldChange(field.id, file)}
                existingFile={field.value instanceof File ? field.value : null}
                handleRemoveFile={() => handleRemoveFile(field.id)}
                disabled={!editFormData}
                accept={field.formRule?.allowedFileTypes?.join(',')}
            />
            <FieldError field={field} />
        </div>
    );

    const renderImage = () => (
        <>
            {labelComponent}
            <div>
                <input
                    id={field.id}
                    type="file"
                    accept={field.formRule?.allowedFileTypes?.join(',') || 'image/*'}
                    onChange={(e) => handleFieldChange(field.id, e.target.files)}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-500 dark:file:text-white hover:dark:file:bg-gray-600"
                    required={field.required && !field.value}
                    disabled={!editFormData}

                />
                {field.value instanceof File && (
                    <div className="relative group mt-2 w-20 h-20">
                        <img
                            src={URL.createObjectURL(field.value)}
                            alt="Selected"
                            className="w-full h-full object-cover rounded border border-gray-600"
                        />
                        <Button
                            onClick={() => handleRemoveFile(field.id)}
                            className="absolute top-1 right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={!editFormData}
                            size="sm"
                            variant="error"
                        >
                            ×
                        </Button>
                    </div>
                )}
            </div>
            <FieldError field={field} />
        </>
    );

    const renderMultiImage = () => (
        <div >
            {labelComponent}
            <div>
                <MultiImageUpload
                    field={field}
                    labelComponent={null}
                    onFilesSelect={(files) => handleFieldChange(field.id, files)}
                    disabled={!editFormData}
                />
                {Array.isArray(field.value) && field.value.length > 0 && (
                    <div className="mt-2">
                        <p className="text-gray-700 dark:text-white text-sm mb-1">Selected Files:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {field.value.map((file: File, index: number) => (
                                <div key={file.name + index} className="relative group">
                                    {file instanceof File && (
                                        <>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Upload ${index + 1}`}
                                                className="w-full h-20 object-cover rounded border border-gray-600"
                                            />
                                            <Button
                                                onClick={() => handleRemoveFile(field.id, index)}
                                                className="absolute top-1 right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={!editFormData}
                                                size="sm"
                                                variant="error"
                                            >
                                                ×
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <FieldError field={field} />
        </div>
    );

    const renderDndMultiImage = () => (
        <div >
            {labelComponent}
            <DndMultiImageUploader
                onFilesSelect={(files) => handleFieldChange(field.id, files)}
                existingFiles={Array.isArray(field.value) ? field.value : []}
                handleRemoveFile={(index) => handleRemoveFile(field.id, index)}
                disabled={!editFormData}
                accept={field.formRule?.allowedFileTypes?.join(',')}
            />
            <FieldError field={field} />
        </div>
    );

    const renderInputGroup = () => (
        <div>
            {field.showLabel && (
                <h3 className="text-sm font-semibold mb-3 dark:text-gray-400">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </h3>
            )}
            <div className={`grid grid-cols-1 ${getResponsiveGridClass(field.GroupColSpan)} gap-4`}>
                {Array.isArray(field.value) &&
                    field.value.map((childField: IndividualFormFieldWithChildren) => (
                        <div key={childField.id} className={getResponsiveColSpanClass(childField.colSpan)}>
                            <RenderFormField
                                setCurrentForm={setCurrentForm}
                                field={childField}
                                editFormData={editFormData}
                                showValidationErrors={showValidationErrors}
                            />
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

    const renderDynamicField = () => {
        const selectedOption = field.options?.find((option: any) => option.value === field.value);

        if (field.enableSearch) {
            return (
                <>
                    {labelComponent}
                    <SearchableSelect
                        options={field.options || []}
                        value={String(field.value || "")}
                        onChange={(newValue) => handleFieldChange(field.id, newValue)}
                        placeholder={field.placeholder || "Select an option"}
                        disabled={!editFormData}
                        isDynamic={true}
                    />
                    <FieldError field={field} />
                    {selectedOption && Array.isArray(selectedOption.form) && (
                        <div className="mt-4 pt-4">
                            <div className={`grid grid-cols-1 ${getResponsiveGridClass(field.DynamicFieldColSpan)} gap-4`}>
                                {selectedOption.form.map((nestedField: IndividualFormFieldWithChildren) => (
                                    <div key={nestedField.id} className={getResponsiveColSpanClass(nestedField.colSpan)}>
                                        <RenderFormField
                                            setCurrentForm={setCurrentForm}
                                            field={nestedField}
                                            editFormData={editFormData}
                                            showValidationErrors={showValidationErrors}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            );
        }

        return (
            <>
                {labelComponent}
                <select
                    value={String(field.value || "")}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    {...commonProps}
                    className={`${commonProps.className} bg-white dark:bg-gray-800 disabled:opacity-50`}
                >
                    <option value="" className="dark:bg-gray-800">
                        {field.placeholder || "Select an option"}
                    </option>
                    {field.options?.map((option: any) => (
                        <option className="text-gray-700 dark:text-white dark:bg-gray-800" key={option.value} value={option.value}>
                            {option.value}
                        </option>
                    ))}
                </select>
                <FieldError field={field} />
                {selectedOption && Array.isArray(selectedOption.form) && (
                    <div className="mt-4 pt-4">
                        <div className={`grid grid-cols-1 ${getResponsiveGridClass(field.DynamicFieldColSpan)} gap-4`}>
                            {selectedOption.form.map((nestedField: IndividualFormFieldWithChildren) => (
                                <div key={nestedField.id} className={getResponsiveColSpanClass(nestedField.colSpan)}>
                                    <RenderFormField
                                        setCurrentForm={setCurrentForm}
                                        field={nestedField}
                                        editFormData={editFormData}
                                        showValidationErrors={showValidationErrors}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    switch (field.type) {
        case "textInput":
        case "emailInput":
        case "passwordInput":
            return renderTextInput();
        case "Integer":
            return renderInteger();
        case "dateInput":
            return renderDateInput();
        case "dateLocal":
            return renderDateLocal();
        case "textAreaInput":
            return renderTextArea();
        case "select":
            return renderSelect();
        case "option":
            return renderOption();
        case "radio":
            return renderRadio();
        case "phoneNumber":
            return renderPhoneNumber();
        case "dndImage":
            return renderDndImage();
        case "image":
            return renderImage();
        case "multiImage":
            return renderMultiImage();
        case "dndMultiImage":
            return renderDndMultiImage();
        case "InputGroup":
            return renderInputGroup();
        case "dynamicField":
            return renderDynamicField();
        default:
            return <p className="text-red-500">Unsupported field type: {field.type}</p>;
    }
};

export default RenderFormField;