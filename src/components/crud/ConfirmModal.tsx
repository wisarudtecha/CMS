// /src/components/crud/ConfirmModal.tsx
import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import type { ConfirmDialog } from "@/types/crud";

interface ConfirmModalProps {
  dialog: ConfirmDialog;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  dialog,
  onConfirm,
  onCancel
}) => {
  const getTitle = () => {
    if (dialog.title) return dialog.title;
    
    switch (dialog.type) {
      case "delete":
        return "Delete Confirmation";
      case "status":
        return "Status Change";
      default:
        return "Confirmation";
    }
  };

  const getMessage = () => {
    if (dialog.message) {
      return dialog.message;
    }
    
    switch (dialog.type) {
      case "delete":
        return `Are you sure you want to delete "${dialog.entityName}"? This action cannot be undone.`;
      case "status":
        return `Change "${dialog.entityName}" status to ${dialog.newValue}?`;
      default:
        return "Are you sure you want to proceed?";
    }
  };

  return (
    <Modal 
      isOpen={dialog.isOpen} 
      onClose={onCancel} 
      className="max-w-md p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {getTitle()}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {dialog.type === "delete" ? "This action cannot be undone" : "Please confirm your action"}
        </p>
      </div>
      
      <p className="text-gray-700 dark:text-gray-200 mb-6">
        {getMessage()}
      </p>
      
      <div className="flex items-center gap-3 justify-end">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant={dialog.type === "delete" ? "error" : "primary"}
        >
          {dialog.type === "delete" ? "Delete" : "Confirm"}
        </Button>
      </div>
    </Modal>
  );
};
