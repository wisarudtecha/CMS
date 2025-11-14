// src/components/workflow/list/formCard.tsx
import React, { SetStateAction } from 'react';

import {
  CalenderIcon,
} from "@/icons";
import { FormManager } from '../interface/FormField';
import ButtonAction from './ButtonAction';
import { getAvatarIconFromString } from '../avatar/createAvatarFromString';
import Button from '../ui/button/Button';
import Badge from '../ui/badge/Badge';

interface FormCardProps {
  form: FormManager;
  setForms: React.Dispatch<SetStateAction<FormManager[]>>
  formatDate: (dateString: string) => string;
  handleOnEdit?: () => void;
  handleOnView?: () => void;
  handleOnVersion?: (form: FormManager) => void;
  setShowPubModal?: React.Dispatch<React.SetStateAction<boolean>>;
  onSetStatusInactive: (formId: string, formName: string, newStatus: FormManager['active']) => void; // Add this line
}



const FormCard: React.FC<FormCardProps> = ({
  form,
  setForms,
  formatDate,
  handleOnEdit,
  handleOnView,
  onSetStatusInactive, // Destructure the new prop
  handleOnVersion
}) => {

  // const config = statusConfig[form.active===true?"active":"inactive"];

  return (
    <div
      key={form.formId}
      className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700 flex flex-col"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{form.formName}</h3>
            {form?.versionsList &&
              form.versionsList.length > 0 &&
              Number(form.versions) < Math.max(...form.versionsList.map(Number)) && (
                <Badge color="warning" className="px-2 py-1 rounded-full text-xs font-medium">
                  New Versions
                </Badge>
              )}


          </div>
          <div className="flex items-center gap-1">
            {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
              {config.label}
            </span> */}
            {/* {form.publish && <Badge color='success' variant='solid' className={`px-2 py-1 rounded-full text-xs font-medium`}>
              Pubilsh
            </Badge>} */}
            {/* <SearchableSelect className=' w-18 rounded-full text-xs font-medium' value={form.versions} prefixedStringValue="v." options={(form?.versionsList || [])} onChange={()=>{}} disabledChevronsIcon={true} disabledRemoveButton={true} placeholder=' '/> */}
            <Button className=' w-fit rounded-full text-xs font-medium' variant='outline' onClick={() => { handleOnVersion && handleOnVersion(form) }}>v.{form.versions}</Button>
            {/* <Badge color='warning' className={`px-2 py-1 rounded-full text-xs font-medium `}>
              v.{form.versions}
            </Badge> */}
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
        <div className='mb-2 flex items-center text-sm text-gray-500 dark:text-gray-400'>Create By : {getAvatarIconFromString(form.createdBy, "bg-blue-600 dark:bg-blue-700 mx-1")}{form.createdBy}</div>
        <ButtonAction
          type="button"
          form={form}
          setForms={setForms}
          handleOnEdit={handleOnEdit}
          handleOnView={handleOnView}
          onSetStatusChange={onSetStatusInactive}
        />
      </div>
    </div>
  );

};

export default FormCard;