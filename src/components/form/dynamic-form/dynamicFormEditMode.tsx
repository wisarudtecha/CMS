import { FormFieldWithChildren, formMetaData, FormRule, IndividualFormFieldWithChildren } from "@/components/interface/FormField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useState, useMemo, useEffect, useCallback } from "react";
import { getCountries } from "react-phone-number-input";
import { maxGridCol, formConfigurations } from "./constant";
import Input from "../input/InputField";
import { SortableFieldEditItem } from "./dynamicFormElement";

import { ConfirmationModal } from "@/components/case/modal/ConfirmationModal";
import { usePublishFormMutation } from "@/store/api/formApi";
import { updateFieldRecursively, removeFieldRecursively, createDynamicFormField, getResponsiveGridClass, getResponsiveColSpanClass } from "./function";


interface FormEditProps {
    currentForm: FormFieldWithChildren;
    addField: (formType: string, parentId?: string) => void;
    editFormData: boolean;
    setCurrentForm: React.Dispatch<React.SetStateAction<FormFieldWithChildren>>;
    showValidationErrors: boolean,
    formMetaData?: formMetaData,
}

export const FormEdit: React.FC<FormEditProps> = ({
    currentForm,
    addField,
    editFormData,
    setCurrentForm,
    showValidationErrors,
    formMetaData
}) => {
    const [modalRules, setModalRules] = useState<FormRule>({});
    const [countrySearch, setCountrySearch] = useState('');
    const allCountries = useMemo(() => getCountries(), []);
    const [hiddenCardIds, setHiddenCardIds] = useState<Set<string>>(new Set());
    const [showSettingModal, setShowSettingModal] = useState(false);
    const [expandedDynamicFields, setExpandedDynamicFields] = useState<Record<string, boolean>>({});
    const [showConfirmPubish, setShowConfirmPubish] = useState(false);
    const commonImageTypes = [
        { name: 'JPEG', mime: 'image/jpeg' },
        { name: 'PNG', mime: 'image/png' },
        { name: 'GIF', mime: 'image/gif' },
        { name: 'SVG', mime: 'image/svg+xml' },
        { name: 'WebP', mime: 'image/webp' },
        { name: 'BMP', mime: 'image/bmp' },
    ];
    const [currentEditingField, setCurrentEditingField] = useState<IndividualFormFieldWithChildren | null>(null);
    const [pusblishForm] = usePublishFormMutation()
    const [formMeta, setFormMeta] = useState<formMetaData | undefined>(formMetaData ?? undefined)
    
    useEffect(() => {
        if (currentEditingField) {
            setModalRules(currentEditingField.formRule || {});
        }
    }, [currentEditingField]);

    useEffect(() => {
        setFormMeta(formMetaData)
    }, [formMetaData]);

    if (!currentEditingField && showSettingModal) return null;

    const handleRuleInputChange = (ruleName: keyof FormRule, value: any) => {
        setModalRules(prevRules => ({
            ...prevRules,
            [ruleName]: value
        }));
    };

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

    const hideAllCards = useCallback(() => {
        const allIds = getAllFieldIds(currentForm.formFieldJson);
        setHiddenCardIds(new Set(allIds));
    }, [currentForm.formFieldJson]);

    const showAllCards = useCallback(() => {
        setHiddenCardIds(new Set());
    }, []);

    const handleSaveRules = () => {
        if (currentEditingField) {
            handleUpdateFieldRule(currentEditingField.id, modalRules);
        }
    };

    const getRuleLabel = (ruleName: string): string => {
        const defaultLabel = ruleName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const customLabels: Record<string, string> = {
            maxFileSize: 'Max File Size (MB)',
        };
        return customLabels[ruleName] || defaultLabel;
    };

    const handleUpdateFieldRule = useCallback((fieldId: string, newRules: FormRule) => {
        setCurrentForm(prevForm => ({
            ...prevForm,
            formFieldJson: updateFieldRecursively(prevForm.formFieldJson, fieldId, (field) => ({
                ...field,
                formRule: newRules
            })),
        }));
        setCurrentEditingField(null);
        setShowSettingModal(false);
    }, [updateFieldRecursively]);

    const settingHandling = (fieldData: IndividualFormFieldWithChildren) => {
        setCurrentEditingField(fieldData);
        setShowSettingModal(true);
    }

    // const handleFormIdChange = useCallback((newId: string) => {
    //     setCurrentForm(prevForm => ({ ...prevForm, formId: newId }));
    // }, []);

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

    const updateFieldId = useCallback((oldId: string, newId: string) => {
        const trimmedNewId = newId.trim();
        if (!trimmedNewId) {
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

    const renderRuleInput = (ruleName: string, value: any) => {
        const label = getRuleLabel(ruleName);
        const commonInputClass = "mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-gray-400";
        const commonCheckboxClass = "form-checkbox h-4 w-4 text-blue-600 rounded";

        switch (ruleName) {
            case 'minLength':
            case 'maxLength':
            case 'minnumber':
            case 'maxnumber':
            case 'minSelections':
            case 'maxSelections':
            case 'maxFileSize':
            case 'minFiles':
            case 'maxFiles':
                const isNonNegative = ['minLength', 'maxLength', 'minSelections', 'maxSelections', 'maxFileSize', 'minFiles', 'maxFiles'].includes(ruleName);
                return <label className="block text-sm font-medium">{label}:
                    <Input
                        type="number"
                        {...(isNonNegative && { min: "0" })}
                        value={value || ''}
                        onChange={e => {
                            const rawValue = e.target.value;
                            if (rawValue === '') {
                                handleRuleInputChange(ruleName as keyof FormRule, undefined);
                                return;
                            }
                            let numValue = parseInt(rawValue, 10);
                            if (isNonNegative && numValue < 0) {
                                numValue = 0;
                            }
                            handleRuleInputChange(ruleName as keyof FormRule, isNaN(numValue) ? undefined : numValue);
                        }}
                        className={commonInputClass}
                    />
                </label>;
            case 'contain':
                return <label className="block text-sm font-medium">{label}:<Input type="text" value={value || ''} onChange={e => handleRuleInputChange(ruleName as keyof FormRule, e.target.value)} className={commonInputClass} /></label>;
            case 'allowedCountries':
                const filteredCountries = allCountries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));
                return (
                    <div>
                        <label className="block text-sm font-medium">{label}:</label>
                        <Input
                            type="text"
                            placeholder="Search countries..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className={`${commonInputClass} mb-2`}
                        />
                        <div className="max-h-40 overflow-y-auto border rounded p-2">
                            {filteredCountries.map(countryCode => (
                                <label key={countryCode} className="flex items-center text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        className={commonCheckboxClass}
                                        checked={(modalRules.allowedCountries || []).includes(countryCode)}
                                        onChange={e => {
                                            const isChecked = e.target.checked;
                                            const currentTypes = modalRules.allowedCountries || [];
                                            const newTypes = isChecked
                                                ? [...new Set([...currentTypes, countryCode])]
                                                : currentTypes.filter(t => t !== countryCode);
                                            handleRuleInputChange('allowedCountries', newTypes);
                                        }}
                                    />
                                    <span className="ml-2">{countryCode}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 'allowedFileTypes':
                return (
                    <div>
                        <label className="block text-sm font-medium">{label}:</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {commonImageTypes.map(imageType => (
                                <label key={imageType.mime} className="flex items-center text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        className={commonCheckboxClass}
                                        checked={(modalRules.allowedFileTypes || []).includes(imageType.mime)}
                                        onChange={e => {
                                            const isChecked = e.target.checked;
                                            const currentTypes = modalRules.allowedFileTypes || [];
                                            const newTypes = isChecked
                                                ? [...new Set([...currentTypes, imageType.mime])]
                                                : currentTypes.filter(t => t !== imageType.mime);
                                            handleRuleInputChange('allowedFileTypes', newTypes);
                                        }}
                                    />
                                    <span className="ml-2">{imageType.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 'minLocalDate':
            case 'maxLocalDate':
                return <label className="block text-sm font-medium">{label}:<Input type="datetime-local" value={value || ''} onChange={e => handleRuleInputChange(ruleName as keyof FormRule, e.target.value)} className={commonInputClass} /></label>;
            case 'minDate':
            case 'maxDate':
                return <label className="block text-sm font-medium">{label}:<Input type="date" value={value || ''} onChange={e => handleRuleInputChange(ruleName as keyof FormRule, e.target.value)} className={commonInputClass} /></label>;
            case 'validEmailFormat':
            case 'hasUppercase':
            case 'hasLowercase':
            case 'hasNumber':
            case 'hasSpecialChar':
            case 'noWhitespace':
            case 'futureDateOnly':
            case 'pastDateOnly':
                return <label className="flex items-center text-sm font-medium"><input type="checkbox" checked={!!value} onChange={e => handleRuleInputChange(ruleName as keyof FormRule, e.target.checked)} className={commonCheckboxClass} /><span className="ml-2">{label}</span></label>;
            default:
                return <p>Unsupported rule: {ruleName}</p>;
        }
    };

    return (
        <>  <ConfirmationModal
            title=""
            description="Confirm Publish?"
            onConfirm={() => {
                pusblishForm({ formId: currentForm.formId, publish: true });
                setFormMeta((prev) => (prev ? {
                    ...(prev),
                    publish: true,
                } : undefined));
                setShowConfirmPubish(false);
            }}
            isOpen={showConfirmPubish}
            onClose={() => setShowConfirmPubish(false)}
        />

            <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <h2 className="text-lg font-bold mb-4">Form Settings</h2>
                <div className=" relative space-y-4">
                    <label className={`block text-gray-600 text-sm font-bold dark:text-gray-400`}>Form Name:

                    </label>
                    <div className={`${formMeta && "grid grid-cols-[1fr_auto_auto] space-x-3"} text-gray-600 text-sm font-bold dark:text-gray-400`}>
                        <Input type="text" value={currentForm.formName} onChange={(e) => handleFormNameChange(e.target.value)} className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-gray-400" placeholder="Enter form name" disabled={!editFormData} />
                        {formMeta?.versions && <div className=" flex items-center">
                            Version :
                            <label className={` items-center justify-center`}>{formMetaData?.versions}</label>
                        </div>
                        }
                        {!formMeta?.publish && formMeta?.publish !== undefined && <div className="flex justify-end">
                            <Button onClick={() => { setShowConfirmPubish(true) }}>Publish</Button>
                        </div>}
                    </div>

                    {/* <label className="block text-gray-700 text-sm font-bold dark:text-gray-400">Form ID:
                        <Input type="text" value={currentForm.formId} onChange={(e) => handleFormIdChange(e.target.value)} className="mt-1 block w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:text-gray-400" placeholder="Enter unique form ID" disabled={true} />
                    </label> */}
                    <div className="flex flex-wrap items-center gap-2">
                        <label htmlFor={`overallColSpan-input`} className="text-gray-700 text-sm dark:text-gray-400">Desktop Grid Columns:</label>
                        <Input id={`overallColSpan-input`} type="number" min="1" max={maxGridCol.toString()} value={currentForm.formColSpan} onChange={handleOverallFormColSpanChange} className="py-1 px-2 border rounded-md text-gray-700 dark:bg-gray-800 dark:text-gray-400 w-20" disabled={!editFormData} />
                    </div>
                </div>
            </div>

            <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
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
                                        <SortableFieldEditItem
                                            key={field.id}
                                            field={field}
                                            handleLabelChange={handleLabelChange}
                                            handleShowLabelChange={handleShowLabelChange}
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
                                            isHidden={hiddenCardIds.has(field.id)}
                                            toggleCardVisibility={toggleCardVisibility}
                                            settingHandling={settingHandling}
                                            expandedDynamicFields={expandedDynamicFields}
                                            setExpandedDynamicFields={setExpandedDynamicFields}
                                            hiddenCardIds={hiddenCardIds}
                                            setCurrentForm={setCurrentForm}
                                            showValidationErrors={showValidationErrors}
                                        />
                                    </div>
                                ))}
                            </div>
                        </SortableContext>
                    </div>
                )}
            </div>

            {
                showSettingModal && currentEditingField && (<Modal isOpen={showSettingModal} onClose={() => { setShowSettingModal(false); setCurrentEditingField(null); }} className="max-w-lg p-6">
                    <div className="dark:text-gray-200">
                        <h3 className="text-lg font-semibold ">Settings for: <span className="font-bold text-blue-500">{currentEditingField.label}</span></h3>
                        <p className="text-sm text-gray-500 mb-4">Field Type: {currentEditingField.type}</p>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {formConfigurations.find(c => c.formType === currentEditingField.type)?.property?.map(rule => (
                                <div key={rule}>
                                    {renderRuleInput(rule, modalRules[rule as keyof FormRule])}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-6">
                            <Button onClick={() => { setShowSettingModal(false); setCurrentEditingField(null); }} variant="outline">Cancel</Button>
                            <Button onClick={handleSaveRules} variant="success">Save Rules</Button>
                        </div>
                    </div>
                </Modal>)
            }
        </>
    );
};