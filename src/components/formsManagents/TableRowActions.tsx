// src/components/workflow/list/TableRowActions.tsx
import React, { useState } from 'react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import Button from '@/components/ui/button/Button';
import { MoreDotIcon } from "@/icons";
import { FormManager } from '../interface/FormField';

interface TableRowActionsProps {
  form: FormManager;
  handleOnEdit?:()=>void;
  handleOnView?:()=>void;
  onSetStatusInactive: (formId: string, formName: string, newStatus: FormManager['status']) => void; // Add this line
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
  form,
  handleOnEdit,
  handleOnView,
  onSetStatusInactive, // Destructure the new prop
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);



  const handleOnDel = () => {
    // Call the new prop to trigger the status update in the parent
    onSetStatusInactive(form.formId, form.formName, 'inactive');
  };



  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="ghost"
        size="xs"
        onClick={toggleDropdown}
      >
        <MoreDotIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </Button>
      <Dropdown
        isOpen={isDropdownOpen}
        onClose={closeDropdown}
        className="w-40 p-2"
      >
        <DropdownItem
          onItemClick={() => {
            handleOnEdit && handleOnEdit();
            closeDropdown();
          }}
          className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          Edit
        </DropdownItem>
        <DropdownItem
          onItemClick={() => {
            handleOnView && handleOnView();
            closeDropdown();
          }}
          className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          View
        </DropdownItem>
        <DropdownItem
          onItemClick={() => {
            handleOnDel(); // This will now call onSetStatusInactive
            closeDropdown();
          }}
          className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          Set Inactive {/* Change label from Delete to Set Inactive */}
        </DropdownItem>
      </Dropdown>
    </div>
  );
};

export default TableRowActions;