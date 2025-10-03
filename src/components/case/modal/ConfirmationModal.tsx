import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    description: React.ReactNode;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonVariant?: 'success' | 'error' | 'primary' | 'ghost' | 'outline';
    children?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
    confirmButtonVariant = "primary",
    children,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showCloseButton={false}
            className="p-6 w-full max-w-md m-4"
        >
            {/* The content of the confirmation dialog goes here */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>

            {children}

            {/* Action buttons for confirmation */}
            <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={onClose}>
                    {cancelButtonText}
                </Button>
                {onConfirm && (
                    <Button variant={confirmButtonVariant} onClick={() => {
                        onConfirm()
                        onClose()
                    }
                    }>
                        {confirmButtonText}
                    </Button>
                )}
            </div>
        </Modal>
    );
};