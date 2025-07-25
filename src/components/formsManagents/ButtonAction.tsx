import React from 'react';
import Button from '@/components/ui/button/Button';
import { FormField, FormManager } from '../interface/FormField';

interface TableRowActionsProps {
  form: FormManager;
  handleOnEdit?: (form: FormField) => void;
  handleOnView?: () => void;
  type?: "button" | "list";
  onSetStatusChange: (formId: string, formName: string, newStatus: boolean) => void;
}

const ButtonAction: React.FC<TableRowActionsProps> = ({
  form,
  type = "list",
  handleOnEdit,
  handleOnView,
  onSetStatusChange,
}) => {

  const style = type === "list" ? "ghost" : "outline";

  // Handles toggling the active status of the form
  const handleToggleStatus = () => {
 
    onSetStatusChange(form.formId, form.formName, !form.active);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleOnView?.()}
        variant={`${style}-primary`}
        title="View"
      >
        View
      </Button>
      <Button
        onClick={() => handleOnEdit?.(form)}
        variant={`${style}-warning`}
        title="Edit"
      >
        Edit
      </Button>
      
      {/* Conditionally render the status button based on the 'active' property */}
      {form.active ? (
        <Button
          onClick={handleToggleStatus}
          variant={`${style}-error`}
          title="Set to Inactive"
        >
          Inactive
        </Button>
      ) : (
        <Button
          onClick={handleToggleStatus}
          variant={`${style}-success`}
          title="Set to Active"
        >
          Active
        </Button>
      )}
    </div>
  );
};

export default ButtonAction;