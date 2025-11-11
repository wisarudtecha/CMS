import { FormFieldWithChildren } from "@/components/interface/FormField";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useState, useCallback } from "react";
import TextArea from "../input/TextArea";
import { ToastContainer } from "@/components/crud/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { FileIcon } from "lucide-react";
import { isFormFieldWithChildren } from "./function";


interface importDynamicFormModal {
    setCurrentForm: React.Dispatch<React.SetStateAction<FormFieldWithChildren>>;
    isImport: boolean,
    setImport: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ImportDynamicFormModal: React.FC<importDynamicFormModal> = ({
    setCurrentForm,
    isImport,
    setImport,


}) => {
    const [importJsonText, setImportJsonText] = useState(String);
    const { toasts, addToast, removeToast } = useToast();

    const handleFormImport = useCallback(() => {
        try {
            const parsedJson = JSON.parse(importJsonText);
            if (isFormFieldWithChildren(parsedJson)) {
                setCurrentForm((prev) => ({
                    ...parsedJson,
                    formName: prev.formName,
                }));

                setImport(false);
            }
            addToast("error", "Invail Import Data.")
        } catch (error) {
            setImport(false);
            addToast("error", String(error))
        }
    }, [importJsonText]);

    if (isImport)
        return (
            <Modal isOpen={isImport} onClose={() => setImport(false)} className="max-w-4xl p-6">
                <ToastContainer toasts={toasts} onRemove={removeToast} />
                <div><h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Import Form JSON</h3></div>
                <div className="p-4"><div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Paste JSON Content</label>
                    <TextArea value={importJsonText} onChange={(value) => setImportJsonText(value)} className="w-full h-64 px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-mono text-sm" placeholder="Paste your form JSON here..." />
                </div></div>
                <div className="flex items-center justify-end gap-2 p-4">
                    <Button onClick={() => setImport(false)} variant="error">Cancel</Button>
                    <Button onClick={handleFormImport} disabled={!importJsonText.trim()} variant={!importJsonText.trim() ? 'outline' : 'success'}><FileIcon className="w-4 h-4" /> Import Form</Button>
                </div>
            </Modal>
        );
};

export default ImportDynamicFormModal