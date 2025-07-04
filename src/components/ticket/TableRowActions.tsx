// src/components/workflow/list/TableRowActions.tsx
import React, { useState } from 'react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import Button from '@/components/ui/button/Button';
import { MoreDotIcon } from "@/icons";

interface TableRowActionsProps {
  ticketId: string;
  ticketName: string;
  handleReadWorkflow: (ticketId: string) => void;
  handleUpdateWorkflow: (ticketId: string) => void;
  setConfirmDialog: (config: any) => void; // Use the actual type for ConfirmDialog
}

const TableRowActions: React.FC<TableRowActionsProps> = ({
  ticketId,
  ticketName,
  handleReadWorkflow,
  handleUpdateWorkflow,
  setConfirmDialog
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
            handleUpdateWorkflow(ticketId);
            closeDropdown();
          }}
          className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          Edit
        </DropdownItem>
        <DropdownItem
          onItemClick={() => {
            handleReadWorkflow(ticketId);
            closeDropdown();
          }}
          className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          View
        </DropdownItem>
        <DropdownItem
          onItemClick={() => {
            setConfirmDialog({
              isOpen: true,
              type: 'delete',
              ticketId: ticketId,
              ticketName: ticketName
            });
            closeDropdown();
          }}
          className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          Delete
        </DropdownItem>
      </Dropdown>
    </div>
  );
};

export default TableRowActions;