import React from 'react';
import Button from '@/components/ui/button/Button';
import { FormField, FormManager } from '../interface/FormField';
import Switch from '../form/switch/Switch';


interface TableRowActionsProps {
  form: FormManager;
  handleOnEdit?: (form: FormField) => void;
  handleOnView?: () => void;
  handleOnDelete?: (form: FormField) => void;
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
    <div className="flex items-center justify-between w-full">
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
        {/* <Button
          onClick={() => handleOnDelete?.(form)}
          variant={`${style}-error`}
          title="Edit"
        >
          Delete
        </Button> */}
      </div>
      <Switch
        label="Active"
        defaultChecked={form.active}
        onChange={handleToggleStatus}
      />
    </div>
  );

};

export default ButtonAction;