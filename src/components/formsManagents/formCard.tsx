// src/components/workflow/list/formCard.tsx
import React from 'react';

import {
  CalenderIcon,
} from "@/icons";
import { statusConfig } from '../ui/status/status';
import { FormManager } from '../interface/FormField';
import ButtonAction from './ButtonAction';
import { getAvatarIconFromString } from '../avatar/createAvatarFromString';

interface FormCardProps {
  form: FormManager;
  formatDate: (dateString: string) => string;
  handleOnEdit?: () => void;
  handleOnView?: () => void;
  onSetStatusInactive: (formId: string, formName: string, newStatus: FormManager['active']) => void; // Add this line
}



const FormCard: React.FC<FormCardProps> = ({
  form,
  formatDate,
  handleOnEdit,
  handleOnView,
  onSetStatusInactive, // Destructure the new prop
}) => {

  const config = statusConfig[form.active===true?"active":"inactive"];

  return (
    <div
      key={form.formId}
      className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700 flex flex-col"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{form.formName}</h3>
          </div>
          <div className="flex items-center gap-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            {form.versions=="draft"&&<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig["draft"].color}`}>
              draft
            </span>}
          </div>
        </div>

        {/* <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{form.description}</p> */}

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <CalenderIcon className="w-4 h-4" />
            {formatDate(form.createdAt)}
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-4">
        <div className='mb-2 flex items-center text-sm text-gray-500 dark:text-gray-400'>Create By : {getAvatarIconFromString(form.createdBy,"bg-blue-600 dark:bg-blue-700 mx-1")}{form.createdBy}</div>
        <ButtonAction
          type="button"
          form={form}
          handleOnEdit={handleOnEdit}
          handleOnView={handleOnView}
          onSetStatusChange={onSetStatusInactive}
        />
      </div>
    </div>
  );

};

export default FormCard;