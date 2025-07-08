// /src/components/workflow/list/List.tsx
import
React,
{
  useEffect,
  useMemo,
  useState
}
  from 'react';
import { useNavigate } from 'react-router-dom';
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import {
  AlertIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  ErrorIcon,
  GridIcon,
  ListIcon,
} from "@/icons";

// Import the new TicketCard component
import FormCard from './formCard';
// Import the new TableRowActions component
import TableRowActions from './TableRowActions';
import { statusConfig } from '../ui/status/status';
import { FormSop } from '../interface/FormField';
// TypeScript interfaces

interface ApiResponse {
  Forms: FormSop[];
}

interface SortConfig {
  key: keyof FormSop | null;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  status: string;
  category: string;
  search: string;
}

interface PaginationConfig {
  page: number;
  pageSize: number;
}

interface ConfirmDialog {
  isOpen: boolean;
  type: 'delete' | 'status';
  ticketId: string;
  ticketName: string;
  newStatus?: FormSop['status'];
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}


const fetchForms = async (): Promise<ApiResponse> => {

  return {
    Forms: [
      {
        "id": "a1b2c3d4e5",
        "name": "Onboarding New Employees SOP",
        "description": "Standard operating procedure for integrating new hires into the company.",
        "status": "active",
        "createdAt": "2024-03-15T10:00:00Z",
        "category": "Human Resources",
        "type": "Process"
      },
      {
        "id": "f6g7h8i9j0",
        "name": "Customer Support Ticket Resolution",
        "description": "SOP for handling and resolving customer support tickets efficiently.",
        "status": "active",
        "createdAt": "2024-02-20T14:30:00Z",
        "category": "Customer Service",
        "type": "Guideline"
      },
      {
        "id": "k1l2m3n4o5",
        "name": "Software Deployment Checklist",
        "description": "Checklist for deploying new software versions to production.",
        "status": "draft",
        "createdAt": "2024-06-01T09:15:00Z",
        "category": "IT Operations",
        "type": "Checklist"
      },
      {
        "id": "p6q7r8s9t0",
        "name": "Monthly Financial Report Generation",
        "description": "Procedure for generating and distributing monthly financial reports.",
        "status": "active",
        "createdAt": "2023-11-10T16:45:00Z",
        "category": "Finance",
        "type": "Process"
      },
      {
        "id": "u1v2w3x4y5",
        "name": "Product Quality Assurance Testing",
        "description": "SOP for conducting quality assurance tests on new product features.",
        "status": "testing",
        "createdAt": "2025-01-05T11:00:00Z",
        "category": "Product Development",
        "type": "Methodology"
      },
      {
        "id": "z6a7b8c9d0",
        "name": "Data Backup and Recovery Policy",
        "description": "Policy outlining procedures for data backup and disaster recovery.",
        "status": "active",
        "createdAt": "2023-09-25T08:00:00Z",
        "category": "IT Security",
        "type": "Policy"
      },
      {
        "id": "e1f2g3h4i5",
        "name": "Employee Performance Review Process",
        "description": "Guide for managers conducting annual employee performance reviews.",
        "status": "active",
        "createdAt": "2024-01-01T13:00:00Z",
        "category": "Human Resources",
        "type": "Process"
      },
      {
        "id": "j6k7l8m9n0",
        "name": "Website Content Update Procedure",
        "description": "Steps for updating and publishing content on the company website.",
        "status": "inactive",
        "createdAt": "2023-07-18T09:00:00Z",
        "category": "Marketing",
        "type": "Guideline"
      },
      {
        "id": "o1p2q3r4s5",
        "name": "New Vendor Onboarding Form",
        "description": "Form and associated procedure for bringing on new vendors.",
        "status": "active",
        "createdAt": "2024-04-22T10:30:00Z",
        "category": "Procurement",
        "type": "Form"
      },
      {
        "id": "t6u7v8w9x0",
        "name": "Social Media Engagement Strategy",
        "description": "Draft strategy for engaging with users on social media platforms.",
        "status": "draft",
        "createdAt": "2025-02-14T15:00:00Z",
        "category": "Marketing",
        "type": "Strategy"
      }
    ]
  };
};

const deleteWorkflow = async (id: string): Promise<void> => {
  // await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Deleting workflow ${id}`);
};

const updateWorkflowStatus = async (id: string, status: FormSop['status']): Promise<void> => {
  // await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Updating workflow ${id} status to ${status}`);
};



const FormListComponent: React.FC = () => {
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState<FormSop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [displayMode, setDisplayMode] = useState<'card' | 'table'>('card');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    status: '',
    category: '',
    search: ''
  });
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 10
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    type: 'delete',
    ticketId: '',
    ticketName: '',
    newStatus: undefined
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');

  const filterOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" },
    { value: "testing", label: "Testing" },
  ];

  const paginationOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];

  // The `dropdownChild` function is no longer needed since actions are handled within TicketCard/TableRowActions
  // const dropdownChild = (): ReactNode => {
  //   const downdownClassName = "flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300";
  //   return (
  //     <>
  //     </>
  //   );
  // };

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchForms();
        setWorkflows(response.Forms);
      }
      catch (err) {
        setError('Failed to fetch workflows. Please try again.');
        console.error('Error fetching workflows:', err);
      }
      finally {
        setLoading(false);
      }
    };

    loadWorkflows();
  }, []);

  // Add toast notification
  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message };
    setToasts(prev => [...prev, newToast]);

    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Remove toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Handle search
  const handleSearch = () => {
    setFilterConfig(prev => ({ ...prev, search: searchInput }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle sort
  const handleSort = (key: keyof FormSop) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle filter
  const handleFilter = (key: keyof FilterConfig, value: string) => {
    setFilterConfig(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilterConfig({ status: '', category: '', search: '' });
    setSearchInput('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle delete workflow
  const handleDeleteWorkflow = async () => {
    try {
      await deleteWorkflow(confirmDialog.ticketId);
      setWorkflows(prev => prev.filter(w => w.id !== confirmDialog.ticketId));
      addToast('success', `Workflow "${confirmDialog.ticketName}" deleted successfully`);
      setConfirmDialog({ isOpen: false, type: 'delete', ticketId: '', ticketName: '' });
    }
    catch (err) {
      addToast('error', `Failed to delete workflow, ${err}`);
    }
  };

  // Handle update workflow status
  const handleUpdateStatus = async () => {
    if (!confirmDialog.newStatus) {
      return;
    }

    try {
      await updateWorkflowStatus(confirmDialog.ticketId, confirmDialog.newStatus);
      setWorkflows(prev => prev.map(w =>
        w.id === confirmDialog.ticketId
          ? { ...w, status: confirmDialog.newStatus! }
          : w
      ));
      addToast('success', `Workflow status updated to ${confirmDialog.newStatus}`);
      setConfirmDialog({ isOpen: false, type: 'status', ticketId: '', ticketName: '' });
    }
    catch (err) {
      addToast('error', `Failed to update workflow status, ${err}`);
    }
  };

  // Navigate to create workflow
  const handleCreateWorkflow = () => {
    console.log('Navigating to create workflow');
    navigate('/workflow/editor/v2');
  };

  // Navigate to read workflow
  const handleReadWorkflow = (ticketId: string) => {
    console.log(`Navigating to read workflow: ${ticketId}`);
    navigate(`/workflow/editor/v2/${ticketId}`);
  };

  // Navigate to update workflow
  const handleUpdateWorkflow = (ticketId: string) => {
    console.log(`Navigating to update workflow: ${ticketId}`);
    navigate(`/workflow/editor/v2/${ticketId}/edit`);
  };

  // Filter and sort workflows
  const filteredAndSortedWorkflows = useMemo(() => {
    const filtered = workflows.filter(workflow => {
      const matchesSearch = !filterConfig.search ||
        workflow.name.toLowerCase().includes(filterConfig.search.toLowerCase()) ||
        workflow.description.toLowerCase().includes(filterConfig.search.toLowerCase());

      const matchesStatus = !filterConfig.status || workflow.status === filterConfig.status;
      const matchesCategory = !filterConfig.category || workflow.category === filterConfig.category;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!] ?? '';
        const bValue = b[sortConfig.key!] ?? '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [workflows, filterConfig, sortConfig]);

  // Paginated workflows
  const paginatedWorkflows = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredAndSortedWorkflows.slice(startIndex, endIndex);
  }, [filteredAndSortedWorkflows, pagination]);

  // Pagination info
  const totalPages = Math.ceil(filteredAndSortedWorkflows.length / pagination.pageSize);
  const startEntry = (pagination.page - 1) * pagination.pageSize + 1;
  const endEntry = Math.min(pagination.page * pagination.pageSize, filteredAndSortedWorkflows.length);

  // Status configurations
  // const statusConfig = {
  //   active: { icon: VideoIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800", label: "Active" },
  //   inactive: { icon: ListIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800", label: "Inactive" },
  //   draft: { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800", label: "Draft" },
  //   testing: { icon: BoltIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800", label: "Testing" }
  // };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueCategories = () => {
    return [...new Set(workflows.map(w => w.category).filter(Boolean))];
  };

  const getUniqueCategoriesOptions = getUniqueCategories()
    .filter((category): category is string => typeof category === 'string')
    .map(category => ({
      value: category,
      label: category
    }));


  return (
    <>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          {/* Loading */}
          {loading && (
            <></>
          )}

          {/* Error */}
          {error && (
            <></>
          )}

          {/* Toast Notifications */}
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
              <div
                key={toast.id}
                className={`flex items-center gap-3 p-4 rounded-lg shadow-lg transition-all duration-300 ${toast.type === 'success' ? 'bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-100' :
                  toast.type === 'error' ? 'bg-red-100 dark:bg-red-800 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100' :
                    'bg-yellow-100 dark:bg-yellow-800 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-100'
                  }`}
              >
                {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-300" />}
                {toast.type === 'error' && <ErrorIcon className="w-5 h-5 text-red-600 dark:text-red-300" />}
                {toast.type === 'warning' && <AlertIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-300" />}
                <span className="text-sm font-medium">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-0">
            <div className="mx-auto">
              {/* Header */}
              <div className="mb-8">


                {/* Controls */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  {/* Search */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search FormSop..."
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      variant="dark"
                      className="h-11"
                    >
                      Search
                    </Button>
                  </div>

                  {/* Display Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">View:</span>
                    <div className="flex rounded-lg overflow-hidden">
                      <Button
                        onClick={() => setDisplayMode('card')}
                        className="rounded-r-none"
                        variant={`${displayMode === 'card'
                          ? 'primary'
                          : 'outline'
                          }`}
                      >
                        <GridIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setDisplayMode('table')}
                        className="rounded-l-none"
                        variant={`${displayMode === 'table'
                          ? 'primary'
                          : 'outline'
                          }`}
                      >
                        <ListIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleCreateWorkflow}
                      variant="primary"
                    >
                      Create FormSop
                    </Button>
                  </div>

                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={filterConfig.status}
                      onChange={(value) => handleFilter('status', value)}
                      options={filterOptions}
                      placeholder="Select Status"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={filterConfig.category}
                      onChange={(value) => handleFilter('category', value)}
                      options={getUniqueCategoriesOptions}
                      placeholder="Select Category"
                    />
                  </div>

                  {/* Clear Filters */}
                  {(filterConfig.search || filterConfig.status || filterConfig.category) && (
                    <Button
                      onClick={clearFilters}
                      className="h-11"
                    >
                      <CloseIcon className="w-4 h-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {startEntry}-{endEntry} of {filteredAndSortedWorkflows.length} workflows
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Show:</span>
                  <Select
                    value={pagination.pageSize.toString()}
                    onChange={(value) => setPagination(prev => ({ ...prev, pageSize: parseInt(value), page: 1 }))}
                    options={paginationOptions}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">entries</span>
                </div>
              </div>

              {/* Content */}
              {displayMode === 'card' ? (
                /* Card View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedWorkflows.map((form) => (
                    <FormCard
                      key={form.id}
                      form={form}
                      formatDate={formatDate}
                      handleReadWorkflow={handleReadWorkflow}
                      handleUpdateWorkflow={handleUpdateWorkflow}
                      setConfirmDialog={setConfirmDialog}
                    />
                  ))}
                </div>
              ) : (
                /* Table View */
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border-none overflow-hidden mb-8">
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('name')}
                              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              Name
                              {sortConfig.key === 'name' && (
                                sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('status')}
                              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              Status
                              {sortConfig.key === 'status' && (
                                sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left">
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

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedWorkflows.map((form) => {
                          const config = statusConfig[form.status]
                          return (
                            <tr key={form.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{form.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{form.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className={`px-6 py-4 `}>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                  {form.status}
                                </span>

                                {/* <Select 
                                  value={form.status}
                                  onChange={(value) => setConfirmDialog({
                                    isOpen: true,
                                    type: 'status',
                                    ticketId: form.id,
                                    ticketName: form.name,
                                    newStatus: value as FormSop['status']
                                  })}
                                  className={`px-2 py-1 rounded-full text-xs font-medium border-0`}
                                  options={filterOptions}
                                >
                                </Select> */}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(form.createdAt)}
                              </td>

                              <td className="px-6 py-4">
                                {/* Use the new TableRowActions component */}
                                <TableRowActions
                                  form={form}

                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Page {pagination.page} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            onClick={() => setPagination(prev => ({ ...prev, page }))}
                            variant={`${pagination.page === page
                              ? 'info'
                              : 'primary'
                              }`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                      disabled={pagination.page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* No Results */}
              {paginatedWorkflows.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No workflows found</div>
                  <p className="text-gray-400 dark:text-gray-500 mb-4">
                    {filterConfig.search || filterConfig.status || filterConfig.category
                      ? 'Try adjusting your filters or search terms'
                      : 'Create your first workflow to get started'
                    }
                  </p>
                  {(filterConfig.search || filterConfig.status || filterConfig.category) && (
                    <Button
                      onClick={clearFilters}
                      className="h-11"
                      variant="primary"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Dialog */}
          {confirmDialog.isOpen && (
            <Modal isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({ isOpen: false, type: 'delete', ticketId: '', ticketName: '' })} className="max-w-4xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {confirmDialog.type === 'delete' ? 'Delete Workflow' : 'Update Status'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {confirmDialog.type === 'delete'
                      ? 'This action cannot be undone'
                      : 'Change workflow status'
                    }
                  </p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-200 mb-6">
                {confirmDialog.type === 'delete'
                  ? `Are you sure you want to delete "${confirmDialog.ticketName}"?`
                  : `Change "${confirmDialog.ticketName}" status to ${confirmDialog.newStatus}?`
                }
              </p>

              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={() => setConfirmDialog({ isOpen: false, type: 'delete', ticketId: '', ticketName: '' })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDialog.type === 'delete' ? handleDeleteWorkflow : handleUpdateStatus}
                  variant={`${confirmDialog.type === 'delete'
                    ? 'error'
                    : 'primary'
                    }`}
                >
                  {confirmDialog.type === 'delete' ? 'Delete' : 'Update'}
                </Button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
};

export default FormListComponent;