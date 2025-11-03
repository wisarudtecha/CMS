// /src/components/workflow/list/FormTableView.tsx
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    ChevronDownIcon,
    ChevronUpIcon,
} from "@/icons";
import ButtonAction from './ButtonAction';
import { statusConfig } from '../ui/status/status';
import { FormManager } from '../interface/FormField';
import { getAvatarIconFromString } from '../avatar/createAvatarFromString';

interface SortConfig {
    key: keyof FormManager | null;
    direction: 'asc' | 'desc';
}

interface FormTableViewProps {
    forms: FormManager[];
    handleSort: (key: keyof FormManager) => void;
    sortConfig: SortConfig;
    formatDate: (dateString: string) => string;
    onSetStatusInactive: (formId: string, formName: string, newStatus: FormManager['active']) => void;
    handleOnEdit: (form: FormManager) => void;
    handleOnView: (form: FormManager) => void;
}

const ListViewFormManager: React.FC<FormTableViewProps> = ({
    forms,
    handleSort,
    sortConfig,
    formatDate,
    onSetStatusInactive,
    handleOnEdit,
    handleOnView,
}) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border-none overflow-hidden mb-8">
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left whitespace-nowrap">
                                <button
                                    onClick={() => handleSort('formName')}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    Name
                                    {sortConfig.key === 'formName' && (
                                        sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left whitespace-nowrap">
                                <button
                                    onClick={() => handleSort('active')}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    Status
                                    {sortConfig.key === 'active' && (
                                        sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left whitespace-nowrap">
                                <button
                                    onClick={() => handleSort('createdAt')}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    Created
                                    {sortConfig.key === 'createdAt' && (
                                        sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                Create By
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {forms.map((form) => {
                            const status = form.active === true ? "active" : "inactive"
                            const config = statusConfig[status]

                            return (
                                <tr key={uuidv4()} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{form.formName}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-xs">
                                                    {/* {form.description} */}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap`}>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                            {status}
                                        </span>
                                        {form.versions === "draft" && <span className={`px-2 py-1 mx-2 rounded-full text-xs font-medium ${statusConfig["draft"].color}`}>
                                            draft
                                        </span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {formatDate(form.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        <div className="flex items-left  gap-2">
                                            {getAvatarIconFromString(form.createdBy, "bg-blue-600 dark:bg-blue-700")}
                                            {form.createdBy}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-2">
                                            <ButtonAction
                                                form={form}
                                                type='list'
                                                onSetStatusChange={onSetStatusInactive}
                                                handleOnEdit={() => handleOnEdit(form)}
                                                handleOnView={() => handleOnView(form)} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListViewFormManager;