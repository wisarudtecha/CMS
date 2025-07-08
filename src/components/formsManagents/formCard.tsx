// src/components/workflow/list/TicketCard.tsx
import React, { useState } from 'react';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import Button from '@/components/ui/button/Button';
import {
  MoreDotIcon,
  CalenderIcon,
  // EyeIcon,
  // PencilIcon,
  // TrashBinIcon,
} from "@/icons";
import { statusConfig } from '../ui/status/status';
import { FormSop } from '../interface/FormField';


interface FormCardProps {
  form: FormSop;
  formatDate: (dateString: string) => string;
  handleReadWorkflow: (ticketId: string) => void;
  handleUpdateWorkflow: (ticketId: string) => void;
  setConfirmDialog: (config: any) => void; // Use the actual type for ConfirmDialog
}



const FormCard: React.FC<FormCardProps> = ({
  form,
  formatDate,
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

  const config = statusConfig[form.status];

  return (
    <div
      key={form.id}
      className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" /> */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{form.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          <div className="relative inline-block">
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
                  handleUpdateWorkflow(form.id);
                  closeDropdown();
                }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Edit
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  handleReadWorkflow(form.id);
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
                    ticketId: form.id,
                    ticketName: form.name
                  });
                  closeDropdown();
                }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{form.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <CalenderIcon className="w-4 h-4" />
          {formatDate(form.createdAt)}
        </div>
        {/* <div className="font-medium">{form.runCount} runs</div> */}
      </div>
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
                        {/* <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>{form.dueDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MessageCircle className="w-3 h-3" />
                            <span>{form.comments}</span>
                        </div> */}
                    </div>

      
    </div>
  );
};

export default FormCard;