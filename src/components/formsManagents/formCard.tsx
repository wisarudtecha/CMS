// src/components/workflow/list/formCard.tsx
import React from 'react';

import {
  CalenderIcon,
} from "@/icons";
import { statusConfig } from '../ui/status/status';
import { FormManager } from '../interface/FormField';
import TableRowActions from './TableRowActions';


interface FormCardProps {
  form: FormManager;
  formatDate: (dateString: string) => string;
  handleOnEdit?:()=>void;
  handleOnView?:()=>void;
  onSetStatusInactive: (formId: string, formName: string, newStatus: FormManager['status']) => void; // Add this line
}



const FormCard: React.FC<FormCardProps> = ({
  form,
  formatDate,
  handleOnEdit,
  handleOnView,
  onSetStatusInactive, // Destructure the new prop
}) => {

  const config = statusConfig[form.status];

  return (
    <div
      key={form.formId}
      className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{form.formName}</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          <div className="relative inline-block">

            <TableRowActions
              form={form}
              handleOnEdit={handleOnEdit}
              handleOnView={handleOnView}
              onSetStatusInactive={onSetStatusInactive} // Pass the prop down
            />
          </div>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{form.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <CalenderIcon className="w-4 h-4" />
          {formatDate(form.createdAt)}
        </div>
      </div>
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
      </div>
    </div>
  );
};

export default FormCard;