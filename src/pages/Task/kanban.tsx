import  { useState } from 'react';
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TaskData from './exampleJsonTaskData.json';


interface TaskDataEntry {
  _id: string;
  tenant_id: string;
  form_id: string;
  created_by: string;
  assigned_to: string;
  current_status: string; 
  current_step: string;
  workflow_id: string;
  data: {
    customer_name?: string;
    customer_email?: string;
    inquiry_type?: string;
    product_SKU?: string;
    message?: string;
    issue_type?: string;
    device_model?: string;
    operating_system?: string;
    problem_description?: string;
    screenshots_attached?: boolean;
    new_hire_name?: string;
    position?: string;
    location?: string;
    issue_description?: string;
    user_id?: string;
    reason_for_reset?: string;
    [key: string]: any; 
  };
  history: Array<any>; 
  SLA_info: {
    priority: string;
    due_by: string;
    breach_status: string;
  };
  timestamps: {
    created: string;
    updated: string;
    closed: string | null;
  };
}

const typedTaskData: TaskDataEntry[] = TaskData as TaskDataEntry[];
const TaskType = ["Open", "In Progress", "Completed", "Approval"];
const baseButtonCSS = "px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200";

export default function Kanban() {
  const [activeFilterStatus, setActiveFilterStatus] = useState<string>('All');
  const getButtonBgColor = (status: string) => {

    if (activeFilterStatus === status) {
      return "bg-blue-700 text-white";
    }
    return "bg-blue-500 text-white hover:bg-blue-600"; 
  };

  return (
    <div>
      <PageMeta
        title="Kanban Board | TailAdmin - React.js Admin Dashboard Template"
        description="This is a Kanban board page example for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Kanban Board" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1"> 
        <ComponentCard title="Task Overview">
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 relative dark:border-gray-700 dark:bg-black dark:text-white/90">
            <div className="flex flex-wrap gap-2 mb-4 border-b pb-4 dark:border-gray-500">

              <button
                className={`${baseButtonCSS} ${getButtonBgColor('All')}`}
                onClick={() => setActiveFilterStatus('All')}
              >
                All
              </button>
              {TaskType.map((status) => (
                <button
                  key={status}
                  className={`${baseButtonCSS} ${getButtonBgColor(status)}`}
                  onClick={() => setActiveFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
              {TaskType.map((status) => (
                (activeFilterStatus === 'All' || activeFilterStatus === status) && (
                  <div
                    key={status}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-4 min-h-[300px] flex flex-col"
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2 border-gray-300 dark:border-gray-600">
                      {status} ({typedTaskData.filter(task => task.current_status === status).length})
                    </h3>
                    <div className="space-y-3 flex-grow overflow-y-auto pr-1"> {/* Added overflow for scrollable cards */}
                      {typedTaskData
                        .filter((task) => task.current_status === status)
                        .map((task) => (
                          <div
                            key={task._id}
                            className="bg-white dark:bg-gray-700 rounded-md shadow p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow duration-200"
                          >
                            <h4 className="font-bold text-md mb-1 text-gray-900 dark:text-white line-clamp-1">
                              {task.data.customer_name || task.data.new_hire_name || task.data.user_id || `Task ID: ${task._id.substring(0, 8)}`}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {task.data.message || task.data.problem_description || task.data.issue_description || 'No description provided.'}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                              <span>
                                ID: <span className="font-mono">{task._id.substring(0, 6)}</span>
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                task.SLA_info.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                task.SLA_info.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              }`}>
                                {task.SLA_info.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      {typedTaskData.filter((task) => task.current_status === status).length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">No tasks in this column.</p>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
