import React from 'react';
import Button from '@/components/ui/button/Button';
import { FormField, FormManager } from '../interface/FormField';

interface TableRowActionsProps {
  form: FormManager;
  handleOnEdit?: (form: FormField) => void;
  handleOnView?: () => void;
  type?: "button" | "list";
  onSetStatusInactive: (formId: string, formName: string, newStatus: FormManager['status']) => void;
}

const ButtonAction: React.FC<TableRowActionsProps> = ({
  form,
  type = "list",
  handleOnEdit,
  handleOnView,
  onSetStatusInactive,
}) => {

  const style = type === "list" ? "ghost" : "outline";

  const handleOnDel = () => {
    form.status!="inactive"?onSetStatusInactive(form.formId, form.formName, 'inactive'):
    onSetStatusInactive(form.formId, form.formName, 'active');
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
      {form.status!="inactive"?<Button
        onClick={handleOnDel}
        variant={`${style}-error`}
      >
        Inactive
      </Button>:<Button
        onClick={handleOnDel}
        variant={`${style}-success`}
      >
        Active
      </Button>}
    </div>
  );
};

export default ButtonAction;
