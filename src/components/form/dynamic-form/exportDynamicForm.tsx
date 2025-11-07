import { FormFieldWithChildren } from "@/components/interface/FormField";
import { Modal } from "@/components/ui/modal";
import TextArea from "../input/TextArea";


interface exportDynamicFormModal {
    currentForm: FormFieldWithChildren;
    isOpen: boolean,
    onClose: () => void;
}

export const ExportDynamicFormModal: React.FC<exportDynamicFormModal> = ({
    currentForm,
    isOpen,
    onClose,


}) => {
    const exportJsonText = JSON.stringify(currentForm)
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6">
            <div><h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Export Form</h3></div>
            <div className="p-4"><div className="mb-4">
                {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Paste JSON Content</label> */}
                <TextArea value={exportJsonText} disabled={true} className="w-full h-64 px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-mono text-sm disabled:cursor-auto " placeholder="Paste your form JSON here..." />
            </div></div>
        </Modal>
    );
};

export default ExportDynamicFormModal