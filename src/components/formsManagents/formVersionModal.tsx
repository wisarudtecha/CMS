import { SpinnerIcon } from "@/icons/SpinnerIcon";
import DynamicForm from "../form/dynamic-form/DynamicForm";
import Button from "../ui/button/Button";
import { useChangeFormVersionMutationMutation, useGetFormByFormIdQueryQuery } from "@/store/api/formApi";
import { FormManager } from "../interface/FormField";
import { SearchableSelect } from "../SearchInput/SearchSelectInput";
import { useState } from "react";
import { Modal } from "../ui/modal";
import { ToastContainer } from "../crud/ToastContainer";
import { useToast } from "@/hooks";

const FormVersionsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    form: FormManager;
}> = ({ isOpen, onClose, form }) => {
    const [selectedVersion, setSelectedVersion] = useState<string>(form.versions);
    const [changeVersion] = useChangeFormVersionMutationMutation()
    const { data: formData, isLoading: isLoadingForm, isFetching } = useGetFormByFormIdQueryQuery({
        formId: form.formId,
        version: selectedVersion
    });
    const { toasts, addToast, removeToast } = useToast();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="p-6 w-full max-w-4xl m-4"
        >
            <div className="flex mb-4 justify-between">
                <div className="px-3 text-xl dark:text-white">{form.formName}</div>
                <SearchableSelect
                    className="w-18 rounded-full text-xs font-medium mr-20"
                    value={selectedVersion}
                    prefixedStringValue="v."
                    options={form?.versionsList || []}
                    onChange={(value) => setSelectedVersion(value)

                    } // Handle version change
                    // disabledChevronsIcon={true}
                    disabledRemoveButton={true}
                    placeholder=" "
                />
            </div>

            {isLoadingForm || isFetching ? (
                <div className="flex justify-center text-gray-500 items-center">
                    <SpinnerIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 animate-spin mr-2" />
                    Loading
                </div>
            ) : (
                <DynamicForm
                    initialForm={formData?.data} // Fix: Remove && undefined
                    edit={false}
                    editFormData={false}
                    enableFormTitle={false}
                />
            )}

            {form.versions !== selectedVersion &&<div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => {
                    try {
                       changeVersion({ formId: form.formId, version: selectedVersion }).unwrap()
                        addToast("success","Change version Success")
                        onClose()
                    } catch (error: any) {
                        addToast("error", error?.data?.msg)
                    }

                }}>
                    Change Version
                </Button>
            </div>}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </Modal>
    );
};

export default FormVersionsModal;